/* Advanced physics bank and 50 bonus rounds: structural regression checks. */
'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const root=path.resolve(__dirname,'../site');
const topics=Array.from({length:25},(_,i)=>'Topic '+(i+1));
const ctx={window:{},physicsTopics:topics,physicsBank:[{id:'existing-physics-item'}],physicsVariants:Array.from({length:50},(_,i)=>({number:i+1,questions:[]}))};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root,'physics-elite-bank.js'),'utf8'),ctx);
vm.runInContext(fs.readFileSync(path.join(root,'physics-depth-prompts.js'),'utf8'),ctx);
vm.runInContext(fs.readFileSync(path.join(root,'physics-elite-round.js'),'utf8'),ctx);
const items=ctx.physicsBank.filter(q=>q.id.startsWith('phys-elite-2026-'));
assert.equal(items.length,75);
assert.equal(new Set(items.map(q=>q.id)).size,75);
assert(ctx.physicsBank.some(q=>q.id==='existing-physics-item'));
assert.equal(ctx.window.physicsDepthByTopic.length,25);
for(let topic=1;topic<=25;topic++){
 const q=items.filter(x=>x.topicId===topic);
 assert.equal(q.length,3,'One challenge per A/B/C for each topic');
 assert.deepEqual(q.map(x=>x.l).sort(),['A','B','C']);
 assert(ctx.window.physicsDepthByTopic[topic-1].every(s=>typeof s==='string'&&s.length>=45));
}
for(const q of items){
 assert(q.kind==='short'&&Number.isFinite(q.value));
 assert(typeof q.t==='string'&&q.t.length>35);
 assert(typeof q.e==='string'&&q.e.length>=12);
 assert(q.a.length&&q.source);
}
const counts=new Map();
for(let n=1;n<=50;n++){
 const three=vm.runInContext('physicsEliteForVariant('+n+')',ctx);
 assert.equal(three.length,3);
 assert.deepEqual(three.map(q=>q.l),['A','B','C']);
 assert.equal(new Set(three.map(q=>q.topicId)).size,3);
 for(const q of three)counts.set(q.id,(counts.get(q.id)||0)+1);
}
assert.equal(counts.size,75);
assert([...counts.values()].every(n=>n===2),'Every advanced problem appears in exactly two rounds');
const boot=fs.readFileSync(path.join(root,'boot.js'),'utf8');
assert(boot.indexOf("'physics-data.js'")<boot.indexOf("'physics-elite-bank.js'"));
assert(boot.indexOf("'physics-depth-prompts.js'")<boot.indexOf("'physics.js'"));
assert(boot.indexOf("'physics.js'")<boot.indexOf("'physics-elite-round.js'"));
console.log(JSON.stringify({passed:true,topicCount:25,newAdvanced:75,bonusRounds:50,bonusPlacements:150}));
