/* Non-destructive regression test for meaning-diverse profile mathematics. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const dir=path.join(__dirname,'..','site');
const context=vm.createContext({window:{},Math,Map,Set,JSON,Array,Number,String,Error,
 Uint8Array,atob,Response,Blob,DecompressionStream});
const run=file=>vm.runInContext(fs.readFileSync(path.join(dir,file),'utf8'),context,{filename:file});
(async()=>{
 run('math-profile-data.js');
 await vm.runInContext('profileDataReady',context);
 const initial=vm.runInContext('profileVariants',context);
 assert.equal(initial.length,121);
 assert.equal(initial.reduce((x,v)=>x+v.questions.length,0),4840);
 run('math-profile-elite-levels.js');
 run('math-profile-curated-cases.js');
 run('math-profile-diversity-v3.js');
 const variants=vm.runInContext('profileVariants',context);
 const stats=context.window.OrnekProfileDiversityV3;
 assert.equal(stats.authored,98);
 assert(stats.legacyMeanings>=40,'expected more than forty original semantic shapes');
 assert.equal(stats.uniqueCombinations,4840);
 assert.equal(stats.activeQuestions,4840);
 const entire=new Set();
 for(let vi=0;vi<variants.length;vi++){
  const v=variants[vi],within=new Set();
  assert.equal(v.number,vi+1);
  assert.equal(v.questions.length,40);
  assert.equal(new Set(v.questions.map(q=>q.id)).size,40);
  assert.equal(v.questions.filter(q=>q.l==='A').length,20);
  assert.equal(v.questions.filter(q=>q.l==='B').length,12);
  assert.equal(v.questions.filter(q=>q.l==='C').length,8);
  for(let i=0;i<v.questions.length;i++){
    const q=v.questions[i],key=q.sourceIdeas.slice().sort().join('/');
    assert(!entire.has(key),'duplicate source combination '+key);
    entire.add(key);
    assert.equal(q.sourceIdeas.length,i<20?2:i<32?3:4);
    for(const id of q.sourceIdeas) {
      assert(!within.has(id),'repeated meaning in same version '+v.number+':'+id);
      within.add(id);
    }
    assert(q.t&&q.e&&q.topic);
    assert(new Set(q.o).size===q.o.length,'ambiguous answer options');
    if(q.kind==='single'){
      assert(q.a>=0&&q.a<4&&q.o.length===4);
      assert.equal(typeof q.a,'number');
    } else if(q.kind==='multi'){
      assert(Array.isArray(q.a)&&q.a.length===q.sourceIdeas.length);
      assert(q.a.every(a=>a>=0&&a<q.o.length));
    } else {
      assert(q.kind==='match');
      assert.equal(q.rows.length,q.sourceIdeas.length);
      assert.equal(q.a.length,q.rows.length);
      assert(q.a.every(a=>a>=0&&a<q.o.length));
    }
  }
 }
 const boot=fs.readFileSync(path.join(dir,'boot.js'),'utf8');
 assert(boot.includes("'math-profile-data.js','math-profile-elite-levels.js','math-profile-curated-cases.js','math-profile-diversity-v3.js','math-profile.js'"),'Math overlay must load before profile engine');
 const profileUI=fs.readFileSync(path.join(dir,'math-profile.js'),'utf8');
 assert(profileUI.includes("'ornek-profile-diverse-v3:'"),'New results need version 3 storage namespace');
 assert(profileUI.includes("'ornek-profile-elite-v2:'"),'Archived results must remain readable');
 console.log('MATH_DIVERSITY_V3_PASS '+JSON.stringify({
  authored:stats.authored,archivedSourceQuestions:4840,legacyTemplates:stats.legacyMeanings,
  activeQuestions:entire.size,perVariant:40,variants:121,duplicateCombinations:0,
  reusedIdeaWithinVariant:0,answersValidated:true,firstTask:variants[0].questions[0].t.slice(0,220)
 }));
})().catch(e=>{console.error('MATH_DIVERSITY_V3_FAIL',e);process.exitCode=1});
