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
      var tagName = block.type === 'h2' ? 'h2' : 'p';
      var element = document.createElement(tagName);
      element.textContent = block.text || '';
      container.appendChild(element);
    });
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

  function applyContentOverride() {
    var data = readContentOverride();
    if (!data) {
      return;
    }
    var posts = Array.isArray(data.posts) ? data.posts : [];
    setText('[data-site-name]', data.siteName);
    setText('[data-author-name]', data.authorName);
    setText('[data-home-intro]', data.homeIntro);
    setText('[data-about-intro]', data.aboutIntro);

    Array.prototype.forEach.call(document.querySelectorAll('[data-post-card]'), function (card) {
      var post = posts.find(function (item) {
        return item.slug === card.dataset.postCard;
      });
      if (post) {
        applyPostToCard(card, post);
      }
    });

    var postPage = document.querySelector('[data-post-page]');
    if (postPage) {
      var currentPost = posts.find(function (item) {
        return item.slug === postPage.dataset.postPage;
      });
      if (currentPost) {
        applyPostToPage(postPage, currentPost);
      }
    }
  }

  applyContentOverride();
}());
