
(function(){
  "use strict";

  const $ = (s,c=document)=>c.querySelector(s);
  const $$ = (s,c=document)=>Array.from(c.querySelectorAll(s));
  const clamp = (v,min,max)=>Math.max(min,Math.min(max,v));

  function bridgeFluidCanvas(){
    const canvas = $("#nimo-native-fluid-canvas");
    if(!canvas) return;
    // Mantém o canvas sem bloquear cliques, mas alimenta o webgl-fluid com eventos sintéticos.
    let last = 0;
    const feed = (type, e) => {
      const now = performance.now();
      if(type === "mousemove" && now - last < 8) return;
      last = now;
      const ev = new MouseEvent(type, {
        clientX: e.clientX,
        clientY: e.clientY,
        bubbles: true,
        cancelable: false,
        view: window
      });
      canvas.dispatchEvent(ev);
    };
    document.addEventListener("mousemove", e => feed("mousemove", e), {passive:true});
    document.addEventListener("mousedown", e => feed("mousedown", e), {passive:true});
    document.addEventListener("mouseup", e => feed("mouseup", e), {passive:true});
  }

  function splitFill(){
    $$(".fill-text").forEach(el=>{
      if(el.dataset.fillReady) return;
      const text = el.textContent.trim();
      el.innerHTML = text.split(/\s+/).map(w=>`<span class="word">${w}</span>`).join(" ");
      el.dataset.fillReady = "true";
    });
  }

  function updateFill(){
    $$(".fill-text").forEach(el=>{
      const words = $$(".word", el);
      const r = el.getBoundingClientRect();
      const p = clamp((innerHeight*.82 - r.top)/(innerHeight*.50),0,1);
      const max = Math.floor(p * words.length);
      words.forEach((w,i)=>w.classList.toggle("filled", i <= max));
    });
  }

  function reveal(){
    $$(".reveal").forEach(el=>{
      if(el.getBoundingClientRect().top < innerHeight*.86) el.classList.add("on");
    });
  }

  function heroParallax(){
    const hero = $(".hero");
    const art = $(".hero-art");
    if(!hero || !art) return;
    hero.addEventListener("pointermove", e=>{
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left)/r.width - .5;
      const y = (e.clientY - r.top)/r.height - .5;
      art.style.transform = `translate3d(${x*18}px,${y*12}px,0)`;
    });
    hero.addEventListener("pointerleave", ()=>art.style.transform = "");
  }

  function initDrawer(){
    const drawer = $(".drawer");
    if(!drawer) return;
    const cards = $$(".drawer-card", drawer);

    function setActive(n){
      drawer.dataset.active = String(n);
      cards.forEach(card => card.classList.toggle("active", card.dataset.step === String(n)));
    }

    cards.forEach(card=>{
      card.addEventListener("mouseenter", ()=>setActive(card.dataset.step));
      card.addEventListener("focus", ()=>setActive(card.dataset.step));
      card.addEventListener("click", ()=>setActive(card.dataset.step));
    });

    function scrollActive(){
      if(innerWidth < 1120) return;
      const r = drawer.getBoundingClientRect();
      const p = clamp((innerHeight*.72 - r.top)/(innerHeight*.65),0,1);
      const step = Math.min(4, Math.max(1, Math.floor(p*4)+1));
      setActive(step);
    }

    addEventListener("scroll", scrollActive, {passive:true});
    scrollActive();
  }

  function initProjects(){
    const preview = $(".project-hover-preview");
    const img = preview ? $("img", preview) : null;
    const label = preview ? $(".label", preview) : null;
    const cubeFaces = $$(".cube-face img");
    const items = $$(".project-item");

    function setCube(src){
      if(!src) return;
      cubeFaces.forEach((face, i)=>{
        if(i === 0) face.src = src;
      });
    }

    function movePreview(e){
      if(!preview) return;
      preview.style.left = e.clientX + 24 + "px";
      preview.style.top = e.clientY + 18 + "px";
    }

    items.forEach(item=>{
      item.addEventListener("mouseenter", e=>{
        const src = item.dataset.img;
        const title = item.dataset.title || item.querySelector(".project-title")?.textContent || "Projeto";
        if(img) img.src = src;
        if(label) label.textContent = title;
        if(preview) preview.classList.add("on");
        setCube(src);
        movePreview(e);
      });
      item.addEventListener("mousemove", movePreview);
      item.addEventListener("mouseleave", ()=>{
        if(preview) preview.classList.remove("on");
      });
      item.addEventListener("focus", ()=>{
        setCube(item.dataset.img);
      });
    });
  }

  function sync(){
    updateFill();
    reveal();
  }

  document.addEventListener("DOMContentLoaded", ()=>{
    bridgeFluidCanvas();
    splitFill();
    heroParallax();
    initDrawer();
    initProjects();
    sync();
    addEventListener("scroll", sync, {passive:true});
    addEventListener("resize", sync);
    console.info("[V32] Vivid global Nimo smoke + DreamLab project hover OK");
  });
})();












