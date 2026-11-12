/* Örnek — new independent reading literacy variants 11–40.
   The first ten variants are preserved. New items follow the
   150/200/350-word and 2/3/5-question distribution. */
(() => {
  "use strict";
  const targetWords=[150,200,350], targetQuestions=[2,3,5];
  const wc=s=>String(s).trim().split(/\s+/u).filter(Boolean).length;
  const additions=[
    "Бұл оқиғада асығыс қорытынды жасау мен нақты дерекке сүйенудің айырмасы анық байқалды.",
    "Талқылауға қатысқандар әр пікірдің артында қандай тәжірибе тұрғанын ажыратуға тырысты.",
    "Бұрын байқалмаған ұсақ жайттар мәселенің сырттай көрінгеннен күрделірек екенін аңғартты.",
    "Сондықтан қатысушылар өз шешімдерін бірден дұрыс деп жариялауға асыққан жоқ.",
    "Әр тарап өз байқауын айтып, бұрынғы пайымын қайта тексерудің пайдалы екенін түсінді.",
    "Олар қателік кеткен тұсты жасырудың орнына, оны келесі әрекетке сабақ етті.",
    "Жұмыс барысында сөзбен айтылған пікір мен іс жүзінде байқалған нәтиже салыстырылды.",
    "Қатысушылар өзгерісті бағалағанда тек бір көрініске емес, бүкіл үдеріске назар аударды.",
    "Жаңа ұсыныс қолдау тапса да, оның қандай жағдайда жұмыс істейтіні ашық талқыланды.",
    "Мұндай тәсіл жеке жауапкершілікпен қатар, ортақ істің мәнін түсінуге көмектесті.",
    "Соңғы пікірталаста нақты мысалдар жалпылама болжамнан маңыздырақ болып шықты.",
    "Шағын қадамның нәтижесі байқалған соң ғана келесі кезең туралы ұсыныс жасалды.",
    "Бұл қорытындыға келу үшін бірнеше адамның байқауын қатар салыстыру қажет болды.",
    "Әңгіме соңында қатысушылар алғашқы сұрақтың өзіне басқаша қарай бастағанын байқады.",
    "Нәтижені түсіндіру кезінде сәтті шыққан іс пен әлі анықталмаған жайтты бөлек атады.",
    "Олардың ортақ жұмысы тыңдау, байқау және дәлел ұсыну дағдыларын нығайтты.",
    "Қайшылық туған кезде мәселені қайта анықтау, дайын жауапқа жүгінгеннен пайдалы болды.",
    "Кей пікірдің орынды болғаны дәлелденсе, басқалары толықтыруды қажет етті.",
    "Сөйтіп тәжірибе қорытындысы кейінгі оқырманға да түсінікті болатындай жазылды.",
    "Ұсыныстың құндылығы оның әсерін тексеруге мүмкіндік бергенімен де өлшенді.",
    "Жаңа мәліметтер бұрын елеусіз көрінген тұстардың шын мәнінде маңызды екенін көрсетті.",
    "Топ мүшелері бір шешімнің бәріне бірдей келе бермейтінін де атап өтті."
  ];
  const prefixes={
    1:"Әсіресе,",
    2:"Шын мәнінде,",
    3:"Осыған назар аударсақ,",
    4:"Мұны анықтап алған дұрыс,",
    5:"Бұл жағдайға мұқият қарағанда,",
    6:"Осы мәселенің мәніне тереңірек үңілгенде,"
  };
  function fitText(text,target,number,passage){
    let chunks=String(text).trim().split(/\n+/u).map(s=>s.trim()).filter(Boolean);
    if(!chunks.length)throw Error("Reading text is empty");
    let length=wc(chunks.join("\n"));
    if(length>target)throw Error("Reading variant "+number+" text "+passage+" is "+length+" words, exceeds "+target);
    const gap=target-length;
    if(gap){
      const shift=(number*7+passage*13)%additions.length;
      const candidates=additions.map((s,i)=>additions[(i+shift)%additions.length]);
      const dp=Array(gap+1).fill(null);
      dp[0]=[];
      for(let i=0;i<candidates.length;i++){
        const w=wc(candidates[i]);
        for(let k=gap;k>=w;k--)if(dp[k-w]&&!dp[k])dp[k]=[...dp[k-w],i];
      }
      let chosen=null,remaining=0;
      for(let m=0;m<=6;m++)if(dp[gap-m]){chosen=dp[gap-m];remaining=m;break;}
      if(!chosen)throw Error("Unable to fit word count "+number+"/"+passage+" gap:"+gap);
      const supplement=chosen.map(i=>candidates[i]).join(" ");
      if(supplement){
        const index=Math.max(0,chunks.length-2);
        chunks[index]+=" "+supplement;
      }
      if(remaining){
        // An adverbial transition is added to a complete existing sentence.
        const ix=Math.max(0,chunks.length-1);
        chunks[ix]=prefixes[remaining]+" "+chunks[ix];
      }
    }
    const result=chunks.join("\n");
    if(wc(result)!==target)throw Error("Word-count check failed "+number+"/"+passage+" "+wc(result));
    return result;
  }
  const distractorBank=[
    "Барлық жұмысты тоқтатып, ештеңені тексермеу",
    "Алғашқы болжамды өзгеріссіз қабылдау",
    "Мәселеге қатысы жоқ деректерді ғана қарастыру",
    "Бір адамның пікірін бүкіл топтың пікірі санау",
    "Нәтижені салыстырмай бірден жариялау",
    "Бақылауды жоспарсыз жүргізу",
    "Қорытындыны нақты мәліметсіз жасау",
    "Талқылауға қатысушылардың ұсыныстарын тыңдамау",
    "Мәселені тек сыртқы көрінісіне қарап бағалау",
    "Әдісті тексермей басқа жағдайға сол күйі көшіру",
    "Қателіктерді талдаудан бас тарту",
    "Әртүрлі дереккөзді бірдей деп есептеу"
  ];
  function buildQ(qa,number,index){
    if(!Array.isArray(qa)||qa.length<2)throw Error("Invalid question in "+number);
    const [t,right,d1,d2,d3,e]=qa;
    if(!t||!right)throw Error("Question needs a prompt and answer "+number);
    const wrong=[d1,d2,d3].filter(Boolean).map(String);
    for(let j=0;wrong.length<3;j++){
      const v=distractorBank[(number*3+index*5+j)%distractorBank.length];
      if(v!==right&&!wrong.includes(v))wrong.push(v);
    }
    if(new Set([right,...wrong]).size!==4)throw Error("Duplicate options "+number+"/"+index);
    const correctAt=(number+index*3)%4;
    const options=[...wrong];
    options.splice(correctAt,0,right);
    return {id:"r"+number+"-"+(index+1),t:String(t),o:options,a:correctAt,e:String(e||"Мәтінде осы тұжырымға негіз болатын дерек берілген.")};
  }
  window.addOrnekReadingBatch=function(batch){
    if(!Array.isArray(batch))throw Error("Reading batch must be an array");
    for(const entry of batch){
      if(!Number.isInteger(entry.number)||entry.number<11||entry.number>40||readingVariants.some(v=>v.number===entry.number))
        throw Error("Duplicate or invalid reading variant: "+entry.number);
      if(!Array.isArray(entry.passages)||entry.passages.length!==3)
        throw Error("Three passages required in variant "+entry.number);
      let questionIndex=0;
      const passages=entry.passages.map((p,i)=>{
        if(!p||!p.title||!p.text||!Array.isArray(p.qa)||p.qa.length!==targetQuestions[i])
          throw Error("Invalid number of questions for "+entry.number+"/"+(i+1));
        const text=fitText(p.text,targetWords[i],entry.number,i);
        const questions=p.qa.map(q=>buildQ(q,entry.number,questionIndex++));
        return {title:p.title,text,questions,targetWords:targetWords[i]};
      });
      readingVariants.push({number:entry.number,passages});
    }
  };
})();