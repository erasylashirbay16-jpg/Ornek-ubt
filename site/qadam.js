const sectionDescriptions = [
  'Пайыз, пропорция және күнделікті өмірдегі есептер.',
  'Деректерді талдау, статистика және ықтималдық.',
  'Заңдылықтар, қозғалыс және шамалар байланысы.',
  'Геометрия, өлшемдер және кеңістіктік ойлау.'
];
const sectionIcons = [
  '<path d="m6 18 12-12M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0m12 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0"/>',
  '<path d="M4 20V10m6 10V4m6 16v-7m5 7H2"/>',
  '<path d="m3 17 6-6 4 3 8-11M15 3h6v6"/>',
  '<path d="m12 3 9 5v9l-9 5-9-5V8zM3 8l9 5 9-5m-9 5v9"/>'
];
const icon = paths => `<svg viewBox="0 0 24 24" aria-hidden="true" class="navicon">${paths}</svg>`;
const qArrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';
function qWeekHTML() {
  const fmt = new Intl.DateTimeFormat('en-CA', {year:'numeric',month:'2-digit',day:'2-digit'});
  return Array.from({length:7},(_,i)=>{
    const date=new Date();date.setDate(date.getDate()-6+i);
    const count=plan.days[fmt.format(date)]||0;
    const day=['Жс','Дс','Сс','Ср','Бс','Жм','Сб'][date.getDay()];
    return `<div class="week-day ${i===6?'today':''}" title="${day}: ${count} жауап"><div class="week-track"><i style="height:${Math.min(100,count/Math.max(plan.target,1)*100)}%"></i></div><span>${day}</span><span class="sr-only">${count} жауап</span></div>`;
  }).join('');
}
home=function(){
  stop();run=null;
  const crumb=document.querySelector('.topbrand>span');if(crumb)crumb.textContent='Менің дайындығым';
  const m=metrics(),today=plan.days[dayKey()]||0,target=plan.target,goal=Math.min(100,Math.round(today/Math.max(target,1)*100));
  app.innerHTML=`
  <div class="home-heading"><div><p class="overline">ҰБТ-ҒА ДАЙЫНДЫҚ / МАТЕМАТИКА</p><h1>Менің дайындығым<span>.</span></h1></div><button class="textbutton" onclick="planner()">Оқу жоспарым ${qArrow}</button></div>
  <section class="qhero" aria-label="Жаттығуды бастау"><div class="hero-copy"><span class="hero-label"><i></i> БҮГІНГІ ЖАТТЫҒУ</span><h2>Жауапты тап.<br><span>Логикасын түсін.</span></h2><p>Төрт бағыттан аралас тест. Әр есептен кейін<br class="desktop-break"> шешу жолын талдап, біліміңді бекіт.</p><div class="qhero-actions"><button onclick="testsPage()">Тестті бастау ${qArrow}</button><button class="hero-secondary" onclick="library()">Есептерді қарау ${qArrow}</button></div></div><div class="session-ticket"><div class="ticket-top"><span>ӨРНЕК / PRACTICE</span>${icon(sectionIcons[2])}</div><div class="ticket-value"><strong>10</strong><span>сұрақ</span></div><div class="ticket-meta"><span>Уақыт<strong>20 минут</strong></span><span>Деңгей<strong>A / B / C</strong></span></div><div class="ticket-bottom"><span>Әр қадам маңызды.</span><span>↗</span></div></div></section>
  <div class="learning-summary"><div><span>Орындалған есеп</span><strong>${m.done}<small> / ${bank.length}</small></strong></div><div><span>Дұрыс жауап үлесі</span><strong>${m.done?m.p+'%':'—'}</strong></div><div><span>Қайталау керек</span><strong>${m.done-m.correct}<small> есеп</small></strong></div><button class="textbutton" onclick="analytics()">Статистика ${qArrow}</button></div>
  <div class="study-columns"><section class="subjects" id="subjects"><div class="qsectionhead"><div><p class="overline">ЕСЕПТЕР БАНКІ</p><h2>Дайындық бағыттары</h2></div><button class="textbutton" onclick="library()">${bank.length} есеп ${qArrow}</button></div><div class="subjectgrid">${sections.map((s,i)=>{
    const items=bank.filter(q=>q.s===i),v=metrics(items),pct=Math.round(v.done/items.length*100);
    return `<button class="subject subject-${i}" onclick="section(${i})"><span class="subject-index">0${i+1}</span><div class="subject-body"><h3>${s[0]}</h3><p>${sectionDescriptions[i]}</p><div class="subjectmeta"><span>${items.length} есеп</span><span>${v.done} орындалды</span></div><div class="qprogress" role="progressbar" aria-label="${s[0]} орындалуы" aria-valuemin="0" aria-valuemax="${items.length}" aria-valuenow="${v.done}"><i style="width:${pct}%"></i></div></div><span class="subjectarrow">${qArrow}</span></button>`;
  }).join('')}</div><div class="practice-links"><button onclick="collection()">${icon('<path d="M6 3h12v18l-6-4-6 4z"/>')}<span>Сақталғандар мен қателер<small>Қайталап, біліміңді бекіт</small></span>${qArrow}</button><button onclick="challenge()">${icon(sectionIcons[3])}<span>Күрделі есептер<small>C деңгей · ${bank.filter(q=>q.l==='C').length} есеп</small></span>${qArrow}</button></div></section>
  <div class="study-rail"><section class="daily-card"><div class="daily-heading"><h2>Бүгінгі мақсат</h2><button class="textbutton" onclick="planner()" aria-label="Күндік мақсатты өзгерту">Өзгерту</button></div><div class="goal-number"><strong>${today}<span> / ${target}</span></strong><span class="goal-unit">есеп</span></div><div class="goal-track" role="progressbar" aria-label="Бүгінгі мақсат" aria-valuemin="0" aria-valuemax="${target}" aria-valuenow="${Math.min(today,target)}"><i style="width:${goal}%"></i></div><p class="daily-caption">${today>=target?'Мақсатыңа жеттің. Жақсы жұмыс!':today?'Бүгінгі мақсатқа тағы '+Math.max(0,target-today)+' есеп қалды.':'Алғашқы есептен бастайық.'}</p><div class="week-title"><span>Соңғы 7 күн</span><span>Жауаптар саны</span></div><div class="week-chart" aria-label="Соңғы жеті күндегі жауаптар">${qWeekHTML()}</div></section><section class="quick-session"><div class="quick-label">АЗ УАҚЫТ БОЛСА</div><h2>5 минут та жеткілікті.</h2><p>Бес есеп. Бір қысқа жаттығу.<br>Күнделікті қарқыныңды сақта.</p><button class="secondary" onclick="rush()">Жылдам жаттығу ${qArrow}</button></section><p class="rail-note">Прогрессің осы браузерде сақталады.<br>Өз қарқыныңмен дайындал.</p></div></div>`;
  window.scrollTo(0,0);
};
document.querySelector('.logo').innerHTML='<img src="assets/ornek-wordmark.svg" alt="Өрнек" width="164" height="54">';
document.querySelector('.examlabel').innerHTML='<span class="exam-indicator"></span><div><b>ҰБТ-ға дайындық</b><small>Математикалық сауаттылық</small></div>';
document.querySelector('.topbrand').innerHTML='<button class="hamburger" onclick="toggleMenu(true)" aria-label="Мәзірді ашу" aria-expanded="false">'+icon('<path d="M4 6h16M4 12h16M4 18h16"/>')+'</button><span>Менің дайындығым</span>';
document.querySelector('.toptools').innerHTML='<button class="top-help" onclick="help()">Қалай қолданамын? '+icon('<path d="M9 9a3 3 0 0 1 6 0c0 2-3 2-3 5m0 3v.1M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0"/>')+'</button><span class="avatar" aria-label="Жеке оқу кеңістігі">Q</span>';
document.querySelector('.sidefoot').innerHTML='<div class="side-message"><span>КҮН САЙЫН БІР ҚАДАМ</span><p>Үлкен нәтиже<br>осы жерден басталады.</p></div><div class="side-profile"><img src="assets/ornek-icon.svg" alt="" width="31" height="31"><div><b>Өрнек</b><small>Сенің келесі қадамың</small></div></div>';
document.querySelector('footer').innerHTML='<span class="footer-brand">Өрнек<span>Сенің келесі қадамың.</span></span><span>Авторлық жаттығулар · ҰБТ-ның ресми сұрақтар банкі емес<br>Нәтижелер осы браузерде сақталады.</span>';
home();