/* V32 — Global V20 Nimo: events on WINDOW, not canvas.
   O motor da V20 escuta window.mousemove, então o rastro inicial precisa
   ser disparado em window. Sem overlay fake. */
(function(){
  "use strict";

  function emit(type, x, y, buttons){
    window.dispatchEvent(new MouseEvent(type, {
      clientX: x,
      clientY: y,
      screenX: x,
      screenY: y,
      buttons: buttons || 1,
      bubbles: true,
      cancelable: true,
      view: window
    }));
  }

  function initSmokeBridge(){
    let last = 0;

    window.addEventListener("pointermove", function(e){
      const now = performance.now();
      if(now - last < 8) return;
      last = now;
      emit("mousemove", e.clientX, e.clientY, e.buttons || 1);
    }, { passive: true });

    window.addEventListener("pointerdown", function(e){
      emit("mousedown", e.clientX, e.clientY, 1);
    }, { passive: true });

    window.addEventListener("pointerup", function(e){
      emit("mouseup", e.clientX, e.clientY, 0);
    }, { passive: true });
  }

  function initialSmokeSweep(){
    const w = window.innerWidth;
    const h = window.innerHeight;
    const start = performance.now();
    const duration = 5200;

    emit("mousedown", w * .12, h * .34, 1);

    function frame(now){
      const t = Math.min(1, (now - start) / duration);
      const wave = Math.sin(t * Math.PI * 4);
      const wave2 = Math.cos(t * Math.PI * 2.3);
      const x = w * (.12 + .74 * t);
      const y = h * (.34 + wave * .16 + wave2 * .06);

      emit("mousemove", x, y, 1);

      if(t < 1) {
        requestAnimationFrame(frame);
      } else {
        emit("mouseup", x, y, 0);
      }
    }

    requestAnimationFrame(frame);
  }

  function idleSmokePulse(){
    // Mantém vida no fundo usando o próprio motor real.
    setInterval(function(){
      const w = window.innerWidth;
      const h = window.innerHeight;
      const baseX = w * (.18 + Math.random() * .64);
      const baseY = h * (.22 + Math.random() * .58);

      emit("mousedown", baseX, baseY, 1);

      for(let i = 0; i < 28; i++){
        setTimeout(function(){
          const x = baseX + Math.cos(i * .42) * (36 + i * 4.6);
          const y = baseY + Math.sin(i * .42) * (28 + i * 3.8);
          emit("mousemove", x, y, 1);
          if(i === 27) emit("mouseup", x, y, 0);
        }, i * 22);
      }
    }, 2200);
  }

  function strengthenKey(){
    window.addEventListener("keydown", function(e){
      if((e.key || "").toLowerCase() === "s"){
        document.body.classList.toggle("v32-smoke-strong");
      }
    });
  }

  function initDreamLabProjectPreview(){
    const preview = document.querySelector(".project-hover-preview");
    if(!preview) return;

    const img = preview.querySelector("img");
    const label = preview.querySelector(".label");
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let x = tx;
    let y = ty;
    let active = false;

    function raf(){
      x += (tx - x) * 0.22;
      y += (ty - y) * 0.22;
      preview.style.left = x + "px";
      preview.style.top = y + "px";
      requestAnimationFrame(raf);
    }
    raf();

    document.querySelectorAll(".project-item").forEach(function(item){
      item.addEventListener("mouseenter", function(e){
        const src = item.getAttribute("data-img");
        const title = item.getAttribute("data-title") || item.querySelector(".project-title")?.textContent || "Projeto";

        if(src && img) img.src = src;
        if(label) label.textContent = title;

        tx = e.clientX + 70;
        ty = e.clientY;
        active = true;
        preview.classList.add("on");
      });

      item.addEventListener("mousemove", function(e){
        tx = e.clientX + 70;
        ty = e.clientY;
      });

      item.addEventListener("mouseleave", function(){
        active = false;
        preview.classList.remove("on");
      });

      item.addEventListener("focus", function(){
        const src = item.getAttribute("data-img");
        const title = item.getAttribute("data-title") || item.querySelector(".project-title")?.textContent || "Projeto";
        if(src && img) img.src = src;
        if(label) label.textContent = title;
        preview.classList.add("on");
      });

      item.addEventListener("blur", function(){
        if(!active) preview.classList.remove("on");
      });
    });
  }

  function init(){
    initSmokeBridge();
    strengthenKey();
    initDreamLabProjectPreview();

    // Aguarda o webgl-fluid iniciar no load + delay interno de mousemove da V20.
    setTimeout(initialSmokeSweep, 1000);
    setTimeout(idleSmokePulse, 6500);

    console.info("[V32] Vivid global Nimo smoke + DreamLab project preview OK");
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
