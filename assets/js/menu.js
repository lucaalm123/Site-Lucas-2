/* menu.js — fullscreen menu */

(function () {
  function initMenu() {
    var body = document.body;
    var toggle = $(".menu-toggle");
    var menu = $(".full-menu");
    var close = $(".menu-close");
    var links = $$(".menu-link", menu);

    if (!toggle || !menu || !close) return;

    function openMenu() {
      menu.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      menu.setAttribute("aria-hidden", "false");
      body.classList.add("is-locked");
      close.focus({ preventScroll: true });
    }

    function closeMenu() {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      menu.setAttribute("aria-hidden", "true");
      body.classList.remove("is-locked");
      toggle.focus({ preventScroll: true });
    }

    toggle.addEventListener("click", function () {
      if (menu.classList.contains("is-open")) closeMenu();
      else openMenu();
    });

    close.addEventListener("click", closeMenu);

    links.forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && menu.classList.contains("is-open")) {
        closeMenu();
      }
    });
  }

  window.initMenu = initMenu;
})();
