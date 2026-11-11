/* Visual shell only. All learning, answer, scoring and account engines remain original. */
(() => {
  'use strict';
  const paths={home:'<path d="m3 10 9-7 9 7v10H3zM9 20v-7h6v7"/>',grid:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',tests:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M9 9h6M9 13h6M9 17h3"/>',plan:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 2v6M17 2v6M3 11h18m-13 5h2m4 0h2"/>',stats:'<path d="M4 3v17h17M8 16v-4m5 4V8m5 8V5"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'};
  const svg=key=>'<svg viewBox="0 0 24 24" aria-hidden="true">'+paths[key]+'</svg>';
  const isRu=()=>typeof qLanguage!=='undefined'&&qLanguage==='ru';
  const labels=()=>isRu()?{space:'УЧЕБНОЕ ПРОСТРАНСТВО',home:'Главная',subjects:'Предметы',tests:'Варианты тестов',plan:'План обучения',stats:'Результаты',catalog:'МОИ ПРЕДМЕТЫ',free:'Бесплатная подготовка',foot:'Твой следующий шаг.',account:'Личный кабинет'}:{space:'ОҚУ КЕҢІСТІГІ',home:'Басты бет',subjects:'Пәндер',tests:'Тест нұсқалары',plan:'Оқу жоспары',stats:'Нәтижелер',catalog:'ДАЙЫНДЫҚ ПӘНДЕРІ',free:'Тегін дайындық',foot:'Сенің келесі қадамың.',account:'Жеке кабинет'};
  function applyIdentity(root=document){
    const logo=root.querySelector('.logo');
    if(logo&&!logo.dataset.premiumBrand){logo.dataset.premiumBrand='true';logo.innerHTML='<img src="assets/ornek-icon.svg" alt="" width="36" height="36"><span class="premium-logo-name">Örnek<b>.</b></span>';logo.setAttribute('aria-label','Örnek')}
    root.querySelectorAll('.arch-footer img[src*="ornek-logo.png"]').forEach(img=>{img.src='assets/ornek-wordmark-dark.svg';img.classList.add('premium-wordmark')});
    root.querySelectorAll('img[src*="ornek-wordmark.svg"]').forEach(img=>{img.src='assets/ornek-wordmark-dark.svg';img.classList.add('premium-wordmark')});
  }
  function decorateLanding(){
    const root=document.getElementById('welcome');
    if(!root||root.querySelector('.premium-rail'))return;
    const t=labels();
    const rail=document.createElement('div');rail.className='premium-rail';rail.setAttribute('role','complementary');rail.setAttribute('aria-label',isRu()?'Учебное пространство':'Оқу кеңістігі');
    rail.innerHTML='<a class="premium-brand" href="/" aria-label="Örnek"><img src="assets/ornek-icon.svg" alt="" width="36" height="36"><span>Örnek<b>.</b></span></a><p class="premium-rail-label">'+t.space+'</p><nav aria-label="'+t.space+'">'+[['home','home','home'],['subjects','grid','subjects'],['tests','tests','tests'],['plan','plan','plan'],['stats','stats','stats']].map(([key,ic,label])=>'<button type="button" class="premium-rail-link '+(key==='home'?'is-active':'')+'" data-premium-route="'+key+'"'+(key==='home'?' aria-current="page"':'')+'>'+svg(ic)+'<span>'+t[label]+'</span>'+(key==='home'?'<i></i>':'')+'</button>').join('')+'</nav><p class="premium-rail-label premium-subject-label">'+t.catalog+'</p><div class="premium-rail-subjects">'+Object.keys(subjectNames).map(id=>'<button type="button" data-premium-subject="'+id+'"><span class="premium-subject-dot dot-'+id+'"></span>'+ (typeof pickerName==='function'?pickerName(id):subjectNames[id])+'</button>').join('')+'</div><div class="premium-rail-foot"><div class="premium-free"><span></span>'+t.free+'</div><button type="button" data-premium-route="account">'+svg('user')+'<span>'+t.account+'<small>'+t.foot+'</small></span><b>↗</b></button></div>';
    root.prepend(rail);
    const container=root.querySelector('.arch-container');
    const counter=container?.querySelector('.ornek-unt-counter');const subjects=container?.querySelector('#arch-subjects');
    if(counter&&subjects)subjects.after(counter);
    const nav=root.querySelector('.arch-nav');
    if(nav&&!nav.querySelector('.premium-context'))nav.insertAdjacentHTML('afterbegin','<div class="premium-context"><span>ÖRNEK</span><b>'+t.home+'</b></div>');
    const hero=root.querySelector('.arch-hero');
    if(hero&&!hero.querySelector('.premium-hero-index'))hero.insertAdjacentHTML('afterbegin','<span class="premium-hero-index" aria-hidden="true">01 — ӨЗІҢНЕН БАСТА</span>');
    const heading=root.querySelector('.arch-section-title h2');if(heading)heading.innerHTML=isRu()?'Выбери свой предмет.':'Біліміңе бағыт бер.';
    const intro=root.querySelector('.arch-section-title>p');if(intro)intro.textContent=isRu()?'Всё для твоего следующего шага — в одном месте.':'Келесі қадамыңа қажеттінің бәрі — бір жерде.';
    root.querySelectorAll('.arch-subject').forEach((card,i)=>{card.dataset.premiumSubject=['math','reading','history','profile','physics'][i];});
    applyIdentity(root);
  }
  document.addEventListener('click',event=>{
    const target=event.target.closest('[data-premium-route],[data-premium-subject]');if(!target)return;
    if(target.hasAttribute('data-premium-subject')){openSubject(target.dataset.premiumSubject);return}
    const route=target.dataset.premiumRoute;
    if(route==='account'){showAccount();return}
    if(route==='subjects'){
      const el=document.getElementById('arch-subjects');if(el)window.scrollTo({top:el.getBoundingClientRect().top+window.scrollY-100,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});return;
    }
    if(route==='home'){window.scrollTo({top:0,behavior:'smooth'});return}
    openSubject('math');subjectNavigate({tests:'testsPage',plan:'planner',stats:'analytics'}[route]);
  });
  const oldRender=renderWelcome;
  renderWelcome=function(){const result=oldRender.apply(this,arguments);decorateLanding();return result};
  let pending=false;
  new MutationObserver(()=>{
    if(pending)return;pending=true;
    requestAnimationFrame(()=>{pending=false;applyIdentity();decorateLanding()});
  }).observe(document.body,{childList:true,subtree:true});
  document.body.classList.add('premium-ui');
  decorateLanding();applyIdentity();
})();
