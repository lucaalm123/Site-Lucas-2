/* effects.js — cursor, reveal, tilt, parallax, spotlight */

(function () {
  function markMotionOk() {
    document.documentElement.classList.add("motion-ok");
    document.documentElement.classList.remove("motion-failed");

    if (window.__motionWatchdog) {
      window.clearTimeout(window.__motionWatchdog);
      window.__motionWatchdog = null;
    }
  }

  function isInViewport(el) {
    var rect = el.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    return rect.top < vh * 0.92 && rect.bottom > vh * 0.04;
  }

  function initSpotlight() {
    document.addEventListener("pointermove", function (event) {
      document.documentElement.style.setProperty("--mx", event.clientX + "px");
      document.documentElement.style.setProperty("--my", event.clientY + "px");
    }, { passive: true });
  }

  function initCursor() {
    if (isTouchDevice()) return;

    var cursor = $(".cursor-label");
    if (!cursor) return;

    document.addEventListener("pointermove", function (event) {
      cursor.style.left = event.clientX + "px";
      cursor.style.top = event.clientY + "px";
    }, { passive: true });

    document.addEventListener("mouseover", function (event) {
      if (event.target.closest(".project-hover")) {
        cursor.classList.add("is-active");
      }
    });

    document.addEventListener("mouseout", function (event) {
      if (event.target.closest(".project-hover")) {
        cursor.classList.remove("is-active");
      }
    });
  }

  function prepareSplitLines() {
    $$(".split-lines").forEach(function (el) {
      Array.from(el.children).forEach(function (child, index) {
        child.style.setProperty("--i", index);
      });
    });
  }

  function initReveal() {
    prepareSplitLines();

    var targets = $$(".reveal, .text-reveal, .mask-reveal, .split-lines");

    if (!targets.length || prefersReducedMotion()) {
      targets.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -6% 0px"
    });

    targets.forEach(function (el) {
      if (isInViewport(el)) {
        window.requestAnimationFrame(function () {
          el.classList.add("is-visible");
        });
      } else {
        observer.observe(el);
      }
    });

    /*
      Segunda verificação: se algum elemento inicial continuar escondido por qualquer
      condição de viewport, ele entra em até 900ms. Isso evita Hero parado.
    */
    window.setTimeout(function () {
      targets.slice(0, 12).forEach(function (el) {
        if (isInViewport(el)) el.classList.add("is-visible");
      });
    }, 900);
  }

  function initTilt() {
    if (isTouchDevice() || prefersReducedMotion()) return;

    var activeCard = null;

    document.addEventListener("mousemove", function (event) {
      var card = event.target.closest(".tilt-card");

      if (!card) {
        if (activeCard) {
          activeCard.style.transform = "";
          activeCard = null;
        }
        return;
      }

      activeCard = card;

      var rect = card.getBoundingClientRect();
      var x = event.clientX - rect.left;
      var y = event.clientY - rect.top;

      var rotateY = ((x / rect.width) - 0.5) * 9;
      var rotateX = ((y / rect.height) - 0.5) * -9;

      card.style.transform = "perspective(1000px) rotateX(" + rotateX.toFixed(2) + "deg) rotateY(" + rotateY.toFixed(2) + "deg)";
    }, { passive: true });

    document.addEventListener("mouseout", function (event) {
      var card = event.target.closest(".tilt-card");
      if (!card) return;
      if (!card.contains(event.relatedTarget)) {
        card.style.transform = "";
        if (activeCard === card) activeCard = null;
      }
    });
  }

  function initParallax() {
    if (prefersReducedMotion()) return;

    var items = $$(".parallax");
    if (!items.length) return;

    var ticking = false;

    function update() {
      var viewportHeight = window.innerHeight || document.documentElement.clientHeight;

      items.forEach(function (item) {
        var rect = item.getBoundingClientRect();
        var speed = parseFloat(item.getAttribute("data-speed") || "0.06");
        var center = rect.top + rect.height / 2;
        var distance = center - viewportHeight / 2;
        var y = distance * speed * -1;

        item.style.translate = "0 " + y.toFixed(2) + "px";
      });

      ticking = false;
    }

    function requestTick() {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }

    window.addEventListener("scroll", requestTick, { passive: true });
    window.addEventListener("resize", requestTick);
    update();
  }

  function initMotionDebugFlag() {
    document.documentElement.setAttribute("data-motion", "ok");

    window.setTimeout(function () {
      var visibleCount = $$(".is-visible").length;
      console.info("[Visual Law Studio] Motion OK — elementos animados:", visibleCount);
    }, 1200);
  }

  function initEffects() {
    initSpotlight();
    initCursor();
    initReveal();
    initTilt();
    initParallax();
    initMotionDebugFlag();
    markMotionOk();
  }

  window.initEffects = initEffects;
})();
