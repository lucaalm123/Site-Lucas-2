/* effects.js — cursor, reveal, tilt, parallax, spotlight */

(function () {
  function initSpotlight() {
    document.addEventListener("pointermove", function (event) {
      document.documentElement.style.setProperty("--mx", event.clientX + "px");
      document.documentElement.style.setProperty("--my", event.clientY + "px");
    });
  }

  function initCursor() {
    if (isTouchDevice()) return;

    var cursor = $(".cursor-label");
    if (!cursor) return;

    document.addEventListener("pointermove", function (event) {
      cursor.style.left = event.clientX + "px";
      cursor.style.top = event.clientY + "px";
    });

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

  function initReveal() {
    if (prefersReducedMotion()) {
      $$(".reveal, .text-reveal, .mask-reveal, .split-lines").forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    $$(".split-lines").forEach(function (el) {
      Array.from(el.children).forEach(function (child, index) {
        child.style.setProperty("--i", index);
      });
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.18,
      rootMargin: "0px 0px -8% 0px"
    });

    $$(".reveal, .text-reveal, .mask-reveal, .split-lines").forEach(function (el) {
      observer.observe(el);
    });
  }

  function initTilt() {
    if (isTouchDevice() || prefersReducedMotion()) return;

    document.addEventListener("mousemove", function (event) {
      var card = event.target.closest(".tilt-card");
      if (!card) return;

      var rect = card.getBoundingClientRect();
      var x = event.clientX - rect.left;
      var y = event.clientY - rect.top;

      var rotateY = ((x / rect.width) - 0.5) * 10;
      var rotateX = ((y / rect.height) - 0.5) * -10;

      card.style.transform = "perspective(900px) rotateX(" + rotateX.toFixed(2) + "deg) rotateY(" + rotateY.toFixed(2) + "deg)";
    });

    document.addEventListener("mouseleave", function (event) {
      var card = event.target.closest && event.target.closest(".tilt-card");
      if (card) card.style.transform = "";
    }, true);

    document.addEventListener("mouseout", function (event) {
      var card = event.target.closest(".tilt-card");
      if (!card) return;
      if (!card.contains(event.relatedTarget)) {
        card.style.transform = "";
      }
    });
  }

  function initParallax() {
    if (prefersReducedMotion()) return;

    var items = $$(".parallax");
    if (!items.length) return;

    var ticking = false;

    function update() {
      var viewportHeight = window.innerHeight;

      items.forEach(function (item) {
        var rect = item.getBoundingClientRect();
        var speed = parseFloat(item.getAttribute("data-speed") || "0.06");
        var center = rect.top + rect.height / 2;
        var distance = center - viewportHeight / 2;
        var y = distance * speed * -1;
        item.style.setProperty("--parallax-y", y.toFixed(2) + "px");
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

  function initEffects() {
    initSpotlight();
    initCursor();
    initReveal();
    initTilt();
    initParallax();
  }

  window.initEffects = initEffects;
})();
