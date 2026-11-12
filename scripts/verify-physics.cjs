const fs=require('fs'),vm=require('vm'),assert=require('assert'),zlib=require('zlib'),path=require('path');
const root=path.resolve(__dirname,'../site');
const script=fs.readFileSync(path.join(root,'physics-data.js'),'utf8');
const encoded=script.match(/atob\("([A-Za-z0-9+/=]+)"\)/)[1];
const data=JSON.parse(zlib.gunzipSync(Buffer.from(encoded,'base64')));
assert.equal(data.variants.length,50);assert.equal(data.topics.length,25);
const bankMap=new Map(data.bank.map(q=>[q.id,q]));assert.equal(bankMap.size,data.bank.length);
const questionSets=new Set(),used=new Set();
for(const v of data.variants){
 assert.equal(v.questions.length,40);assert.equal(new Set(v.questions.map(q=>q.id)).size,40);
 const count=key=>v.questions.filter(key).length;
 assert.equal(count(q=>q.kind==='single'&&!q.context),25);assert.equal(count(q=>q.context),5);assert.equal(count(q=>q.kind==='multi'),5);assert.equal(count(q=>q.kind==='match'),5);
 for(const [l,n] of [['A',20],['B',12],['C',8]])assert.equal(count(q=>q.l===l),n);
 const context=v.questions[25].context;assert(v.questions.slice(25,30).every(q=>q.context===context));
 assert(v.questions.slice(0,25).every(q=>q.topicId!==v.questions[25].topicId));
 const signature=v.questions.map(q=>q.id).sort().join(',');assert(!questionSets.has(signature));questionSets.add(signature);
 for(const q of v.questions){assert(bankMap.has(q.id));used.add(q.id);assert(q.t&&q.e&&q.topic);assert(q.topicId>=1&&q.topicId<=25);assert(new Set(q.o).size===q.o.length);const ans=q.kind==='single'?[q.a]:q.a;assert(ans.every(a=>Number.isInteger(a)&&a>=0&&a<q.o.length));assert(q.kind!=='match'||q.a.length===q.rows.length);assert(q.kind!=='multi'||q.a.length>1&&q.a.length<q.o.length);}
}
const baseline=JSON.parse(fs.readFileSync(path.join(__dirname,'physics-topics/baseline.json'),'utf8'));
assert.deepStrictEqual(data.variants,baseline.variants,'Existing variants and IDs stay unchanged');
assert.equal(used.size,baseline.bank.length);
const review=JSON.parse(fs.readFileSync(path.join(__dirname,'physics-duplicate-removals.json'),'utf8'));
assert.equal(data.bank.length,2500-review.removals.length);
for(const item of review.removals){assert(!bankMap.has(item.removedId));assert(bankMap.has(item.keptId));}
for(let topic=1;topic<=25;topic++)assert(data.bank.some(q=>q.topicId===topic));
assert.equal(data.bank.filter(q=>q.kind==='short').length,2017-review.removals.length);
for(const q of data.bank.filter(q=>q.kind==='short')){assert(typeof q.a==='string'&&q.a.trim());assert(q.t.trim()&&q.e.trim());if(typeof q.value==='number')assert(Number.isFinite(q.value));}
const storage=new Map(),ctx={console,Date,JSON,Math,Number,Set,Array,Object,String,physicsVariants:data.variants,physicsBank:data.bank,physicsTopics:data.topics,ornekAccount:{user:null},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},clearInterval, setInterval:()=>1,stopHistory(){},stopReading(){},stopProfile(){},stop(){},roomModeExit(){},run:null,confirm:()=>true,window:{scrollTo(){}},document:{querySelectorAll:()=>[],getElementById:()=>null},app:{innerHTML:''},escapeText:s=>String(s).replace(/[&<>"']/g,''),page:(...args)=>ctx.lastPage=args,shuffle:a=>a};
vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(root,'physics.js'),'utf8'),ctx);
vm.runInContext('startPhysics(1)',ctx);assert(ctx.app.innerHTML.includes('1 / 40'));assert(ctx.app.innerHTML.includes('Физика'));
for(let i=0;i<40;i++){const q=data.variants[0].questions[i];vm.runInContext(`jumpPhysics(${i})`,ctx);if(q.kind==='single')ctx.choosePhysics(q.a);else if(q.kind==='multi')q.a.forEach(a=>ctx.choosePhysics(a));else q.a.forEach((a,row)=>ctx.choosePhysics(a,row));}
ctx.finishPhysics(true);assert.equal(ctx.physicsResults()[1].correct,40);assert.equal(ctx.physicsRead('draft',null),null);
ctx.startPhysics(50);ctx.jumpPhysics(25);assert(ctx.app.innerHTML.includes('КОНТЕКСТ'));ctx.resumePhysics();assert(ctx.app.innerHTML.includes('26 / 40'));
ctx.physicsWrite('draft',{number:50,pos:999,end:Date.now()+1000,answers:{}});ctx.resumePhysics();assert.equal(ctx.physicsRead('draft',null),null);
assert.equal(ctx.physicsAll().length,data.bank.length);
assert.equal(ctx.physicsAll().filter(q=>q.number===0).length,2017-review.removals.length);
for(let topic=1;topic<=25;topic++){
 vm.runInContext(`physicsTopic='${topic}';physicsMode='library';physicsBankPage=0;physicsRenderBank()`,ctx);
 assert.equal(ctx.lastPage[1],data.bank.filter(q=>q.topicId===topic).length+' бөлек тапсырма');
 assert(ctx.lastPage[2].includes('1 / 5'));
}
const numeric=data.bank.find(q=>q.kind==='short'&&q.value===0.006);
assert(ctx.physicsShortCorrect(numeric,'0,006'));
assert(!ctx.physicsShortCorrect(numeric,'0,06'));
assert(!ctx.physicsShortCorrect(numeric,'0,006e'));
assert(!ctx.physicsShortCorrect(numeric,'0,006×10³'));
assert(ctx.physicsShortCorrect(numeric,'0,006 '+numeric.unit));
assert(!ctx.physicsShortCorrect(numeric,'білмеймін'));
const tiny=data.bank.find(q=>q.kind==='short'&&q.value===1e-19);
assert(ctx.physicsShortCorrect(tiny,'1e-19'));
const written=data.bank.find(q=>q.kind==='short'&&typeof q.value!=='number');
assert(ctx.physicsInput(written,null,true).includes('textarea'));
assert(!ctx.physicsInput(written,null,true).includes(written.a));
let feedback={textContent:''};
ctx.physicsCheckPractice({parentElement:{querySelector:()=>({value:'өз жауабым'})},nextElementSibling:feedback},written.id);
assert(feedback.textContent.includes(written.a));
assert(!feedback.textContent.includes('Қате'));

ctx.physicsSection('planner');assert(ctx.lastPage[2].includes('Космология'));assert.equal((ctx.lastPage[2].match(/бөлек тапсырма/g)||[]).length,25);ctx.physicsSection('analytics');assert(ctx.lastPage[2].includes('40 / 40'));
for(const q of data.bank){assert(ctx.physicsCorrect(q,q.a));if(q.kind==='match')assert(!ctx.physicsAnswered(q,q.rows.map(()=>-1)));}
const architecture=fs.readFileSync(path.join(root,'architecture.js'),'utf8');assert(architecture.includes("else if(currentSubject==='physics')physicsSection(key)"));assert(architecture.includes("openSubject('physics')"));
const boot=fs.readFileSync(path.join(root,'boot.js'),'utf8');assert(boot.indexOf("'physics.js'")<boot.indexOf("'architecture.js'"));assert(boot.includes("if(src==='physics-data.js')await physicsDataReady"));
console.log(JSON.stringify({passed:true,variants:50,placements:2000,uniqueItems:data.bank.length,topics:25,allCorrectFlow:'40/40',draftResume:true,topicNavigation:true,crossVariantReuse:true}));

require('./verify-physics-advanced.cjs');
