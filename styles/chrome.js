/* Shared site chrome behavior for standalone pages: hamburger menu, clock, footer reveal */
(function () {
  'use strict';
  // Austin clock
  if (!customElements.get('c-clock')) {
    class C extends HTMLElement {
      connectedCallback(){ this.t=null; this.tick(); this.iv=setInterval(this.tick.bind(this),1000); }
      disconnectedCallback(){ clearInterval(this.iv); }
      tick(){ var t=new Date().toLocaleTimeString('en-US',{timeStyle:'short',timeZone:'America/Chicago'}); if(t!==this.t){this.t=t;this.innerHTML=t;} }
    }
    customElements.define('c-clock', C);
  }
  function init(){
    // hamburger menu -> toggle has-menu-open on .c-header
    var header=document.querySelector('.c-header');
    var tog=document.querySelector('[data-header-toggler]');
    if (header && tog) {
      function set(o){ header.classList.toggle('has-menu-open',o); document.body.classList.toggle('no-scroll',o); tog.setAttribute('aria-expanded',String(o)); }
      tog.addEventListener('click', function(){ set(!header.classList.contains('has-menu-open')); });
      var ov=header.querySelector('[data-header-menu-overlay]');
      if(ov) ov.addEventListener('click', function(){ set(false); });
      header.querySelectorAll('.c-menu a').forEach(function(a){ a.addEventListener('click', function(){ set(false); }); });
      document.addEventListener('keydown', function(e){ if(e.key==='Escape') set(false); });
    }
    // footer reveal (drive --progress from scroll, replacing locomotive)
    var cf=document.querySelector('.c-footer');
    if (cf) {
      function fp(){ var r=cf.getBoundingClientRect(); var vh=window.innerHeight||800; var h=r.height||vh; var prog=Math.min(Math.max((vh-r.top)/h,0),1); document.documentElement.style.setProperty('--progress',prog.toFixed(4)); }
      window.addEventListener('scroll',fp,{passive:true}); window.addEventListener('resize',fp); fp();
    }
  }
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
