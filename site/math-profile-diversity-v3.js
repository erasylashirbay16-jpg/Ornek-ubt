/* Örnek Math v3 — 121 meaning-diverse variants. No original item is deleted.
 * Source ideas are selected by semantic shape, not by parameter/number changes.
 * Every displayed question combines distinct models, and the same model
 * cannot appear twice within any single variant. Combination signatures are
 * globally unique across all 4,840 active tasks.
 */
(() => {
  'use strict';
  const legacy = window.ornekLegacyProfileVariants;
  const prior = profileVariants;
  const authored = window.ornekProfileCuratedCases;
  if (!Array.isArray(legacy) || legacy.length!==121 ||
      !Array.isArray(authored) || authored.length<80 ||
      !Array.isArray(prior) || prior.length!==121)
    throw Error('Örnek: missing source or curated math bank');

  const letters='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  function semanticKey(value) {
    return String(value??'').normalize('NFKC').toLocaleLowerCase('kk-KZ')
      .replace(/[0-9]+(?:[.,][0-9]+)?/g,'#')
      .replace(/[\u2070-\u2079]/g,'#').replace(/\b[xyabcdnkmpt]\b/gi,'v')
      .replace(/\s+/g,' ').trim();
  }
  const originalTemplates = new Map();
  for(const v of legacy)for(const q of v.questions) {
    const key=q.kind+'|'+q.topic+'|'+semanticKey(q.t);
    if(!originalTemplates.has(key))originalTemplates.set(key,q);
  }
  const source = [
    ...[...originalTemplates.values()].map((q,i)=>({...q,id:'template-'+(i+1)})),
    ...authored.map(q=>({...q}))
  ];
  if(source.length<120)throw Error('Örnek: insufficient distinct problem ideas: '+source.length);
  const concepts=new Set(source.map(q=>q.kind+'|'+q.topic+'|'+semanticKey(q.t)));
  if(concepts.size!==source.length)throw Error('Örnek: source question meanings duplicate');

  function code(n) {return letters[n]}
  function keyAnswer(q) {
    if(q.kind==='single')return code(q.a);
    if(q.kind==='multi')return [...q.a].sort((a,b)=>a-b).map(code).join(',');
    if(q.kind==='match')return q.a.map((x,i)=>(i+1)+'→'+code(x)).join(', ');
    throw Error('Örnek: unknown answer type '+q.kind);
  }
  function alternatives(q) {
    const correct=keyAnswer(q),out=[];
    if(q.kind==='single'){
      for(let i=0;i<q.o.length;i++)if(i!==q.a)out.push(code(i));
    } else if(q.kind==='multi') {
      for(let i=0;i<q.o.length;i++){
        const a=new Set(q.a);
        if(a.has(i))a.delete(i);else a.add(i);
        out.push([...a].sort((x,y)=>x-y).map(code).join(',')||'Ешқайсысы');
      }
    }else if(q.kind==='match') {
      for(let i=0;i<q.a.length;i++)for(let delta=1;delta<q.o.length;delta++){
        const a=[...q.a];a[i]=(a[i]+delta)%q.o.length;
        out.push(a.map((x,j)=>(j+1)+'→'+code(x)).join(', '));
      }
    }
    return [...new Set(out)].filter(x=>x!==correct);
  }
  function describe(q) {
    const context=q.context?String(q.context)+'\n':'';
    const rows=q.kind==='match'?q.rows.map((r,i)=>(i+1)+') '+r).join('\n')+'\n':'';
    return context+q.t+'\n'+rows+q.o.map((o,i)=>code(i)+') '+o).join('\n');
  }
  const models=source.map(q=>({
    id:q.id,topic:q.topic,task:describe(q),right:keyAnswer(q),
    wrong:alternatives(q),explain:q.e,kind:q.kind
  }));
  if(models.some(m=>!m.right||!m.wrong.length||!m.explain))
    throw Error('Örnek: model missing answer justification');

  function hash(s){
    let h=2166136261;for(const ch of String(s))h=Math.imul(h^ch.charCodeAt(0),16777619);
    return h>>>0;
  }
  function shuffle(xs,seed){
    let state=seed||0xb63834af,arr=xs.slice();
    for(let i=arr.length-1;i>0;i--){
      state=(Math.imul(state,1664525)+1013904223)>>>0;
      const j=state%(i+1);
      [arr[i],arr[j]]=[arr[j],arr[i]];
    }
    return arr;
  }
  const combinations=new Set();
  const totalUse=new Map(models.map(m=>[m.id,0]));
  const chosenLists=[];
  const choose=(variant,slot,unused)=>{
    const length=slot<20?2:slot<32?3:4;
    const isMatch=slot>=35;
    for(let retry=0;retry<600;retry++){
      const random=shuffle(unused,hash('v3|'+variant+'|'+slot+'|'+retry));
      const chosen=[];
      const topics=new Set(),rights=new Set();
      for(const m of random){
        if(topics.has(m.topic))continue;
        if(isMatch&&rights.has(m.right))continue;
        chosen.push(m);topics.add(m.topic);rights.add(m.right);
        if(chosen.length===length)break;
      }
      if(chosen.length!==length)continue;
      const signature=length+'|'+chosen.map(x=>x.id).sort().join('|');
      if(combinations.has(signature))continue;
      combinations.add(signature);
      for(const m of chosen){const i=unused.findIndex(x=>x.id===m.id);unused.splice(i,1);totalUse.set(m.id,totalUse.get(m.id)+1)}
      return chosen;
    }
    throw Error('Örnek: cannot find unique meaningful problem set for '+variant+':'+slot);
  };
  const taskText=items=>items.map((m,i)=>'['+(i+1)+'-есеп]\n'+m.task).join('\n\n');
  const explanation=items=>items.map((m,i)=>(i+1)+'-есеп: '+m.explain).join('\n\n');
  const topicTitle=items=>[...new Set(items.map(x=>x.topic))].join(' · ');
  function correctText(items){
    return items.map((m,i)=>(i+1)+' — '+m.right).join('; ');
  }
  function optionsSingle(items,variant,slot) {
    const good=correctText(items),invalid=[];
    for(let i=0;i<70&&invalid.length<3;i++){
      const ix=i%items.length;
      const invalidAnswer=items[ix].wrong[Math.floor(i/items.length)%items[ix].wrong.length];
      const choices=items.map(x=>x.right);choices[ix]=invalidAnswer;
      const text=choices.map((x,j)=>(j+1)+' — '+x).join('; ');
      if(text!==good&&!invalid.includes(text))invalid.push(text);
    }
    if(invalid.length!==3)throw Error('Örnek: insufficient distractors '+variant+':'+slot);
    const correct=(hash('answer|'+variant+'|'+slot)>>>0)%4;
    const choices=Array(4);choices[correct]=good;
    let n=0;for(let i=0;i<4;i++)if(i!==correct)choices[i]=invalid[n++];
    return {o:choices,a:correct};
  }
  function optionsMulti(items,variant,slot){
    const claims=[];
    for(let i=0;i<items.length;i++){
      claims.push({text:(i+1)+'-есеп: '+items[i].right+' — дұрыс жауап',correct:true});
      claims.push({text:(i+1)+'-есеп: '+items[i].wrong[0]+' — дұрыс жауап',correct:false});
    }
    const arr=shuffle(claims,hash('multi|'+variant+'|'+slot));
    return {o:arr.map(q=>q.text),a:arr.flatMap((q,i)=>q.correct?[i]:[])};
  }
  function optionsMatch(items,variant,slot){
    const right=items.map(x=>x.right);
    if(new Set(right).size!==right.length)throw Error('Örnek: ambiguous matching options');
    const opts=right.slice();
    for(const q of items)for(const w of q.wrong)
      if(opts.length<6&&!opts.includes(w))opts.push(w);
    const rotated=shuffle(opts,hash('match|'+variant+'|'+slot));
    return {o:rotated,a:right.map(x=>rotated.indexOf(x))};
  }

  profileVariants = legacy.map((v,i)=>{
    const variant=i+1;
    const unused=shuffle(models,hash('unused|'+variant));
    // Reserve four different answer codes for each matching item before
    // allocating the other question types, which need no such constraint.
    const picked=Array(40);
    for(const slot of [35,36,37,38,39,...Array.from({length:35},(_,i)=>i)])
      picked[slot]=choose(variant,slot,unused);
    const questions=[];
    for(let slot=0;slot<40;slot++){
      const sourceTasks=picked[slot];
      const kind=slot<30?'single':slot<35?'multi':'match';
      const level=slot<20?'A':slot<32?'B':'C';
      const pair=kind==='single'?optionsSingle(sourceTasks,variant,slot):
          kind==='multi'?optionsMulti(sourceTasks,variant,slot):optionsMatch(sourceTasks,variant,slot);
      const prompt=kind==='match'?'Әр есепті тиісті жауаптар кодымен сәйкестендіріңіз.':
        taskText(sourceTasks)+'\n\n'+(kind==='single'?
          'Барлық есепті шығарып, дұрыс жауап кодтарының тізбегін таңдаңыз.':
          'Әр есептің дұрыс жауабы көрсетілген тұжырымдардың барлығын таңдаңыз.');
      const question={
        id:'mpe3-'+variant+'-'+(slot+1),l:level,kind,topic:topicTitle(sourceTasks),
        t:prompt,o:pair.o,a:pair.a,e:explanation(sourceTasks),
        sourceIdeas:sourceTasks.map(q=>q.id)
      };
      if(kind==='match')question.rows=sourceTasks.map((q,j)=>(j+1)+'-есеп:\n'+q.task);
      if(slot>=25&&slot<30)question.context='Әр есеп тәуелсіз. Толық дұрыс жауапты шығару үшін барлық есептерді шешіңіз.';
      questions.push(question);
    }
    if(questions.length!==40||questions.some(q=>q.o.length<4||!q.e))
      throw Error('Örnek: invalid variant '+variant);
    chosenLists.push(questions);
    return {number:v.number,questions};
  });

  if(combinations.size!==4840 || profileVariants.length!==121 ||
    profileVariants.some(v=>v.questions.length!==40||
      v.questions.filter(q=>q.l==='A').length!==20||
      v.questions.filter(q=>q.l==='B').length!==12||
      v.questions.filter(q=>q.l==='C').length!==8||
      v.questions.some(q=>q.sourceIdeas.length!==new Set(q.sourceIdeas).size))) {
    throw Error('Örnek: invalid unique mathematics variant distribution');
  }
  window.ornekProfilePreviousEliteVariants=prior;
  window.OrnekProfileDiversityV3=Object.freeze({
    authored:authored.length,legacyMeanings:originalTemplates.size,
    sourceMeaningTypes:source.length,activeQuestions:4840,
    uniqueCombinations:combinations.size,version:'2026-11-13'
  });
})();
