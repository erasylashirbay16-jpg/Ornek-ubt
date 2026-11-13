/* Örnek — profile mathematics duplication audit. Read-only. */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..','site');
const ctx=vm.createContext({console,Math,Map,Set,JSON,Array,Number,String,Error,
  Uint8Array,atob,Response,Blob,DecompressionStream});
function run(n){return vm.runInContext(fs.readFileSync(path.join(root,n),'utf8'),ctx,{filename:n})}
function canonical(s){
 return String(s||'').normalize('NFKC').toLocaleLowerCase('kk-KZ')
 .replace(/[0-9]+(?:[.,][0-9]+)?/g,'#')
 .replace(/[\u2070-\u2079]/g,'#')
 .replace(/\b[xyabcdnkmpt]\b/gi,'v')
 .replace(/[\s\u00a0]+/g,' ').replace(/[«»"“”']/g,'')
 .replace(/[.,;:!?()\[\]{}]+/g,' ').replace(/\s+/g,' ').trim();
}
function groupReport(items,keyFn,top=12){
 const groups=new Map();
 for(const q of items){const k=keyFn(q);if(!k)continue;const g=groups.get(k)||[];g.push(q);groups.set(k,g)}
 const duplicateGroups=[...groups].filter(([k,v])=>v.length>1).sort((a,b)=>b[1].length-a[1].length);
 return {groups:duplicateGroups.length,occurrences:duplicateGroups.reduce((s,[k,v])=>s+v.length,0),
  excess:duplicateGroups.reduce((s,[k,v])=>s+v.length-1,0),
  samples:duplicateGroups.slice(0,top).map(([key,qs])=>({count:qs.length,keys:qs.slice(0,6).map(x=>x.id||x.number),
    examples:qs.slice(0,2).map(x=>String(x.t).slice(0,190)),signature:key.slice(0,190)}))};
}
(async()=>{
 run('math-profile-data.js');
 await vm.runInContext('profileDataReady',ctx);
 const before=vm.runInContext('profileVariants',ctx);
 assert.equal(before.length,121);
 const source=before.flatMap(v=>v.questions.map(q=>({...q,number:v.number})));
 const stats={sourceCount:source.length,sourceLevels:source.reduce((a,q)=>(a[q.l]=(a[q.l]||0)+1,a),{}),
   sourceKinds:source.reduce((a,q)=>(a[q.kind]=(a[q.kind]||0)+1,a),{}),
   sourceTopics:new Set(source.map(q=>q.topic)).size,
   sourceExact:groupReport(source,q=>q.kind+'|'+String(q.t)),
   sourceNormalized:groupReport(source,q=>q.kind+'|'+q.topic+'|'+canonical(q.t)),
   sourceLooseNormalized:groupReport(source,q=>q.kind+'|'+canonical(q.t)),
   difficultSourceNormalized:groupReport(source.filter(q=>q.l==='C'),q=>q.kind+'|'+q.topic+'|'+canonical(q.t))};
 run('math-profile-elite-levels.js');
 const after=vm.runInContext('profileVariants',ctx);
 const curr=after.flatMap(v=>v.questions.map(q=>({...q,number:v.number})));
 stats.finalCount=curr.length;
 stats.finalExact=groupReport(curr,q=>q.kind+'|'+q.t);
 stats.finalNormalized=groupReport(curr,q=>q.kind+'|'+q.topic+'|'+canonical(q.t));
 // Find base tasks duplicated inside different combination questions.
 const fragments=[];
 for(const q of curr){const pieces=String(q.t).split(/\[(?:\d+)-есеп\]\s*/).slice(1);
   for(const p of pieces){const actual=p.split(/\n\n(?:Барлық есеп|Дұрыс жауапты|Әр есеп)/)[0].trim();
     const trimmed=actual.replace(/\n[A-Z]\) .*/g,'').slice(0,1500);
     fragments.push({id:q.id,number:q.number,t:trimmed,topic:q.topic});}
 }
 stats.fragmentCount=fragments.length;
 stats.fragmentExact=groupReport(fragments,q=>q.t);
 stats.fragmentNormalized=groupReport(fragments,q=>canonical(q.t));
 console.log('PROFILE_DUPLICATE_AUDIT_START');
 console.log(JSON.stringify(stats,null,2));
 console.log('PROFILE_DUPLICATE_AUDIT_END');
})().catch(e=>{console.error(e);process.exitCode=1});
