/* Verify dashboard accounting against real banks and the existing scoring engines. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const path=require('node:path');
const root=path.join(__dirname,'..');
const storage=new Map();
const context=vm.createContext({console,Date,Map,Set,WeakMap,JSON,Number,String,Array,Math,Blob,Response,DecompressionStream,Uint8Array,atob,
 localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v))},
 setInterval,clearInterval,setTimeout,clearTimeout,confirm:()=>false});
const run=code=>vm.runInContext(code,context);
const file=p=>run(fs.readFileSync(path.join(root,p),'utf8'));
(async()=>{
 for(const name of ['reading-data','history-data','math-profile-data','physics-data'])file('site/'+name+'.js');
 await run('Promise.all([profileDataReady,physicsDataReady])');
 run(`var window=globalThis,ornekAccount={user:null},qRussian={},qLanguage='kk';
 function escapeText(v){return String(v)};function qTr(v){return v};
 function readStore(k,f){try{return JSON.parse(localStorage.getItem((ornekAccount.user?.id||'guest')+':'+k))??f}catch{return f}};
 function writeStore(k,v){localStorage.setItem((ornekAccount.user?.id||'guest')+':'+k,JSON.stringify(v))};
 function studyPlan(){return readStore('ornek-reading-plan-v1',{target:10,days:{}})};
 function readingAll(){return readingVariants.flatMap(v=>v.passages.flatMap((p,pi)=>p.questions.map(q=>({...q,title:p.title,pi,number:v.number}))))};
 function readingSection(){};var qArrow='',currentSubject='reading';
 var ornekLocal={removeItem(){}};function page(){};function roomModeExit(){};function stop(){};
 function checkReadingPractice(button,id){};
 `);
 for(const name of ['reading','history','math-profile','physics'])file('site/'+name+'.js');
 run(`historyReview=function(){};profileReview=function(){};physicsReview=function(){};`);
 file('site/subject-dashboards.js');
 run(`
 var dashboard=OrnekSubjectDashboard;
 for(const id of ['reading','history','profile','physics']){
  const s=dashboard.snapshot(id);if(!s.topics.length||!s.questions.length)throw Error('Missing '+id+' content');
  if(s.topics.reduce((n,t)=>n+t.questions.length,0)!==s.questions.length)throw Error('Topic accounting '+id);
 }
 var hv=historyVariants[0],hq=historyItems(hv);
 writeStore('ornek-history-results-v1',{[hv.number]:{date:new Date().toISOString(),answers:{[hq[0].id]:hq[0].a,[hq[1].id]:(hq[1].a+1)%4}}});
 `);
 let state=run('dashboard.snapshot("history")');
 assert.equal(state.summary.done,2);assert.equal(state.summary.correct,1);assert.equal(state.summary.wrong,1);
 assert.equal(state.state.days[run('dashboard.dateKey()')],2);
 assert.equal(run('dashboard.snapshot("history").state.days[dashboard.dateKey()]'),2,'Rendering must not count attempts twice');
 run(`var rq=readingAll()[0];var practiceButton={parentElement:{querySelector(){return {value:rq.a}}}};
 checkReadingPractice(practiceButton,rq.id);checkReadingPractice(practiceButton,rq.id);`);
 assert.equal(run('dashboard.snapshot("reading").summary.done'),1);
 assert.equal(run('dashboard.snapshot("reading").state.days[dashboard.dateKey()]'),1,'Repeated check click must not double count');
 run(`readingRun={number:1,pos:0,answers:{}};finishReading();`);
 assert.equal(run('dashboard.loadState("reading").days[dashboard.dateKey()]'),1,'Cancel finish must not add work');
 run(`var shared=physicsBank.find(q=>physicsVariants.filter(v=>v.questions.some(x=>x.id===q.id)).length>1&&q.kind==='single');
 var vv=physicsVariants.filter(v=>v.questions.some(q=>q.id===shared.id));
 physicsWrite('results',{[vv[0].number]:{date:'2026-01-01T10:00:00Z',answers:{[shared.id]:(shared.a+1)%shared.o.length}},[vv[1].number]:{date:'2026-01-02T10:00:00Z',answers:{[shared.id]:shared.a}}});`);
 const shared=run('dashboard.snapshot("physics").summary');
 assert.equal(shared.done,1,'Shared question is one distinct completed question');assert.equal(shared.correct,1,'Use latest graded answer');
 run('ornekAccount.user={id:"other-user"}');
 assert.equal(run('dashboard.snapshot("reading").summary.done'),0,'Progress must be isolated by account');
 assert.equal(run('dashboard.loadState("physics").target'),10);
 console.log(JSON.stringify({passed:true,subjects:4,topicTotals:true,latestAnswer:true,practiceCounting:true,cancelFinish:true,accountIsolation:true}));
})().catch(error=>{console.error(error);process.exitCode=1});
