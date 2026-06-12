/* main.js — boot */

(function () {
  function safeRun(name, fn) {
    try {
      if (typeof fn === "function") {
        fn();
        console.info("[Visual Law Studio] " + name + " inicializado.");
      } else {
        console.warn("[Visual Law Studio] " + name + " não encontrado.");
      }
    } catch (error) {
      console.error("[Visual Law Studio] Erro em " + name + ":", error);
      throw error;
    }
  }

  function setYear() {
    var year = $("#current-year");
    if (year) year.textContent = new Date().getFullYear();
  }

  function setHeroImage() {
    var heroCase = window.SITE_DATA && window.SITE_DATA.cases && window.SITE_DATA.cases.find(function (item) {
      return item.id === "contratos";
    });

    if (!heroCase) return;

    var heroMain = $("#hero-main-case");
    var heroImage = $("#hero-main-image");

    if (heroMain) heroMain.setAttribute("data-case-id", heroCase.id);
    if (heroImage) {
      heroImage.src = heroCase.image;
      heroImage.alt = heroCase.title;
    }
  }

  function boot() {
    safeRun("menu", window.initMenu);
    safeRun("cases", window.initCases);

    setYear();
    setHeroImage();

    /*
      Effects precisa rodar depois de cases, porque os cards dos cases são
      renderizados via JS e também precisam receber reveal, cursor e tilt.
    */
    safeRun("effects", window.initEffects);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
