/* ScrollFloat's character float adapted to Örnek's native JS renderer. */
(()=>{
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const selector='#welcome :is(h1,h2,h3,p),#app :is(h1,h2,h3,p)';
 const excluded='button,a,label,summary,dialog,.questionrow,.question-room,.qroom,.history-workspace,.reading-workspace,.reading-passage,.reading-context,.option,.feedback,.testtile,.testintro,.formula,.motivation-loop,.arch-example,.example-paper';
 const items=new Map();let raf=0;
 const ease=t=>{const c=2*1.525;return t<.5?Math.pow(2*t,2)*((c+1)*2*t-c)/2:(Math.pow(2*t-2,2)*((c+1)*(2*t-2)+c)+2)/2};
 function update(){raf=0;const vh=innerHeight;
  for(const [el,chars]of items){if(!el.isConnected){items.delete(el);continue}if(!el.getClientRects().length)continue;
   const r=el.getBoundingClientRect();
   const progress=reduced.matches?1:Math.max(0,Math.min(1,(vh*1.5-r.top-r.height/2)/(vh*.9+r.height/2)));
   const total=1+Math.max(0,chars.length-1)*.03;
   chars.forEach((ch,i)=>{const t=Math.max(0,Math.min(1,progress*total-i*.03));const p=ease(t);ch.style.transform=`translateY(${(1-p)*120}px) scaleY(${1+(1-p)*1.3})`;ch.style.opacity=String(Math.min(1,t*3));});
  }
 }
 function schedule(){if(!raf)raf=requestAnimationFrame(update)}
 function split(el){if(el.dataset.scrollFloat==='ready')return;el.dataset.scrollFloat='ready';el.classList.add('ornek-scroll-float');el.setAttribute('aria-label',el.innerText.trim()||el.textContent.trim());const nodes=[];const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);while(walker.nextNode())nodes.push(walker.currentNode);const chars=[];
  for(const node of nodes){const frag=document.createDocumentFragment();for(const part of node.textContent.split(/(\s+)/)){if(!part)continue;if(/^\s+$/.test(part)){frag.append(document.createTextNode(part));continue}const word=document.createElement('span');word.className='sf-word';word.setAttribute('aria-hidden','true');for(const letter of Array.from(part)){const span=document.createElement('span');span.className='sf-char';span.textContent=letter;word.append(span);chars.push(span)}frag.append(word)}node.replaceWith(frag)}items.set(el,chars);
 }
 function scan(){for(const el of document.querySelectorAll(selector)){if(el.querySelector('button,a,input,select,textarea,svg')||el.closest(excluded)||el.textContent.trim().length>180||!el.textContent.trim())continue;if(el.closest('#app')&&document.querySelector('#app input[type=radio],#app .option,#app .history-question,#app .reading-practice-option'))continue;split(el);}schedule()}
 new MutationObserver(records=>{if(records.some(r=>[...r.addedNodes].some(n=>n.nodeType===1&&!n.classList?.contains('sf-word')&&!n.classList?.contains('sf-char'))))scan()}).observe(document.body,{childList:true,subtree:true});
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});reduced.addEventListener('change',schedule);scan();
})();
