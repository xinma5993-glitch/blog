(function () {
  var storageKey = 'blog.content.override';
  var page = document.querySelector('[data-dynamic-post-page]');
  if (!page) {
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var slug = params.get('slug');
  var title = page.querySelector('[data-dynamic-post-title]');
  var body = page.querySelector('[data-post-edit-body]');
  var panel = page.querySelector('[data-post-editor-panel]');
  var editButton = page.querySelector('[data-post-edit-toggle]');
  var saveButton = page.querySelector('[data-post-edit-save]');
  var status = page.querySelector('[data-post-edit-status]');
  var dateInput = page.querySelector('[data-post-edit-date]');
  var categoryInput = page.querySelector('[data-post-edit-category]');
  var categoryOptions = page.querySelector('[data-post-category-options]');
  var tagsInput = page.querySelector('[data-post-edit-tags]');
  var summaryInput = page.querySelector('[data-post-edit-summary]');
  var state = readState();
  var post = state && Array.isArray(state.posts) ? state.posts.find(function (item) {
    return item.slug === slug;
  }) : null;

  function setStatus(message) {
    if (status) {
      status.textContent = message;
    }
  }

  function readState() {
    try {
      var raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function saveState() {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }

  function fillEditorFields() {
    if (!post) {
      return;
    }
    dateInput.value = post.date || '';
    categoryInput.value = post.category || '';
    tagsInput.value = Array.isArray(post.tags) ? post.tags.join(', ') : '';
    summaryInput.value = post.summary || '';
    if (categoryOptions) {
      categoryOptions.textContent = '';
      Array.from(new Set(state.posts.map(function (item) {
        return item.category;
      }).filter(Boolean))).forEach(function (category) {
        var option = document.createElement('option');
        option.value = category;
        categoryOptions.appendChild(option);
      });
    }
  }

  function setEditMode(enabled) {
    if (!post) {
      setStatus('没有找到可编辑的本地文章。请先从“编辑”页面新建文章。');
      return;
    }
    title.contentEditable = enabled ? 'true' : 'false';
    body.contentEditable = enabled ? 'true' : 'false';
    page.classList.toggle('is-editing', enabled);
    panel.hidden = !enabled;
    saveButton.hidden = !enabled;
    editButton.hidden = enabled;
    if (enabled) {
      fillEditorFields();
      title.focus();
      setStatus('正在编辑。可以直接修改正文，也可以把图片粘贴到正文区域。');
    } else {
      setStatus('');
    }
  }

  function insertNodeAtSelection(node) {
    var selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      body.appendChild(node);
      return;
    }
    var range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(node);
    range.setStartAfter(node);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function insertImage(src) {
    var figure = document.createElement('figure');
    var image = document.createElement('img');
    image.src = src;
    image.alt = '文章图片';
    figure.appendChild(image);
    insertNodeAtSelection(figure);
  }

  function handlePaste(event) {
    if (body.contentEditable !== 'true') {
      return;
    }
    var items = event.clipboardData ? Array.prototype.slice.call(event.clipboardData.items) : [];
    var imageItems = items.filter(function (item) {
      return item.type.indexOf('image/') === 0;
    });
    if (!imageItems.length) {
      return;
    }
    event.preventDefault();
    imageItems.forEach(function (item) {
      var file = item.getAsFile();
      if (!file) {
        return;
      }
      if (file.size > 800 * 1024) {
        setStatus('图片较大，建议压缩到 800KB 以内再粘贴，避免浏览器保存失败。');
      }
      var reader = new FileReader();
      reader.onload = function () {
        insertImage(String(reader.result));
      };
      reader.readAsDataURL(file);
    });
  }

  function blockFromNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      var text = node.textContent.trim();
      return text ? { type: 'p', text: text } : null;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return null;
    }
    var element = node;
    var tag = element.tagName.toLowerCase();
    var image = tag === 'img' ? element : element.querySelector(':scope > img');
    if (image) {
      return {
        type: 'image',
        src: image.getAttribute('src') || '',
        alt: image.getAttribute('alt') || '文章图片',
        caption: element.querySelector('figcaption') ? element.querySelector('figcaption').textContent.trim() : ''
      };
    }
    var textContent = element.textContent.trim();
    if (!textContent) {
      return null;
    }
    return {
      type: tag === 'h2' ? 'h2' : 'p',
      text: textContent
    };
  }

  function bodyToBlocks() {
    return Array.prototype.map.call(body.childNodes, blockFromNode).filter(Boolean);
  }

  function savePost() {
    if (!post) {
      return;
    }
    post.title = title.textContent.trim() || '未命名文章';
    post.date = dateInput.value;
    post.category = categoryInput.value.trim() || '未分类';
    post.tags = tagsInput.value.split(',').map(function (tag) {
      return tag.trim();
    }).filter(Boolean);
    post.summary = summaryInput.value.trim() || post.summary || '暂无摘要。';
    post.body = bodyToBlocks();
    try {
      saveState();
      setEditMode(false);
      setStatus('已保存到当前浏览器。返回首页可以看到文章卡片更新。');
    } catch (error) {
      setStatus('保存失败，可能是图片太大导致浏览器存储空间不足。');
    }
  }

  if (!post) {
    editButton.disabled = true;
    setStatus('这篇文章不在当前浏览器保存的数据中。请从“编辑”页面新建文章，或导入之前导出的 JSON。');
    return;
  }

  editButton.addEventListener('click', function () {
    setEditMode(true);
  });
  saveButton.addEventListener('click', savePost);
  body.addEventListener('paste', handlePaste);

  if (params.get('edit') === '1') {
    setEditMode(true);
  }
}());
