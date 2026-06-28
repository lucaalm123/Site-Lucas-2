
(function () {
  "use strict";

  const $ = (s, c=document) => c.querySelector(s);
  const $$ = (s, c=document) => Array.from(c.querySelectorAll(s));
  const clamp = (v,min,max) => Math.max(min, Math.min(max, v));

  function splitLetters() {
    $$("[data-letter-fx]").forEach(el => {
      if (el.dataset.ready) return;
      let i = 0;

      const processText = (text) => {
        const frag = document.createDocumentFragment();
        const parts = text.split(/(\s+)/);

        parts.forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(part));
            return;
          }

          const word = document.createElement("span");
          word.className = "word-wrap";

          [...part].forEach(ch => {
            const span = document.createElement("span");
            span.className = "letter";
            span.style.setProperty("--i", i++);
            span.textContent = ch;
            word.appendChild(span);
          });

          frag.appendChild(word);
        });

        return frag;
      };

      const walk = node => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.nodeValue;
          if (!text.trim()) return;
          node.parentNode.replaceChild(processText(text), node);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          [...node.childNodes].forEach(walk);
        }
      };

      [...el.childNodes].forEach(walk);
      el.dataset.ready = "true";
    });
  }

  function splitFillText() {
    $$(".fill-text").forEach(el => {
      if (el.dataset.fillReady) return;
      el.innerHTML = el.textContent.trim().split(/\s+/).map(w => `<span class="word">${w}</span>`).join(" ");
      el.dataset.fillReady = "true";
    });
  }

  function updateFillText() {
    $$(".fill-text").forEach(el => {
      const words = $$(".word", el);
      const r = el.getBoundingClientRect();
      const p = clamp((window.innerHeight * .82 - r.top) / (window.innerHeight * .48), 0, 1);
      const count = Math.floor(p * words.length);
      words.forEach((w, i) => w.classList.toggle("filled", i <= count));
    });
  }

  function reveal() {
    $$(".reveal").forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * .86) el.classList.add("on");
    });
  }

  function updateHeader() {
    const h = $(".header");
    if (h) h.classList.toggle("is-scrolled", scrollY > 50);
  }

  function updateStack() {
    const section = $(".stack-section");
    const cards = $$(".scroll-card");
    if (!section || !cards.length || innerWidth < 1100) return;

    const rect = section.getBoundingClientRect();
    const total = Math.max(1, rect.height - innerHeight);
    const progress = clamp((-rect.top) / total, 0, 1);
    const raw = progress * (cards.length - 1);
    const active = Math.round(raw);

    cards.forEach((card, i) => {
      const d = i - raw;
      const abs = Math.abs(d);
      const y = i * 118 + d * 52;
      const scale = clamp(1 - abs * .045, .88, 1);
      const opacity = clamp(1 - abs * .12, .56, 1);
      card.style.transform = `translate3d(0,${y.toFixed(2)}px,0) scale(${scale.toFixed(3)})`;
      card.style.opacity = opacity.toFixed(3);
      card.style.zIndex = String(30 - Math.round(abs*3) + i);
      card.classList.toggle("active", i === active);
    });
  }

  function updateTimeline() {
    const tl = $(".timeline");
    if (!tl) return;
    const r = tl.getBoundingClientRect();
    const p = clamp((innerHeight * .7 - r.top) / (r.height - innerHeight * .25), 0, 1);
    tl.style.setProperty("--progress", (p * 100).toFixed(1) + "%");
  }

  function heroParallax() {
    const hero = $(".hero");
    const art = $(".hero-art");
    if (!hero || !art) return;
    hero.addEventListener("pointermove", e => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      art.style.transform = `translate3d(${x*18}px,${y*12}px,0)`;
    });
    hero.addEventListener("pointerleave", () => art.style.transform = "");
  }

  function eyeFollow() {
    $$(".case-card").forEach(card => {
      const eye = $(".eye", card);
      if (!eye) return;
      card.addEventListener("pointermove", e => {
        const r = card.getBoundingClientRect();
        const x = e.clientX - r.left - r.width/2;
        const y = e.clientY - r.top - r.height/2;
        eye.style.translate = `calc(-50% + ${x*.12}px) calc(-50% + ${y*.12}px)`;
      });
      card.addEventListener("pointerleave", () => eye.style.translate = "-50% -50%");
    });
  }

  function testimonialCycle() {
    const avatars = $$(".nimo-avatar").length ? $$(".nimo-avatar") : $$(".avatar");
    if (!avatars.length) return;
    let i = avatars.findIndex(a => a.classList.contains("active"));
    if (i < 0) i = 0;
    setInterval(() => {
      avatars.forEach(a => a.classList.remove("active"));
      i = (i + 1) % avatars.length;
      avatars[i].classList.add("active");
    }, 2200);
  }

  function sync() {
    updateHeader();
    updateFillText();
    reveal();
    updateStack();
    updateTimeline();
  }

  document.addEventListener("DOMContentLoaded", () => {
    splitLetters();
    splitFillText();
    heroParallax();
    eyeFollow();
    testimonialCycle();
    sync();
    addEventListener("scroll", sync, { passive: true });
    addEventListener("resize", sync);
    console.info("[V23] Text + testimonial wheel fix OK");
  });
})();
