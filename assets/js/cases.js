(function () {
  function getCase(id) {
    return window.SITE_DATA && window.SITE_DATA.cases ? window.SITE_DATA.cases[id] : null;
  }

  function openDrawer(item) {
    var drawer = $("#case-drawer");
    if (!drawer || !item) return;

    $("#drawer-image").src = item.image;
    $("#drawer-image").alt = item.title;
    $("#drawer-category").textContent = item.category;
    $("#drawer-title").textContent = item.title;
    $("#drawer-doc").textContent = "Documento original: " + item.document;
    $("#drawer-problem").textContent = item.problem;
    $("#drawer-solution").textContent = item.solution;
    $("#drawer-result").textContent = item.result;

    var resources = $("#drawer-resources");
    resources.innerHTML = (item.resources || []).map(function (r) {
      return "<li>" + escapeHtml(r) + "</li>";
    }).join("");

    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-locked");
  }

  function closeDrawer() {
    var drawer = $("#case-drawer");
    if (!drawer) return;
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-locked");
  }

  function openLightbox(item) {
    var lightbox = $("#lightbox");
    if (!lightbox || !item) return;

    $("#lightbox-image").src = item.image;
    $("#lightbox-image").alt = item.title;
    $("#lightbox-caption").textContent = item.title + " — " + item.category;

    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-locked");
  }

  function closeLightbox() {
    var lightbox = $("#lightbox");
    if (!lightbox) return;
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-locked");
  }

  function initCases() {
    document.addEventListener("click", function (event) {
      var trigger = event.target.closest("[data-case][data-action]");
      if (!trigger) return;

      var item = getCase(trigger.getAttribute("data-case"));
      var action = trigger.getAttribute("data-action");

      if (action === "drawer") openDrawer(item);
      if (action === "lightbox") openLightbox(item);
    });

    $$(".drawer [data-close], .lightbox [data-close], .overlay-bg").forEach(function (button) {
      button.addEventListener("click", function () {
        closeDrawer();
        closeLightbox();
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;
      closeDrawer();
      closeLightbox();
    });
  }

  window.initCases = initCases;
})();
