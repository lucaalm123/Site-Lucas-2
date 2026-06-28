(function () {
  "use strict";

  var root = document.documentElement;
  var ticking = false;
  var smokeParticles = [];
  var lastMouse = { x: 0, y: 0, t: 0 };
  var smokeCanvas = null;
  var smokeCtx = null;
  var smokeDpr = 1;

  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function $$(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function prefersReducedMotion() {
    return Boolean(
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function isTouchDevice() {
    return Boolean(
      "ontouchstart" in window ||
      (navigator.maxTouchPoints && navigator.maxTouchPoints > 0)
    );
  }

  function escapeHtml(value) {
    var span = document.createElement("span");
    span.textContent = String(value);
    return span.innerHTML;
  }

  function initSmoothScrollFallback() {
    root.style.scrollBehavior = prefersReducedMotion() ? "auto" : "smooth";
  }

  function initMotionFallback() {
    clearTimeout(window.__motionFallbackTimer);

    window.__motionFallbackTimer = window.setTimeout(function () {
      if (!root.classList.contains("motion-ok")) {
        root.classList.add("motion-failed");
      }
    }, 4500);
  }

  function markMotionOk() {
    root.classList.add("motion-ok");
    root.classList.remove("motion-failed");

    clearTimeout(window.__motionWatchdog);
    clearTimeout(window.__motionFallbackTimer);
  }

  function initSplitLines() {
    $$(".split").forEach(function (el) {
      Array.from(el.children).forEach(function (child, index) {
        child.style.setProperty("--i", String(index));
      });
    });
  }

  function initScrollReveal() {
    initSplitLines();

    var targets = $$(".motion, .motion-mask, .split");

    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
      targets.forEach(function (el) {
        el.classList.add("inview");
      });
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

      if (rect.top < window.innerHeight * 0.94 && rect.bottom > 0) {
        el.classList.add("inview");
      } else {
        observer.observe(el);
      }
    });

    window.addEventListener("load", function () {
      window.setTimeout(function () {
        targets.forEach(function (el) {
          el.classList.add("inview");
        });
      }, 1800);
    }, { once: true });
  }

  function initScrollFillText() {
    $$(".scroll-fill-text").forEach(function (el) {
      if (el.dataset.prepared === "true") return;

      var text = el.textContent.trim().replace(/\s+/g, " ");
      var words = text ? text.split(" ") : [];

      el.innerHTML = '<span class="scroll-fill-line">' + words.map(function (word, index) {
        return (
          '<span class="scroll-fill-word" data-word-index="' + index +
          '" style="--word-progress:0">' + escapeHtml(word) + "</span>"
        );
      }).join(" ") + "</span>";

      el.dataset.prepared = "true";
    });

    updateScrollFillText();
  }

  function updateScrollFillText() {
    $$(".scroll-fill-text").forEach(function (el) {
      var rect = el.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var start = vh * 0.9;
      var end = vh * 0.22;
      var progress = clamp((start - rect.top) / Math.max(1, start - end), 0, 1);
      var words = $$(".scroll-fill-word", el);
      var count = Math.max(1, words.length);

      words.forEach(function (word, index) {
        var local = clamp((progress * (count + 2.4) - index) / 2.25, 0, 1);
        word.style.setProperty("--word-progress", local.toFixed(3));
      });

      el.style.setProperty("--fill-progress", progress.toFixed(3));
      el.classList.toggle("text-fill-active", progress > 0.02);
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
        card.style.setProperty("--stack-offset", "0");
        card.style.setProperty("--stack-scale", "1");
        card.style.setProperty("--stack-opacity", "1");
        card.style.setProperty("--stack-z", "1");
        card.classList.remove(
          "scroll-stack-card-current",
          "scroll-stack-card-past",
          "scroll-stack-card-next",
          "lime-hover-active"
        );
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
      var offset = distance * 64 + index * 18;
      var scale = clamp(1 - abs * 0.052, 0.86, 1);
      var opacity = clamp(1 - abs * 0.16, 0.46, 1);

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
    var progress = clamp((vh * 0.72 - rect.top) / Math.max(1, rect.height - vh * 0.25), 0, 1);
    var nodes = $$(".timeline-node", timeline);
    var cards = $$(".timeline-card", timeline);

    timeline.style.setProperty("--timeline-progress", progress.toFixed(3));

    nodes.forEach(function (node, index) {
      var point = nodes.length <= 1 ? 1 : index / (nodes.length - 1);
      var active = progress + 0.04 >= point;

      node.classList.toggle("timeline-node-active", active);

      if (cards[index]) {
        cards[index].classList.toggle("timeline-card-active", active);
      }
    });
  }

  function initMagneticButtons() {
    if (isTouchDevice() || prefersReducedMotion()) return;

    $$(".magnetic-button").forEach(function (button) {
      button.addEventListener("mousemove", function (event) {
        var rect = button.getBoundingClientRect();
        var x = event.clientX - rect.left - rect.width / 2;
        var y = event.clientY - rect.top - rect.height / 2;
        var icon = $(".nimo-cta-icon, .header-arrow-icon", button);

        button.style.setProperty("--shift-x", (x * 0.1).toFixed(2) + "px");
        button.style.setProperty("--shift-y", (y * 0.16).toFixed(2) + "px");

        if (icon) {
          icon.style.transform = "translate(" + (x * 0.13).toFixed(2) + "px," + (y * 0.13).toFixed(2) + "px)";
        }
      });

      button.addEventListener("mouseleave", function () {
        var icon = $(".nimo-cta-icon, .header-arrow-icon", button);

        button.style.setProperty("--shift-x", "0px");
        button.style.setProperty("--shift-y", "0px");

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
      card.addEventListener("mouseenter", function () {
        card.classList.add("is-hovered");
      });

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
      $$(".case-showcase-card").forEach(function (item) {
        updateEyeFollow(item, null, true);
      });
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
    var dx = clamp((event.clientX - cx) / Math.max(rect.width, 1), -0.5, 0.5);
    var dy = clamp((event.clientY - cy) / Math.max(rect.height, 1), -0.5, 0.5);
    var x = dx * 24;
    var y = dy * 18;

    eye.style.setProperty("--eye-x", x.toFixed(2) + "px");
    eye.style.setProperty("--eye-y", y.toFixed(2) + "px");
    pupil.style.setProperty("--eye-x", (x * 0.72).toFixed(2) + "px");
    pupil.style.setProperty("--eye-y", (y * 0.72).toFixed(2) + "px");
  }

  function addSmoke(x, y, speed) {
    var colors = ["223,255,47", "54,201,255", "255,42,114", "255,183,94"];
    var amount = clamp(Math.round(speed / 24), 2, 6);

    for (var i = 0; i < amount; i++) {
      smokeParticles.push({
        x: x + (Math.random() - 0.5) * 14,
        y: y + (Math.random() - 0.5) * 14,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        r: 14 + Math.random() * 28 + Math.min(speed, 36) * 0.035,
        life: 0.62,
        decay: 0.018 + Math.random() * 0.022,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    if (smokeParticles.length > 180) {
      smokeParticles.splice(0, smokeParticles.length - 180);
    }
  }

  function resizeSmokeCanvas() {
    if (!smokeCanvas || !smokeCtx) return;

    smokeDpr = Math.min(window.devicePixelRatio || 1, 2);
    smokeCanvas.width = Math.floor(window.innerWidth * smokeDpr);
    smokeCanvas.height = Math.floor(window.innerHeight * smokeDpr);
    smokeCanvas.style.width = window.innerWidth + "px";
    smokeCanvas.style.height = window.innerHeight + "px";
    smokeCtx.setTransform(smokeDpr, 0, 0, smokeDpr, 0, 0);
  }

  function initMouseSmokeTrail() {
    smokeCanvas = $("#smoke-canvas");

    // V16: cria o canvas automaticamente se o HTML antigo não tiver o elemento.
    if (!smokeCanvas) {
      smokeCanvas = document.createElement("canvas");
      smokeCanvas.id = "smoke-canvas";
      smokeCanvas.className = "mouse-smoke-field";
      smokeCanvas.setAttribute("aria-hidden", "true");
      document.body.prepend(smokeCanvas);
    }

    if (prefersReducedMotion()) return;

    smokeCtx = smokeCanvas.getContext("2d");

    if (!smokeCtx) return;

    resizeSmokeCanvas();

    document.addEventListener("pointermove", function (event) {
      var now = performance.now();
      var dx = event.clientX - lastMouse.x;
      var dy = event.clientY - lastMouse.y;
      var dt = Math.max(16, now - lastMouse.t);
      var speed = Math.sqrt(dx * dx + dy * dy) / dt * 16.67;

      root.style.setProperty("--mx", event.clientX + "px");
      root.style.setProperty("--my", event.clientY + "px");

      addSmoke(event.clientX, event.clientY, speed);

      lastMouse = { x: event.clientX, y: event.clientY, t: now };
    }, { passive: true });

    window.addEventListener("resize", resizeSmokeCanvas);

    // V16: sem explosão inicial; a fumaça aparece apenas com o movimento real do mouse.

    requestAnimationFrame(function drawSmoke() {
      updateSmokeTrail();
      requestAnimationFrame(drawSmoke);
    });
  }

  function updateSmokeTrail(ctx) {
    var targetCtx = ctx || smokeCtx;

    if (!smokeCanvas || !targetCtx) return;

    targetCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    targetCtx.globalCompositeOperation = "screen";

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

      var grad = targetCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);

      grad.addColorStop(0, "rgba(" + p.color + "," + (p.life * 0.075) + ")");
      grad.addColorStop(0.48, "rgba(" + p.color + "," + (p.life * 0.034) + ")");
      grad.addColorStop(1, "rgba(" + p.color + ",0)");

      targetCtx.fillStyle = grad;
      targetCtx.beginPath();
      targetCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      targetCtx.fill();
    }

    targetCtx.globalCompositeOperation = "source-over";
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

    if (!ctx) return;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      particles = Array.from({ length: window.innerWidth < 720 ? 40 : 92 }, function (_, i) {
        return {
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          r: Math.random() * 2.3 + 0.8,
          vx: (Math.random() - 0.5) * 0.18,
          vy: -0.08 - Math.random() * 0.22,
          a: 0.18 + Math.random() * 0.68,
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
          p.x += dx / Math.max(dist, 1) * 0.22;
          p.y += dy / Math.max(dist, 1) * 0.22;
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
      var speed = Number(el.getAttribute("data-speed") || 0.06);
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
      root.style.setProperty("--mx", event.clientX + "px");
      root.style.setProperty("--my", event.clientY + "px");
    }, { passive: true });

    document.addEventListener("mouseover", function (event) {
      if (event.target && event.target.closest && event.target.closest(".case-hover")) {
        cursor.classList.add("is-active");
      }
    });

    document.addEventListener("mouseout", function (event) {
      if (event.target && event.target.closest && event.target.closest(".case-hover")) {
        cursor.classList.remove("is-active");
      }
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


  /* =========================================================
     V17 — Aurora Smoke Nimo
     Grandes gradientes atmosféricos. Sem bolinhas, sem rastro
     de cometa, sem branco estourado.
     ========================================================= */
  var aurora = null;

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function initAuroraSmoke() {
    if (prefersReducedMotion()) return;

    var canvas = $("#aurora-smoke-canvas");

    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.id = "aurora-smoke-canvas";
      canvas.className = "mouse-aurora-field aurora-smoke-layer";
      canvas.setAttribute("aria-hidden", "true");
      document.body.prepend(canvas);
    }

    var ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    var dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    var pointer = {
      x: window.innerWidth * 0.42,
      y: window.innerHeight * 0.38,
      tx: window.innerWidth * 0.42,
      ty: window.innerHeight * 0.38
    };

    var isMobile = window.innerWidth < 720;
    var intensity = isMobile ? 0.54 : 1;

    var blobs = [
      {
        name: "blue-depth",
        x: window.innerWidth * 0.42,
        y: window.innerHeight * 0.36,
        ox: -160,
        oy: -20,
        radius: isMobile ? 300 : 520,
        color: [54, 201, 255],
        alpha: 0.115 * intensity,
        lag: 0.035,
        drift: 0.0009,
        scale: 1
      },
      {
        name: "lime-rim",
        x: window.innerWidth * 0.56,
        y: window.innerHeight * 0.40,
        ox: 80,
        oy: 12,
        radius: isMobile ? 260 : 430,
        color: [223, 255, 47],
        alpha: 0.085 * intensity,
        lag: 0.026,
        drift: 0.0011,
        scale: 1
      },
      {
        name: "magenta-side",
        x: window.innerWidth * 0.28,
        y: window.innerHeight * 0.46,
        ox: -310,
        oy: 46,
        radius: isMobile ? 270 : 470,
        color: [255, 42, 114],
        alpha: 0.060 * intensity,
        lag: 0.018,
        drift: 0.0007,
        scale: 1
      },
      {
        name: "amber-low",
        x: window.innerWidth * 0.36,
        y: window.innerHeight * 0.62,
        ox: -80,
        oy: 170,
        radius: isMobile ? 230 : 360,
        color: [255, 183, 94],
        alpha: 0.052 * intensity,
        lag: 0.015,
        drift: 0.0013,
        scale: 1
      },
      {
        name: "deep-cyan-wide",
        x: window.innerWidth * 0.62,
        y: window.innerHeight * 0.22,
        ox: 190,
        oy: -160,
        radius: isMobile ? 320 : 620,
        color: [39, 236, 198],
        alpha: 0.038 * intensity,
        lag: 0.012,
        drift: 0.00055,
        scale: 1
      }
    ];

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      isMobile = window.innerWidth < 720;
      intensity = isMobile ? 0.54 : 1;
    }

    function onPointerMove(event) {
      pointer.tx = event.clientX;
      pointer.ty = event.clientY;
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("pointermove", onPointerMove, { passive: true });

    aurora = {
      canvas: canvas,
      ctx: ctx,
      pointer: pointer,
      blobs: blobs,
      startedAt: performance.now(),
      running: true
    };

    renderAuroraSmoke();
  }

  function updateAuroraSmoke(time) {
    if (!aurora) return;

    var pointer = aurora.pointer;
    pointer.x = lerp(pointer.x, pointer.tx, 0.055);
    pointer.y = lerp(pointer.y, pointer.ty, 0.055);

    var t = (time - aurora.startedAt) * 0.001;

    aurora.blobs.forEach(function (blob, index) {
      var waveX = Math.cos(t * (0.34 + index * 0.07) + index * 1.7) * (34 + index * 8);
      var waveY = Math.sin(t * (0.28 + index * 0.05) + index * 1.2) * (22 + index * 5);
      var targetX = pointer.x + blob.ox + waveX;
      var targetY = pointer.y + blob.oy + waveY;

      blob.x = lerp(blob.x, targetX, blob.lag);
      blob.y = lerp(blob.y, targetY, blob.lag);
      blob.scale = 1 + Math.sin(t * (0.52 + index * 0.04) + index) * 0.045;
    });
  }

  function renderAuroraSmoke(time) {
    if (!aurora || !aurora.running) return;

    var ctx = aurora.ctx;
    var width = window.innerWidth;
    var height = window.innerHeight;
    var now = typeof time === "number" ? time : performance.now();

    updateAuroraSmoke(now);

    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = "screen";

    // Camada base quase imperceptível, para a fumaça não parecer colada.
    var base = ctx.createRadialGradient(width * 0.52, height * 0.38, 0, width * 0.52, height * 0.38, Math.max(width, height) * 0.82);
    base.addColorStop(0, "rgba(20, 70, 62, 0.035)");
    base.addColorStop(0.48, "rgba(10, 36, 48, 0.018)");
    base.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, width, height);

    aurora.blobs.forEach(function (blob) {
      var radius = blob.radius * blob.scale;
      var color = blob.color;
      var gradient = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, radius);

      // Sem branco puro: centro colorido translúcido e borda longa.
      gradient.addColorStop(0, "rgba(" + color[0] + "," + color[1] + "," + color[2] + "," + blob.alpha + ")");
      gradient.addColorStop(0.28, "rgba(" + color[0] + "," + color[1] + "," + color[2] + "," + (blob.alpha * 0.62) + ")");
      gradient.addColorStop(0.62, "rgba(" + color[0] + "," + color[1] + "," + color[2] + "," + (blob.alpha * 0.22) + ")");
      gradient.addColorStop(1, "rgba(" + color[0] + "," + color[1] + "," + color[2] + ",0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(blob.x, blob.y, radius, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalCompositeOperation = "source-over";

    requestAnimationFrame(renderAuroraSmoke);
  }

  // Compatibilidade: chamadas antigas de smoke agora usam Aurora.
  function initMouseSmokeTrail() {
    initNimoFluidAurora();
  }

  function updateSmokeTrail() {
    updateAuroraSmoke(performance.now());
  }


  /* =========================================================
     V18 — Nimo Fluid Aurora Trail
     O zip do Nimo usa webgl-fluid em canvas:
     TRIGGER:'hover', TRANSPARENT:true, DENSITY_DISSIPATION,
     CURL, SPLAT_RADIUS. Aqui recrio o comportamento visual
     em Canvas 2D: rastro fluido, splats amplos, dissipação e
     curl suave. Não é bolinha nem partícula pontilhada.
     ========================================================= */
  var nimoFluidAurora = null;

  function initNimoFluidAurora() {
    if (prefersReducedMotion()) return;

    var canvas = $("#nimo-fluid-aurora-canvas");

    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.id = "nimo-fluid-aurora-canvas";
      canvas.className = "nimo-fluid-aurora-canvas nimo-fluid-aurora-trail mouse-aurora-field aurora-smoke-layer";
      canvas.setAttribute("aria-hidden", "true");
      document.body.prepend(canvas);
    }

    var ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var isMobile = window.innerWidth < 720;

    var pointer = {
      x: window.innerWidth * 0.43,
      y: window.innerHeight * 0.38,
      px: window.innerWidth * 0.43,
      py: window.innerHeight * 0.38,
      tx: window.innerWidth * 0.43,
      ty: window.innerHeight * 0.38,
      vx: 0,
      vy: 0,
      speed: 0,
      active: false,
      lastMove: performance.now()
    };

    var colors = [
      [54, 201, 255],   // blue
      [39, 236, 198],   // cyan-green
      [223, 255, 47],   // lime
      [255, 42, 114],   // magenta
      [255, 183, 94]    // amber
    ];

    var trails = [];
    var maxTrail = isMobile ? 18 : 30;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      isMobile = window.innerWidth < 720;
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function addTrailPoint(x, y, speed) {
      var hueIndex = Math.floor((performance.now() * 0.0018 + trails.length * 0.33) % colors.length);
      trails.push({
        x: x,
        y: y,
        px: pointer.px,
        py: pointer.py,
        speed: Math.min(speed, isMobile ? 38 : 52),
        life: 1,
        radius: (isMobile ? 110 : 180) + Math.min(speed, 48) * (isMobile ? 2.2 : 3.4),
        color: colors[hueIndex],
        color2: colors[(hueIndex + 2) % colors.length],
        curl: (Math.random() - 0.5) * 26
      });

      if (trails.length > maxTrail) {
        trails.splice(0, trails.length - maxTrail);
      }
    }

    function onPointerMove(event) {
      pointer.tx = event.clientX;
      pointer.ty = event.clientY;
      pointer.active = true;
      pointer.lastMove = performance.now();
    }

    function onPointerLeave() {
      pointer.active = false;
    }

    function splat(x, y, radius, color, alpha, elongation, angle) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.scale(elongation, 1);

      var gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
      gradient.addColorStop(0, "rgba(" + color[0] + "," + color[1] + "," + color[2] + "," + alpha + ")");
      gradient.addColorStop(0.25, "rgba(" + color[0] + "," + color[1] + "," + color[2] + "," + (alpha * 0.58) + ")");
      gradient.addColorStop(0.62, "rgba(" + color[0] + "," + color[1] + "," + color[2] + "," + (alpha * 0.20) + ")");
      gradient.addColorStop(1, "rgba(" + color[0] + "," + color[1] + "," + color[2] + ",0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function drawRibbon(point, index, total) {
      var alpha = 0.030 * point.life;
      var width = (isMobile ? 72 : 118) + point.speed * 2.2;
      var angle = Math.atan2(point.y - point.py, point.x - point.px);
      var nx = Math.cos(angle + Math.PI / 2) * point.curl;
      var ny = Math.sin(angle + Math.PI / 2) * point.curl;

      var grad = ctx.createLinearGradient(point.px, point.py, point.x, point.y);
      grad.addColorStop(0, "rgba(" + point.color[0] + "," + point.color[1] + "," + point.color[2] + ",0)");
      grad.addColorStop(0.42, "rgba(" + point.color[0] + "," + point.color[1] + "," + point.color[2] + "," + alpha + ")");
      grad.addColorStop(1, "rgba(" + point.color2[0] + "," + point.color2[1] + "," + point.color2[2] + "," + (alpha * 0.82) + ")");

      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = grad;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(point.px - nx * 0.3, point.py - ny * 0.3);
      ctx.quadraticCurveTo(
        (point.px + point.x) / 2 + nx,
        (point.py + point.y) / 2 + ny,
        point.x,
        point.y
      );
      ctx.stroke();
      ctx.restore();
    }

    function resizeSafe() {
      resize();
    }

    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave, { passive: true });
    window.addEventListener("resize", resizeSafe, { passive: true });

    resize();

    nimoFluidAurora = {
      canvas: canvas,
      ctx: ctx,
      pointer: pointer,
      trails: trails,
      colors: colors,
      startedAt: performance.now(),
      addTrailPoint: addTrailPoint,
      splat: splat,
      drawRibbon: drawRibbon,
      running: true
    };

    renderNimoFluidAurora();
  }

  function updateNimoFluidAurora(time) {
    if (!nimoFluidAurora) return;

    var p = nimoFluidAurora.pointer;
    var oldX = p.x;
    var oldY = p.y;

    p.px = p.x;
    p.py = p.y;
    p.x = lerp(p.x, p.tx, 0.075);
    p.y = lerp(p.y, p.ty, 0.075);
    p.vx = p.x - oldX;
    p.vy = p.y - oldY;
    p.speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);

    var idle = time - p.lastMove;
    var t = (time - nimoFluidAurora.startedAt) * 0.001;

    // Mesmo parado, mantém uma aurora viva e lenta, como luz de fundo.
    if (idle > 120) {
      p.tx += Math.cos(t * 0.9) * 0.12;
      p.ty += Math.sin(t * 0.7) * 0.10;
    }

    if (p.speed > 0.35 || idle < 180) {
      nimoFluidAurora.addTrailPoint(p.x, p.y, p.speed);
    }

    for (var i = nimoFluidAurora.trails.length - 1; i >= 0; i--) {
      var point = nimoFluidAurora.trails[i];
      point.life -= 0.018;
      point.radius *= 1.006;
      point.curl *= 0.992;

      if (point.life <= 0) {
        nimoFluidAurora.trails.splice(i, 1);
      }
    }
  }

  function renderNimoFluidAurora(time) {
    if (!nimoFluidAurora || !nimoFluidAurora.running) return;

    var ctx = nimoFluidAurora.ctx;
    var width = window.innerWidth;
    var height = window.innerHeight;
    var now = typeof time === "number" ? time : performance.now();

    updateNimoFluidAurora(now);

    // Dissipação tipo fluido: apaga devagar, mantendo rastro.
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0,0,0,0.045)";
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = "screen";

    var t = (now - nimoFluidAurora.startedAt) * 0.001;
    var p = nimoFluidAurora.pointer;

    // Massa atmosférica larga que segue o mouse com atraso.
    var ambientColors = nimoFluidAurora.colors;
    for (var a = 0; a < 4; a++) {
      var c = ambientColors[a];
      var ax = p.x + Math.cos(t * (0.42 + a * 0.08) + a) * (120 + a * 38) + (a - 1.5) * 90;
      var ay = p.y + Math.sin(t * (0.34 + a * 0.07) + a * 1.8) * (70 + a * 24) + (a - 1.5) * 34;
      var ar = (window.innerWidth < 720 ? 250 : 430) + a * 46;
      var aa = [0.038, 0.030, 0.026, 0.020][a];

      nimoFluidAurora.splat(ax, ay, ar, c, aa, 1.55 + a * 0.18, t * 0.18 + a);
    }

    // Rastro de aurora — faixas largas, não bolinhas.
    nimoFluidAurora.trails.forEach(function (point, index) {
      nimoFluidAurora.drawRibbon(point, index, nimoFluidAurora.trails.length);
    });

    // Splats fluidos espalhados na trilha, mas grandes e translúcidos.
    nimoFluidAurora.trails.forEach(function (point, index) {
      if (index % 2 !== 0) return;

      var angle = Math.atan2(point.y - point.py, point.x - point.px);
      var alpha = Math.min(0.055, 0.018 + point.speed * 0.0018) * point.life;
      var elongation = 1.65 + Math.min(point.speed, 45) * 0.018;

      nimoFluidAurora.splat(
        point.x,
        point.y,
        point.radius,
        point.color,
        alpha,
        elongation,
        angle
      );
    });

    ctx.restore();

    requestAnimationFrame(renderNimoFluidAurora);
  }

  // Mantém os nomes pedidos no prompt, mas agora com rastro fluido.
  function initAuroraSmoke() {
    initNimoFluidAurora();
  }

  function updateAuroraSmoke() {
    updateNimoFluidAurora(performance.now());
  }

  function renderAuroraSmoke() {
    renderNimoFluidAurora(performance.now());
  }

  function initMouseSmokeTrail() {
    initNimoFluidAurora();
  }

  function updateSmokeTrail() {
    updateNimoFluidAurora(performance.now());
  }

  function initEffects() {
    if (window.__effectsInitialized) {
      onScroll();
      return;
    }

    window.__effectsInitialized = true;

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
    initNimoFluidAurora();
    initOrbitNodes();
    initParticleCanvas();
    initParallax();
    initCursor();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    onScroll();
    markMotionOk();
  }

  window.initNimoFluidAurora = initNimoFluidAurora;
  window.updateNimoFluidAurora = updateNimoFluidAurora;
  window.renderNimoFluidAurora = renderNimoFluidAurora;
  window.initAuroraSmoke = initAuroraSmoke;
  window.updateAuroraSmoke = updateAuroraSmoke;
  window.renderAuroraSmoke = renderAuroraSmoke;
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
