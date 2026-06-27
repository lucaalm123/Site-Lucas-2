(function () {
  function markMotionOk() {
    document.documentElement.classList.add("motion-ok");
    document.documentElement.classList.remove("motion-failed");

    if (window.__motionWatchdog) {
      clearTimeout(window.__motionWatchdog);
      window.__motionWatchdog = null;
    }
  }

  function initSplit() {
    $$(".split").forEach(function (el) {
      Array.from(el.children).forEach(function (child, index) {
        child.style.setProperty("--i", index);
      });
    });
  }

  function initReveal() {
    initSplit();

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
    }, {
      threshold: 0.13,
      rootMargin: "0px 0px -7% 0px"
    });

    targets.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.94 && rect.bottom > 0) {
        requestAnimationFrame(function () {
          el.classList.add("inview");
        });
      } else {
        observer.observe(el);
      }
    });

    setTimeout(function () {
      targets.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 1.1) el.classList.add("inview");
      });
    }, 1200);

    window.addEventListener("load", function () {
      setTimeout(function () {
        targets.forEach(function (el) {
          if (!el.classList.contains("inview")) el.classList.add("inview");
        });
      }, 1800);
    }, { once: true });
  }

  function initSpotlight() {
    document.addEventListener("pointermove", function (event) {
      document.documentElement.style.setProperty("--mx", event.clientX + "px");
      document.documentElement.style.setProperty("--my", event.clientY + "px");
    }, { passive: true });
  }

  function initCursor() {
    if (isTouchDevice()) return;
    var cursor = $(".cursor");
    if (!cursor) return;

    document.addEventListener("pointermove", function (event) {
      cursor.style.left = event.clientX + "px";
      cursor.style.top = event.clientY + "px";
    }, { passive: true });

    document.addEventListener("mouseover", function (event) {
      if (event.target.closest(".case-hover")) cursor.classList.add("is-active");
    });

    document.addEventListener("mouseout", function (event) {
      if (event.target.closest(".case-hover")) cursor.classList.remove("is-active");
    });
  }

  function initTilt() {
    if (isTouchDevice() || prefersReducedMotion()) return;

    document.addEventListener("mousemove", function (event) {
      var card = event.target.closest(".tilt");
      if (!card) return;

      var rect = card.getBoundingClientRect();
      var x = event.clientX - rect.left;
      var y = event.clientY - rect.top;
      var rotateY = ((x / rect.width) - .5) * 8;
      var rotateX = ((y / rect.height) - .5) * -8;

      card.style.transform = "perspective(1000px) rotateX(" + rotateX.toFixed(2) + "deg) rotateY(" + rotateY.toFixed(2) + "deg)";
    }, { passive: true });

    document.addEventListener("mouseout", function (event) {
      var card = event.target.closest(".tilt");
      if (!card) return;
      if (!card.contains(event.relatedTarget)) card.style.transform = "";
    });
  }

  function initParallax() {
    if (prefersReducedMotion()) return;

    var items = $$(".parallax");
    if (!items.length) return;

    var ticking = false;

    function update() {
      var vh = window.innerHeight || document.documentElement.clientHeight;

      items.forEach(function (item) {
        var rect = item.getBoundingClientRect();
        var speed = Number(item.getAttribute("data-speed") || 0.06);
        var center = rect.top + rect.height / 2;
        var y = (center - vh / 2) * speed * -1;
        item.style.translate = "0 " + y.toFixed(2) + "px";
      });

      ticking = false;
    }

    function requestTick() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }

    window.addEventListener("scroll", requestTick, { passive: true });
    window.addEventListener("resize", requestTick);
    update();
  }

  function initCanvas() {
    var canvas = $("#ambient-canvas");
    if (!canvas || prefersReducedMotion()) return;

    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var points = [];

    function resize() {
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      points = Array.from({ length: 18 }, function (_, i) {
        return {
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          r: 90 + Math.random() * 190,
          vx: (Math.random() - .5) * .22,
          vy: (Math.random() - .5) * .22,
          c: ["rgba(243,179,91,.14)", "rgba(240,42,104,.12)", "rgba(67,182,255,.10)", "rgba(141,101,255,.09)"][i % 4]
        };
      });
    }

    function draw() {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      points.forEach(function (p) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -p.r) p.x = window.innerWidth + p.r;
        if (p.x > window.innerWidth + p.r) p.x = -p.r;
        if (p.y < -p.r) p.y = window.innerHeight + p.r;
        if (p.y > window.innerHeight + p.r) p.y = -p.r;

        var grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        grad.addColorStop(0, p.c);
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    draw();
  }

  function initEffects() {
    initReveal();
    initSpotlight();
    initCursor();
    initTilt();
    initParallax();
    initCanvas();
    markMotionOk();
  }

  window.initEffects = initEffects;
})();
