/* Regression test: original historical questions are retained and revised levels are keyed. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..','site');
const original=fs.readFileSync(path.join(root,'history-data.js'),'utf8');
const revision=fs.readFileSync(path.join(root,'history-difficulty-v2.js'),'utf8');
const boot=fs.readFileSync(path.join(root,'boot.js'),'utf8');
const history=fs.readFileSync(path.join(root,'history.js'),'utf8');
const ctx=vm.createContext({window:{},Math,Map,Set,JSON,Array,Number,String,Error});
vm.runInContext(original,ctx);
const initial=vm.runInContext('historyVariants.map(v=>({number:v.number,ids:[...v.questions,...v.contexts.flatMap(c=>c.questions)].map(q=>({id:q.id,l:q.l,t:q.t,o:q.o,a:q.a,e:q.e}))}))',ctx);
vm.runInContext(revision,ctx);
const updated=vm.runInContext('historyVariants.map(v=>({number:v.number,questions:[...v.questions,...v.contexts.flatMap(c=>c.questions)]}))',ctx);
assert.equal(initial.length,50);
assert.equal(updated.length,50);
let tally={A:0,B:0,C:0},composite=0;
for(let i=0;i<50;i++){
 const before=initial[i].ids,after=updated[i].questions;
 const counts={A:0,B:0,C:0};
 assert.equal(before.length,20);assert.equal(after.length,20);
 assert.equal(new Set(after.map(q=>q.id)).size,20);
 for(let j=0;j<20;j++){
  const old=before[j],q=after[j];
  assert.equal(q.id,old.id,'Original question IDs must remain intact');
  assert.equal(q.previousLevel,old.l);
  assert.equal(q.o.length,4);
  assert.equal(new Set(q.o).size,4,'Options must be unambiguous');
  assert(q.a>=0&&q.a<4&&Number.isInteger(q.a),'Correct answer index invalid');
  assert(q.e&&q.t,'Question and explanation are required');
  if(old.l==='C'){
   assert.equal(q.l,'A','Old difficult item must become A');
   assert.equal(q.t,old.t,'Original hard question preserved verbatim');
   assert.equal(q.a,old.a);
   assert.equal(JSON.stringify(q.o),JSON.stringify(old.o));
  } else {
   composite++;
   assert(q.e.includes(old.o[old.a]),'Explanation must retain factual correct answer');
   if(q.l==='B')assert(q.t.includes('III.'),'Medium item requires at least three claims');
   if(q.l==='C')assert(q.t.includes('IV.'),'Hard item requires four claims');
  }
  counts[q.l]++;tally[q.l]++;
 }
 assert.equal(counts.A,10,'A level per version');
 assert.equal(counts.B,6,'B level per version');
 assert.equal(counts.C,4,'C level per version');
}
assert.deepEqual(tally,{A:500,B:300,C:200});
assert.equal(composite,800);
assert(boot.includes("'history-data.js','history-difficulty-v2.js','history.js'"),'Load order');
assert(boot.includes("'ornek-history-results-v2'"),'Versioned results must sync');
assert(history.includes("readStore('ornek-history-results-v2'"),'Results must be versioned');
assert(!history.includes("'ornek-history-draft-v1'"),'Old saved drafts may not use new answers');
console.log(JSON.stringify({passed:true,questions:1000,variants:50,composite,levelTotals:tally,originalPreserved:true}));
