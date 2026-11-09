/* Animations de contenu progressives — sans bibliothèque externe. */
(()=>{'use strict';
 const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const addReveal=()=>{
  const selectors=['main > section','main .hero h1','main .hero .lead','main .eyebrow','main .head','main .cta-row','main .proof','main .stack','main article','main .card','main .legal','footer .fg > div','main .cards > article'];
  const nodes=new Set();selectors.forEach(sel=>document.querySelectorAll(sel).forEach(el=>nodes.add(el)));
  let i=0;nodes.forEach(el=>{if(el.closest('#dashboard')||el.closest('#login-panel'))return;el.dataset.reveal='';el.style.setProperty('--reveal-delay',`${Math.min(i++%5,4)*75}ms`)});
  document.querySelectorAll('main h1, main h2').forEach(el=>{if(!el.hasAttribute('data-reveal'))el.dataset.textReveal=''});
 };
 if(reduce){return}
 document.documentElement.classList.add('motion-ready');
 addReveal();
 const bar=document.createElement('div');bar.className='noor-progress';bar.setAttribute('aria-hidden','true');document.body.prepend(bar);
 let io=null;
 if('IntersectionObserver'in window){io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');io.unobserve(entry.target)}}),{threshold:.12,rootMargin:'0px 0px -35px 0px'});document.querySelectorAll('[data-reveal],[data-text-reveal]').forEach(el=>io.observe(el));}
 else document.querySelectorAll('[data-reveal],[data-text-reveal]').forEach(el=>el.classList.add('is-visible'));
 // Les contenus chargés après coup (portfolio, actualités, résultats Supabase) reçoivent aussi leurs animations.
 if('MutationObserver'in window){const dynamicObserver=new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{if(node.nodeType!==1)return;const found=[];if(node.matches('main article,main .card,main h1,main h2'))found.push(node);node.querySelectorAll?.('main article,main .card,main h1,main h2').forEach(el=>found.push(el));found.forEach(el=>{if(el.hasAttribute('data-reveal')||el.hasAttribute('data-text-reveal'))return;if(el.matches('h1,h2'))el.dataset.textReveal='';else el.dataset.reveal='';if(io)io.observe(el);else el.classList.add('is-visible')})})));dynamicObserver.observe(document.body,{childList:true,subtree:true});}
 let raf=false;const progress=()=>{if(raf)return;raf=true;requestAnimationFrame(()=>{const d=document.documentElement;const max=d.scrollHeight-innerHeight;d.style.setProperty('--noor-scroll',max>0?String(Math.min(1,scrollY/max)):'0');raf=false})};addEventListener('scroll',progress,{passive:true});addEventListener('resize',progress,{passive:true});progress();
 document.querySelectorAll('main article,main .card,main .btn,main a.btn').forEach(el=>el.dataset.motionHover='');
})();
