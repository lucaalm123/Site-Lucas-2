
(function(){
  "use strict";
  const $ = (s,c=document)=>c.querySelector(s);
  const $$ = (s,c=document)=>Array.from(c.querySelectorAll(s));
  const clamp = (v,min,max)=>Math.max(min,Math.min(max,v));

  function splitLetters(){
    $$("[data-letter-fx]").forEach(el=>{
      if(el.dataset.ready) return;
      let i=0;
      const processText = text => {
        const frag=document.createDocumentFragment();
        text.split(/(\s+)/).forEach(part=>{
          if(!part) return;
          if(/^\s+$/.test(part)){ frag.appendChild(document.createTextNode(part)); return; }
          const word=document.createElement("span");
          word.className="word-wrap";
          [...part].forEach(ch=>{
            const span=document.createElement("span");
            span.className="letter";
            span.style.setProperty("--i", i++);
            span.textContent=ch;
            word.appendChild(span);
          });
          frag.appendChild(word);
        });
        return frag;
      };
      const walk=node=>{
        if(node.nodeType===Node.TEXT_NODE){
          if(!node.nodeValue.trim()) return;
          node.parentNode.replaceChild(processText(node.nodeValue), node);
        } else if(node.nodeType===Node.ELEMENT_NODE) {
          [...node.childNodes].forEach(walk);
        }
      };
      [...el.childNodes].forEach(walk);
      el.dataset.ready="true";
    });
  }

  function splitFill(){
    $$(".fill-text").forEach(el=>{
      if(el.dataset.fillReady) return;
      el.innerHTML = el.textContent.trim().split(/\s+/).map(w=>`<span class="word">${w}</span>`).join(" ");
      el.dataset.fillReady="true";
    });
  }

  function updateFill(){
    $$(".fill-text").forEach(el=>{
      const words=$$(".word", el);
      const r=el.getBoundingClientRect();
      const p=clamp((innerHeight*.82-r.top)/(innerHeight*.5),0,1);
      const max=Math.floor(p*words.length);
      words.forEach((w,i)=>w.classList.toggle("filled", i<=max));
    });
  }

  function reveal(){
    $$(".reveal").forEach(el=>{
      if(el.getBoundingClientRect().top < innerHeight*.86) el.classList.add("on");
    });
  }

  function header(){
    const h=$(".header");
    if(h) h.classList.toggle("is-scrolled", scrollY > 40);
  }

  function timeline(){
    const tl=$(".timeline");
    if(!tl) return;
    const r=tl.getBoundingClientRect();
    const p=clamp((innerHeight*.72-r.top)/(r.height-innerHeight*.2),0,1);
    tl.style.setProperty("--progress", (p*100).toFixed(1)+"%");
  }

  function parallax(){
    const hero=$(".hero");
    const art=$(".hero-art");
    if(!hero || !art) return;
    hero.addEventListener("pointermove", e=>{
      const r=hero.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5;
      const y=(e.clientY-r.top)/r.height-.5;
      art.style.transform=`translate3d(${x*18}px,${y*12}px,0)`;
    });
    hero.addEventListener("pointerleave", ()=>art.style.transform="");
  }

  function eye(){
    $$(".project-card").forEach(card=>{
      const btn=$(".eye",card);
      if(!btn) return;
      card.addEventListener("pointermove", e=>{
        const r=card.getBoundingClientRect();
        const x=e.clientX-r.left-r.width/2;
        const y=e.clientY-r.top-r.height/2;
        btn.style.transform=`translate(calc(-50% + ${x*.12}px), calc(-50% + ${y*.12}px)) scale(1)`;
      });
      card.addEventListener("pointerleave", ()=>btn.style.transform="translate(-50%,-50%) scale(.8)");
    });
  }

  function sync(){
    header();
    updateFill();
    reveal();
    timeline();
  }

  document.addEventListener("DOMContentLoaded", ()=>{
    splitLetters();
    splitFill();
    parallax();
    eye();
    sync();
    addEventListener("scroll", sync, {passive:true});
    addEventListener("resize", sync);
    console.info("[V24] DreamLab clean rebuild OK");
  });
})();
