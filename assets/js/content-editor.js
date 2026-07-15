(function () {
  var storageKey = 'blog.content.override';
  var form = document.querySelector('[data-content-form]');
  if (!form) {
    return;
  }

  var status = document.querySelector('[data-content-status]');
  var postSelect = document.querySelector('[data-post-select]');
  var exportButton = document.querySelector('[data-content-export]');
  var importInput = document.querySelector('[data-content-import]');
  var resetButton = document.querySelector('[data-content-reset]');
  var state = null;
  var currentSlug = '';

  function setStatus(message) {
    if (status) {
      status.textContent = message;
    }
  }

  function loadJson(path) {
    return fetch(path).then(function (response) {
      if (!response.ok) {
        throw new Error('无法读取 ' + path);
      }
      return response.json();
    });
  }

  function readStored() {
    try {
      var raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function bodyToText(body) {
    return (body || []).map(function (block) {
      return block.type === 'h2' ? '## ' + block.text : block.text;
    }).join('\n');
  }

  function textToBody(text) {
    return text.split('\n').map(function (line) {
      return line.trim();
    }).filter(Boolean).map(function (line) {
      if (line.indexOf('## ') === 0) {
        return { type: 'h2', text: line.slice(3).trim() };
      }
      return { type: 'p', text: line };
    });
  }

  function selectedPost(slug) {
    return state.posts.find(function (post) {
      return post.slug === (slug || postSelect.value);
    });
  }

  function fillPostFields(post) {
    form.elements.postTitle.value = post.title || '';
    form.elements.postDate.value = post.date || '';
    form.elements.postCategory.value = post.category || '';
    form.elements.postTags.value = Array.isArray(post.tags) ? post.tags.join(', ') : '';
    form.elements.postSummary.value = post.summary || '';
    form.elements.postBody.value = bodyToText(post.body);
  }

  function syncCurrentPostFromFields(slug) {
    var post = selectedPost(slug);
    if (!post) {
      return;
    }
    post.title = form.elements.postTitle.value.trim();
    post.date = form.elements.postDate.value;
    post.category = form.elements.postCategory.value.trim();
    post.tags = form.elements.postTags.value.split(',').map(function (tag) {
      return tag.trim();
    }).filter(Boolean);
    post.summary = form.elements.postSummary.value.trim();
    post.body = textToBody(form.elements.postBody.value);
  }

  function fillForm() {
    form.elements.siteName.value = state.siteName || '';
    form.elements.authorName.value = state.authorName || '';
    form.elements.homeIntro.value = state.homeIntro || '';
    form.elements.aboutIntro.value = state.aboutIntro || '';

    postSelect.textContent = '';
    state.posts.forEach(function (post) {
      var option = document.createElement('option');
      option.value = post.slug;
      option.textContent = post.title;
      postSelect.appendChild(option);
    });
    if (state.posts[0]) {
      postSelect.value = state.posts[0].slug;
      currentSlug = state.posts[0].slug;
      fillPostFields(state.posts[0]);
    }
  }

  function syncSiteFromFields() {
    state.siteName = form.elements.siteName.value.trim();
    state.authorName = form.elements.authorName.value.trim();
    state.homeIntro = form.elements.homeIntro.value.trim();
    state.aboutIntro = form.elements.aboutIntro.value.trim();
  }

  function save() {
    syncSiteFromFields();
    syncCurrentPostFromFields();
    localStorage.setItem(storageKey, JSON.stringify(state));
    setStatus('已保存到当前浏览器。回到首页、关于页或文章页即可看到改动。');
  }

  function downloadJson(filename, value) {
    var blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  Promise.all([
    loadJson('content/site/content.json'),
    loadJson('content/posts/posts.json')
  ]).then(function (parts) {
    var defaults = Object.assign({}, parts[0], { posts: parts[1] });
    state = readStored() || clone(defaults);
    fillForm();
    setStatus('默认内容已加载。');

    postSelect.addEventListener('change', function () {
      syncCurrentPostFromFields(currentSlug);
      currentSlug = postSelect.value;
      fillPostFields(selectedPost(currentSlug));
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      save();
    });

    exportButton.addEventListener('click', function () {
      syncSiteFromFields();
      syncCurrentPostFromFields();
      downloadJson('blog-content.json', state);
      setStatus('已导出 blog-content.json。');
    });

    importInput.addEventListener('change', function () {
      var file = importInput.files[0];
      if (!file) {
        return;
      }
      file.text().then(function (text) {
        state = JSON.parse(text);
        localStorage.setItem(storageKey, JSON.stringify(state));
        fillForm();
        setStatus('已导入并保存到当前浏览器。');
      }).catch(function () {
        setStatus('导入失败，请确认文件是有效 JSON。');
      });
    });

    resetButton.addEventListener('click', function () {
      localStorage.removeItem(storageKey);
      state = clone(defaults);
      fillForm();
      setStatus('已恢复默认内容。');
    });
  }).catch(function (error) {
    setStatus(error.message);
  });
}());
