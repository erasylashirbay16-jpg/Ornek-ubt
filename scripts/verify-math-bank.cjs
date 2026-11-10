const fs=require('fs'),vm=require('vm'),assert=require('assert');
const base=require('path').resolve(__dirname,'../site')+'/';
const context=vm.createContext({console,qLanguage:'kk',run:null,setQLanguage(){},readStore:(k,v)=>v,applyQLanguage(){}});
for(const name of ['questions-hard.js','questions-hard-extra.js','questions-hard-next.js','questions-new.js','questions-materials.js','questions-2026-400.js'])vm.runInContext(fs.readFileSync(base+name,'utf8'),context,{filename:name});
vm.runInContext(fs.readFileSync(base+'app.js','utf8').split('let saved=')[0],context);
vm.runInContext(fs.readFileSync(base+'test-variants.js','utf8'),context);
vm.runInContext(`globalThis.snapshot=()=>bank.map(q=>({id:q.id,t:q.t,o:[...q.o],a:q.a,e:q.e,s:q.s,l:q.l}));globalThis.variants=testVariants;globalThis.lookup=getMathQuestion`,context);
const before=context.snapshot();assert.equal(before.length,589);assert.equal(new Set(before.map(q=>q.id)).size,589);
for(const q of before){assert(q.t&&q.e);assert(q.a>=0&&q.a<q.o.length);assert.equal(context.lookup(q.id).id,q.id);}
const sigs=new Set();for(const v of context.variants){assert.equal(v.ids.length,10);assert.equal(new Set(v.ids).size,10);const items=v.ids.map(context.lookup);assert(items.every(Boolean));assert.equal(new Set(items.map(q=>q.s)).size,4);for(const [l,n]of [['A',5],['B',3],['C',2]])assert.equal(items.filter(q=>q.l===l).length,n);sigs.add([...v.ids].sort((a,b)=>a-b).join(','));}assert.equal(sigs.size,92);
for(const name of ['math-ru.js','hard60-ru.js','math-solutions-ru.js','new100-ru.js','extra100-ru.js','extra-second100-ru.js','next-first100-ru.js','next-second100-ru.js'])vm.runInContext(fs.readFileSync(base+name,'utf8'),context,{filename:name});
context.setQLanguage('ru');const ru=context.snapshot();for(const q of ru){assert(q.t&&!q.t.includes('undefined'));assert(q.e&&!q.e.includes('undefined'));assert.deepEqual(q.a,before.find(x=>x.id===q.id).a);}
context.setQLanguage('kk');assert.deepEqual(context.snapshot(),before);context.setQLanguage('ru');context.setQLanguage('kk');assert.deepEqual(context.snapshot(),before);
console.log('PASS: 589 stable IDs; 92 balanced complete variants; all translation modules; repeated kk/ru round trip; answers unchanged.');
