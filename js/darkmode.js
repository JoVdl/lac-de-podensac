// ================================================================
// Dark mode — toggle + localStorage persistence
// ================================================================

(function () {
  const KEY = 'lac-theme';

  function applyTheme(dark) {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    document.querySelectorAll('.dark-toggle').forEach(btn => {
      btn.textContent = dark ? '☀️' : '🌙';
      btn.title = dark ? 'Mode clair' : 'Mode sombre';
    });
  }

  function toggle() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const next = !isDark;
    localStorage.setItem(KEY, next ? 'dark' : 'light');
    applyTheme(next);
  }

  // Apply stored preference before paint to avoid flash
  const stored = localStorage.getItem(KEY);
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(stored ? stored === 'dark' : prefersDark);

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.dark-toggle').forEach(btn => {
      btn.addEventListener('click', toggle);
    });
    // Re-apply so button text is correct after DOM ready
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    applyTheme(isDark);
  });
})();
