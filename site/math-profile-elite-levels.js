/* Örnek profile mathematics: advanced A/B/C practice overlay.
   Original 121 variants remain untouched in math-profile-data.js.
   A uses original C-grade material; B combines two C-grade tasks;
   C combines three or four C-grade tasks. All answers are derived
   from the verified answer keys already present in the source bank. */
(() => {
  "use strict";
  if (!Array.isArray(profileVariants) || profileVariants.length !== 121)
    throw Error("Örnek: expected original 121 profile mathematics variants");
  const legacy = profileVariants;
  const source = legacy.flatMap(v => v.questions).filter(q =>
    q.l === "C" && Array.isArray(q.o) && q.o.length >= 4 &&
    (q.kind === "single" || q.kind === "multi" || q.kind === "match"));
  if (source.length < 900) throw Error("Örnek: incomplete advanced math source");
  const topics = [...new Set(source.map(q => q.topic))];
  const pools = topics.map(t => source.filter(q => q.topic === t));
  const ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const code = n => ABC[n];
  const answers = q => {
    if (q.kind === "single") return code(q.a);
    if (q.kind === "multi") return [...q.a].sort((a,b)=>a-b).map(code).join(",");
    return q.a.map((x,i) => (i+1) + "→" + code(x)).join(", ");
  };
  const optionsText = q =>
    q.o.map((o,i) => code(i) + ") " + o).join("\n");
  const describe = q =>
    (q.context ? q.context + "\n" : "") + q.t + "\n" +
    (q.kind === "match" ? q.rows.map((r,i) => (i+1) + ") " + r).join("\n") + "\n" : "") +
    optionsText(q);
  const alternatives = q => {
    const arr = [];
    if (q.kind === "single") {
      for (let i=0;i<q.o.length;i++) if (i!==q.a) arr.push(code(i));
    } else if (q.kind === "multi") {
      for (let i=0;i<q.o.length;i++) {
        const a = new Set(q.a);
        if(a.has(i)) a.delete(i); else a.add(i);
        arr.push([...a].sort((a,b)=>a-b).map(code).join(",") || "Ешқайсысы");
      }
    } else {
      for (let i=0;i<q.a.length;i++) for(let d=1;d<q.o.length;d++){
        const alt=[...q.a];
        alt[i]=(alt[i]+d)%q.o.length;
        arr.push(alt.map((x,j)=>(j+1)+"→"+code(x)).join(", "));
      }
    }
    return [...new Set(arr)].filter(x=>x!==answers(q));
  };
  const inputFor = q => ({task:describe(q),right:answers(q),wrong:alternatives(q),explain:q.e,topic:q.topic});
  const rotations = (arr,n) => arr.slice(n%arr.length).concat(arr.slice(0,n%arr.length));
  function select(variant,slot,part,used) {
    const offset=(variant * 3 + slot * 5 + part * 7) % topics.length;
    for(let attempt=0;attempt<topics.length;attempt++){
      const group=pools[(offset+attempt)%topics.length];
      const start=(variant*17+slot*31+part*47)%group.length;
      for(let j=0;j<group.length;j++){
        const candidate=group[(start+j)%group.length];
        if(used.has(candidate.id) || used.has(candidate.kind+"|"+candidate.t)) continue;
        used.add(candidate.id);
        used.add(candidate.kind+"|"+candidate.t);
        return inputFor(candidate);
      }
    }
    throw Error("Örnek: advanced question pool exhausted");
  }
  function steps(variant,slot,count,used){
    const result=[];
    for(let i=0;i<count;i++)result.push(select(variant,slot,i,used));
    return result;
  }
  function taskText(tasks) {
    return tasks.map((p,i)=>"["+(i+1)+"-есеп]\n"+p.task).join("\n\n");
  }
  function explanation(tasks){
    return tasks.map((p,i)=>(i+1)+"-есеп: "+p.explain).join("\n\n");
  }
  function topicTitle(tasks) {
    return [...new Set(tasks.map(p=>p.topic))].join(" · ");
  }
  function single(variant,slot,level,tasks,context){
    const original=tasks.map(x=>x.right);
    const value=a=>a.map((x,i)=>(i+1)+" — "+x).join("; ");
    const correct=value(original),wrong=[];
    for(let i=0;i<100&&wrong.length<3;i++){
      const index=i%tasks.length;
      const choices=tasks[index].wrong;
      const alt=choices[Math.floor(i/tasks.length)%choices.length];
      const response=[...original];
      response[index]=alt;
      const result=value(response);
      if(result!==correct&&!wrong.includes(result))wrong.push(result);
    }
    if(wrong.length!==3)throw Error("Örnek: not enough single-choice distractors");
    const position=(variant+slot*3)%4;
    const opts=Array(4);
    opts[position]=correct;
    let k=0;for(let j=0;j<4;j++)if(j!==position)opts[j]=wrong[k++];
    return {
      id:"mpe2-"+variant+"-"+slot, l:level, kind:"single",
      topic:topicTitle(tasks),
      context:context?"Күрделі математикалық есептер топтамасы. Әр есептің жауап нұсқаларын талдап, нәтижелердің дұрыс тізбегін таңдаңыз.":undefined,
      t:taskText(tasks)+"\n\n"+(tasks.length===1?"Дұрыс жауапты белгілеңіз.":"Барлық есептің дұрыс жауаптарының тізбегін таңдаңыз."),
      o:opts,a:position,e:explanation(tasks)
    };
  }
  function multi(variant,slot,level,tasks){
    const claims=[];
    tasks.forEach((task,i)=>{
      claims.push({text:(i+1)+"-есептің дұрыс жауабы: "+task.right,ok:true});
      claims.push({text:(i+1)+"-есептің дұрыс жауабы: "+task.wrong[0],ok:false});
    });
    const order=rotations(claims,(variant+slot)%claims.length);
    return {
      id:"mpe2-"+variant+"-"+slot,l:level,kind:"multi",
      topic:topicTitle(tasks),
      t:taskText(tasks)+"\n\nӘр есеп бойынша дұрыс жауап көрсетілген тұжырымдардың БАРЛЫҒЫН таңдаңыз.",
      o:order.map(x=>x.text),a:order.flatMap((x,i)=>x.ok?[i]:[]),
      e:explanation(tasks)
    };
  }
  function match(variant,slot,level,tasks){
    const right=[...new Set(tasks.map(t=>t.right))];
    const options=[...right];
    for(const task of tasks)for(const wrong of task.wrong)
      if(options.length<6&&!options.includes(wrong))options.push(wrong);
    const sorted=rotations(options,(variant+slot)%options.length);
    return {
      id:"mpe2-"+variant+"-"+slot,l:level,kind:"match",
      topic:topicTitle(tasks),
      t:"Әрбір күрделі есепті оның дұрыс жауаптар кодымен сәйкестендіріңіз.",
      rows:tasks.map((x,i)=>(i+1)+"-есеп:\n"+x.task),
      o:sorted,a:tasks.map(x=>sorted.indexOf(x.right)),e:explanation(tasks)
    };
  }
  profileVariants = legacy.map((original,index)=>{
    const v=index+1,used=new Set();
    const questions=original.questions.map((q,i)=>{
      const slot=i+1;
      const level=i<20?"A":i<32?"B":"C";
      const count=level==="A"?1:level==="B"?2:i>=35?4:3;
      const tasks=steps(v,slot,count,used);
      if(i>=35)return match(v,slot,level,tasks);
      if(i>=30)return multi(v,slot,level,tasks);
      return single(v,slot,level,tasks,i>=25&&i<30);
    });
    return {number:v,questions};
  });
  window.ornekLegacyProfileVariants=legacy;
  if(profileVariants.length!==121 || profileVariants.some(v=>
    v.questions.length!==40 ||
    v.questions.filter(q=>q.l==="A").length!==20 ||
    v.questions.filter(q=>q.l==="B").length!==12 ||
    v.questions.filter(q=>q.l==="C").length!==8))
    throw Error("Örnek: advanced mathematics exam balance is invalid");
})();
