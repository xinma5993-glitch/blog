(function () {
  var storageKey = 'theme';
  var contentStorageKey = 'blog.content.override';
  var root = document.documentElement;
  var toggle = document.querySelector('.theme-toggle');
  var yearTargets = document.querySelectorAll('[data-current-year]');

  function preferredTheme() {
    var saved = localStorage.getItem(storageKey);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  function applyTheme(theme) {
    root.dataset.theme = theme;
    if (toggle) {
      toggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
      toggle.setAttribute('title', theme === 'dark' ? '切换到浅色模式' : '切换到深色模式');
    }
  }

  applyTheme(preferredTheme());

  if (toggle) {
    toggle.addEventListener('click', function () {
      var nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem(storageKey, nextTheme);
      applyTheme(nextTheme);
    });
  }

  yearTargets.forEach(function (target) {
    target.textContent = String(new Date().getFullYear());
  });

  function readContentOverride() {
    try {
      var raw = localStorage.getItem(contentStorageKey);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function setText(selector, text, scope) {
    if (!text) {
      return;
    }
    Array.prototype.forEach.call((scope || document).querySelectorAll(selector), function (node) {
      node.textContent = text;
    });
  }

  function renderTags(container, tags) {
    if (!container || !Array.isArray(tags)) {
      return;
    }
    container.textContent = '';
    tags.forEach(function (tag) {
      var item = document.createElement('span');
      item.textContent = tag;
      container.appendChild(item);
    });
  }

  function renderBody(container, body) {
    if (!container || !Array.isArray(body)) {
      return;
    }
    container.textContent = '';
    body.forEach(function (block) {
      if (block.type === 'image' && block.src) {
        var figure = document.createElement('figure');
        var image = document.createElement('img');
        image.src = block.src;
        image.alt = block.alt || '文章图片';
        figure.appendChild(image);
        if (block.caption) {
          var caption = document.createElement('figcaption');
          caption.textContent = block.caption;
          figure.appendChild(caption);
        }
        container.appendChild(figure);
        return;
      }
      var tagName = block.type === 'h2' ? 'h2' : 'p';
      var element = document.createElement(tagName);
      element.textContent = block.text || '';
      container.appendChild(element);
    });
  }

  function postUrl(post) {
    return post.url || 'post.html?slug=' + encodeURIComponent(post.slug || '');
  }

  function createPostCard(post) {
    var article = document.createElement('article');
    article.className = 'post-card';
    article.dataset.postCard = post.slug || '';

    var meta = document.createElement('div');
    meta.className = 'post-meta';
    var date = document.createElement('time');
    date.dataset.postDate = '';
    date.dateTime = post.date || '';
    date.textContent = post.date || '';
    var category = document.createElement('span');
    category.dataset.postCategory = '';
    category.textContent = post.category || '未分类';
    meta.appendChild(date);
    meta.appendChild(category);

    var title = document.createElement('h3');
    var link = document.createElement('a');
    link.dataset.postTitle = '';
    link.href = postUrl(post);
    link.textContent = post.title || '未命名文章';
    title.appendChild(link);

    var summary = document.createElement('p');
    summary.dataset.postSummary = '';
    summary.textContent = post.summary || '暂无摘要。';

    var tags = document.createElement('div');
    tags.className = 'tags';
    tags.dataset.postTags = '';
    tags.setAttribute('aria-label', '文章标签');
    renderTags(tags, post.tags);

    var readMore = document.createElement('a');
    readMore.className = 'read-more';
    readMore.href = postUrl(post);
    readMore.textContent = '阅读全文';

    article.appendChild(meta);
    article.appendChild(title);
    article.appendChild(summary);
    article.appendChild(tags);
    article.appendChild(readMore);
    return article;
  }

  function applyPostToCard(card, post) {
    var date = card.querySelector('[data-post-date]');
    setText('[data-post-title]', post.title, card);
    setText('[data-post-summary]', post.summary, card);
    setText('[data-post-category]', post.category, card);
    if (date && post.date) {
      date.dateTime = post.date;
      date.textContent = post.date;
    }
    renderTags(card.querySelector('[data-post-tags]'), post.tags);
  }

  function applyPostToPage(page, post) {
    var date = page.querySelector('[data-post-date]');
    setText('[data-post-title]', post.title, page);
    if (date && post.date) {
      date.dateTime = post.date;
      date.textContent = post.date;
    }
    var meta = page.querySelector('.post-meta');
    if (meta && Array.isArray(post.tags)) {
      Array.prototype.forEach.call(meta.querySelectorAll('[data-post-tag]'), function (tag) {
        tag.remove();
      });
      post.tags.forEach(function (tag) {
        var item = document.createElement('span');
        item.dataset.postTag = '';
        item.textContent = tag;
        meta.appendChild(item);
      });
    }
    renderBody(page.querySelector('[data-post-body]'), post.body);
    if (post.title) {
      document.title = post.title + ' | Xinma\'s Blog';
    }
  }

  function renderDynamicPostPage(posts) {
    var page = document.querySelector('[data-dynamic-post-page]');
    if (!page) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var slug = params.get('slug');
    var post = posts.find(function (item) {
      return item.slug === slug;
    });
    if (!post) {
      document.title = '文章未找到 | Xinma\'s Blog';
      return;
    }

    var title = page.querySelector('[data-dynamic-post-title]');
    var date = page.querySelector('[data-dynamic-post-date]');
    var category = page.querySelector('[data-dynamic-post-category]');
    var tagContainer = page.querySelector('[data-dynamic-post-tags]');
    if (title) {
      title.textContent = post.title || '未命名文章';
    }
    if (date) {
      date.dateTime = post.date || '';
      date.textContent = post.date || '';
    }
    if (category) {
      category.textContent = post.category || '未分类';
    }
    if (tagContainer) {
      tagContainer.textContent = Array.isArray(post.tags) ? post.tags.join(' / ') : '';
    }
    renderBody(page.querySelector('[data-dynamic-post-body]'), post.body);
    document.title = (post.title || '文章') + ' | Xinma\'s Blog';
  }

  function applyContentOverride() {
    var data = readContentOverride();
    if (!data) {
      return;
    }
    var posts = Array.isArray(data.posts) ? data.posts : [];
    var existingCards = {};
    setText('[data-site-name]', data.siteName);
    setText('[data-author-name]', data.authorName);
    setText('[data-home-intro]', data.homeIntro);
    setText('[data-about-intro]', data.aboutIntro);

    Array.prototype.forEach.call(document.querySelectorAll('[data-post-card]'), function (card) {
      existingCards[card.dataset.postCard] = true;
      var post = posts.find(function (item) {
        return item.slug === card.dataset.postCard;
      });
      if (post) {
        applyPostToCard(card, post);
      }
    });

    var grid = document.querySelector('.post-grid');
    if (grid) {
      posts.forEach(function (post) {
        if (!existingCards[post.slug]) {
          grid.appendChild(createPostCard(post));
        }
      });
    }

    var postPage = document.querySelector('[data-post-page]');
    if (postPage) {
      var currentPost = posts.find(function (item) {
        return item.slug === postPage.dataset.postPage;
      });
      if (currentPost) {
        applyPostToPage(postPage, currentPost);
      }
    }
    renderDynamicPostPage(posts);
  }

  applyContentOverride();
}());
