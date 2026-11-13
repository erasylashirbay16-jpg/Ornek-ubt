/* Örnek · common timer picker and separate question-bank workspace. */
(function(){
'use strict';
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let modal=null,room=null;
const pages={},bankAnswerCache=Object.create(null);
function timePicker(title,defaultMin,callback){
  if(modal)modal.close();
  const prev=document.activeElement,oldOverflow=document.body.style.overflow;
  const layer=document.createElement('div');layer.className='oe-time-overlay';
  const presets=[20,30,40,50];
  if(!presets.includes(defaultMin))presets.push(defaultMin);
  layer.innerHTML='<section class="oe-time-dialog" role="dialog" aria-modal="true" aria-labelledby="oe-time-title">'+
    '<div class="oe-time-heading"><div><small>ÖRNEK · ТЕСТ БАСТАУ</small><h2 id="oe-time-title">Уақытты таңда</h2></div><button type="button" class="oe-close" data-close aria-label="Жабу">×</button></div>'+
    '<p class="oe-time-subject">'+esc(title)+'</p><p class="oe-time-hint">Нұсқа басталғанда таймер іске қосылады. Уақытты өзің таңдайсың.</p>'+
    '<form class="oe-time-form" novalidate><div class="oe-time-grid" role="group" aria-label="Уақыт таңдауы">'+
    presets.map(m=>'<button type="button" data-duration="'+m+'" class="oe-time-chip'+(m===defaultMin?' selected':'')+'" aria-pressed="'+(m===defaultMin)+'">'+m+' <span>мин</span>'+(m===defaultMin?'<small>Ұсынылған</small>':'')+'</button>').join('')+
    '</div><label class="oe-time-label" for="oe-own-minutes">Өз уақытым (минут)</label>'+
    '<input class="oe-time-input" id="oe-own-minutes" type="number" min="1" max="300" step="1" inputmode="numeric" placeholder="Мысалы: 75">'+
    '<p class="oe-time-error" role="alert"></p><div class="oe-time-actions"><button type="button" class="oe-cancel" data-close>Бас тарту</button><button type="submit" class="oe-confirm">Тестті бастау →</button></div></form></section>';
  document.body.append(layer);document.body.style.overflow='hidden';
  const input=layer.querySelector('input'),form=layer.querySelector('form'),error=layer.querySelector('.oe-time-error');
  let selected=defaultMin;
  function close(){
    if(!modal||modal.layer!==layer)return;
    document.removeEventListener('keydown',keyHandler,true);layer.remove();
    document.body.style.overflow=oldOverflow;modal=null;
    if(prev&&prev.isConnected&&prev.focus)prev.focus();
  }
  function keyHandler(e){
    if(e.key==='Escape'){e.preventDefault();close();return;}
    if(e.key!=='Tab')return;
    const focus=[...layer.querySelectorAll('button,input')].filter(el=>!el.disabled);
    if(!focus.length)return;
    if(e.shiftKey&&document.activeElement===focus[0]){e.preventDefault();focus[focus.length-1].focus();}
    else if(!e.shiftKey&&document.activeElement===focus[focus.length-1]){e.preventDefault();focus[0].focus();}
  }
  modal={layer,close};
  document.addEventListener('keydown',keyHandler,true);
  layer.addEventListener('click',e=>{if(e.target===layer)close();});
  layer.querySelectorAll('[data-close]').forEach(btn=>btn.addEventListener('click',close));
  layer.querySelectorAll('[data-duration]').forEach(btn=>btn.addEventListener('click',()=>{
    selected=Number(btn.dataset.duration);input.value='';error.textContent='';
    layer.querySelectorAll('[data-duration]').forEach(b=>{b.classList.toggle('selected',b===btn);b.setAttribute('aria-pressed',String(b===btn));});
  }));
  input.addEventListener('input',()=>{
    selected=null;error.textContent='';
    layer.querySelectorAll('[data-duration]').forEach(b=>{b.classList.remove('selected');b.setAttribute('aria-pressed','false');});
  });
  form.addEventListener('submit',e=>{
    e.preventDefault();const n=selected===null?Number(input.value):selected;
    if(!Number.isInteger(n)||n<1||n>300){error.textContent='1–300 арасындағы бүтін минутты енгіз.';input.focus();return;}
    close();callback(n);
  });
  layer.querySelector('.oe-time-chip.selected').focus();
}
function applyTime(state,min,save,tick){
  if(!state)return;
  state.end=Date.now()+min*60000;state.durationMinutes=min;
  if(typeof save==='function')save();if(typeof tick==='function')tick();
}
function wrapStart(name,subject,recommended,apply){
  const old=window[name];if(typeof old!=='function')return;
  window[name]=function(){
    const args=[...arguments],label=typeof subject==='function'?subject(args[0]):subject;
    timePicker(label,recommended,minutes=>{old.apply(window,args);apply(minutes,args[0]);});
  };
}
wrapStart('startReading',n=>'Оқу сауаттылығы · '+n+'-нұсқа',20,m=>applyTime(typeof readingRun==='undefined'?null:readingRun,m,saveReadingDraft,readingClock));
wrapStart('startHistory',n=>'Қазақстан тарихы · '+n+'-нұсқа',40,m=>applyTime(typeof historyRun==='undefined'?null:historyRun,m,saveHistoryDraft,historyClock));
wrapStart('startProfile',n=>'Математика · '+n+'-нұсқа',120,m=>applyTime(typeof profileRun==='undefined'?null:profileRun,m,saveProfileDraft,profileClock));
wrapStart('startPhysics',n=>'Физика · '+n+'-нұсқа',80,m=>applyTime(typeof physicsRun==='undefined'?null:physicsRun,m,savePhysicsDraft,physicsClock));
wrapStart('startVariant',n=>'Математикалық сауаттылық · '+n+'-нұсқа',20,(m,n)=>{if(typeof run!=='undefined'&&run&&run.variant===n)applyTime(run,m,null,clock);});
wrapStart('startMixed','Математикалық сауаттылық · Аралас тест',20,m=>{if(typeof run!=='undefined'&&run&&run.mixed)applyTime(run,m,null,clock);});

const banks={
  history:{title:'Қазақстан тарихы',all:()=>historyAll(),back:()=>historyRenderBank(),
    save:id=>saveHistoryQuestion(id),saved:id=>historyBookmarks().includes(id),check:'checkHistoryPractice',
    context:q=>q.context===null?'':historyContextMarkup(historyVariants.find(v=>v.number===q.number).contexts[q.context]),
    input:q=>'<fieldset><legend>Жауабыңды таңда</legend>'+q.o.map((o,i)=>'<label class="reading-practice-option"><input type="radio" name="oe-history-answer" value="'+i+'"> '+esc(o)+'</label>').join('')+'</fieldset>',
    extra:()=>''},
  profile:{title:'Математика',all:()=>profileAll(),back:()=>profileRenderBank(),
    save:id=>profileSaveQuestion(id),saved:id=>profileSaved().includes(id),check:'profileCheckPractice',
    context:q=>q.context?'<p>'+esc(q.context)+'</p>':'',
    input:q=>profileInput(q,null,true),extra:()=>''},
  physics:{title:'Физика',all:()=>physicsAll(),back:()=>physicsRenderBank(),
    save:id=>physicsSaveQuestion(id),saved:id=>physicsSaved().includes(id),check:'physicsCheckPractice',
    context:q=>q.context?'<p>'+esc(q.context)+'</p>':'',
    input:q=>physicsInput(q,null,true),
    extra:q=>'<p class="oe-depth">'+esc(physicsDepthTask(q))+'</p><label class="oe-reasoning">Толық негіздеу<textarea data-physics-practice-reasoning rows="3" maxlength="5000" placeholder="Формула → шешім → тексеру"></textarea></label>'}
};
function decorate(type){
  const rows=[...(document.getElementById('app')?.querySelectorAll('.questionrow')||[])],ids=[],attr='data-'+type+'-save';
  rows.forEach(row=>{
    const save=row.querySelector('['+attr+']');if(!save)return;
    const id=save.getAttribute(attr);ids.push(id);const details=row.querySelector('details');
    if(!details)return;
    const button=document.createElement('button');button.type='button';button.className='oe-bank-open';
    button.textContent='Сұрақты жеке ашу →';button.addEventListener('click',()=>openQuestion(type,id));
    details.replaceWith(button);
  });
  pages[type]=ids;
}
function wrapBank(name,type){
  const old=window[name];if(typeof old!=='function')return;
  window[name]=function(){const result=old.apply(window,arguments);decorate(type);return result;};
}
wrapBank('historyRenderBank','history');
wrapBank('profileRenderBank','profile');
wrapBank('physicsRenderBank','physics');
function openQuestion(type,id){
  if(!banks[type])return;
  const ids=room&&room.type===type&&room.ids.includes(id)?room.ids:[...(pages[type]||[])];
  if(!ids.includes(id))ids.push(id);
  room={type,ids,id};renderQuestion();
}
function saveBankAnswers(){
  if(!room)return;
  const practice=document.querySelector('.oe-bank-practice');if(!practice)return;
  bankAnswerCache[room.type+':'+room.id]={
    values:[...practice.querySelectorAll('input,select,textarea')].map(el=>({value:el.value,checked:el.checked})),
    feedback:practice.querySelector('.oe-bank-feedback')?.textContent||''
  };
}
function restoreBankAnswers(){
  if(!room)return;
  const state=bankAnswerCache[room.type+':'+room.id];if(!state)return;
  const practice=document.querySelector('.oe-bank-practice');if(!practice)return;
  [...practice.querySelectorAll('input,select,textarea')].forEach((el,i)=>{
    if(!state.values[i])return;
    if(el.type==='radio'||el.type==='checkbox')el.checked=state.values[i].checked;
    else el.value=state.values[i].value;
  });
  const feedback=practice.querySelector('.oe-bank-feedback');if(feedback)feedback.textContent=state.feedback;
}
function backToBank(){
  if(!room)return;saveBankAnswers();const type=room.type;room=null;
  banks[type].back();window.scrollTo(0,0);
}
function nextQuestion(offset){
  if(!room)return;const idx=room.ids.indexOf(room.id)+offset;
  if(idx<0||idx>=room.ids.length)return;
  saveBankAnswers();room.id=room.ids[idx];renderQuestion();
}
function renderQuestion(){
  if(!room)return;
  const type=room.type,id=room.id,ids=room.ids,b=banks[type];
  const q=b.all().find(q=>String(q.id)===String(id));
  if(!q){backToBank();return;}
  const idx=ids.indexOf(id),app=document.getElementById('app');
  if(!app)return;
  const context=b.context(q),saved=b.saved(id);
  app.innerHTML='<div class="oe-bank-toolbar"><button type="button" class="oe-bank-back">← Сұрақтар банкі</button><span>'+esc(b.title)+' · Жаттығу</span></div>'+
    '<div class="oe-bank-workspace">'+(context?'<aside class="oe-bank-context"><small>КОНТЕКСТ</small>'+context+'</aside>':'')+
    '<section class="oe-bank-question"><div class="oe-bank-meta"><span>'+(idx+1)+' / '+ids.length+' сұрақ</span><span>'+esc(q.l)+' деңгей · '+esc(q.topic)+'</span></div>'+
    '<div class="oe-bank-progress"><i style="width:'+Math.round((idx+1)/ids.length*100)+'%"></i></div>'+
    '<h1>'+esc(q.t)+'</h1>'+b.extra(q)+
    '<div class="oe-bank-practice">'+b.input(q)+
    '<button class="oe-bank-check" type="button">'+(q.kind==='short'&&typeof q.value!=='number'?'Үлгі жауапты ашу':'Жауапты тексеру')+'</button>'+
    '<p class="oe-bank-feedback" role="status" aria-live="polite"></p></div>'+
    '<div class="oe-bank-footer"><button type="button" class="oe-bank-prev" '+(idx===0?'disabled':'')+'>← Алдыңғы</button>'+
    '<button type="button" class="oe-bank-save" aria-pressed="'+saved+'">'+(saved?'Сақталған ✓':'Сақтап қою')+'</button>'+
    '<button type="button" class="oe-bank-next" '+(idx===ids.length-1?'disabled':'')+'>Келесі →</button></div></section></div>';
  restoreBankAnswers();
  app.querySelector('.oe-bank-back').addEventListener('click',backToBank);
  app.querySelector('.oe-bank-prev').addEventListener('click',()=>nextQuestion(-1));
  app.querySelector('.oe-bank-next').addEventListener('click',()=>nextQuestion(1));
  app.querySelector('.oe-bank-save').addEventListener('click',()=>{
    b.save(id);const btn=app.querySelector('.oe-bank-save'),on=b.saved(id);
    btn.textContent=on?'Сақталған ✓':'Сақтап қою';btn.setAttribute('aria-pressed',String(on));
  });
  app.querySelector('.oe-bank-check').addEventListener('click',e=>{const check=window[b.check];if(typeof check==='function')check(e.currentTarget,id);});
  window.scrollTo(0,0);
}
window.OrnekExamInteractions={timePicker,openQuestion,backToBank};
})();
