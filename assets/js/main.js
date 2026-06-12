/* main.js — boot */

(function () {
  document.documentElement.classList.remove("no-js");

  function boot() {
    if (window.initMenu) window.initMenu();
    if (window.initCases) window.initCases();
    if (window.initEffects) window.initEffects();

    var year = $("#current-year");
    if (year) year.textContent = new Date().getFullYear();

    var heroCase = window.SITE_DATA && window.SITE_DATA.cases.find(function (item) {
      return item.id === "contratos";
    });

    if (heroCase) {
      var heroMain = $("#hero-main-case");
      var heroImage = $("#hero-main-image");
      if (heroMain) heroMain.setAttribute("data-case-id", heroCase.id);
      if (heroImage) {
        heroImage.src = heroCase.image;
        heroImage.alt = heroCase.title;
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
