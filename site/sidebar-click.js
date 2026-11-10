/* Use ordinary buttons for every sidebar destination. */
(()=>{
 function repair(){
  for(const shell of document.querySelectorAll('aside nav .ow-shell')){
   const old=[...shell.querySelectorAll('button.ow-item[data-section]')];if(!old.length)continue;
   const list=document.createElement('div');list.className='ornek-click-nav';list.setAttribute('aria-label','Оқу бөлімдері');
   for(const original of old){const button=original.cloneNode(true);button.removeAttribute('style');button.removeAttribute('role');button.removeAttribute('aria-selected');button.removeAttribute('id');button.removeAttribute('title');button.removeAttribute('data-index');button.tabIndex=0;button.classList.remove('ow-item');button.classList.add('ornek-nav-link');button.type='button';
    button.onclick=()=>{if(typeof subjectNavigate==='function')subjectNavigate(button.dataset.section)};list.append(button);
   }shell.replaceWith(list);
  }
 }
 new MutationObserver(repair).observe(document.body,{childList:true,subtree:true});repair();
})();
