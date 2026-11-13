/* Қазақстан тарихы: 50 source-based practice variants, separate from other subjects. */
let historyRun = null, historyTimer = null, historyBankPage = 0, historyBankQuery = '', historyBankMode = 'library';
const historyDuration = 40 * 60 * 1000;
function historyAll() { return historyVariants.flatMap(v => historyItems(v).map(q => ({...q, number:v.number}))); }
function historyItems(v) { return [...v.questions.map(q => ({...q, context:null})), ...v.contexts.flatMap((c, ci) => c.questions.map(q => ({...q, context:ci})))]; }
function historyResults() { return readStore('ornek-history-results-v2', {}); }
function historyBookmarks() { return readStore('ornek-history-bookmarks-v1', []); }
function stopHistory() { clearInterval(historyTimer); historyTimer = null; }
function historySource(source) { return source ? escapeText(source.file.startsWith('ilide.info-1-')?'Қазақстан тарихы: 2000 сұрақ (2019)':source.file.startsWith('22_')?'Қазақстан тарихы: тест спецификациясы':source.file.startsWith('Қазақстан-тарихы-2')?'Ұсынылатын оқулықтар тізімі':'Қазақстан тарихы: тапсырмалар жинағы') + ' · PDF ' + Number(source.page) + '-бет' : ''; }
function historyContextMarkup(c) { return `<article class="history-context" lang="kk"><span class="overline">КОНТЕКСТ · ОҚУ МӘТІНІ</span><h2>${escapeText(c.title)}</h2>${c.text.split('\n').filter(Boolean).map(p => `<p>${escapeText(p)}</p>`).join('')}</article>`; }
function historySection(key) {
  if(key === 'datesQuiz') return window.OrnekHistoryDatesQuiz.open();
  if(key === 'testsPage') return historyTestsPage();
  const results = historyResults(), done = Object.values(results), correct = done.reduce((n,r) => n+r.correct,0);
  const previousResults=readStore('ornek-history-results-v1',{});
  if(key === 'home') {
    page('Қазақстан тарихы', 'Ежелгі дәуірден тәуелсіз Қазақстанға дейін.', `<section class="subject-banner"><span class="ornek-chip">50 НҰСҚА · 1 000 СҰРАҚ</span><h2>Тарихты түсін.<br>Оқиғаларды байланыстыр.</h2><p>Әр нұсқада 10 жеке сұрақ және екі контекст бойынша 10 сұрақ. Уақыт — 40 минут.</p><button onclick="subjectNavigate('testsPage')">Нұсқаларды ашу →</button></section><div class="stats"><div class="stat">Нұсқалар<strong>${historyVariants.length}</strong></div><div class="stat">Аяқталған нұсқа<strong>${done.length} / 50</strong></div><div class="stat">Дұрыс жауап<strong>${done.length?Math.round(correct/(done.length*20)*100)+'%':'—'}</strong></div></div><div class="history-difficulty-notice" role="note"><strong>ЖАҢАРТЫЛҒАН КҮРДЕЛІЛІК · 2026</strong><p>A — бұрынғы қиын сұрақтар деңгейі; B — бірнеше тарихи деректі байланыстыру; C — төрт тұжырымды салыстыру арқылы өте күрделі талдау. Алдыңғы нәтиже бөлек сақталады.</p></div><div class="subject-shortcuts"><button onclick="subjectNavigate('datesQuiz')">100 дата · интерактивті Quiz →</button><button onclick="subjectNavigate('library')">Сұрақтар банкі →</button><button onclick="subjectNavigate('collection')">Сақталғандар мен қателер →</button><button onclick="subjectNavigate('planner')">Оқу жоспары →</button></div><p class="notice">Жіберілген материалдар мен 2026 жылдан қолданылатын спецификация негізіндегі жаттығулар. Деңгейлер — оқу мақсатындағы бағалау. Ресми емтихан сұрақтары емес.</p>`);
    return;
  }
  if(key === 'analytics') {
    page('Қазақстан тарихы: статистика','Әр нұсқаның соңғы нәтижесі.',`<div class="stats"><div class="stat">Аяқталған нұсқа<strong>${done.length} / 50</strong></div><div class="stat">Дұрыс жауап<strong>${correct} / ${done.length*20}</strong></div></div><div class="panel">${done.length?Object.entries(results).map(([n,r])=>`<div class="review row"><span>${Number(n)}-нұсқа · ${new Date(r.date).toLocaleDateString('kk-KZ')}</span><b>${r.correct} / 20</b><button onclick="historyReview(${Number(n)})">Талдауды ашу</button></div>`).join(''):'<p>Бір нұсқаны аяқтаған соң нәтижең осында көрінеді.</p><button onclick="historyTestsPage()">Нұсқаларды ашу</button>'}</div>${Object.keys(previousResults).length?`<details class="history-prior-results"><summary>Бұрынғы күрделілік нәтижелері · ${Object.keys(previousResults).length} нұсқа (архив)</summary><p>Бұл нәтижелер ескі тапсырмаларға қатысты, сондықтан жаңа тест бағасына араластырылмайды.</p>${Object.entries(previousResults).map(([n,r])=>`<div class="review row"><span>${Number(n)}-нұсқа</span><b>${Number(r.correct) || 0} / 20</b></div>`).join('')}</details>`:''}`);
    return;
  }
  if(key === 'planner') {
    page('Қазақстан тарихы: оқу жоспары','Тақырыпты қайталау → тест → қателерді талдау.',`<div class="panel">${[['Ежелгі Қазақстан','Тас және қола дәуірлері, сақтар, үйсіндер, қаңлылар, ғұндар.'],['Орта ғасыр және Қазақ хандығы','Түркі мемлекеттері, Алтын Орда, Қазақ хандығы, хандықтың дамуы.'],['Жаңа заман','Қазақ-жоңғар қатынастары, отарлау, көтерілістер, реформалар.'],['ХХ ғасыр және тәуелсіздік','Алаш, кеңестік кезең, соғыс, тәуелсіз мемлекеттің қалыптасуы.'],['Мәдениет және контекст','Мәтін, тарихи құжаттар, тұлғалар және хронологиялық байланыстар.']].map(([t,p],i)=>`<article class="review"><span class="overline">${i+1}-ҚАДАМ</span><h2>${t}</h2><p>${p}</p></article>`).join('')}<button onclick="historyTestsPage()">Тестке өту →</button></div>`);
    return;
  }
  historyBankQuery=''; historyBankPage=0; historyBankMode=key; historyRenderBank();
}
function historyTestsPage() {
  stopHistory(); historyRun=null;
  const results=historyResults(), draft=readStore('ornek-history-draft-v2',null);
  page('Қазақстан тарихы: тест нұсқалары','50 нұсқа · 20 сұрақ · уақытты таңда',`${draft?'<div class="draftbanner"><div><strong>Аяқталмаған тарих тесті сақталды</strong><p>Таймер үзіліс кезінде де жүреді.</p></div><button onclick="resumeHistory()">Жалғастыру →</button></div>':''}<div class="testintro"><p>10 жеке тапсырма + әрқайсысында 5 сұрақ бар 2 контекст. Бір дұрыс жауап. Әр нұсқада A — 10 (бұрынғы қиын), B — 6 (терең талдау), C — 4 (өте күрделі, төрт дерек).</p><p>Жауаптар мен түсіндірмелер тест аяқталғанда ашылады. 1000 тапсырманың күрделілігі жаңартылды; бұрынғы нәтижелер бөлек сақталады.</p></div><label class="reading-search">Нұсқа нөмірін іздеу<input type="search" inputmode="numeric" placeholder="Мысалы: 25" oninput="filterHistoryVariants(this.value)"></label><div class="testgrid">${historyVariants.map(v=>{const r=results[v.number];return `<section class="testtile" data-history-number="${v.number}"><div class="testtilerow"><h2>${String(v.number).padStart(2,'0')}-нұсқа</h2><span class="teststate ${r?'completed':''}">${r?'Аяқталған':'Орындалмаған'}</span></div><p>20 сұрақ · 2 контекст · уақытты таңда</p><div class="testlevels"><span>A · 10</span><span>B · 6</span><span>C · 4</span></div><div class="testresult">${r?`Соңғы нәтиже: <b>${r.correct} / 20</b>`:'Ежелгі дәуір, хандықтар, жаңа заман және қазіргі тарих.'}</div><button onclick="startHistory(${v.number})">${r?'Қайта орындау':'Тестті бастау'} →</button>${r?`<button class="secondary" onclick="historyReview(${v.number})">Жауаптарды талдау</button>`:''}</section>`}).join('')}</div><p id="history-variant-empty" hidden>Сәйкес нұсқа табылмады.</p>`);
}
function filterHistoryVariants(query) { let count=0;document.querySelectorAll('[data-history-number]').forEach(el=>{el.hidden=!el.dataset.historyNumber.startsWith(query.trim().replace(/^0+(?=\d)/,''));if(!el.hidden)count++;});document.getElementById('history-variant-empty').hidden=count>0; }
function saveHistoryDraft() { if(historyRun) writeStore('ornek-history-draft-v2',historyRun); }
function startHistory(number) {
  const v=historyVariants.find(v=>v.number===number); if(!v)return;
  const draft=readStore('ornek-history-draft-v2',null);
  if(draft && !confirm('Сақталған тарих тестін жаңасымен ауыстырасың ба?'))return;
  stopHistory();stopReading();stop();roomModeExit();run=null;
  historyRun={number,pos:0,answers:{},end:Date.now()+historyDuration};saveHistoryDraft();renderHistory();historyTimer=setInterval(historyClock,1000);
}
function validHistoryDraft(d) {
  const v=historyVariants.find(v=>v.number===d?.number);
  if(!v||!Number.isInteger(d.pos)||d.pos<0||d.pos>=20||!Number.isFinite(d.end)||!d.answers||typeof d.answers!=='object'||Array.isArray(d.answers))return false;
  const ids=new Set(historyItems(v).map(q=>q.id));
  return Object.entries(d.answers).every(([id,a])=>ids.has(id)&&Number.isInteger(a)&&a>=0&&a<4);
}
function resumeHistory() {
  const d=readStore('ornek-history-draft-v2',null);
  if(!validHistoryDraft(d)){ornekLocal.removeItem('ornek-history-draft-v2');historyTestsPage();return;}
  stopHistory();stopReading();stop();roomModeExit();run=null;historyRun=d;
  if(Date.now()>=d.end){finishHistory(true);return;}
  renderHistory();historyTimer=setInterval(historyClock,1000);
}
function historyClock() {
  if(!historyRun){stopHistory();return;}
  const sec=Math.max(0,Math.ceil((historyRun.end-Date.now())/1000));
  if(!sec){finishHistory(true);return;}
  const el=document.getElementById('history-clock');if(el)el.textContent=String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0');
}
function renderHistory() {
  if(!historyRun)return;
  if(Date.now()>=historyRun.end){finishHistory(true);return;}
  const v=historyVariants.find(v=>v.number===historyRun.number),items=historyItems(v),q=items[historyRun.pos],c=q.context===null?null:v.contexts[q.context];
  app.innerHTML=`<div class="reading-top"><button class="secondary" onclick="saveHistoryDraft();historyTestsPage()">← Нұсқаларға оралу</button><span>${v.number}-нұсқа · Қазақстан тарихы</span><strong id="history-clock" role="timer" aria-label="Қалған уақыт">40:00</strong></div><div class="history-workspace ${c?'with-context':''}">${c?historyContextMarkup(c):''}<section class="reading-question history-question"><div class="reading-q-label"><span>${historyRun.pos+1} / 20 сұрақ</span><span>${q.l} деңгей</span></div><p class="muted">${escapeText(q.topic)}</p><h1 class="reading-question-text" lang="kk">${escapeText(q.t)}</h1><div class="reading-options">${q.o.map((o,i)=>`<button class="reading-option ${historyRun.answers[q.id]===i?'selected':''}" lang="kk" aria-pressed="${historyRun.answers[q.id]===i}" onclick="chooseHistory(${i})"><b>${'ABCD'[i]}</b><span>${escapeText(o)}</span></button>`).join('')}</div><p class="muted">Бір дұрыс жауапты таңда. Түсіндірме тест соңында ашылады.</p><div class="reading-move"><button class="secondary" onclick="moveHistory(-1)" ${historyRun.pos===0?'disabled':''}>Алдыңғы</button><button onclick="${historyRun.pos===19?'finishHistory()':'moveHistory(1)'}">${historyRun.pos===19?'Аяқтау':'Келесі'}</button></div><nav class="reading-number-grid history-number-grid" aria-label="Тест сұрақтары">${items.map((item,i)=>`<button class="${i===historyRun.pos?'current':''} ${Number.isInteger(historyRun.answers[item.id])?'answered':''}" onclick="jumpHistory(${i})" aria-label="${i+1}-сұрақ${Number.isInteger(historyRun.answers[item.id])?', жауап берілді':''}" ${i===historyRun.pos?'aria-current="step"':''}>${i+1}</button>`).join('')}</nav><button class="secondary history-finish" onclick="finishHistory()">Тестті аяқтау</button></section></div>`;
  historyClock();window.scrollTo(0,0);
}
function chooseHistory(index) {
  if(!historyRun||!Number.isInteger(index)||index<0||index>3)return;
  if(Date.now()>=historyRun.end){finishHistory(true);return;}
  const q=historyItems(historyVariants.find(v=>v.number===historyRun.number))[historyRun.pos];historyRun.answers[q.id]=index;saveHistoryDraft();
  document.querySelectorAll('.history-question .reading-option').forEach((b,i)=>{b.classList.toggle('selected',i===index);b.setAttribute('aria-pressed',String(i===index));});
  document.querySelectorAll('.history-number-grid button').forEach((b,i)=>{if(i===historyRun.pos){b.classList.add('answered');b.setAttribute('aria-label',`${i+1}-сұрақ, жауап берілді`);}});
}
function jumpHistory(pos) { if(!historyRun||!Number.isInteger(pos)||pos<0||pos>19)return;historyRun.pos=pos;saveHistoryDraft();renderHistory(); }
function moveHistory(delta) { if(historyRun)jumpHistory(historyRun.pos+delta); }
function finishHistory(expired=false) {
  if(!historyRun)return;
  const v=historyVariants.find(v=>v.number===historyRun.number),items=historyItems(v),answered=items.filter(q=>Number.isInteger(historyRun.answers[q.id])).length;
  if(!expired&&answered<20&&!confirm(`Жауапсыз ${20-answered} сұрақ бар. Тестті аяқтайсың ба?`))return;
  stopHistory();const r={correct:items.filter(q=>historyRun.answers[q.id]===q.a).length,answers:{...historyRun.answers},date:new Date().toISOString(),expired};
  const results=historyResults();results[v.number]=r;writeStore('ornek-history-results-v1',results);ornekLocal.removeItem('ornek-history-draft-v2');historyRun=null;historyReview(v.number);
}
function historyReview(number) {
  const v=historyVariants.find(v=>v.number===number),r=historyResults()[number];if(!v||!r)return;
  stopHistory();historyRun=null;
  page('Қазақстан тарихы: нәтиже',`${number}-нұсқа${r.expired?' · Уақыт аяқталды':''}`,`<section class="hero"><div><span>СЕНІҢ НӘТИЖЕҢ</span><h2>${r.correct} / 20</h2><p>${Math.round(r.correct/20*100)}% дұрыс жауап</p></div><button onclick="historyTestsPage()">Нұсқаларға оралу</button></section><div class="panel">${historyItems(v).map((q,i)=>`<article class="review" lang="kk"><span class="badge">${i+1}-сұрақ · ${r.answers[q.id]===q.a?'Дұрыс':'Қайталау керек'}</span><h3>${escapeText(q.t)}</h3><p>Сенің жауабың: ${Number.isInteger(r.answers[q.id])?escapeText(q.o[r.answers[q.id]]):'Жауап берілмеді'}<br>Дұрыс жауап: <b>${escapeText(q.o[q.a])}</b></p><p>${escapeText(q.e)}</p><small class="history-source">Тақырып пен материал негізі: ${historySource(q.source||v.contexts[q.context]?.source)}</small>${q.context!==null?`<details><summary>Контексті қайта оқу</summary>${historyContextMarkup(v.contexts[q.context])}</details>`:''}<button class="secondary" data-history-save="${q.id}" aria-pressed="${historyBookmarks().includes(q.id)}" onclick="saveHistoryQuestion('${q.id}')">${historyBookmarks().includes(q.id)?'Сақталған':'Сақтау'}</button></article>`).join('')}</div>`);
  window.scrollTo(0,0);
}
function saveHistoryQuestion(id) {
  const ids=historyBookmarks(),exists=ids.includes(id);writeStore('ornek-history-bookmarks-v1',exists?ids.filter(x=>x!==id):[...ids,id]);
  document.querySelectorAll(`[data-history-save="${id}"]`).forEach(b=>{b.textContent=exists?'Сақтау':'Сақталған';b.setAttribute('aria-pressed',String(!exists));});
}
function historyRenderBank() {
  const results=historyResults(),marked=historyBookmarks();let qs=historyAll();
  if(historyBankMode==='collection')qs=qs.filter(q=>marked.includes(q.id)||(results[q.number]&&results[q.number].answers[q.id]!==q.a));
  if(historyBankMode==='challenge')qs=qs.filter(q=>q.l==='C');
  const query=historyBankQuery.toLocaleLowerCase();if(query)qs=qs.filter(q=>(q.t+' '+q.topic).toLocaleLowerCase().includes(query));
  if(historyBankMode==='rush')qs=qs.slice(0,5);
  const pages=Math.max(1,Math.ceil(qs.length/30));historyBankPage=Math.max(0,Math.min(historyBankPage,pages-1));
  page(historyBankMode==='collection'?'Қазақстан тарихы: сақталғандар мен қателер':historyBankMode==='rush'?'Қазақстан тарихы: жылдам жаттығу':'Қазақстан тарихы: сұрақтар банкі',`${qs.length} сұрақ`, `<form class="history-search" onsubmit="event.preventDefault();historySearch()"><label for="history-search">Тақырып не сөз бойынша іздеу</label><div><input id="history-search" type="search" value="${escapeText(historyBankQuery)}" placeholder="Мысалы: Қазақ хандығы"><button>Іздеу</button></div></form><div>${qs.slice(historyBankPage*30,(historyBankPage+1)*30).map(q=>{const v=historyVariants.find(v=>v.number===q.number);return `<article class="questionrow" lang="kk"><span class="badge">${q.number}-нұсқа · ${q.l}</span><p>${escapeText(q.topic)}</p><h3>${escapeText(q.t)}</h3><details><summary>Жаттығуды ашу</summary>${q.context!==null?historyContextMarkup(v.contexts[q.context]):''}<fieldset><legend>Жауабыңды таңда</legend>${q.o.map((o,i)=>`<label class="reading-practice-option"><input type="radio" name="history-practice-${q.id}" value="${i}"> ${escapeText(o)}</label>`).join('')}</fieldset><button onclick="checkHistoryPractice(this,'${q.id}')">Тексеру</button><p class="practice-feedback" aria-live="polite"></p></details><button class="secondary" data-history-save="${q.id}" aria-pressed="${marked.includes(q.id)}" onclick="saveHistoryQuestion('${q.id}')">${marked.includes(q.id)?'Сақталған':'Сақтау'}</button></article>`}).join('')||'<p>Әзірге сәйкес сұрақ жоқ. Басқа сөзбен іздеп көр немесе тестті орында.</p>'}</div><div class="reading-move"><button class="secondary" onclick="historyBankPage--;historyRenderBank()" ${historyBankPage===0?'disabled':''}>Алдыңғы бет</button><span>${historyBankPage+1} / ${pages}</span><button class="secondary" onclick="historyBankPage++;historyRenderBank()" ${historyBankPage>=pages-1?'disabled':''}>Келесі бет</button></div>`);
}
function historySearch(){historyBankQuery=document.getElementById('history-search').value.trim();historyBankPage=0;historyRenderBank();}
function checkHistoryPractice(button,id) {
  const q=historyAll().find(q=>q.id===id),chosen=button.parentElement.querySelector('input:checked');
  button.nextElementSibling.textContent=!chosen?'Алдымен жауапты таңда.':(Number(chosen.value)===q.a?'Дұрыс! ':'Қате. Дұрыс жауап: '+q.o[q.a]+'. ')+q.e;
}
