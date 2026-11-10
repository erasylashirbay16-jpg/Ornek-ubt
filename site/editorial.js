
/* Presentation layer only; original banks, identity and study engines retained. */
const editorialWelcomeBase=renderWelcome;
renderWelcome=function(){
 editorialWelcomeBase();
 const root=document.getElementById('welcome');if(!root)return;
 const heading=root.querySelector('.arch-hero h1');
 if(heading)heading.innerHTML='Болашағыңды<br><em>біліміңмен</em><br>өрнекте.';
 const intro=root.querySelector('.arch-hero-copy>p');
 if(intro)intro.innerHTML='ҰБТ-ға дайындықты түсінікті қадамдарға бөл. <br>Есеп шығар. Мәтінді талда. Нәтижеңді көр.';
 const how=root.querySelector('#arch-how');
 if(how&&!root.querySelector('.ornek-method'))how.insertAdjacentHTML('beforebegin',`<section class="ornek-method" aria-labelledby="method-heading"><div><h2 id="method-heading">Жауапты табудан<br>түсінуге дейін.</h2><p>Дайындықтың әр бөлігі бір-бірімен байланысты. Бүгін үйренгенің ертеңгі сенімділігіңе айналады.</p></div><ol><li><b>01</b> Өз деңгейіңнен баста<span>Тақырып пен A, B, C деңгейін таңда. Қысқа жаттығумен біліміңді тексер.</span></li><li><b>02</b> Қатеңнің себебін түсін<span>Жауаптың түсіндірмесін оқы. Қиын тапсырманы сақтап, қайта орында.</span></li><li><b>03</b> Ілгерілеуіңді бақыла<span>Күндік мақсат, тест тарихы және тақырып бойынша нәтиже — жеке оқу кеңістігіңде.</span></li></ol></section>`);
 const foot=root.querySelector('.arch-footer');
 if(foot&&!root.querySelector('.ornek-faq'))foot.insertAdjacentHTML('beforebegin',`<section class="ornek-faq" aria-labelledby="faq-heading"><h2 id="faq-heading">Сұрағың бар ма?</h2><div><details><summary>Дайындықты қалай бастаймын?</summary><p>Пәнді таңда да, сұрақтар банкін немесе тест нұсқаларын аш. Алдымен тіркелмей-ақ дайындала аласың.</p></details><details><summary>Тапсырмалар тегін бе?</summary><p>Қазақстан тарихы, математикалық және оқу сауаттылығы тапсырмаларын тегін орындауға болады.</p></details><details><summary>Нәтижелерім қайда сақталады?</summary><p>Тіркелусіз дайындалсаң, прогресс осы браузерде сақталады. Аккаунтпен кіргенде нәтижелер жеке аккаунтыңмен байланыстырылады.</p></details><details><summary>Бұл ресми ҰБТ сұрақтары ма?</summary><p>Örnek — дайындыққа арналған авторлық тапсырмалар платформасы. Сұрақтар ресми ҰБТ банкіне жатпайды.</p></details></div></section>`);
};
renderWelcome();
