/* Örnek: locale/accessibility QA fixes. Preserve correct answers and learner progress. */
(function(){
 const ruLabels={
  'Әр мәтін 400 сөзден тұрады. Тапсырмалар деңгейге бөлінбейді. Тапсырмалар саны — 2 + 3 + 5. Мәтіндер мен сұрақтар — Өрнектің авторлық материалы.':'10 вариантов, в каждом 3 текста и 10 вопросов (2 + 3 + 5). Объём перевода может отличаться от оригинала. Материалы подготовлены Өрнек.',
  'Әр мәтін — 400 сөз':'Тексты переведены на русский язык',
  '3 мәтін':'3 текста','сөз':'слов','мәтін':'текста','сұрақ':'вопросов',
  'Кітаптың екінші өмірі':'Вторая жизнь книги',
  'Оқу банкіндегі есептер мен шешімдер қазақша.':'Задания и объяснения доступны на русском и казахском.',
  'Құпиялық саясаты':'Политика конфиденциальности',
  'Деректерге келісім':'Согласие на обработку данных',
  'Cookie саясаты':'Политика cookie',
  'Cookie баптау':'Настройки cookie',
  'Cookie баптаулары':'Настройки cookie',
  'Cookie таңдауы':'Выбор cookie',
  'Құпиялылығыңыз маңызды':'Ваша конфиденциальность важна',
  'Өrnek қажетті cookie-лерді қолданады. Аналитика мен маркетинг тек келісім бергенде қосылады.':'Өrnek использует необходимые cookie. Аналитика и маркетинг включаются только с вашего согласия.',
  'Örnek қажетті cookie-лерді қолданады. Аналитика мен маркетинг тек келісім бергенде қосылады.':'Örnek использует необходимые cookie. Аналитика и маркетинг включаются только с вашего согласия.',
  'Барлығын қабылдау':'Принять все','Міндеттілер ғана':'Только необходимые','Баптау':'Настроить',
  'Жабу':'Закрыть','Таңдауды сақтау':'Сохранить выбор',
  'Қажетті cookie әрқашан қосулы. Қалғандары тек таңдауыңыз бойынша қолданылады.':'Необходимые cookie всегда включены. Остальные используются только по вашему выбору.',
  'Қажетті cookie':'Необходимые cookie',
  'Кіру сессиясы және сайттың негізгі жұмысы':'Сессия входа и основная работа сайта',
  'Қосымша статистика':'Дополнительная статистика',
  'Қосымша жарнама құралдары':'Дополнительные маркетинговые инструменты',
  'Мен':'Я',
  'дербес деректерімді өңдеуге келісім':'согласен на обработку моих персональных данных',
  'беремін және құпиялық саясатымен таныстым.':'и ознакомился с политикой конфиденциальности.',
  'Жалғастыру үшін келісімді белгілеңіз.':'Для продолжения отметьте согласие.',
  'Өrnek-ке кіру':'Вход в Өrnek','Örnek-ке кіру':'Вход в Örnek',
  'Менің аккаунтым':'Мой аккаунт','Есімің':'Ваше имя','Сақтау':'Сохранить',
  'Аккаунттан шығу':'Выйти из аккаунта',
  'Email мен құпиясөз арқылы тіркел немесе кір.':'Зарегистрируйтесь или войдите по email и паролю.',
  'Құпиясөз':'Пароль',
  'Мен':'Я','құпиялық саясатымен':'политикой конфиденциальности',
  'таныстым және':'ознакомился и',
  'деректерді өңдеуге келісемін':'согласен на обработку данных',
  'Кіру':'Войти','Тіркелу':'Регистрация',
  'Google арқылы кіру':'Войти через Google',
  'Тіркелусіз жалғастыру':'Продолжить без регистрации',
  'Тіркелу үшін дербес деректерді өңдеуге келісім беріңіз.':'Для регистрации необходимо согласие на обработку персональных данных.',
  'Күте тұр…':'Пожалуйста, подождите…',
  'Поштаңды тексер: тіркелуді растау хатын жібердік. Растағаннан кейін осы бетке оралып, «Кіру» батырмасын бас.':'Проверьте почту: мы отправили письмо для подтверждения регистрации. Затем вернитесь и нажмите «Войти».',
  'Email немесе құпиясөз дұрыс емес.':'Неверный email или пароль.',
  'Алдымен поштаңдағы растау сілтемесін аш.':'Сначала подтвердите email по ссылке из письма.',
  'Хат жіберу шегіне жетті. Біраздан кейін қайта көр.':'Превышен лимит отправки писем. Повторите позднее.',
  'Бұл email тіркелген. «Кіру» батырмасын бас.':'Этот email уже зарегистрирован. Нажмите «Войти».',
  'Күштірек құпиясөз таңда.':'Выберите более надёжный пароль.',
  'Әрекет орындалмады. Байланысты және енгізген деректерді тексеріп, қайта көр.':'Не удалось выполнить действие. Проверьте соединение и введённые данные.',
  'Google арқылы кіру үшін деректерді өңдеуге келісім беріңіз.':'Для входа через Google подтвердите согласие на обработку данных.',
  'Google-ға бағытталуда…':'Переход к Google…',
  'Google арқылы кіру ашылмады. Қайта көр немесе email арқылы кір.':'Вход через Google не открылся. Повторите попытку или войдите по email.',
  'Қайта көр':'Повторить',
  'Алдыңғы':'Назад','Келесі':'Далее','Аяқтау':'Завершить',
  'Жауаптар тест соңында талданады':'Ответы разбираются после завершения теста.',
  'Аяқталған':'Завершено','Орындалмаған':'Не выполнено',
  'Тестті бастау →':'Начать тест →',
  'Дұрыс жауап. Жақсы жұмыс!':'Верный ответ. Отличная работа!',
  'Бұл жолы сәйкес келмеді.':'На этот раз ответ неверный.',
  'Енді шешу тәсілін бекітіп ал.':'Теперь закрепи способ решения.',
  'Шешімін қарап, қай қадамда қателескеніңді анықта.':'Посмотри решение и найди шаг, на котором возникла ошибка.',
  'Шешу жолын ашу →':'Показать решение →',
  'Қайта шығару':'Решить заново',
  'Сұраққа жауап сақталмаған':'Ответ на вопрос не сохранён'
 };
 Object.assign(qRussian,ruLabels);
 if(typeof ornekWords!=='undefined'&&ornekWords.ru)ornekWords.ru.note='Задания, тексты и объяснения доступны на русском и казахском.';
 if(typeof welcomeCopy!=='undefined'&&welcomeCopy.ru)welcomeCopy.ru.languageNote='Главная, интерфейс, задания и тексты доступны на русском и казахском.';
 function ruCount(n,forms){n=Number(n);return n%100>=11&&n%100<=14?forms[2]:n%10===1?forms[0]:n%10>=2&&n%10<=4?forms[1]:forms[2];}
 function fixMathTerms(){
  for(const item of bank){
   const trans=item.ruSource||item.ruTask;
   if(!trans||typeof trans.t!=='string')continue;
   trans.t=trans.t.replace(/\b(\d+)\s+часов(?=\s|[.,!?]|$)/g,(m,n)=>n+' '+ruCount(n,['час','часа','часов']));
   if(qLanguage==='ru')item.t=trans.t;
  }
 }
 fixMathTerms();
 const oldApplyFormula=applyFormulaLanguage;
 applyFormulaLanguage=function(lang){
  oldApplyFormula(lang);
  if(lang!=='ru')return;
  const replaces=[
   ['0 жақ:','0 граней:'],['1 жақ:','1 грань:'],['2 жақ:','2 грани:'],['3 жақ:','3 грани:'],
   ['<sub>нов</sub>','<sub>новое</sub>'],
   ['Дұрыс пирамида:','Правильная пирамида:'],
   ['<sub>ағыспен</sub>','<sub>по течению</sub>'],
   ['<sub>қайық</sub>','<sub>лодка</sub>'],
   ['<sub>ағыс</sub>','<sub>течение</sub>'],
   ['<sub>қарсы</sub>','<sub>против течения</sub>'],
   ['<sub>орташа</sub>','<sub>среднее</sub>'],
   ['<sub>барлық</sub>','<sub>общее</sub>'],
   ['<sub>тіктөртбұрыш</sub>','<sub>прямоугольник</sub>'],
   ['<sub>шаршы</sub>','<sub>квадрат</sub>'],
   ['<sub>дөңгелек</sub>','<sub>круг</sub>'],
   ['<sub>бүйір</sub>','<sub>боковое</sub>'],
   ['<sub>толық</sub>','<sub>полное</sub>'],
   ['<sub>таб</sub>','<sub>осн</sub>']
  ];
  for(const topic of formulaGuideTopics)for(const f of topic[2])for(const [a,b] of replaces)f[1]=f[1].replaceAll(a,b);
 };
 applyFormulaLanguage(qLanguage);
 function localizeReadingDOM(){
   document.querySelectorAll('.reading-passage,.reading-question-text,.reading-option,.reading-review [lang],.reading-modal [lang]').forEach(e=>e.lang=qLanguage);
   if(qLanguage!=='ru')return;
   const meta=document.querySelector('.reading-passage-meta');
   if(meta&&readingRun){
      const v=readingVariants.find(x=>x.number===readingRun.number),item=readingItems(v)[readingRun.pos],p=v.passages[item.passage],words=p.text.trim().split(/\s+/u).length;
      meta.textContent='Текст '+(item.passage+1)+' из 3 · '+words+' '+ruCount(words,['слово','слова','слов']);
   }
   for(const e of document.querySelectorAll('.reading-review .badge'))e.textContent=e.textContent.replace(/^(\d+)-сұрақ$/,'Вопрос $1');
 }
 const oldReadingsPage=readingsPage;
 readingsPage=function(){
   oldReadingsPage();
   if(qLanguage==='ru'){
     const note=document.querySelector('.reading-spec-note');
     if(note)note.textContent=ruLabels['Әр мәтін 400 сөзден тұрады. Тапсырмалар деңгейге бөлінбейді. Тапсырмалар саны — 2 + 3 + 5. Мәтіндер мен сұрақтар — Өрнектің авторлық материалы.'];
     document.querySelectorAll('.testtile>p').forEach(e=>{if(e.textContent.trim()==='Әр мәтін — 400 сөз')e.textContent='Тексты доступны на двух языках';});
     const foot=document.querySelector('.workspace-language-note');if(foot)foot.textContent='Задания и объяснения доступны на русском и казахском.';
   }
   applyQLanguage();
 };
 const oldRenderReading=renderReading;
 renderReading=function(){
   oldRenderReading();
   localizeReadingDOM();
   applyQLanguage();
 };
 const oldFinishReading=finishReading;
 finishReading=function(...args){
   oldFinishReading(...args);
   if(!readingRun){localizeReadingDOM();applyQLanguage();}
 };
 const oldShowPassage=showReadingPassage;
 showReadingPassage=function(...args){oldShowPassage(...args);localizeReadingDOM();applyQLanguage();};
 const oldShowAccount=showAccount;
 showAccount=function(...args){oldShowAccount(...args);applyQLanguage();};
 const oldSetLanguage=setQLanguage;
 setQLanguage=function(lang){
   oldSetLanguage(lang);
   fixMathTerms();
   if(document.body.classList.contains('on-welcome')){renderWelcome();}
   if(document.querySelector('.reading-passage'))localizeReadingDOM();
   if(document.querySelector('.reading-spec-note'))readingsPage();
   if(document.querySelector('.reading-review'))localizeReadingDOM();
   applyQLanguage();
 };
 if(qLanguage==='ru'&&document.body.classList.contains('on-welcome'))renderWelcome();
 applyQLanguage();
})();