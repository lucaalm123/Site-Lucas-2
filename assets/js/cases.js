/* cases.js — cards, drawer and lightbox */

(function () {
  var activeCase = null;

  function caseTemplate(item) {
    return [
      '<article class="case-row">',
      '  <button class="case-media project-hover tilt-card mask-reveal parallax" data-case-id="' + escapeHtml(item.id) + '" data-action="lightbox" data-speed="0.05" type="button">',
      '    <img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '">',
      '  </button>',
      '  <div class="case-content">',
      '    <div class="case-meta text-reveal">',
      '      <span class="case-number">' + escapeHtml(item.number) + '</span>',
      '      <span class="case-category">' + escapeHtml(item.category) + ' / ' + escapeHtml(item.year) + '</span>',
      '    </div>',
      '    <h3 class="case-title split-lines"><span>' + escapeHtml(item.title) + '</span></h3>',
      '    <p class="body-copy text-reveal">' + escapeHtml(item.description) + '</p>',
      '    <div class="btn-row case-actions text-reveal">',
      '      <button class="btn" data-case-id="' + escapeHtml(item.id) + '" data-action="drawer" type="button">Entender o projeto</button>',
      '      <button class="btn" data-case-id="' + escapeHtml(item.id) + '" data-action="lightbox" type="button">Ampliar imagem</button>',
      '    </div>',
      '  </div>',
      '</article>'
    ].join("");
  }

  function workTileTemplate(item) {
    return [
      '<button class="work-tile project-hover tilt-card" data-case-id="' + escapeHtml(item.id) + '" data-action="drawer" type="button">',
      '  <img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '">',
      '  <span class="tile-label">' + escapeHtml(item.category) + '</span>',
      '</button>'
    ].join("");
  }

  function serviceTemplate(item) {
    return [
      '<article class="service-item text-reveal">',
      '  <span class="service-number">' + escapeHtml(item[0]) + '</span>',
      '  <div>',
      '    <h3>' + escapeHtml(item[1]) + '</h3>',
      '    <p>' + escapeHtml(item[2]) + '</p>',
      '  </div>',
      '</article>'
    ].join("");
  }

  function processTemplate(item) {
    return [
      '<article class="process-card glass-card border-gradient mask-reveal">',
      '  <span class="process-number">' + escapeHtml(item[0]) + '</span>',
      '  <h3>' + escapeHtml(item[1]) + '</h3>',
      '  <p>' + escapeHtml(item[2]) + '</p>',
      '</article>'
    ].join("");
  }

  function findCase(id) {
    return ((window.SITE_DATA && window.SITE_DATA.cases) ? window.SITE_DATA.cases : []).find(function (item) {
      return item.id === id;
    });
  }

  function renderCases() {
    var cases = (window.SITE_DATA && window.SITE_DATA.cases) ? window.SITE_DATA.cases : [];
    var casesList = $("#cases-list");
    var workA = $("#work-row-a");
    var workB = $("#work-row-b");
    var services = $("#service-list");
    var process = $("#process-grid");

    if (casesList) {
      casesList.innerHTML = cases.map(caseTemplate).join("");
    }

    if (workA) {
      workA.innerHTML = cases.concat(cases).map(workTileTemplate).join("");
    }

    if (workB) {
      workB.innerHTML = cases.slice().reverse().concat(cases).map(workTileTemplate).join("");
    }

    if (services) {
      services.innerHTML = ((window.SITE_DATA && window.SITE_DATA.services) ? window.SITE_DATA.services : []).map(serviceTemplate).join("");
    }

    if (process) {
      process.innerHTML = ((window.SITE_DATA && window.SITE_DATA.process) ? window.SITE_DATA.process : []).map(processTemplate).join("");
    }
  }

  function openDrawer(item) {
    activeCase = item;
    var drawer = $("#case-drawer");
    if (!drawer) return;

    $("#drawer-image").src = item.image;
    $("#drawer-image").alt = item.title;
    $("#drawer-eyebrow").textContent = item.category;
    $("#drawer-title").textContent = item.title;
    $("#drawer-doc").textContent = "Documento original: " + item.document;
    $("#drawer-problem").textContent = item.problem;
    $("#drawer-solution").textContent = item.solution;
    $("#drawer-result").textContent = item.result;

    var resources = $("#drawer-resources");
    if (resources) {
      resources.innerHTML = item.resources.map(function (resource) {
        return "<li>" + escapeHtml(resource) + "</li>";
      }).join("");
    }

    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-locked");
    $(".drawer-close").focus({ preventScroll: true });
  }

  function closeDrawer() {
    var drawer = $("#case-drawer");
    if (!drawer) return;
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-locked");
  }

  function openLightbox(item) {
    activeCase = item;
    var lightbox = $("#lightbox");
    if (!lightbox) return;

    $("#lightbox-image").src = item.image;
    $("#lightbox-image").alt = item.title;
    $("#lightbox-caption").textContent = item.title;

    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-locked");
    $(".lightbox-close").focus({ preventScroll: true });
  }

  function closeLightbox() {
    var lightbox = $("#lightbox");
    if (!lightbox) return;
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-locked");
  }

  function bindCaseEvents() {
    document.addEventListener("click", function (event) {
      var trigger = event.target.closest("[data-case-id][data-action]");
      if (!trigger) return;

      var item = findCase(trigger.getAttribute("data-case-id"));
      if (!item) return;

      var action = trigger.getAttribute("data-action");
      if (action === "drawer") openDrawer(item);
      if (action === "lightbox") openLightbox(item);
    });

    $$(".drawer-close, #case-drawer .overlay-backdrop").forEach(function (el) {
      el.addEventListener("click", closeDrawer);
    });

    $$(".lightbox-close, #lightbox .overlay-backdrop").forEach(function (el) {
      el.addEventListener("click", closeLightbox);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;
      closeDrawer();
      closeLightbox();
    });
  }

  window.initCases = function initCases() {
    renderCases();
    bindCaseEvents();
  };
})();
