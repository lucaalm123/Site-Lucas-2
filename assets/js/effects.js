(function () {
  var ticking = false;
  var smokeParticles = [];
  var lastMouse = { x: 0, y: 0, t: 0 };

  function initSmoothScrollFallback() {
    document.documentElement.style.scrollBehavior = "smooth";
  }

  function initMotionFallback() {
    window.__motionFallbackTimer = window.setTimeout(function () {
      if (!document.documentElement.classList.contains("motion-ok")) {
        document.documentElement.classList.add("motion-failed");
      }
    }, 4500);
  }

  function markMotionOk() {
    document.documentElement.classList.add("motion-ok");
    document.documentElement.classList.remove("motion-failed");

    if (window.__motionWatchdog) clearTimeout(window.__motionWatchdog);
    if (window.__motionFallbackTimer) clearTimeout(window.__motionFallbackTimer);
  }

  function initSplitLines() {
    $$(".split").forEach(function (el) {
      Array.from(el.children).forEach(function (child, index) {
        child.style.setProperty("--i", index);
      });
    });
  }

  function initScrollReveal() {
    initSplitLines();

    var targets = $$(".motion, .motion-mask, .split");

    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
      targets.forEach(function (el) { el.classList.add("inview"); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("inview");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    targets.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * .94 && rect.bottom > 0) {
        el.classList.add("inview");
      } else {
        observer.observe(el);
      }
    });

    window.addEventListener("load", function () {
      setTimeout(function () {
        targets.forEach(function (el) { el.classList.add("inview"); });
      }, 1800);
    }, { once: true });
  }

  function initScrollFillText() {
    $$(".scroll-fill-text").forEach(function (el) {
      if (el.dataset.prepared === "true") return;

      var text = el.textContent.trim().replace(/\s+/g, " ");
      el.innerHTML = '<span class="scroll-fill-line">' + text.split(" ").map(function (word, index) {
        return '<span class="scroll-fill-word" data-word-index="' + index + '" style="--word-progress:0">' + escapeHtml(word) + '</span>';
      }).join(" ") + '</span>';

      el.dataset.prepared = "true";
    });

    updateScrollFillText();
  }

  function updateScrollFillText() {
    $$(".scroll-fill-text").forEach(function (el) {
      var rect = el.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var start = vh * .90;
      var end = vh * .22;
      var progress = clamp((start - rect.top) / Math.max(1, start - end), 0, 1);
      var words = $$(".scroll-fill-word", el);
      var count = Math.max(1, words.length);

      words.forEach(function (word, index) {
        var local = clamp((progress * (count + 2.4) - index) / 2.25, 0, 1);
        word.style.setProperty("--word-progress", local.toFixed(3));
      });

      el.style.setProperty("--fill-progress", progress.toFixed(3));
      el.classList.toggle("text-fill-active", progress > .02);
    });
  }

  function initScrollStackCards() {
    updateScrollStackCards();
  }

  function updateScrollStackCards() {
    var section = $(".scroll-stack-section");
    var cards = $$(".scroll-stack-card");
    if (!section || !cards.length) return;

    if (window.innerWidth <= 1180) {
      cards.forEach(function (card) {
        card.style.setProperty("--stack-offset", 0);
        card.style.setProperty("--stack-scale", 1);
        card.style.setProperty("--stack-opacity", 1);
      });
      return;
    }

    var rect = section.getBoundingClientRect();
    var scrollable = Math.max(1, rect.height - window.innerHeight);
    var progress = clamp((-rect.top) / scrollable, 0, 1);
    var active = Math.round(progress * (cards.length - 1));

    cards.forEach(function (card, index) {
      var distance = index - progress * (cards.length - 1);
      var abs = Math.abs(distance);
      var offset = distance * 92;
      var scale = clamp(1 - abs * .075, .78, 1);
      var opacity = clamp(1 - abs * .24, .30, 1);

      card.style.setProperty("--stack-offset", offset.toFixed(2));
      card.style.setProperty("--stack-scale", scale.toFixed(3));
      card.style.setProperty("--stack-opacity", opacity.toFixed(3));
      card.style.setProperty("--stack-z", String(20 - Math.round(abs * 4) + index));

      card.classList.toggle("scroll-stack-card-current", index === active);
      card.classList.toggle("scroll-stack-card-past", index < active);
      card.classList.toggle("scroll-stack-card-next", index > active);
      card.classList.toggle("lime-hover-active", index === active);
    });
  }

  function initTimelineProgress() {
    updateTimelineProgress();
  }

  function updateTimelineProgress() {
    var timeline = $(".method-timeline");
    if (!timeline) return;

    var rect = timeline.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var progress = clamp((vh * .72 - rect.top) / Math.max(1, rect.height - vh * .25), 0, 1);

    timeline.style.setProperty("--timeline-progress", progress.toFixed(3));

    var nodes = $$(".timeline-node", timeline);
    var cards = $$(".timeline-card", timeline);

    nodes.forEach(function (node, index) {
      var point = nodes.length <= 1 ? 1 : index / (nodes.length - 1);
      var active = progress + .04 >= point;
      node.classList.toggle("timeline-node-active", active);
      if (cards[index]) cards[index].classList.toggle("timeline-card-active", active);
    });
  }

  function initMagneticButtons() {
    if (isTouchDevice() || prefersReducedMotion()) return;

    $$(".magnetic-button").forEach(function (button) {
      button.addEventListener("mousemove", function (event) {
        var rect = button.getBoundingClientRect();
        var x = event.clientX - rect.left - rect.width / 2;
        var y = event.clientY - rect.top - rect.height / 2;

        button.style.setProperty("--shift-x", (x * .10).toFixed(2) + "px");
        button.style.setProperty("--shift-y", (y * .16).toFixed(2) + "px");

        var icon = $(".nimo-cta-icon, .header-arrow-icon", button);
        if (icon) {
          icon.style.transform = "translate(" + (x * .13).toFixed(2) + "px," + (y * .13).toFixed(2) + "px)";
        }
      });

      button.addEventListener("mouseleave", function () {
        button.style.setProperty("--shift-x", "0px");
        button.style.setProperty("--shift-y", "0px");

        var icon = $(".nimo-cta-icon, .header-arrow-icon", button);
        if (icon) icon.style.transform = "";
      });
    });
  }

  function initStackedHoverCards() {
    $$(".stacked-card").forEach(function (card) {
      card.addEventListener("mouseenter", function () {
        var group = card.closest(".stacked-card-group");
        if (!group) return;

        $$(".stacked-card", group).forEach(function (other) {
          other.classList.toggle("stacked-card-active", other === card);
          other.classList.toggle("card-state-dimmed", other !== card);
        });
      });
    });

    $$(".stacked-card-group").forEach(function (group) {
      group.addEventListener("mouseleave", function () {
        $$(".stacked-card", group).forEach(function (card, index) {
          card.classList.toggle("stacked-card-active", index === 1);
          card.classList.remove("card-state-dimmed");
        });
      });
    });
  }

  function initPortfolioHover() {
    $$(".case-showcase-card").forEach(function (card) {
      card.addEventListener("mouseenter", function () { card.classList.add("is-hovered"); });
      card.addEventListener("mouseleave", function () {
        card.classList.remove("is-hovered");
        updateEyeFollow(card, null, true);
      });
      card.addEventListener("mousemove", function (event) {
        updateEyeFollow(card, event, false);
      });
    });
  }

  function initEyeFollow() {
    updateEyeFollow();
  }

  function updateEyeFollow(card, event, reset) {
    if (!card) {
      $$(".case-showcase-card").forEach(function (item) { updateEyeFollow(item, null, true); });
      return;
    }

    var eye = $(".case-eye-icon", card);
    var pupil = $(".case-eye-pupil", card);
    if (!eye || !pupil) return;

    if (reset || !event) {
      eye.style.setProperty("--eye-x", "0px");
      eye.style.setProperty("--eye-y", "0px");
      pupil.style.setProperty("--eye-x", "0px");
      pupil.style.setProperty("--eye-y", "0px");
      return;
    }

    var rect = card.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    var dx = clamp((event.clientX - cx) / rect.width, -.5, .5);
    var dy = clamp((event.clientY - cy) / rect.height, -.5, .5);
    var x = dx * 24;
    var y = dy * 18;

    eye.style.setProperty("--eye-x", x.toFixed(2) + "px");
    eye.style.setProperty("--eye-y", y.toFixed(2) + "px");
    pupil.style.setProperty("--eye-x", (x * .72).toFixed(2) + "px");
    pupil.style.setProperty("--eye-y", (y * .72).toFixed(2) + "px");
  }

  function initMouseSmokeTrail() {
    var canvas = $("#smoke-canvas");
    if (!canvas || prefersReducedMotion()) return;

    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function addSmoke(x, y, speed) {
      var colors = ["223,255,47", "54,201,255", "255,42,114", "255,183,94"];
      var amount = clamp(Math.round(speed / 28), 1, 5);
      for (var i = 0; i < amount; i++) {
        smokeParticles.push({
          x: x + (Math.random() - .5) * 14,
          y: y + (Math.random() - .5) * 14,
          vx: (Math.random() - .5) * 0.7,
          vy: (Math.random() - .5) * 0.7,
          r: 28 + Math.random() * 52 + speed * .07,
          life: 1,
          decay: .010 + Math.random() * .018,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
      if (smokeParticles.length > 180) smokeParticles.splice(0, smokeParticles.length - 180);
    }

    document.addEventListener("pointermove", function (event) {
      var now = performance.now();
      var dx = event.clientX - lastMouse.x;
      var dy = event.clientY - lastMouse.y;
      var dt = Math.max(16, now - lastMouse.t);
      var speed = Math.sqrt(dx * dx + dy * dy) / dt * 16.67;

      document.documentElement.style.setProperty("--mx", event.clientX + "px");
      document.documentElement.style.setProperty("--my", event.clientY + "px");

      addSmoke(event.clientX, event.clientY, speed);

      lastMouse = { x: event.clientX, y: event.clientY, t: now };
    }, { passive: true });

    function draw() {
      updateSmokeTrail(ctx);
      requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    draw();
  }

  function updateSmokeTrail(ctx) {
    var canvas = $("#smoke-canvas");
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.globalCompositeOperation = "lighter";

    for (var i = smokeParticles.length - 1; i >= 0; i--) {
      var p = smokeParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.r *= 1.006;
      p.life -= p.decay;

      if (p.life <= 0) {
        smokeParticles.splice(i, 1);
        continue;
      }

      var grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      grad.addColorStop(0, "rgba(" + p.color + "," + (p.life * .16) + ")");
      grad.addColorStop(.38, "rgba(" + p.color + "," + (p.life * .075) + ")");
      grad.addColorStop(1, "rgba(" + p.color + ",0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalCompositeOperation = "source-over";
  }

  function initOrbitNodes() {
    var nodes = $$(".orbit-node");
    if (!nodes.length) return;

    nodes.forEach(function (node, index) {
      var angle = (index / nodes.length) * Math.PI * 2;
      var radius = index % 2 === 0 ? 310 : 230;
      var x = Math.cos(angle) * radius;
      var y = Math.sin(angle) * radius;

      node.style.left = "calc(50% + " + x.toFixed(2) + "px - 48px)";
      node.style.top = "calc(50% + " + y.toFixed(2) + "px - 48px)";
    });
  }

  function initParticleCanvas() {
    var canvas = $("#particle-canvas");
    if (!canvas || prefersReducedMotion()) return;

    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var particles = [];
    var mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    function resize() {
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      particles = Array.from({ length: window.innerWidth < 720 ? 40 : 92 }, function (_, i) {
        return {
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          r: Math.random() * 2.3 + .8,
          vx: (Math.random() - .5) * .18,
          vy: -0.08 - Math.random() * .22,
          a: .18 + Math.random() * .68,
          hue: i % 6 === 0 ? "54,201,255" : (i % 5 === 0 ? "255,42,114" : "223,255,47")
        };
      });
    }

    function draw() {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      particles.forEach(function (p) {
        p.x += p.vx;
        p.y += p.vy;

        var dx = p.x - mouse.x;
        var dy = p.y - mouse.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          p.x += dx / Math.max(dist, 1) * .22;
          p.y += dy / Math.max(dist, 1) * .22;
        }

        if (p.y < -20) p.y = window.innerHeight + 20;
        if (p.x < -20) p.x = window.innerWidth + 20;
        if (p.x > window.innerWidth + 20) p.x = -20;

        ctx.beginPath();
        ctx.fillStyle = "rgba(" + p.hue + "," + p.a + ")";
        ctx.shadowBlur = 16;
        ctx.shadowColor = "rgba(" + p.hue + ",.52)";
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(draw);
    }

    document.addEventListener("pointermove", function (event) {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    }, { passive: true });

    resize();
    window.addEventListener("resize", resize);
    draw();
  }

  function initParallax() {
    updateParallax();
  }

  function updateParallax() {
    if (prefersReducedMotion()) return;

    var vh = window.innerHeight || document.documentElement.clientHeight;
    $$(".parallax").forEach(function (el) {
      var rect = el.getBoundingClientRect();
      var speed = Number(el.getAttribute("data-speed") || .06);
      var center = rect.top + rect.height / 2;
      var y = (center - vh / 2) * speed * -1;
      el.style.translate = "0 " + y.toFixed(2) + "px";
    });
  }

  function initCursor() {
    if (isTouchDevice()) return;

    var cursor = $(".cursor");
    if (!cursor) return;

    document.addEventListener("pointermove", function (event) {
      cursor.style.left = event.clientX + "px";
      cursor.style.top = event.clientY + "px";
      document.documentElement.style.setProperty("--mx", event.clientX + "px");
      document.documentElement.style.setProperty("--my", event.clientY + "px");
    }, { passive: true });

    document.addEventListener("mouseover", function (event) {
      if (event.target.closest(".case-hover")) cursor.classList.add("is-active");
    });

    document.addEventListener("mouseout", function (event) {
      if (event.target.closest(".case-hover")) cursor.classList.remove("is-active");
    });
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(function () {
      updateScrollFillText();
      updateScrollStackCards();
      updateTimelineProgress();
      updateParallax();
      ticking = false;
    });
  }

  function initEffects() {
    initMotionFallback();
    initSmoothScrollFallback();
    initScrollReveal();
    initScrollFillText();
    initScrollStackCards();
    initTimelineProgress();
    initMagneticButtons();
    initStackedHoverCards();
    initPortfolioHover();
    initEyeFollow();
    initMouseSmokeTrail();
    initOrbitNodes();
    initParticleCanvas();
    initParallax();
    initCursor();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    onScroll();
    markMotionOk();
  }

  window.initSmoothScrollFallback = initSmoothScrollFallback;
  window.initScrollReveal = initScrollReveal;
  window.initScrollFillText = initScrollFillText;
  window.updateScrollFillText = updateScrollFillText;
  window.initScrollStackCards = initScrollStackCards;
  window.updateScrollStackCards = updateScrollStackCards;
  window.initTimelineProgress = initTimelineProgress;
  window.updateTimelineProgress = updateTimelineProgress;
  window.initMagneticButtons = initMagneticButtons;
  window.initStackedHoverCards = initStackedHoverCards;
  window.initPortfolioHover = initPortfolioHover;
  window.initEyeFollow = initEyeFollow;
  window.updateEyeFollow = updateEyeFollow;
  window.initMouseSmokeTrail = initMouseSmokeTrail;
  window.updateSmokeTrail = updateSmokeTrail;
  window.initOrbitNodes = initOrbitNodes;
  window.initParticleCanvas = initParticleCanvas;
  window.initParallax = initParallax;
  window.initCursor = initCursor;
  window.initMotionFallback = initMotionFallback;
  window.initEffects = initEffects;
})();
