/* Shared subject dashboard. Existing banks, scoring and exam engines stay authoritative. */
(() => {
  'use strict';
  const subjects = {
    reading: {all: () => readingAll(), results: () => readingResults(), variants: () => readingVariants,
      items: v => readingItems(v), correct: (q,a) => a === q.a, answered: (q,a) => Number.isInteger(a)},
    history: {all: () => historyAll(), results: () => historyResults(), variants: () => historyVariants,
      items: v => historyItems(v), correct: (q,a) => a === q.a, answered: (q,a) => Number.isInteger(a)},
    profile: {all: () => profileAll(), results: () => profileResults(), variants: () => profileVariants,
      items: v => v.questions, correct: (q,a) => profileCorrect(q,a), answered: (q,a) => profileAnswered(q,a) && (Array.isArray(a) ? a.every(x=>Number.isInteger(x)&&x>=0&&x<q.o.length) : a>=0&&a<q.o.length)},
    physics: {all: () => physicsAll(), results: () => physicsResults(), variants: () => physicsVariants,
      items: v => v.questions, correct: (q,a) => physicsCorrect(q,a), answered: (q,a) => physicsAnswered(q,a)}
  };
  let shownTopics = 6;
  let activeTopics = [];
  const checks = new WeakMap();
  const t = text => typeof qTr === 'function' ? qTr(text) : text;
  const esc = value => escapeText(String(value));
  function dateKey(value = new Date()) {
    const date = new Date(value);
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  }
  function storageKey(subject) {
    return 'ornek-subject-dashboard-v1:' + (ornekAccount.user?.id || 'guest') + ':' + subject;
  }
  function saveState(subject, state) {
    try { localStorage.setItem(storageKey(subject), JSON.stringify(state)); }
    catch { /* Keep practice and exam engines usable if browser storage is full. */ }
  }
  function loadState(subject) {
    let state;
    try { state = JSON.parse(localStorage.getItem(storageKey(subject)) || 'null'); } catch {}
    if (!state || typeof state !== 'object' || Array.isArray(state)) {
      const previous = subject === 'reading' ? studyPlan() : null;
      state = {target: previous?.target || 10, days: {...(previous?.days || {})}, practice: {}, imported: {}};
      // Reading's earlier plan already includes its completed test attempts.
      if (previous) for (const [number,result] of Object.entries(subjects.reading.results())) {
        state.imported[number + ':' + result.date] = true;
      }
    }
    for (const key of ['days','practice','imported']) {
      if (!state[key] || typeof state[key] !== 'object' || Array.isArray(state[key])) state[key] = {};
    }
    if (![5,10,20,30].includes(Number(state.target))) state.target = 10;
    state.target = Number(state.target);
    if(subject==='reading'){
      const target=Number(studyPlan().target);
      if([5,10,20,30].includes(target))state.target=target;
    }
    let changed = false;
    const config = subjects[subject];
    const results = config.results();
    for (const variant of config.variants()) {
      const result = results[variant.number];
      if (!result?.answers || !Number.isFinite(Date.parse(result.date))) continue;
      const attempt = variant.number + ':' + result.date;
      if (state.imported[attempt]) continue;
      const count = config.items(variant).filter(q => config.answered(q, result.answers[q.id])).length;
      const day = dateKey(result.date);
      state.days[day] = (Number(state.days[day]) || 0) + count;
      state.imported[attempt] = true;
      changed = true;
    }
    if (changed) saveState(subject,state);
    return state;
  }
  function snapshot(subject) {
    const config = subjects[subject], state = loadState(subject);
    const questions = [...new Map(config.all().map(q => [q.id,q])).values()];
    const latest = new Map();
    const results = config.results();
    for (const variant of config.variants()) {
      const result = results[variant.number];
      if (!result?.answers) continue;
      for (const q of config.items(variant)) {
        if (!config.answered(q,result.answers[q.id])) continue;
        const date = Date.parse(result.date) || 0;
        if (!latest.has(q.id) || latest.get(q.id).date <= date) {
          latest.set(q.id,{date,correct:config.correct(q,result.answers[q.id])});
        }
      }
    }
    for (const [id,record] of Object.entries(state.practice)) {
      const date = Date.parse(record.date) || 0;
      if (!latest.has(id) || latest.get(id).date <= date) latest.set(id,{...record,date});
    }
    const groups = new Map();
    for (const q of questions) {
      const name = subject === 'reading' ? q.title : q.topic || 'Тапсырмалар';
      const key = subject === 'physics' ? String(q.topicId) : name;
      if (!groups.has(key)) groups.set(key,{key,name,questions:[]});
      groups.get(key).questions.push(q);
    }
    function metrics(items) {
      const records = items.map(q => latest.get(q.id)).filter(Boolean);
      const graded = records.filter(r => typeof r.correct === 'boolean');
      return {total:items.length, done:records.length, correct:graded.filter(r=>r.correct).length,
        graded:graded.length, wrong:graded.filter(r=>!r.correct).length};
    }
    const topics=[...groups.values()];
    if(subject==='physics')topics.sort((a,b)=>Number(a.key)-Number(b.key));
    if(subject==='history')topics.sort((a,b)=>b.questions.length-a.questions.length||a.name.localeCompare(b.name,'kk'));
    return {state,questions,topics,metrics,summary:metrics(questions)};
  }
  function weekHTML(state) {
    const days = qLanguage === 'ru' ? ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'] : ['Жс','Дс','Сс','Ср','Бс','Жм','Сб'];
    return Array.from({length:7},(_,i) => {
      const date = new Date(); date.setDate(date.getDate()-6+i);
      const count = Math.max(0,Number(state.days[dateKey(date)]) || 0);
      const label = days[date.getDay()];
      return `<div class="week-day ${i===6?'today':''}" title="${label}: ${count}"><div class="week-track"><i style="height:${Math.min(100,count/state.target*100)}%"></i></div><span>${label}</span><span class="sr-only">${count} ${t('жауап')}</span></div>`;
    }).join('');
  }
  function render(subject) {
    if (!subjects[subject] || app.querySelector('.subject-dashboard')) return;
    const data = snapshot(subject), {state,summary} = data;
    activeTopics = data.topics;
    const today = Math.max(0,Number(state.days[dateKey()]) || 0);
    const percent = Math.min(100,today/state.target*100);
    const rows = data.topics.slice(0,shownTopics).map((topic,index) => {
      const m = data.metrics(topic.questions);
      return `<button class="subject subject-${index%4}" onclick="OrnekSubjectDashboard.openTopic(${index})"><span class="subject-index">${String(index+1).padStart(2,'0')}</span><div class="subject-body"><h3>${esc(topic.name)}</h3><p>${t(subject==='reading'?'Мәтінді оқып, сұрақтарға жауап бер.':'Тақырыпты қайталап, тапсырмаларды орында.')}</p><div class="subjectmeta"><span>${m.total} ${t('сұрақ')}</span><span>${m.done} ${t('орындалды')}</span></div><div class="qprogress" role="progressbar" aria-label="${esc(topic.name)}" aria-valuemin="0" aria-valuemax="${m.total}" aria-valuenow="${m.done}"><i style="width:${m.total?m.done/m.total*100:0}%"></i></div></div><span class="subjectarrow">${qArrow}</span></button>`;
    }).join('');
    const goalMessage = today>=state.target ? 'Мақсатыңа жеттің. Жақсы жұмыс!' : 'Тестті аяқта немесе жаттығуда жауабыңды тексер.';
    const root = document.createElement('section');
    root.className = 'subject-dashboard'; root.dataset.subject = subject;
    root.innerHTML = `<div class="learning-summary"><div><span>${t('Орындалған есеп')}</span><strong>${summary.done}<small> / ${summary.total}</small></strong></div><div><span>${t('Дұрыс жауап үлесі')}</span><strong>${summary.graded?Math.round(summary.correct/summary.graded*100)+'%':'—'}</strong></div><div><span>${t('Қайталау керек')}</span><strong>${summary.wrong}<small> ${t('сұрақ')}</small></strong></div><button class="textbutton" onclick="subjectNavigate('analytics')">${t('Статистика')} ${qArrow}</button></div><div class="study-columns"><section class="subjects"><div class="qsectionhead"><div><p class="overline">${t('ЕСЕПТЕР БАНКІ')}</p><h2>${t('Дайындық бағыттары')}</h2></div><button class="textbutton" onclick="subjectNavigate('library')">${summary.total} ${t('сұрақ')} ${qArrow}</button></div><div class="subjectgrid">${rows}</div>${data.topics.length>shownTopics?`<button class="secondary dashboard-more" onclick="OrnekSubjectDashboard.showAll()">${t('Барлық тақырыпты көрсету')} (${data.topics.length})</button>`:''}<div class="practice-links"><button onclick="subjectNavigate('collection')"><span>${t('Сақталғандар мен қателер')}<small>${t('Қайталап, біліміңді бекіт')}</small></span>${qArrow}</button><button onclick="subjectNavigate('testsPage')"><span>${t('Тест нұсқалары')}<small>${t('Уақытпен дайындал')}</small></span>${qArrow}</button></div></section><div class="study-rail"><section class="daily-card"><div class="daily-heading"><h2>${t('Бүгінгі мақсат')}</h2><button class="textbutton" onclick="OrnekSubjectDashboard.editGoal()" aria-label="${t('Күндік мақсатты өзгерту')}">${t('Өзгерту')}</button></div><div class="goal-number"><strong>${today}<span> / ${state.target}</span></strong><span class="goal-unit">${t('сұрақ')}</span></div><div class="goal-track" role="progressbar" aria-label="${t('Бүгінгі мақсат')}" aria-valuemin="0" aria-valuemax="${state.target}" aria-valuenow="${Math.min(today,state.target)}"><i style="width:${percent}%"></i></div><p class="daily-caption">${t(goalMessage)}</p><div class="week-title"><span>${t('Соңғы 7 күн')}</span><span>${t('Жауаптар саны')}</span></div><div class="week-chart" aria-label="${t('Соңғы жеті күндегі жауаптар')}">${weekHTML(state)}</div></section><section class="quick-session"><div class="quick-label">${t('АЗ УАҚЫТ БОЛСА')}</div><h2>${t('Бес сұрақтан баста.')}</h2><p>${t('Қысқа жаттығу. Өз қарқыныңмен дайындал.')}</p><button class="secondary" onclick="subjectNavigate('rush')">${t('Жылдам жаттығу')} ${qArrow}</button></section><p class="rail-note">${t('Әр пәннің мақсаты мен нәтижесі бөлек сақталады.')}<br>${t('Прогресс осы браузерде сақталады.')}</p></div></div>`;
    const notice = app.querySelector(':scope > .notice');
    if (notice) notice.before(root); else app.append(root);
  }
  function refresh() {
    app.querySelector('.subject-dashboard')?.remove();
    render(currentSubject);
  }
  function openTopic(index) {
    const topic = activeTopics[index]; if (!topic) return;
    subjectNavigate('library');
    if (currentSubject==='physics') { physicsTopic=topic.key; physicsBankPage=0; physicsRenderBank(); }
    if (currentSubject==='profile') { profileQuery=topic.name; profileBankPage=0; profileRenderBank(); }
    if (currentSubject==='history') { historyBankQuery=topic.name; historyBankPage=0; historyRenderBank(); }
    if (currentSubject==='reading') {
      const input=app.querySelector('input[type="search"]'); if(input) input.value=topic.name;
      filterReadingRows(topic.name);
      const count=app.querySelector('.page-intro .muted');if(count)count.textContent=topic.questions.length+' '+t('сұрақ')+' · '+t('Оқу сауаттылығы');
    }
  }
  function editGoal() {
    const subject = currentSubject, state = loadState(subject);
    const dialog = document.createElement('dialog'); dialog.className='ornek-dialog subject-goal-dialog';
    dialog.innerHTML=`<button class="dialog-close" type="button" aria-label="${t('Жабу')}">×</button><h2>${t('Күндік мақсат')}</h2><p>${esc(pickerName(subject))}</p><form><label>${t('Күніне орындалатын сұрақ саны')}<select name="target">${[5,10,20,30].map(n=>`<option value="${n}" ${n===state.target?'selected':''}>${n}</option>`).join('')}</select></label><button type="submit">${t('Сақтау')}</button></form>`;
    dialog.querySelector('.dialog-close').onclick=()=>dialog.close();
    dialog.querySelector('form').onsubmit=event=>{
      event.preventDefault();state.target=Number(new FormData(event.currentTarget).get('target'));saveState(subject,state);
      if(subject==='reading'){const plan=studyPlan();plan.target=state.target;writeStore('ornek-reading-plan-v1',plan)}
      dialog.close(); if(currentSubject===subject)refresh();
    };
    dialog.addEventListener('close',()=>dialog.remove());document.body.append(dialog);dialog.showModal();
  }
  function recordPractice(subject,button,id) {
    const config=subjects[subject],q=config.all().find(q=>q.id===id);if(!q)return;
    const root=button.parentElement;
    let answer,correct;
    if(q.kind==='short') {
      answer=root.querySelector('[data-physics-short]')?.value?.trim();if(!answer)return;
      correct=typeof q.value==='number'?physicsShortCorrect(q,answer):null;
    } else {
      if(q.kind==='match')answer=[...root.querySelectorAll('select')].map(x=>Number(x.value));
      else if(q.kind==='multi')answer=[...root.querySelectorAll('input:checked')].map(x=>Number(x.value));
      else {const input=root.querySelector('input:checked');if(!input)return;answer=Number(input.value)}
      if(!config.answered(q,answer))return;
      if(Array.isArray(answer)&&answer.some(a=>!Number.isInteger(a)||a<0||a>=q.o.length))return;
      correct=config.correct(q,answer);
    }
    const signature=id+':'+JSON.stringify(answer);
    if(checks.get(button)===signature)return;
    checks.set(button,signature);
    const state=loadState(subject),day=dateKey();
    state.days[day]=(Number(state.days[day])||0)+1;
    state.practice[id]={correct,date:new Date().toISOString()};saveState(subject,state);
    if(subject==='reading'){const plan=studyPlan();plan.days[day]=(Number(plan.days[day])||0)+1;writeStore('ornek-reading-plan-v1',plan)}
  }
  function renderPracticeReview(subject) {
    const data=snapshot(subject);
    const wrong=data.questions.filter(q=>data.state.practice[q.id]?.correct===false&&data.metrics([q]).wrong);
    if(!wrong.length)return;
    const host=document.createElement('section');host.className='dashboard-review';
    host.innerHTML=`<h2>${t('Жаттығудағы қателер')}</h2><p>${t('Соңғы тексерілген жауаптарыңды қайта орында.')}</p>`;
    const handler={reading:'checkReadingPractice',history:'checkHistoryPractice',profile:'profileCheckPractice',physics:'physicsCheckPractice'}[subject];
    wrong.forEach((q,index)=>{
      const article=document.createElement('article');article.className='questionrow';
      let input;
      if(subject==='physics')input=physicsInput(q,null,true);
      else if(subject==='profile')input=profileInput(q,null,true);
      else input=`<fieldset><legend>${t('Жауабыңды таңда')}</legend>${q.o.map((o,i)=>`<label class="reading-practice-option"><input type="radio" name="dashboard-review-${index}" value="${i}"> ${esc(o)}</label>`).join('')}</fieldset>`;
      let context='';
      if(subject==='reading')context=`<p>${esc(readingVariants.find(v=>v.number===q.number).passages[q.pi].text)}</p>`;
      if(subject==='history'&&q.context!==null)context=historyContextMarkup(historyVariants.find(v=>v.number===q.number).contexts[q.context]);
      if((subject==='profile'||subject==='physics')&&q.context)context=`<p>${esc(q.context)}</p>`;
      article.innerHTML=`<p>${esc(q.topic||q.title||'')}</p><h3 lang="kk">${esc(q.t)}</h3><details><summary>${t('Жаттығуды ашу')}</summary>${context}${input}<button type="button">${t('Тексеру')}</button><p aria-live="polite"></p></details>`;
      article.querySelector('details>button').onclick=function(){window[handler](this,q.id)};
      host.append(article);
    });
    const heading=app.querySelector('.page-intro');
    const intro=heading?.querySelector('.muted');
    if(intro)intro.textContent=t('Тест нәтижелері, сақталған сұрақтар және жаттығудағы қателер.');
    const emptyMessages=['Әзірге сәйкес сұрақ жоқ. Басқа сөзбен іздеп көр немесе тестті орында.','Сәйкес тапсырма жоқ.'];
    for(const p of app.querySelectorAll('p')){if(emptyMessages.includes(p.textContent.trim()))p.hidden=true}
    app.append(host);
  }
  function wrapSection(original,subject) {
    return function(key,...args){
      if(key==='home')shownTopics=6;
      const result=original.call(this,key,...args);
      if(key==='home')render(subject);
      if(key==='collection')renderPracticeReview(subject);
      return result;
    };
  }
  readingSection=wrapSection(readingSection,'reading');historySection=wrapSection(historySection,'history');
  profileSection=wrapSection(profileSection,'profile');physicsSection=wrapSection(physicsSection,'physics');
  function wrapPractice(original,subject) {
    return function(button,id,...args){const result=original.call(this,button,id,...args);recordPractice(subject,button,id);return result};
  }
  checkReadingPractice=wrapPractice(checkReadingPractice,'reading');checkHistoryPractice=wrapPractice(checkHistoryPractice,'history');
  profileCheckPractice=wrapPractice(profileCheckPractice,'profile');physicsCheckPractice=wrapPractice(physicsCheckPractice,'physics');
  function wrapFinish(original,subject,getRun) {
    return function(...args){
      const before=getRun();if(before)loadState(subject);
      const result=original.apply(this,args);
      if(before&&!getRun())loadState(subject);
      return result;
    };
  }
  finishReading=wrapFinish(finishReading,'reading',()=>readingRun);finishHistory=wrapFinish(finishHistory,'history',()=>historyRun);
  finishProfile=wrapFinish(finishProfile,'profile',()=>profileRun);finishPhysics=wrapFinish(finishPhysics,'physics',()=>physicsRun);
  Object.assign(qRussian,{
    'Барлық тақырыпты көрсету':'Показать все темы','Бес сұрақтан баста.':'Начни с пяти вопросов.',
    'Қысқа жаттығу. Өз қарқыныңмен дайындал.':'Короткая тренировка в своём темпе.',
    'Әр пәннің мақсаты мен нәтижесі бөлек сақталады.':'Цели и результаты каждого предмета сохраняются отдельно.',
    'Прогресс осы браузерде сақталады.':'Прогресс сохраняется в этом браузере.',
    'Тақырыпты қайталап, тапсырмаларды орында.':'Повтори тему и выполни задания.',
    'Мәтінді оқып, сұрақтарға жауап бер.':'Прочитай текст и ответь на вопросы.',
    'Тестті аяқта немесе жаттығуда жауабыңды тексер.':'Заверши тест или проверь ответ в тренировке.',
    'Тест нәтижелері, сақталған сұрақтар және жаттығудағы қателер.':'Результаты тестов, сохранённые вопросы и ошибки в тренировках.',
    'Жаттығудағы қателер':'Ошибки в тренировках','Соңғы тексерілген жауаптарыңды қайта орында.':'Повтори задания с ошибками в последних ответах.',
    'Уақытпен дайындал':'Тренируйся с таймером','орындалды':'выполнено','жауап':'ответов'
  });
  const previousLanguage=setQLanguage;
  setQLanguage=function(...args){
    const result=previousLanguage.apply(this,args);
    if(app.querySelector('.subject-dashboard'))refresh();
    return result;
  };
  window.OrnekSubjectDashboard={openTopic,editGoal,showAll(){shownTopics=Infinity;refresh()},snapshot,loadState,dateKey};
})();
