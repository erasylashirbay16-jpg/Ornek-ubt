/* Bonus challenges: 3 advanced numeric problems per variant. Existing 40-question scoring remains unchanged. */
function physicsEliteForVariant(number){
 if(!Number.isInteger(number)||number<1||number>50)return [];
 const spec=[[(number-1)%25+1,'a'],[(number+7)%25+1,'b'],[(number+15)%25+1,'c']];
 const bank=new Map(physicsBank.filter(q=>q.id.startsWith('phys-elite-2026-')).map(q=>[q.id,q]));
 return spec.map(([topic,l])=>bank.get('phys-elite-2026-'+String(topic).padStart(2,'0')+'-'+l)).filter(Boolean);
}
function physicsEliteVariant(number){
 stopPhysics();physicsRun=null;
 const qs=physicsEliteForVariant(number);
 if(qs.length!==3)return physicsTestsPage();
 const data=physicsRead('elite-practice',{}),values=data[number]||{};
 const correct=qs.filter(q=>physicsShortCorrect(q,values[q.id])).length;
 const items=qs.map((q,i)=>'<article class="panel physics-elite-item">'+
  '<span class="badge">'+(i+1)+' · '+physicsDifficultyName(q.l)+'</span>'+
  '<p class="muted">'+escapeText(q.topic)+'</p>'+
  '<h3>'+escapeText(q.t)+'</h3>'+
  '<label>Сандық жауап ('+escapeText(q.unit||'өлшемсіз')+')'+
  '<input type="text" inputmode="decimal" data-physics-elite-value value="'+escapeText(values[q.id]||'')+'" placeholder="Жауапты енгіз"></label>'+
  '<button onclick="physicsEliteCheck(this,\''+q.id+'\','+number+')">Тексеру</button>'+
  '<p role="status" aria-live="polite">'+(physicsShortCorrect(q,values[q.id])?'Дұрыс жауап сақталған.':'')+'</p>'+
  '<details><summary>Шешу жолын көру</summary><p>'+escapeText(q.e)+'</p></details>'+
  '</article>').join('');
 page('Физика: күрделі есептер',number+'-нұсқа · үш қосымша есеп',
  '<section class="hero"><div><h2>Қосымша 3 есеп</h2><p>Бұл раунд негізгі 40 тапсырманың ұпайына әсер етпейді. Жауаптар жеке сақталады.</p></div>'+
  '<button class="secondary" onclick="physicsTestsPage()">← Нұсқалар</button></section>'+
  '<p class="physics-elite-progress">Дұрыс жауап: <strong id="physics-elite-score">'+correct+' / 3</strong></p>'+
  '<section class="physics-elite-stack">'+items+'</section>');
 window.scrollTo(0,0);
}
function physicsEliteCheck(button,id,number){
 const q=physicsEliteForVariant(number).find(item=>item.id===id);
 if(!q)return;
 const input=button.closest('.physics-elite-item')?.querySelector('[data-physics-elite-value]');
 const value=input?.value?.trim()||'';
 const saved=physicsRead('elite-practice',{});
 saved[number]={...(saved[number]||{}),[id]:value.slice(0,100)};
 physicsWrite('elite-practice',saved);
 const correct=physicsShortCorrect(q,value);
 const status=button.nextElementSibling;
 if(status)status.textContent=correct?'Дұрыс! Жауап сақталды.':'Дұрыс емес. Есептің шартын және өлшем бірлігін қайта тексер.';
 const score=document.getElementById('physics-elite-score');
 if(score)score.textContent=physicsEliteForVariant(number).filter(item=>physicsShortCorrect(item,saved[number][item.id])).length+' / 3';
}
