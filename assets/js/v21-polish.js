
(function () {
  "use strict";

  function $(selector, ctx) {
    return (ctx || document).querySelector(selector);
  }

  function $$(selector, ctx) {
    return Array.from((ctx || document).querySelectorAll(selector));
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function wrapLetters(root) {
    if (!root || root.dataset.letterReady === "true") return;

    var index = 0;

    function process(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        var text = node.nodeValue;
        if (!text.trim()) return;

        var frag = document.createDocumentFragment();

        Array.from(text).forEach(function (char) {
          if (char === " ") {
            frag.appendChild(document.createTextNode(" "));
            return;
          }

          var span = document.createElement("span");
          span.className = "letter-fx-char";
          span.style.setProperty("--char-index", index++);
          span.textContent = char;
          frag.appendChild(span);
        });

        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        Array.from(node.childNodes).forEach(process);
      }
    }

    Array.from(root.childNodes).forEach(process);
    root.dataset.letterReady = "true";
  }

  function initNimoLetterFX() {
    $$("[data-nimo-letter-fx]").forEach(wrapLetters);
  }

  function updateV21StackCards() {
    var section = $(".scroll-stack-section");
    var cards = $$(".scroll-stack-card");

    if (!section || !cards.length) return;

    if (window.innerWidth <= 1180) {
      cards.forEach(function (card) {
        card.style.transform = "";
        card.style.opacity = "";
        card.style.zIndex = "";
        card.classList.remove("scroll-stack-card-current", "scroll-stack-card-past", "scroll-stack-card-next", "lime-hover-active");
      });
      return;
    }

    var rect = section.getBoundingClientRect();
    var total = Math.max(1, rect.height - window.innerHeight);
    var progress = clamp((-rect.top) / total, 0, 1);
    var raw = progress * (cards.length - 1);
    var active = Math.round(raw);

    cards.forEach(function (card, i) {
      var d = i - raw;
      var abs = Math.abs(d);
      var y = d * 82 + i * 12;
      var scale = clamp(1 - abs * 0.055, 0.84, 1);
      var opacity = clamp(1 - abs * 0.18, 0.42, 1);
      var rotate = d * -1.2;

      card.style.transform = "translate3d(0," + y.toFixed(2) + "px,0) scale(" + scale.toFixed(3) + ") rotate(" + rotate.toFixed(2) + "deg)";
      card.style.opacity = opacity.toFixed(3);
      card.style.zIndex = String(40 - Math.round(abs * 6) + i);

      card.classList.toggle("scroll-stack-card-current", i === active);
      card.classList.toggle("scroll-stack-card-past", i < active);
      card.classList.toggle("scroll-stack-card-next", i > active);
      card.classList.toggle("lime-hover-active", i === active);
    });
  }

  function initHeaderFX() {
    var header = $(".premium-nimo-header");
    if (!header) return;

    window.addEventListener("scroll", function () {
      header.classList.toggle("is-scrolled", window.scrollY > 40);
    }, { passive: true });
  }

  function initHeroParallaxFX() {
    var hero = $(".hero");
    var docs = $(".hero-floating-documents");
    var ring = $(".rotating-social-wheel");

    if (!hero || !docs) return;

    hero.addEventListener("pointermove", function (event) {
      var rect = hero.getBoundingClientRect();
      var x = (event.clientX - rect.left) / rect.width - 0.5;
      var y = (event.clientY - rect.top) / rect.height - 0.5;

      docs.style.transform = "translate3d(" + (x * 18).toFixed(2) + "px," + (y * 12).toFixed(2) + "px,0)";
      if (ring) {
        ring.style.translate = (x * 8).toFixed(2) + "px " + (y * 10).toFixed(2) + "px";
      }
    });

    hero.addEventListener("pointerleave", function () {
      docs.style.transform = "";
      if (ring) ring.style.translate = "";
    });
  }

  function initTestimonialWheel() {
    var wheel = $(".testimonial-wheel");
    if (!wheel) return;

    var avatars = $$(".testimonial-avatar", wheel);
    var active = 0;

    setInterval(function () {
      avatars.forEach(function (avatar) { avatar.classList.remove("is-active"); });
      active = (active + 1) % avatars.length;
      avatars[active].classList.add("is-active");
    }, 2400);
  }

  function initV21() {
    initNimoLetterFX();
    initHeaderFX();
    initHeroParallaxFX();
    initTestimonialWheel();
    updateV21StackCards();

    window.addEventListener("scroll", updateV21StackCards, { passive: true });
    window.addEventListener("resize", updateV21StackCards);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initV21);
  } else {
    initV21();
  }

  window.updateV21StackCards = updateV21StackCards;
})();
