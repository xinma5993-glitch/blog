(function () {
  var storageKey = 'theme';
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
}());
