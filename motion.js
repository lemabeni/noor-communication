/* Animations discrètes de contenu — sans bibliothèque externe. */
(()=>{'use strict';
 const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(reduce)return;
 const selectors=[
  'main .hero h1','main .hero .lead','main .hero .cta-row','main .hero .proof','main .hero .stack',
  'main .head','main .card','main .catcard','main .step','main .val','main .work',
  'main article','main .svc-block','main .ctaband','footer .fg > div'
 ];
 const io=('IntersectionObserver'in window)?new IntersectionObserver(entries=>{
  entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');io.unobserve(entry.target)}});
 },{threshold:.08,rootMargin:'0px 0px -24px 0px'}):null;
 const reveal=root=>{
  const nodes=new Set();
  selectors.forEach(sel=>{
   if(root.matches?.(sel))nodes.add(root);
   root.querySelectorAll?.(sel).forEach(el=>nodes.add(el));
  });
  let i=0;
  nodes.forEach(el=>{
   if(el.closest('#dashboard')||el.closest('#login-panel')||el.hasAttribute('data-reveal'))return;
   el.dataset.reveal='';
   el.style.setProperty('--reveal-delay',`${Math.min(i++,2)*35}ms`);
   if(io)io.observe(el);else el.classList.add('is-visible');
  });
 };
 reveal(document);
 if('MutationObserver'in window){
  const observer=new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{
   if(node.nodeType===1)reveal(node);
  })));
  observer.observe(document.body,{childList:true,subtree:true});
 }
 // Les éléments interactifs restent réactifs sans déplacement marqué.
 document.querySelectorAll('main .card,main .catcard,main .work').forEach(el=>el.dataset.motionHover='');
})();
