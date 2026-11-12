/* Қазақстан тарихы · difficulty revision v2 (2026-11-12)
   Original 1,000 historical questions and source files remain untouched in history-data.js.
   A: old C + two-source reasoning; B: three-claim verification;
   C: four-claim, cross-evidence analysis. Answers are derived solely from the original keyed items.
*/
(function () {
  'use strict';

  const variants = historyVariants;
  const all = variants.flatMap(v => [...v.questions, ...v.contexts.flatMap(c => c.questions)]);
  const originals = new Map(all.map(q => [q.id, {
    id:q.id, t:q.t, o:[...q.o], a:q.a, e:q.e, l:q.l, topic:q.topic, source:q.source
  }]));
  const roman = ['I','II','III','IV'];
  const standaloneOriginals = variants.flatMap(v=>v.questions.map(q=>originals.get(q.id)));

  const counter = {A:0,B:0,C:0};

  function assert(condition, message) {
    if (!condition) throw new Error('History difficulty v2: ' + message);
  }
  assert(variants.length===50 && originals.size===1000,'expected 50 variants and 1,000 unique questions');

  const brief = q => q.t.replace(/^«[^»]+» контексі:\s*/u,'').trim();
  const right = q => q.o[q.a];
  const wrong = (q,seed) => {
    const choices=q.o.filter((_,i)=>i!==q.a);
    return choices[(seed>>>0)%choices.length];
  };
  function checksum(s) { let h=2166136261; for(const ch of s) h=Math.imul(h^ch.charCodeAt(0),16777619);return h>>>0; }
  function permutation(list,seed) {
    const array=list.slice();
    let state=seed||0x13ef9b72;
    for(let i=array.length-1;i>0;i--) {
      state=(Math.imul(1664525,state)+1013904223)>>>0;
      const j=state%(i+1);
      [array[i],array[j]]=[array[j],array[i]];
    }
    return array;
  }
  function distinctRefs(target,pool,n,seed) {
    // Match the same history topic or era first; exclude nested multi-claim C sources.
    const candidates=pool.filter(x=>x.id!==target.id && x.l!=='C' &&
      brief(x)!==brief(target));
    const prefix=target.id.slice(0,2);
    const topical=candidates.filter(x=>x.topic===target.topic);
    const sameEra=candidates.filter(x=>x.topic!==target.topic && x.id.slice(0,2)===prefix);
    const other=candidates.filter(x=>x.topic!==target.topic && x.id.slice(0,2)!==prefix);
    return [...permutation(topical,seed),...permutation(sameEra,seed+1),
      ...permutation(other,seed+2)].slice(0,n);
  }

  function pair(target,group,seed) {
    const other=distinctRefs(target,group,1,seed)[0];
    assert(other,'missing second fact in A-level question');
    const labels = [
      [right(target),right(other),true],
      [wrong(target,seed),right(other),false],
      [right(target),wrong(other,seed+1),false],
      [wrong(target,seed+2),wrong(other,seed+3),false]
    ];
    const shuffled=permutation(labels,seed);
    return {
      t:'Екі тарихи деректі бір уақытта тексеріңіз. Екеуіне де дұрыс жауап берілген сәйкестікті табыңыз.\n' +
        'I. '+brief(target)+'\nII. '+brief(other),
      o:shuffled.map(x=>'I — '+x[0]+'; II — '+x[1]),
      a:shuffled.findIndex(x=>x[2]),
      e:'I: '+right(target)+'. '+target.e+'\nII: '+right(other)+'. '+other.e
    };
  }

  function claimSet(target,group,number,seed) {
    const supporting=distinctRefs(target,group,number-1,seed);
    assert(supporting.length===number-1,'not enough source questions for composite');
    const refs=permutation([target,...supporting],seed+57);
    // Both correct and incorrect statements; the text retains original question framing.
    const truth=number===3
      ? permutation([true,true,false],seed+11)
      : permutation([true,true,false,false],seed+11);
    const statements=refs.map((q,i)=>
      roman[i]+'. '+brief(q)+' — '+(truth[i]?right(q):wrong(q,seed+i+31))
    );
    const trueIndices=truth.flatMap((x,i)=>x?[i]:[]);
    let choices=[];
    if(number===3) {
      choices=[[0,1,2],[0,1],[0,2],[1,2]];
    } else {
      choices=[[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]];
      const distractors=permutation(choices.filter(pair=>pair.some(i=>!truth[i])),seed+19).slice(0,3);
      choices=[trueIndices,...distractors];
    }
    const describe=indices=>indices.length===3?'I, II және III':indices.map(i=>roman[i]).join(' және ');
    const answers=permutation(choices.map(x=>({
      text:(x.length===3?'Барлығы дұрыс':'Тек '+describe(x)+' дұрыс'),
      correct:x.length===trueIndices.length && x.every(i=>truth[i])
    })),seed+41);
    assert(answers.filter(x=>x.correct).length===1,'composite must have one keyed answer');
    const explanations=refs.map((q,i)=>roman[i]+' — '+(truth[i]?'дұрыс':'қате')+
      '. Нақты дұрыс жауап: '+right(q)+'. '+q.e);
    return {
      t:(number===4?'Төрт тарихи тұжырымды салыстырыңыз. Дәлелдерге сәйкес келетін дұрыс тұжырымдар жиынтығын таңдаңыз.':
          'Үш тарихи тұжырымды талдаңыз. Дәлелдерге сәйкес келетін жауапты таңдаңыз.')+
        '\n'+statements.join('\n'),
      o:answers.map(x=>x.text),a:answers.findIndex(x=>x.correct),
      e:explanations.join('\n')
    };
  }

  function upgrade(target,level,pool) {
    const seed=checksum(target.id+':'+level+':history-v2');
    let made;
    if(level==='A')made=pair(target,pool,seed);
    else if(level==='B')made=claimSet(target,pool,3,seed);
    else made=claimSet(target,pool,4,seed);
    assert(made.o.length===4 && Number.isInteger(made.a) && made.a>=0 && made.a<4,'invalid answer structure');
    target.t=made.t;target.o=made.o;target.a=made.a;target.e=made.e;
  }

  for(const v of variants) {
    const groups=[v.questions,...v.contexts.map(c=>c.questions)];
    for(let gi=0;gi<groups.length;gi++) {
      const group=groups[gi], originalsInGroup=group.map(q=>originals.get(q.id));
      const supportingPool=gi===0?standaloneOriginals:originalsInGroup;
      const as=group.filter(q=>q.l==='A');
      const bs=group.filter(q=>q.l==='B');
      const cs=group.filter(q=>q.l==='C');
      if(gi===0)assert(as.length===6&&bs.length===2&&cs.length===2,'invalid standalone level structure '+v.number);
      else assert(as.length===2&&bs.length===2&&cs.length===1,'invalid context structure '+v.number);

      // Previously difficult (C) becomes baseline A, with the *original* demanding question intact.
      for(const q of cs){q.previousLevel=q.l;q.l='A';q.difficultyRevision='old-difficult';counter.A++;}

      // Previously intermediate (B) becomes A or a deeper, 3-claim B.
      for(let i=0;i<bs.length;i++) {
        const q=bs[i],newLevel=(gi===0||i===0)?'A':'B';
        const original=originals.get(q.id);
        Object.assign(q,original);upgrade(q,newLevel,supportingPool);
        q.previousLevel=original.l;q.l=newLevel;q.difficultyRevision='reasoning';
        counter[newLevel]++;
      }

      // Previously basic (A) is strengthened into complex A/B/C questions.
      for(let i=0;i<as.length;i++) {
        const q=as[i],newLevel=gi===0?(i<2?'A':i<4?'B':'C'):(i===0?'B':'C');
        const original=originals.get(q.id);
        Object.assign(q,original);upgrade(q,newLevel,supportingPool);
        q.previousLevel=original.l;q.l=newLevel;q.difficultyRevision='reasoning';
        counter[newLevel]++;
      }
      for(const q of group) {
        assert(q.o.length===4 && q.o.every(o=>typeof o==='string'&&o.trim()) &&
          new Set(q.o).size===4 && Number.isInteger(q.a) && q.a>=0 && q.a<4,
          'bad keyed options '+q.id);
      }
    }
  }
  assert(counter.A===500&&counter.B===300&&counter.C===200,
    'expected 500 A, 300 B, 200 C: '+JSON.stringify(counter));
  window.OrnekHistoryDifficultyV2={
    version:'2026-11-12',count:all.length,distribution:{...counter},
    description:{A:'Бұрынғы қиын',B:'Жоғары деңгей · бірнеше дерек',C:'Өте қиын · төрт тұжырым'}
  };
})();