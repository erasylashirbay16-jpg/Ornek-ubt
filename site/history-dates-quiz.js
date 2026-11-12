/* Örnek · Қазақстан тарихы: 100 дата, randomized immediate-feedback quiz. */
(function () {
  'use strict';
  const facts = Array.isArray(window.historyChronologyFacts) ? window.historyChronologyFacts : [];
  const storeKey = 'ornek-history-dates-quiz-v1';
  const categories = [
    {id:'ancient',name:'Ежелгі дәуір және түркі кезеңі',min:1,max:20},
    {id:'khanate',name:'Қазақ хандығы мен XVIII ғасыр',min:21,max:40},
    {id:'revival',name:'XIX ғасыр және Алаш кезеңі',min:41,max:60},
    {id:'soviet',name:'Кеңестік Қазақстан',min:61,max:80},
    {id:'independent',name:'Тәуелсіздік және қазіргі кезең',min:81,max:100}
  ];
  let session = null;

  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function shuffleCopy(list) {
    const a = list.slice();
    for (let i=a.length-1;i>0;i--) {
      const j=Math.floor(Math.random()*(i+1));
      [a[i],a[j]]=[a[j],a[i]];
    }
    return a;
  }
  function recentRuns() {
    try {const arr=JSON.parse(localStorage.getItem(storeKey)||'[]');return Array.isArray(arr)?arr.slice(0,30):[];}
    catch {return [];}
  }
  function saveRun(run) {
    try {localStorage.setItem(storeKey,JSON.stringify([run,...recentRuns()].slice(0,30)));}
    catch {}
  }
  function categoryOf(fact) {return Math.min(4,Math.floor((fact.id-1)/20));}
  function dateKey(label) {return String(label).replace(/\bI\b/g,'І').replace(/[‒−]/g,'–').replace(/\s+/g,' ').trim();}
  function othersFor(fact,property) {
    const same=facts.filter(f=>f.id!==fact.id && (property==='date'?dateKey(f.date)!==dateKey(fact.date):f.event!==fact.event) && categoryOf(f)===categoryOf(fact));
    const rest=facts.filter(f=>f.id!==fact.id && (property==='date'?dateKey(f.date)!==dateKey(fact.date):f.event!==fact.event) && categoryOf(f)!==categoryOf(fact));
    return [...shuffleCopy(same),...shuffleCopy(rest)];
  }
  function createQuestion(fact) {
    // If two events have the same date, asking "what happened in YEAR" could have two correct answers.
    const repeatedDate=facts.some(f=>f.id!==fact.id && dateKey(f.date)===dateKey(fact.date));
    const reverse=!repeatedDate && Math.random()<0.42;
    const property=reverse?'event':'date';
    const correct=fact[property];
    const options=[correct];
    for(const candidate of othersFor(fact,property)) {
      if(options.length===4)break;
      if(!options.some(o=>property==='date'?dateKey(o)===dateKey(candidate[property]):o===candidate[property]))options.push(candidate[property]);
    }
    if(options.length!==4)throw Error('Chronology quiz lacks distinct choices');
    return {
      fact,reverse,answer:correct,options:shuffleCopy(options)
    };
  }
  function modeLabel(mode) {
    if(Number.isInteger(mode))return String(mode).padStart(2,'0')+'-нұсқа';
    if(mode==='all')return '100 датаның бәрі';
    if(mode==='wrong')return 'Қателерді қайталау';
    return categories.find(c=>c.id===mode)?.name || 'Кездейсоқ жаттығу';
  }
  function modeFacts(mode) {
    if(Number.isInteger(mode) && mode>=1 && mode<=12) {
      // Twenty balanced questions, randomly resampled on EVERY launch.
      return shuffleCopy(categories.flatMap(c=>shuffleCopy(facts.filter(f=>f.id>=c.min&&f.id<=c.max)).slice(0,4)));
    }
    if(mode==='all')return shuffleCopy(facts);
    if(mode==='wrong') {
      const wrongIds=new Set(recentRuns().flatMap(r=>Array.isArray(r.wrongIds)?r.wrongIds:[]));
      return shuffleCopy(facts.filter(f=>wrongIds.has(f.id))).slice(0,20);
    }
    const cat=categories.find(c=>c.id===mode);
    if(cat)return shuffleCopy(facts.filter(f=>f.id>=cat.min&&f.id<=cat.max)).slice(0,12);
    return [];
  }
  function open() {
    session=null;
    const runs=recentRuns(),best=runs.length?Math.max(...runs.map(x=>Math.round(x.correct/Math.max(1,x.total)*100))):null;
    const wrongIds=new Set(runs.flatMap(r=>Array.isArray(r.wrongIds)?r.wrongIds:[]));
    const mixes=Array.from({length:12},(_,i)=>i+1);
    page('Қазақстан тарихы · 100 дата','PDF кестесінен жасалған жеке интерактивті жаттығу.', 
      '<div class="hdq-home">'+
        '<section class="hdq-hero">'+
          '<div class="hdq-hero-copy"><span class="hdq-eyebrow">ЖАҢА ЖАТТЫҒУ · QUIZ РЕЖИМІ</span><h2>100 тарихи дата.<br><em>Шексіз жаңа жаттығу.</em></h2>'+
          '<p>Сұрақты таңдаған бойда дұрыс жауап ашылады. Әр бастағанда сұрақтар да, жауаптардың реті де жаңадан араластырылады.</p>'+
          '<button type="button" onclick="OrnekHistoryDatesQuiz.start(1)">Жаттығуды бастау <span aria-hidden="true">↗</span></button></div>'+
          '<div class="hdq-hero-mark" aria-hidden="true"><span>100</span><small>ДАТА</small><div>✦</div></div></section>'+
        '<div class="hdq-kpis"><div><span>PDF деректері</span><strong>'+facts.length+'</strong></div><div><span>Аралас нұсқалар</span><strong>12</strong></div>'+
          '<div><span>Орындалғаны</span><strong>'+runs.length+'</strong></div><div><span>Үздік нәтиже</span><strong>'+(best===null?'—':best+'%')+'</strong></div></div>'+
        '<section class="hdq-section"><div class="hdq-section-head"><h2>Нұсқаны таңда</h2><p>Әр нұсқада 20 сұрақ, кезеңдер бойынша теңдей бөлінеді.</p></div>'+
        '<div class="hdq-grid">'+mixes.map(n=>
          '<button type="button" class="hdq-mode" onclick="OrnekHistoryDatesQuiz.start('+n+')">'+
          '<span class="hdq-mode-num">'+String(n).padStart(2,'0')+'</span><strong>'+String(n).padStart(2,'0')+'-нұсқа</strong><small>20 сұрақ · жаңа рет</small><span class="hdq-mode-arrow" aria-hidden="true">↗</span></button>'
        ).join('')+'</div></section>'+
        '<section class="hdq-section"><div class="hdq-section-head"><h2>Тақырып бойынша жаттық</h2><p>Күрделі даталарды жеке-жеке қайтала.</p></div>'+
        '<div class="hdq-topics">'+categories.map(c=>
          '<button type="button" onclick="OrnekHistoryDatesQuiz.start(\''+c.id+'\')"><span>'+esc(c.name)+'</span><small>12 кездейсоқ сұрақ</small><b aria-hidden="true">↗</b></button>'
        ).join('')+'</div></section>'+
        '<div class="hdq-final-actions"><button type="button" onclick="OrnekHistoryDatesQuiz.start(\'all\')">Барлық 100 датаны жаттау</button>'+
        (wrongIds.size?'<button type="button" class="hdq-quiet" onclick="OrnekHistoryDatesQuiz.start(\'wrong\')">Қателерді қайталау ('+wrongIds.size+')</button>':'')+
        '<button type="button" class="hdq-quiet" onclick="subjectNavigate(\'testsPage\')">50 тарих тестіне оралу</button></div>'+
        '<p class="hdq-source">Дереккөз: «Қазақстан тарихы» маңызды оқиғаларының хронологиялық кестесі, 100 дата, 3 бет (жүктеген PDF). Даталар мен оқиғалар файлдағы нұсқасы бойынша берілген.</p>'+
      '</div>');
  }
  function start(mode) {
    if(facts.length!==100) {
      page('Қазақстан тарихы · 100 дата','Деректер жүктелмеді.','<p class="notice">Бетті қайта жүктеп көріңіз.</p>');
      return;
    }
    const chosen=modeFacts(mode);
    if(!chosen.length){open();return;}
    session={mode,questions:chosen.map(createQuestion),position:0,chosen:Array(chosen.length).fill(null),correct:0};
    page('Қазақстан тарихы · '+modeLabel(mode),'Дұрыс жауапты әр таңдаудан кейін бірден көресің.',
      '<div class="hdq-play"><div class="hdq-toolbar"><button class="hdq-back" type="button" onclick="OrnekHistoryDatesQuiz.open()">← Нұсқалар</button>'+
      '<span>'+esc(modeLabel(mode))+'</span><strong id="hdq-score">0 дұрыс</strong></div>'+
      '<div id="hdq-stage" aria-live="off"></div></div>');
    showQuestion();
  }
  function showQuestion() {
    if(!session)return;
    const root=document.getElementById('hdq-stage');
    if(!root)return;
    const {questions,position,chosen,correct}=session,question=questions[position],selected=chosen[position];
    const revealed=selected!==null;
    const isCorrect=revealed&&question.options[selected]===question.answer;
    const progress=Math.round((position+Number(revealed))/questions.length*100);
    const heading=question.reverse?'Осы мерзімге қандай оқиға сәйкес келеді?':'Бұл тарихи оқиға қай мерзімде болды?';
    root.innerHTML=
      '<div class="hdq-progress-top"><span>СҰРАҚ '+(position+1)+' / '+questions.length+'</span><span>'+progress+'% аяқталды</span></div>'+
      '<div class="hdq-track" role="progressbar" aria-label="Жаттығу барысы" aria-valuemin="0" aria-valuemax="'+questions.length+'" aria-valuenow="'+(position+Number(revealed))+'"><i style="width:'+progress+'%"></i></div>'+
      '<section class="hdq-question"><span class="hdq-question-tag">'+(question.reverse?'ДАТА → ОҚИҒА':'ОҚИҒА → ДАТА')+'</span>'+
      '<h2>'+heading+'</h2><div class="hdq-prompt" lang="kk">'+esc(question.reverse?question.fact.date:question.fact.event)+'</div>'+
      '<div class="hdq-choices">'+question.options.map((option,index)=>{
        const right=option===question.answer;
        const state=revealed?(right?' hdq-correct':selected===index?' hdq-incorrect':' hdq-muted'):'';
        return '<button type="button" class="hdq-choice'+state+'" onclick="OrnekHistoryDatesQuiz.choose('+index+')"'+(revealed?' disabled':'')+'>'+
          '<span class="hdq-choice-letter">'+['A','B','C','D'][index]+'</span><span class="hdq-choice-text" lang="kk">'+esc(option)+'</span>'+
          (revealed&&right?'<span aria-label="Дұрыс жауап" class="hdq-choice-icon">✓</span>':revealed&&index===selected?'<span aria-label="Қате жауап" class="hdq-choice-icon">×</span>':'')+
          '</button>';
      }).join('')+'</div>'+
      (revealed?
        '<div class="hdq-feedback '+(isCorrect?'hdq-feedback-good':'hdq-feedback-bad')+'" role="status">'+
        '<strong>'+(isCorrect?'Дұрыс! Керемет.':'Қате жауап. Дұрысын есте сақта!')+'</strong>'+
        '<p><span>Дұрыс жауап:</span> '+esc(question.answer)+'</p>'+
        '<small>PDF · '+question.fact.page+'-бет. '+esc(question.fact.event)+' — '+esc(question.fact.date)+'</small></div>'+
        '<button type="button" id="hdq-next" class="hdq-next" onclick="OrnekHistoryDatesQuiz.next()">'+
          (position===questions.length-1?'Нәтижені көру':'Келесі сұрақ')+' <span aria-hidden="true">→</span></button>'
      :'<p class="hdq-hint">Бір дұрыс жауап. Таңдаған кезде нәтиже бірден көрсетіледі.</p>')+
      '</section>';
    const score=document.getElementById('hdq-score');if(score)score.textContent=correct+' дұрыс';
    if(revealed)document.getElementById('hdq-next')?.focus({preventScroll:true});
  }
  function choose(index) {
    if(!session||!Number.isInteger(index)||index<0||index>3)return;
    const pos=session.position;
    if(session.chosen[pos]!==null)return;
    session.chosen[pos]=index;
    if(session.questions[pos].options[index]===session.questions[pos].answer)session.correct++;
    showQuestion();
  }
  function next() {
    if(!session||session.chosen[session.position]===null)return;
    if(session.position===session.questions.length-1){finish();return;}
    session.position++;
    showQuestion();
    document.querySelector('.hdq-question')?.scrollIntoView({behavior:'smooth',block:'start'});
  }
  function finish() {
    if(!session)return;
    const s=session;
    const wrong=s.questions.filter((q,i)=>q.options[s.chosen[i]]!==q.answer);
    const record={mode:s.mode,label:modeLabel(s.mode),correct:s.correct,total:s.questions.length,wrongIds:wrong.map(q=>q.fact.id),date:new Date().toISOString()};
    saveRun(record);
    const percentage=Math.round(s.correct/s.questions.length*100);
    session=null;
    page('Қазақстан тарихы · Нәтиже','Жаттығу аяқталды. Дұрыс жауаптарды қайталап шық.',
      '<div class="hdq-results"><div class="hdq-result-hero"><span>СЕНІҢ НӘТИЖЕҢ</span><strong>'+s.correct+' <small>/ '+s.questions.length+'</small></strong>'+
      '<h2>'+percentage+'% дұрыс жауап</h2><p>'+esc(modeLabel(s.mode))+' · жауаптарды бірден тексеру режимі</p></div>'+
      '<div class="hdq-result-actions"><button type="button" onclick="OrnekHistoryDatesQuiz.start('+JSON.stringify(s.mode).replace(/"/g,'&quot;')+')">Қайта орындау · жаңа сұрақтар</button>'+
      '<button type="button" class="hdq-quiet" onclick="OrnekHistoryDatesQuiz.open()">Басқа нұсқа</button></div>'+
      (wrong.length?'<div class="hdq-review"><h2>Қайталау керек · '+wrong.length+' сұрақ</h2>'+
         wrong.map((q,i)=>'<article><span>PDF · '+q.fact.page+'-бет</span><h3>'+esc(q.fact.event)+'</h3><p><b>Дұрыс дата:</b> '+esc(q.fact.date)+'</p></article>').join('')+'</div>':
        '<div class="hdq-perfect">Барлық сұраққа дұрыс жауап бердің!</div>')+
      '</div>');
  }
  window.OrnekHistoryDatesQuiz={open,start,choose,next};
})();