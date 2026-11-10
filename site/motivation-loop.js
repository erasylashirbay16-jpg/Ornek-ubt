/* TextLoop wave ribbon adapted to Örnek's native JavaScript interface. */
(()=>{
 const phrase='Бүгінгі қадам — ертеңгі нәтиже ✦ Үйрен ✦ Талпын ✦ Өс ✦ ';
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');let current=null;
 function mount(){const welcome=document.querySelector('#welcome');if(!welcome||welcome.querySelector('.motivation-loop'))return;
  const anchor=welcome.querySelector('.arch-facts');if(!anchor)return;
  const section=document.createElement('section');section.className='motivation-loop';section.setAttribute('aria-label',phrase);
  const wave='M -2400 150 Q -2100 -30 -1800 150 T -1200 150 T -600 150 T 0 150 T 600 150 T 1200 150 T 1800 150 T 2400 150 T 3000 150 T 3600 150 T 4200 150 T 4800 150 T 5400 150 T 6000 150 T 6600 150 T 7200 150 T 7800 150 T 8400 150 T 9000 150 T 9600 150 T 10200 150 T 10800 150 T 11400 150 T 12000 150';
  section.innerHTML=`<svg aria-hidden="true"><defs><path id="ornek-motivation-wave" d="${wave}"/></defs><use class="loop-ribbon" href="#ornek-motivation-wave"/><text class="loop-measure" opacity="0">${phrase.toUpperCase()}</text><text dy=".35em"><textPath href="#ornek-motivation-wave">${phrase.toUpperCase().repeat(16)}</textPath></text></svg>`;
  anchor.after(section);const svg=section.querySelector('svg'),path=section.querySelector('textPath'),measure=section.querySelector('.loop-measure');let offset=0,unit=2200,last=0,raf=0,visible=true,hovered=false;
  const paint=()=>path.setAttribute('startOffset',String(2400-((offset%unit+unit)%unit)));
  const resize=()=>{svg.setAttribute('viewBox',`0 0 ${Math.max(320,section.clientWidth)} 300`);unit=measure.getComputedTextLength()||2200;paint()};const ro=new ResizeObserver(resize);ro.observe(section);document.fonts.ready.then(()=>{if(section.isConnected)resize()});resize();
  const frame=now=>{raf=0;if(!section.isConnected)return;const dt=last?Math.min(50,now-last):0;last=now;if(!hovered){offset+=90*dt/1000;paint()}if(visible&&!document.hidden&&!reduce.matches&&!hovered)raf=requestAnimationFrame(frame)};
  const stop=()=>{cancelAnimationFrame(raf);raf=0;last=0};
  const wake=()=>{last=0;if(!raf&&visible&&!document.hidden&&!reduce.matches&&!hovered)raf=requestAnimationFrame(frame)};
  const io=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)wake();else stop()},{rootMargin:'100px'});io.observe(section);
  section.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){hovered=true;stop()}});section.addEventListener('pointerleave',()=>{hovered=false;wake()});
  const onVisibility=()=>{if(document.hidden)stop();else wake()};document.addEventListener('visibilitychange',onVisibility);
  const onMotion=()=>{stop();wake()};reduce.addEventListener('change',onMotion);wake();
  current?.();current=()=>{stop();io.disconnect();ro.disconnect();document.removeEventListener('visibilitychange',onVisibility);reduce.removeEventListener('change',onMotion)};
 }
 new MutationObserver(()=>{if(current&&!document.querySelector('.motivation-loop')){current();current=null}mount()}).observe(document.body,{subtree:true,childList:true});mount();
})();
