// Örnek mathematical literacy regression check. Run: node scripts/verify-literacy-fresh-800.cjs
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const assert=require('node:assert/strict');
const site=path.resolve(__dirname,'../site');
const sandbox=vm.createContext({console});
for(const filename of [
  'questions-diverse.js','questions-expanded.js','questions-quality.js',
  'math-literacy-fresh-800.js','questions-hard.js','questions-hard-extra.js',
  'questions-hard-next.js','questions-new.js','questions-materials.js','questions-2026-400.js'
]){
  vm.runInContext(fs.readFileSync(path.join(site,filename),'utf8'),sandbox,{filename});
}
const fresh=vm.runInContext('ornekLiteracyFresh800',sandbox);
const old=vm.runInContext('[...hardQuestions,...extraHardQuestions,...nextHardQuestions,...newOrnekQuestions,...materialQuestions,...ornekMath2026Questions]',sandbox);
const normalize=s=>s.toLowerCase().replace(/<[^>]+>/g,' ').replace(/\d+(?:[.,]\d+)?/g,'#').replace(/[^\p{L}#\s]/gu,' ').replace(/\s+/g,' ').trim();
const ids=new Set(old.map(q=>q.id)),texts=new Set(),oldTexts=new Set(old.map(q=>normalize(q.t)));
assert.equal(fresh.length,800);
for(const q of fresh){
  assert(Number.isInteger(q.id) && !ids.has(q.id),'New ID must not collide: '+q.id);
  assert(Number.isInteger(q.s) && q.s>=0 && q.s<4,'Invalid topic: '+q.id);
  assert(['A','B','C'].includes(q.l),'Invalid difficulty: '+q.id);
  assert(q.t && q.e && Array.isArray(q.o) && q.o.length===4,'Missing question, options or explanation: '+q.id);
  assert(Number.isInteger(q.a) && q.a>=0 && q.a<4,'Invalid answer index: '+q.id);
  assert.equal(new Set(q.o).size,4,'Repeated options: '+q.id);
  const signature=normalize(q.t);
  assert(!texts.has(signature),'Number-only duplicate in new set: '+q.id);
  assert(!oldTexts.has(signature),'Number-only duplicate of a previous question: '+q.id);
  ids.add(q.id);texts.add(signature);
}
for(let s=0;s<4;s++){
  const items=fresh.filter(q=>q.s===s);
  assert.equal(items.length,200,'Exactly 200 new questions expected in section '+s);
  for(const level of ['A','B','C'])assert(items.some(q=>q.l===level),'Missing '+level+' in section '+s);
}
const boot=fs.readFileSync(path.join(site,'boot.js'),'utf8');
const app=fs.readFileSync(path.join(site,'app.js'),'utf8');
assert(boot.indexOf("'math-literacy-fresh-800.js'")>0 && boot.indexOf("'math-literacy-fresh-800.js'")<boot.indexOf("'app.js'"),'Bank must load before app.js');
assert(app.includes('for(const item of ornekLiteracyFresh800)'),'Bank must be registered');
assert(app.includes('l===\'fresh\'&&q.fresh'),'New questions filter required');
console.log('PASS: 800 new unique question texts, 200 per section, valid options, stable IDs, registered scripts.');
