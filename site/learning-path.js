(() => {
  const ru = () => qLanguage === 'ru';
  const words = (kk, russian) => ru() ? russian : kk;
  const routes = {
    math: {
      slug: 'math-literacy', size: 10, draft: readDraft,
      resume: resumeDraft, results: () => variantResults
    },
    reading: {
      slug: 'reading-literacy', size: 10, variants: readingVariants,
      draft: () => readStore('ornek-reading-draft-v1', null),
      resume: resumeReading, results: readingResults
    },
    history: {
      slug: 'kazakhstan-history', size: 20, variants: historyVariants,
      draft: () => readStore('ornek-history-draft-v2', null),
      resume: resumeHistory, results: historyResults, review: historyReview
    },
    profile: {
      slug: 'mathematics', size: 40, variants: profileVariants,
      draft: () => profileRead('draft', null),
      resume: resumeProfile, results: profileResults, review: profileReview
    },
    physics: {
      slug: 'physics', size: 40, variants: physicsVariants,
      draft: () => physicsRead('draft', null),
      resume: resumePhysics, results: physicsResults, review: physicsReview
    }
  };

  function results(route) {
    return Object.entries(route.results()).flatMap(([number, result]) => {
      const score = result?.correct;
      const date = Date.parse(result?.date);
      if (!Number.isInteger(score) || score < 0 || score > route.size || !Number.isFinite(date)) return [];
      return [{number: Number(number), score, date}];
    }).sort((a, b) => a.date - b.date);
  }

  function draftFor(route) {
    const draft = route.draft();
    if (!draft || !Number.isFinite(draft.end) || (route.variants && !route.variants.some(v => v.number === draft.number))) return null;
    return draft;
  }

  function openWorkspace(id, action) {
    const route = routes[id];
    openSubject(id);
    if (action === 'resume') {
      if (draftFor(route)) route.resume();
      else subjectNavigate('testsPage');
    } else if (action === 'result' && route.review) {
      const last = results(route).at(-1);
      if (last) route.review(last.number);
      else subjectNavigate('analytics');
    } else {
      subjectNavigate(action === 'result' ? 'analytics' : action);
    }
  }

  function progressPanel(id = null) {
    const entries = (id ? [[id, routes[id]]] : Object.entries(routes)).map(([key, route]) => ({
      key, route, draft: draftFor(route), results: results(route)
    }));
    const next = entries.filter(item => item.draft).sort((a, b) => b.draft.end - a.draft.end)[0];
    const recent = entries.filter(item => item.results.length).sort((a, b) => b.results.at(-1).date - a.results.at(-1).date)[0];
    if (!id && !next && !recent && !ornekAccount.user) return null;
    const panel = document.createElement('section');
    panel.className = 'learning-progress-panel';
    const heading = document.createElement('h2');
    heading.textContent = words('Менің дайындығым', 'Моя подготовка');
    panel.append(heading);
    const actions = document.createElement('div');
    actions.className = 'learning-actions';
    const button = (key, action, label) => {
      const el = document.createElement('button');
      el.type = 'button';
      el.textContent = label;
      el.addEventListener('click', () => openWorkspace(key, action));
      actions.append(el);
    };
    if (next) {
      const draftInfo = document.createElement('p');
      draftInfo.textContent = (pickerName(next.key) + ' · ' +
        (next.draft.end > Date.now()
          ? words('Таймер жүріп жатыр', 'Таймер продолжает идти')
          : words('Тест уақыты аяқталды', 'Время теста истекло')));
      panel.append(draftInfo);
      button(next.key, 'resume', next.draft.end > Date.now()
        ? words('Жаттығуды жалғастыру', 'Продолжить тренировку')
        : words('Аяқталған тестті ашу', 'Открыть завершённый тест'));
    }
    if (recent) {
      const last = recent.results.at(-1);
      const text = document.createElement('p');
      text.textContent = words('Соңғы нәтиже', 'Последний результат') + ' · ' +
        pickerName(recent.key) + ' · ' + last.score + ' / ' + recent.route.size;
      panel.append(text);
      button(recent.key, 'result', words('Нәтижені ашу', 'Открыть результат'));
      if (recent.results.length >= 2) {
        const graph = document.createElement('ol');
        graph.className = 'learning-score-chart';
        graph.setAttribute('aria-label', words('Соңғы нұсқалардағы нәтиже', 'Результаты последних вариантов'));
        for (const attempt of recent.results.slice(-7)) {
          const item = document.createElement('li');
          item.title = new Date(attempt.date).toLocaleDateString(ru() ? 'ru' : 'kk');
          item.innerHTML = `<strong>${attempt.score}/${recent.route.size}</strong><span aria-hidden="true" style="--score:${attempt.score/recent.route.size*100}%"></span><small>№ ${attempt.number}</small>`;
          graph.append(item);
        }
        panel.append(graph);
      }
    }
    const key = id || recent?.key || next?.key || 'math';
    if (!next && !recent) button(key, 'testsPage', words('Тест нұсқаларын ашу', 'Открыть варианты тестов'));
    button(key, 'collection', words('Қателерді қайталау', 'Повторить ошибки'));
    panel.append(actions);
    return panel;
  }

  function practicePercentages() {
    openSubject('math');
    const selected = bank.filter(q => /пайыз|жеңілдік|%/iu.test(q.t)).slice(0, 8);
    window.OrnekExamInteractions.openDirect('math', selected.map(q => q.id));
  }

  function renderLandingPath() {
    const root = document.getElementById('welcome');
    const hero = root?.querySelector('.arch-hero');
    const subjects = root?.querySelector('#arch-subjects');
    if (!hero || !subjects || root.querySelector('.learning-path-links')) return;
    const primary = hero.querySelector('.arch-cta');
    primary.replaceChildren(words('Тестті бастау', 'Начать тест'));
    primary.href = '/?subject=math&mode=tests';
    primary.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      openWorkspace('math', 'testsPage');
    });
    const sample = document.createElement('a');
    sample.className = 'learning-sample-link';
    sample.href = '/subjects/math-literacy/percentages/';
    sample.textContent = words('Үлгі жаттығуды көру', 'Посмотреть пример упражнения');
    primary.after(sample);

    const panel = progressPanel();
    if (panel) hero.after(panel);
    const links = document.createElement('div');
    links.className = 'learning-path-links';
    links.setAttribute('role', 'navigation');
    links.setAttribute('aria-label', words('Ашық пән беттері', 'Открытые страницы предметов'));
    for (const [key, route] of Object.entries(routes)) {
      const anchor = document.createElement('a');
      anchor.href = '/subjects/' + route.slug + '/';
      anchor.textContent = pickerName(key);
      links.append(anchor);
    }
    subjects.append(links);
  }

  const previousRender = renderWelcome;
  renderWelcome = function () {
    const result = previousRender.apply(this, arguments);
    renderLandingPath();
    return result;
  };
  renderLandingPath();

  const navigate = window.subjectNavigate;
  window.subjectNavigate = function (key) {
    const result = navigate.apply(this, arguments);
    if (key === 'home' && routes[currentSubject]) {
      app.querySelector('.learning-progress-panel')?.remove();
      const panel = progressPanel(currentSubject);
      if (panel) app.prepend(panel);
    }
    return result;
  };

  window.ornekOpenLearningLink = function () {
    const query = new URLSearchParams(location.search);
    const id = query.get('subject');
    if (!Object.hasOwn(routes, id) || window.ornekStartupRequestedSubject) return;
    if (id === 'math' && query.get('topic') === 'percentages') practicePercentages();
    else openWorkspace(id, query.get('mode') === 'tests' ? 'testsPage' : 'home');
  };
})();
