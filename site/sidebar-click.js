/* LineSidebar interaction adapted to Örnek's native navigation. */
(()=>{
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function enhance(list){
  if(list.dataset.lineSidebar)return;list.dataset.lineSidebar='true';
  const buttons=[...list.querySelectorAll('button[data-section]')];
  buttons.forEach((button,index)=>{
   const label=document.createElement('span');label.className='line-sidebar-label';for(const node of [...button.childNodes]){if(node.nodeType===Node.TEXT_NODE)label.append(node)}button.append(label);
   button.dataset.lineIndex=String(index+1).padStart(2,'0');
   const marker=document.createElement('span');marker.className='line-sidebar-marker';marker.setAttribute('aria-hidden','true');
   button.prepend(marker);
   const number=document.createElement('span');number.className='line-sidebar-index';number.textContent=button.dataset.lineIndex;number.setAttribute('aria-hidden','true');button.prepend(number);
  });
  function reset(){for(const button of buttons){button.style.setProperty('--line-shift','0px');button.style.setProperty('--line-scale','.5')}}
  list.addEventListener('pointermove',event=>{
   if(event.pointerType==='touch'||reduced.matches)return;
   for(const button of buttons){const rect=button.getBoundingClientRect();const distance=Math.hypot(event.clientX-rect.left,event.clientY-(rect.top+rect.height/2));const t=Math.max(0,1-distance/100);const strength=t*t*(3-2*t);button.style.setProperty('--line-shift',`${strength*8}px`);button.style.setProperty('--line-scale',String(.5+strength*.5))}
  });list.addEventListener('pointerleave',reset);
 }
 function repair(){
  for(const shell of document.querySelectorAll('aside nav .ow-shell')){
   const old=[...shell.querySelectorAll('button.ow-item[data-section]')];if(!old.length)continue;
   const list=document.createElement('div');list.className='ornek-click-nav';list.setAttribute('aria-label','Оқу бөлімдері');
   for(const original of old){const button=original.cloneNode(true);for(const attr of ['style','role','aria-selected','id','title','data-index'])button.removeAttribute(attr);button.tabIndex=0;button.classList.remove('ow-item');button.classList.add('ornek-nav-link');button.type='button';
    button.onclick=()=>{if(typeof subjectNavigate==='function')subjectNavigate(button.dataset.section)};list.append(button);
   }shell.replaceWith(list);enhance(list);
  }
  document.querySelectorAll('aside nav .ornek-click-nav').forEach(enhance);
 }
 new MutationObserver(repair).observe(document.body,{childList:true,subtree:true});repair();
})();
