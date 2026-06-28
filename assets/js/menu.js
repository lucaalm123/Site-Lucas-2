(function () {
  function initMenu() {
    var toggle = $(".menu-toggle");
    var menu = $("#mobile-menu");
    var close = $(".menu-close");

    if (!toggle || !menu || !close) return;

    function openMenu() {
      menu.classList.add("is-open");
      menu.setAttribute("aria-hidden", "false");
      toggle.setAttribute("aria-expanded", "true");
      document.body.classList.add("is-locked");
    }

    function closeMenu() {
      menu.classList.remove("is-open");
      menu.setAttribute("aria-hidden", "true");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("is-locked");
    }

    toggle.addEventListener("click", function () {
      menu.classList.contains("is-open") ? closeMenu() : openMenu();
    });

    close.addEventListener("click", closeMenu);

    $$(".mobile-menu-link", menu).forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu();
    });
  }

  window.initMenu = initMenu;
})();
