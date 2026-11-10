/* CurvedLoop adapted to the native Örnek interface. */
(()=>{
 const phrase='Бүгінгі қадам — ертеңгі нәтиже ✦ Үйрен ✦ Талпын ✦ Өс ✦ ';
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');let current=null;
 function mount(){const welcome=document.querySelector('#welcome');if(!welcome||welcome.querySelector('.motivation-loop'))return;
  const anchor=welcome.querySelector('.arch-facts');if(!anchor)return;
  const section=document.createElement('section');section.className='motivation-loop';section.setAttribute('aria-label',phrase);section.innerHTML=`<svg viewBox="0 0 1600 330" aria-hidden="true"><defs><path id="ornek-motivation-arc" d="M -2000 1050 Q 800 -850 3600 1050"/></defs><text class="loop-measure" opacity="0" x="0" y="0">${phrase}</text><text><textPath href="#ornek-motivation-arc">${phrase.repeat(14)}</textPath></text></svg>`;
  anchor.after(section);const path=section.querySelector('textPath'),measure=section.querySelector('.loop-measure');let offset=0,unit=2200,last=0,raf=0,visible=true,dragging=false,x=0;
  const measureText=()=>{unit=measure.getComputedTextLength()||2200};document.fonts.ready.then(measureText);measureText();
  const paint=()=>path.setAttribute('startOffset',String(-((offset%unit+unit)%unit)));
  const frame=now=>{raf=0;if(!section.isConnected)return;const dt=last?Math.min(50,now-last):16.67;last=now;if(visible&&!document.hidden&&!reduce.matches&&!dragging){offset+=2*dt/16.67;paint()}if(visible&&!document.hidden&&!reduce.matches)raf=requestAnimationFrame(frame)};
  const wake=()=>{last=0;if(!raf&&visible&&!document.hidden&&!reduce.matches)raf=requestAnimationFrame(frame)};
  const io=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)wake();else{cancelAnimationFrame(raf);raf=0}},{rootMargin:'100px'});io.observe(section);
  section.addEventListener('pointerdown',e=>{if(e.button!==0)return;dragging=true;x=e.clientX;section.setPointerCapture(e.pointerId);section.classList.add('is-dragging')});
  section.addEventListener('pointermove',e=>{if(!dragging)return;offset-=(e.clientX-x)*1600/section.clientWidth;x=e.clientX;paint()});
  const release=()=>{dragging=false;section.classList.remove('is-dragging');wake()};section.addEventListener('pointerup',release);section.addEventListener('pointercancel',release);
  const onVisibility=()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0}else wake()};document.addEventListener('visibilitychange',onVisibility);
  const onMotion=()=>{cancelAnimationFrame(raf);raf=0;wake()};reduce.addEventListener('change',onMotion);wake();
  current?.();current=()=>{cancelAnimationFrame(raf);io.disconnect();document.removeEventListener('visibilitychange',onVisibility);reduce.removeEventListener('change',onMotion)};
 }
 new MutationObserver(()=>{if(current&&!document.querySelector('.motivation-loop')){current();current=null}mount()}).observe(document.body,{subtree:true,childList:true});mount();
})();
