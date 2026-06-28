
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
    console.info("[V30] V20 Nimo smoke + project hover fix OK");
  });
})();






/* V30 — Ponte limpa para o canvas V20.
   Não cria overlay. Não cria fumaça falsa. Só envia o movimento do mouse
   para o canvas real do webgl-fluid da V20. */
(function(){
  "use strict";

  function getCanvas(){
    return document.getElementById("nimo-native-fluid-canvas");
  }

  function dispatchToCanvas(type, e){
    const canvas = getCanvas();
    if(!canvas) return;
    canvas.dispatchEvent(new MouseEvent(type, {
      clientX: e.clientX,
      clientY: e.clientY,
      buttons: e.buttons || 1,
      bubbles: true,
      cancelable: true,
      view: window
    }));
  }

  function initV20SmokeBridge(){
    let last = 0;

    window.addEventListener("pointermove", function(e){
      const now = performance.now();
      if(now - last < 10) return;
      last = now;
      dispatchToCanvas("mousemove", e);
    }, { passive: true });

    window.addEventListener("pointerdown", function(e){
      dispatchToCanvas("mousedown", e);
    }, { passive: true });

    window.addEventListener("pointerup", function(e){
      dispatchToCanvas("mouseup", e);
    }, { passive: true });

    console.info("[V30] V20 Nimo smoke bridge OK");
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", initV20SmokeBridge);
  } else {
    initV20SmokeBridge();
  }
})();
