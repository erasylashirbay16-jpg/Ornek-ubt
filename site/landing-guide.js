(() => {
  const email = 'erasylashirbay51@gmail.com';
  const copy = {
    kk: {
      about: 'Örnek туралы',
      intro: 'Örnek — ҰБТ-ға дайындалатын оқушыларға арналған платформа. Пәнді таңда, тест орында және түсіндірмелер арқылы қай тақырыпты қайталау керегін анықта.',
      blog: 'Дайындық блогы',
      articles: [
        ['ҰБТ-ға апталық жоспар құру', 'Аптаның басында бір сынақ орында. Қателерді тақырып бойынша топтастырып, ең әлсіз екі тақырыпты таңда. Әрқайсына жеке жаттығу күнін белгіле. Апта соңында ұқсас тапсырмалармен нәтижені қайта тексер.'],
        ['Мәтіннен дұрыс жауаптың дәлелін табу', 'Сұрақтағы негізгі сөзді белгіле де, мәтіннен сол ой айтылған абзацты тап. Әр нұсқаны автордың сөзімен салыстыр. Таныс сөз кездескеніне қарап жауап таңдама: нұсқаның бүкіл мағынасы мәтінге сәйкес келуі керек.'],
        ['Тест қатесін қалай талдау керек?', 'Әр қате үшін себебін жаз: тақырыпты білмедің бе, шартты қате оқыдың ба, әлде есептеуден жаңылдың ба? Шешу жолын қарап шық. Келесі күні жауапқа қарамай, сол тәсілді басқа есепте қолданып көр.']
      ],
      reviews: 'Оқушылардың пікірлері',
      empty: 'Жарияланған пікірлер әзірге жоқ. Örnek-те не көмектесті және нені жақсартуға болады?',
      review: 'Пікір қалдыру',
      contact: 'Байланыс',
      topic: 'Хабарлама тақырыбы',
      question: 'Сұрақ немесе ұсыныс',
      message: 'Хабарлама',
      hint: 'Батырма пошта қолданбасында хат дайындайды. Хатты сол жерден жібер.',
      send: 'Поштада ашу',
      cta: 'Алғашқы тестіңді баста',
      start: 'Тест нұсқаларын ашу',
      signup: 'Кіру / Тіркелу',
      nav: 'Басты бет бөлімдері'
    },
    ru: {
      about: 'Об Örnek',
      intro: 'Örnek — платформа для подготовки к ЕНТ. Выбери предмет, пройди тест и по объяснениям определи, какие темы стоит повторить.',
      blog: 'Блог о подготовке',
      articles: [
        ['Как составить план подготовки на неделю', 'В начале недели пройди пробный тест. Сгруппируй ошибки по темам и выбери две самые сложные. Выдели каждой отдельный день для практики. В конце недели проверь результат на похожих заданиях.'],
        ['Как найти доказательство ответа в тексте', 'Отметь ключевое слово в вопросе и найди абзац с нужной мыслью. Сравни каждый вариант ответа со словами автора. Проверяй смысл всего варианта: одного совпавшего слова недостаточно.'],
        ['Как разбирать ошибки в тесте', 'Для каждой ошибки запиши причину: пробел в теме, неверно прочитанное условие или просчёт. Разбери решение. На следующий день примени тот же подход в другой задаче без подсказки.']
      ],
      reviews: 'Отзывы учеников',
      empty: 'Опубликованных отзывов пока нет. Что помогло тебе в Örnek и что можно улучшить?',
      review: 'Оставить отзыв',
      contact: 'Контакты',
      topic: 'Тема сообщения',
      question: 'Вопрос или предложение',
      message: 'Сообщение',
      hint: 'Кнопка подготовит письмо в почтовом приложении. Отправь его оттуда.',
      send: 'Открыть в почте',
      cta: 'Начни свой первый тест',
      start: 'Открыть варианты тестов',
      signup: 'Войти / Зарегистрироваться',
      nav: 'Разделы главной страницы'
    }
  };

  function renderGuide() {
    const root = document.getElementById('welcome');
    const footer = root?.querySelector('.arch-footer');
    if (!footer || root.querySelector('.landing-guide')) return;
    const t = copy[qLanguage] || copy.kk;
    const links = [
      ['arch-subjects', qLanguage === 'ru' ? 'Предметы' : 'Пәндер'],
      ['ornek-about', t.about], ['ornek-blog', t.blog], ['ornek-contact', t.contact]
    ].map(([id, label]) => `<a href="#${id}">${label}</a>`).join('');
    footer.insertAdjacentHTML('beforebegin', `
      <div class="landing-guide">
        <section id="ornek-about" aria-labelledby="ornek-about-title">
          <h2 id="ornek-about-title">${t.about}</h2>
          <p>${t.intro}</p>
        </section>
        <section id="ornek-blog" aria-labelledby="ornek-blog-title">
          <h2 id="ornek-blog-title">${t.blog}</h2>
          <div class="landing-articles">${t.articles.map(([title, body]) => `
            <details><summary>${title}</summary><p>${body}</p></details>
          `).join('')}</div>
        </section>
        <section id="ornek-reviews" aria-labelledby="ornek-reviews-title">
          <h2 id="ornek-reviews-title">${t.reviews}</h2>
          <p>${t.empty}</p>
          <a href="#ornek-contact" data-review-link>${t.review}</a>
        </section>
        <section id="ornek-contact" aria-labelledby="ornek-contact-title">
          <h2 id="ornek-contact-title">${t.contact}</h2>
          <form>
            <label>${t.topic}
              <select name="topic"><option value="question">${t.question}</option><option value="review">${t.review}</option></select>
            </label>
            <label>${t.message}<textarea name="message" rows="5" maxlength="1500" required aria-describedby="ornek-mail-hint"></textarea></label>
            <p id="ornek-mail-hint">${t.hint}</p>
            <button type="submit">${t.send}</button>
          </form>
        </section>
        <section class="landing-guide-cta" aria-labelledby="ornek-start-title">
          <h2 id="ornek-start-title">${t.cta}</h2>
          <button type="button" data-open-tests>${t.start}</button>
          ${ornekAccount.user ? '' : `<button type="button" class="secondary" data-open-account>${t.signup}</button>`}
        </section>
      </div>
    `);
    footer.insertAdjacentHTML('beforeend', `<div class="landing-footer-links" role="navigation" aria-label="${t.nav}">${links}<a href="mailto:${email}">${email}</a></div>`);

    const form = root.querySelector('#ornek-contact form');
    root.querySelector('[data-review-link]').addEventListener('click', () => {
      form.elements.topic.value = 'review';
      form.elements.message.focus({ preventScroll: true });
    });
    form.addEventListener('submit', event => {
      event.preventDefault();
      const message = form.elements.message.value.trim();
      if (!message) {
        form.elements.message.focus();
        return;
      }
      const subject = form.elements.topic.value === 'review' ? t.reviews : t.question;
      location.href = `mailto:${email}?subject=${encodeURIComponent('Örnek · ' + subject)}&body=${encodeURIComponent(message)}`;
    });
    root.querySelector('[data-open-tests]').addEventListener('click', () => {
      openSubject('math');
      subjectNavigate('testsPage');
    });
    root.querySelector('[data-open-account]')?.addEventListener('click', () => showAccount());
  }

  const previousRender = renderWelcome;
  renderWelcome = function () {
    const result = previousRender.apply(this, arguments);
    renderGuide();
    return result;
  };
  renderGuide();
})();
