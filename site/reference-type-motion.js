/* Native scrolling stays intact: only presentational sections receive one entry. */
(()=>{
  document.body.classList.add('ornek-reference-type');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  if(reduce.matches||!('IntersectionObserver' in window))return;
  const seen=new WeakSet();
  const entering=new Set();
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(!entry.isIntersecting)continue;
      observer.unobserve(entry.target);
      entering.delete(entry.target);
      if(!reduce.matches)entry.target.classList.add('ornek-soft-entry');
    }
  },{threshold:.06});
  function scan(){
    for(const el of document.querySelectorAll('#welcome .arch-hero,#welcome #arch-subjects,#welcome .arch-how,#welcome .ornek-method,.subject-dashboard .qhero,.subject-dashboard .study-rail,.subject-dashboard .qsectionhead')){
      if(seen.has(el))continue;
      seen.add(el);entering.add(el);observer.observe(el);
    }
    for(const el of entering)if(!el.isConnected){observer.unobserve(el);entering.delete(el)}
  }
  let scheduled=false;
  new MutationObserver(records=>{
    if(scheduled||!records.some(r=>r.addedNodes.length||r.removedNodes.length))return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;scan()});
  }).observe(document.body,{childList:true,subtree:true});
  reduce.addEventListener('change',()=>{if(reduce.matches){observer.disconnect();entering.clear()}});
  scan();
})();
