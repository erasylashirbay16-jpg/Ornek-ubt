/* Örnek 2026 admission facts — separate official legal thresholds from
 * independently aggregated grant contest outcomes; never predict admission.
 * Catalog group codes with suffixes inherit the underlying official B/BM code. */
(function(){
"use strict";
const data=window.ORNEK_GRANTS_2026||{};
const gov="https://www.gov.kz/org/sci/press/news/details/1197627?lang=kk";
const govResults="https://www.gov.kz/org/sci/press/news/details/1270585?lang=kk";
const nationalCenter="https://testcenter.kz/?page_id=23112";
const grantIndex="https://grantkz.com/spec/";
const qnuPdf="https://welcome.kaznu.kz/media/admissions/bachelor/editor/2026-2027-porog-bally_3yzxkra_m4T9Eg9.pdf";
const entFormat="https://testcenter.kz/?page_id=23360";
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const rec=r=>Array.isArray(data[r.base])?data[r.base]:null;
const number=v=>Number.isInteger(v)?String(v):"—";
const link=r=>rec(r)?"https://grantkz.com/"+encodeURIComponent(r.base.toLowerCase())+"/":grantIndex;
const min=r=>r.category==="Педагогикалық ғылымдар"||r.base==="B049"?75:r.category==="Медицина және денсаулық"?70:50;
const text=ru=>ru?{
 p2026:"Грант 2026",threshold:"Мин. ЕНТ",heading:"Гранты и вузы",tag:"ПОСТУПЛЕНИЕ · 2026–2027",
 intro:"Сначала — результат грантного конкурса 2026 года. Отдельно — официальный порог поступления 2026 года. У вуза могут быть собственные, более высокие требования.",
 result:"01 / КОНКУРС 2026",passed:"Проходной балл на грант",score:"баллов",
 dataNote:"Минимальный балл грантополучателя по общему конкурсу 2026 года. Это не прогноз поступления в 2027 году.",
 stateNote:"Показатель государственного заказа (отмечен * в источнике), не общего конкурса.",
 missing:"Для этой группы сопоставимый балл за 2026 год не опубликован в выбранном источнике. Мы не подставляем число.",
 rural:"Сельская квота",holders:"Получили грант",group:"Группа",sourceLink:"История по вузам",
 official:"02 / ОФИЦИАЛЬНЫЙ ПОРОГ",officialTitle:"Минимум для участия",other:"Другие вузы",national:"Национальные вузы",
 officialNote:"Порог ЕНТ не равен проходному баллу на грант. Университеты вправе устанавливать более высокий порог.",
 officialLink:"Правила 2026 · Министерство",
 university:"03 / ТРЕБОВАНИЯ ВУЗОВ",universityTitle:"Сверьте свой университет",
 universityNote:"Проходной балл различается по вузам, группам программ и условиям конкурса. Итоги прошлого года — ориентир, а не гарантированный балл.",
 uniLink:"Результаты по вузам · 2026",qnuLink:"Пример: пороги КазНУ · PDF",
 warning:"Данные о проходных баллах: независимый расчёт GrantKZ по опубликованным спискам грантополучателей 2026 года. Не являются официальным порогом и не означают гарантию гранта.",
 check:"Навигатор баллов",checkInfo:"Введите свой балл ЕНТ. Сравнение с 2026 годом не рассчитывает вероятность получения гранта.",
 subjects:"Минимум по предметам: история Казахстана и каждый профильный предмет — 5; грамотность чтения и математическая грамотность — 3.",
 documents:"Проверить официально",resultLink:"Итоги 2026 · Министерство",centerLink:"Госзаказ · НЦТ",formatLink:"Формат ЕНТ · НЦТ",
 invalid:"Введите целое число от 0 до максимума",below:"Балл ниже общего минимального порога для этого направления.",
 enough:"Общий порог для части вузов достигнут. ",natYes:"Общий порог национального вуза также достигнут. ",natNo:"Для национального вуза проверьте требования отдельно. ",
 pastYes:"Балл не ниже общего проходного показателя 2026 года. ",pastNo:"Балл ниже общего проходного показателя 2026 года. ",
 caution:"Это не гарантирует грант: проверьте минимумы по предметам и порог конкретного университета."
}:{
 p2026:"Грант 2026",threshold:"Ресми шек",heading:"Грант және ЖОО",tag:"ҚАБЫЛДАУ · 2026–2027",
 intro:"Алдымен — 2026 жылғы грант конкурсының нәтижесі. Бөлек — 2026 жылғы ресми ҰБТ шегі. Әр ЖОО одан жоғары талап қоя алады.",
 result:"01 / 2026 ЖЫЛҒЫ КОНКУРС",passed:"Грантқа өту балы",score:"балл",
 dataNote:"2026 жылғы жалпы конкурста грант алғандардың ең төменгі балы. Бұл 2027 жылға болжам емес.",
 stateNote:"Мемлекеттік тапсырыс тізімі бойынша көрсеткіш (* белгісі). Жалпы конкурс балы емес.",
 missing:"Бұл топқа 2026 жыл бойынша салыстырылатын балл таңдалған дереккөзде жарияланбаған. Расталмаған сан қоймаймыз.",
 rural:"Ауыл квотасы",holders:"Грант иегерлері",group:"Топ",sourceLink:"ЖОО бойынша нәтижелер",
 official:"02 / РЕСМИ ҰБТ ШЕГІ",officialTitle:"Қатысуға қажет минимум",other:"Басқа ЖОО",national:"Ұлттық ЖОО",
 officialNote:"ҰБТ шегі мен грантқа өткен нақты балл әртүрлі. Университет одан жоғары шекті балл белгілей алады.",
 officialLink:"Ресми ереже · Министрлік",
 university:"03 / ЖОО ТАЛАПТАРЫ",universityTitle:"Таңдаған ЖОО-ны тексер",
 universityNote:"Өту балы ЖОО-ға, бағдарлама тобына және конкурс шартына қарай өзгереді. Өткен жылғы балл — бағдар ғана.",
 uniLink:"ЖОО бойынша 2026 нәтижесі",qnuLink:"Мысал: ҚазҰУ шекті балдары · PDF",
 warning:"Грантқа өту балдары — GrantKZ сайтының 2026 жылғы жарияланған грант иегерлері тізіміне негізделген тәуелсіз есебі. Ресми шекті балл емес және грант кепілдігі емес.",
 check:"Қабылдау навигаторы",checkInfo:"ҰБТ балыңды енгіз. 2026 жылғы көрсеткішпен салыстыру грант ықтималдығын есептемейді.",
 subjects:"Пәндік минимум: Қазақстан тарихы мен екі бейіндік пәннің әрқайсысынан — 5; оқу және математикалық сауаттылықтан — 3 балл.",
 documents:"Ресми құжаттар",resultLink:"2026 қорытындысы · Министрлік",centerLink:"Мемлекеттік тапсырыс · ҰТО",formatLink:"ҰБТ форматы · ҰТО",
 invalid:"0-ден ең жоғары балға дейін бүтін сан енгіз",below:"Бұл бағыттың жалпы ресми шекті балынан төмен.",
 enough:"Кейбір ЖОО үшін жалпы шекті балл орындалды. ",natYes:"Ұлттық ЖОО-ның жалпы шегіне де сай. ",natNo:"Ұлттық ЖОО талабын бөлек тексер. ",
 pastYes:"2026 жылғы жалпы конкурстың өту балынан кем емес. ",pastNo:"2026 жылғы жалпы конкурстың өту балынан төмен. ",
 caution:"Бұл грантқа кепіл емес: пәндік минимум мен нақты ЖОО талабын тексер."
};
function listBadges(r,ru){
 const copy=text(ru),score=rec(r)?.[0];
 return `<div class="sp-list-score"><span>${esc(copy.p2026)}: <strong>${number(score)}</strong></span><span>${esc(copy.threshold)}: <strong>${min(r)}</strong></span></div>`;
}
function renderGrantSection(r,ctx){
 const {ru,baseMin,nationalMin,max}=ctx,copy=text(ru);
 const record=rec(r),general=record?.[0],rural=record?.[1],holders=record?.[2],star=record?.[3]===true;
 const has=Number.isInteger(general);
 const note=has?(star?copy.stateNote:copy.dataNote):copy.missing;
 const code=esc(r.base);
 return `<section class="sp-grants" id="sp-grant">
  <div class="sp-grants-head"><span class="sp-eyebrow">${esc(copy.tag)}</span><h2>${esc(copy.heading)}</h2><p>${esc(copy.intro)}</p></div>
  <div class="sp-grants-grid">
    <article class="sp-grant-card sp-grant-primary">
      <span class="sp-card-kicker">${esc(copy.result)} · ${code}</span><h3>${esc(copy.passed)}</h3>
      <div class="sp-grant-big-number">${number(general)}${has?`<small> ${esc(copy.score)}${star?"*":""}</small>`:""}</div>
      <p>${esc(note)}</p>
      <div class="sp-grant-facts"><span>${esc(copy.rural)} <strong>${number(rural)}</strong></span><span>${esc(copy.holders)} <strong>${number(holders)}</strong></span></div>
      <a href="${link(r)}" target="_blank" rel="noopener noreferrer">${esc(copy.sourceLink)} ↗</a>
    </article>
    <article class="sp-grant-card">
      <span class="sp-card-kicker">${esc(copy.official)}</span><h3>${esc(copy.officialTitle)}</h3>
      <div class="sp-thresholds"><div><span>${esc(copy.other)}</span><strong>${baseMin}</strong></div><div><span>${esc(copy.national)}</span><strong>${nationalMin}</strong></div></div>
      <p>${esc(copy.officialNote)}</p>
      <a href="${gov}" target="_blank" rel="noopener noreferrer">${esc(copy.officialLink)} ↗</a>
    </article>
    <article class="sp-grant-card">
      <span class="sp-card-kicker">${esc(copy.university)}</span><h3>${esc(copy.universityTitle)}</h3>
      <p>${esc(copy.universityNote)}</p>
      <div class="sp-university-links"><a href="${link(r)}" target="_blank" rel="noopener noreferrer">${esc(copy.uniLink)} ↗</a><a href="${qnuPdf}" target="_blank" rel="noopener noreferrer">${esc(copy.qnuLink)} ↗</a></div>
    </article>
  </div>
  <p class="sp-grant-disclaimer" role="note">${esc(copy.warning)} <a href="${grantIndex}" target="_blank" rel="noopener noreferrer">GrantKZ ↗</a></p>
  <div class="sp-check"><div><h3>${esc(copy.check)}</h3><p>${esc(copy.checkInfo)}</p><p class="sp-subject-minima">${esc(copy.subjects)}</p></div>
    <div class="sp-check-form"><label for="sp-score">${esc(ctx.t.score)} <small>/ ${max}</small></label>
    <input type="number" id="sp-score" min="0" max="${max}" inputmode="numeric" placeholder="0–${max}">
    <div class="sp-score-track"><div id="sp-score-fill" style="width:0%"></div></div>
    <p role="status" id="sp-score-status">${esc(ctx.t.tip)}</p></div>
  </div>
  <div class="sp-official-links"><strong>${esc(copy.documents)}</strong><a href="${govResults}" target="_blank" rel="noopener noreferrer">${esc(copy.resultLink)} ↗</a><a href="${nationalCenter}" target="_blank" rel="noopener noreferrer">${esc(copy.centerLink)} ↗</a><a href="${entFormat}" target="_blank" rel="noopener noreferrer">${esc(copy.formatLink)} ↗</a></div>
 </section>`;
}
function handleScore(input,panel,ru,t){
 if(!panel||!input)return;
 const copy=text(ru),max=Number(panel.dataset.max),base=Number(panel.dataset.min),national=Number(panel.dataset.nationalMin);
 const historical=panel.dataset.historicScore!==""?Number(panel.dataset.historicScore):null;
 const n=Number(input.value),valid=input.value.trim()!==""&&Number.isInteger(n)&&n>=0&&n<=max;
 const track=document.getElementById("sp-score-fill"),out=document.getElementById("sp-score-status");
 if(track)track.style.width=valid?Math.min(100,100*n/max)+"%":"0%";
 if(!out)return;
 out.dataset.state=!valid?"empty":n<base?"low":historical!==null&&n>=historical?"high":"mid";
 if(!valid){out.textContent=copy.invalid;return;}
 if(n<base){out.textContent=copy.below;return;}
 out.textContent=copy.enough+(n>=national?copy.natYes:copy.natNo)
  +(historical!==null?(n>=historical?copy.pastYes:copy.pastNo):"")+copy.caution;
}
function recordInfo(r){return rec(r);}
window.OrnekGrantUI={listBadges,renderGrantSection,handleScore,recordInfo,groupMin:min};
})();
