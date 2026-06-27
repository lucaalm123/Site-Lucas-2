(function () {
  function safe(name, fn) {
    try {
      if (typeof fn === "function") {
        fn();
        console.info("[Visual Law Studio] " + name + " OK");
      }
    } catch (error) {
      console.error("[Visual Law Studio] Erro em " + name + ":", error);
      document.documentElement.classList.add("motion-failed");
    }
  }

  function setYear() {
    var year = $("#current-year");
    if (year) year.textContent = new Date().getFullYear();
  }

  function boot() {
    setYear();
    safe("menu", window.initMenu);
    safe("cases", window.initCases);
    safe("effects", window.initEffects);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
