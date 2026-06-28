(function () {
  function safeRun(name, fn) {
    try {
      if (typeof fn === "function") {
        fn();
        console.info("[Visual Law Nimo Rebuild] " + name + " OK");
      }
    } catch (error) {
      console.error("[Visual Law Nimo Rebuild] Erro em " + name + ":", error);
      document.documentElement.classList.add("motion-failed");
    }
  }

  function setYear() {
    var year = $("#current-year");
    if (year) year.textContent = new Date().getFullYear();
  }

  function boot() {
    setYear();
    safeRun("menu", window.initMenu);
    safeRun("cases", window.initCases);
    safeRun("effects", window.initEffects);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
