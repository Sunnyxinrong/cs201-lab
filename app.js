'use strict';

(() => {
  const { bi: b, lessons, groups, lectureFiles, glossary } = CS201;
  const { el, button, mount, reducedMotion } = CS201UI;
  const ids = groups.flatMap((group) => group.ids);
  const allQuestions = ids.reduce((sum, id) => sum + lessons[id].questions.length, 0);
  const pad = (id) => String(id).padStart(2, '0');
  const main = document.getElementById('main');
  const sidebar = document.getElementById('sidebar');
  const bar = document.getElementById('topbar');
  const scrim = document.getElementById('scrim');
  const skip = document.getElementById('skip-link');
  const mobile = matchMedia('(max-width: 840px)');
  const storeKey = 'cs201-lab-study-v1';
  const saved = readProgress();
  const solved = new Set(Array.isArray(saved.solved) ? saved.solved : []);
  const drafts = new Map();
  let language = saved.language === 'en' ? 'en' : 'zh';
  let lastLesson = ids.includes(saved.lastLesson?.id) ? saved.lastLesson : null;
  let dispose = null;
  let menu = null;

  const t = (x) => typeof x === 'object' && x !== null ? x[language] : String(x ?? '');
  const tabs = { learn: b('讲解', 'Learn'), lab: b('实验', 'Experiment'), quiz: b('练习', 'Practice') };
  const homeText = b('课程总览', 'Course overview');
  const referenceText = b('速查与术语', 'Reference & glossary');
  const javaText = b('Java 考点加练', 'Java exam practice');
  const codingText = CS201Workshop.title;
  const javaTabs = {
    api: { label: b('方法与参数', 'Methods & arguments'), href: '#java', lab: 'java-api',
      description: b('练 ArrayList 和 ArrayDeque 的参数、重载、返回值与异常。', 'Practice arguments, overloads, return values, and exceptions for ArrayList and ArrayDeque.') },
    nodes: { label: b('节点与引用', 'Nodes & references'), href: '#java/nodes', lab: 'java-nodes',
      description: b('跟着 Java 代码把链表、二叉树和递归返回值里的引用画出来。', 'Follow the Java code and trace references in a list, a binary tree, and a recursive return.') }
  };
  const chapterName = (id) => t(b('第 ' + pad(id) + ' 讲', 'Lecture ' + pad(id)));
  const lessonLink = (id, tab = 'learn') => '#lesson-' + id + (tab === 'learn' ? '' : '/' + tab);
  const groupOf = (id) => groups.find((x) => x.ids.includes(id));
  const solvedCount = (id) => lessons[id].questions.filter((_, i) => solved.has(id + '-' + i)).length;

  function readProgress() {
    try {
      const data = JSON.parse(localStorage.getItem(storeKey) ?? '{}');
      if (data && typeof data === 'object') return data;
    } catch {
      // Studying still works in browsers that restrict storage for local files.
    }
    return {};
  }

  function saveProgress() {
    try {
      localStorage.setItem(storeKey, JSON.stringify({ language, lastLesson, solved: [...solved] }));
    } catch {
      // Keep session state in memory when persistent storage is unavailable.
    }
  }

  function routeForHash() {
    if (location.hash === '#reference') return { type: 'reference' };
    if (location.hash === javaTabs.api.href) return { type: 'java', tab: 'api' };
    if (location.hash === javaTabs.nodes.href) return { type: 'java', tab: 'nodes' };
    const coding = /^#coding(?:\/([a-z-]+))?$/.exec(location.hash);
    if (coding) return { type: 'coding', id: coding[1] };
    const match = /^#lesson-(\d+)(?:\/(lab|quiz))?$/.exec(location.hash);
    if (match && ids.includes(Number(match[1]))) return { type: 'lesson', id: Number(match[1]), tab: match[2] ?? 'learn' };
    return { type: 'home' };
  }
  function link(label, href, css, more = {}) {
    return el('a', { href, class: css, ...more }, label);
  }
  function mark(css = '') {
    return el('span', { class: 'brand-mark ' + css, 'aria-hidden': 'true' },
      el('i', { class: 'brand-wire' }), el('i', { class: 'brand-dot a' }),
      el('i', { class: 'brand-dot b' }), el('i', { class: 'brand-dot c' }));
  }
  function smallIcon(name) {
    const glyphs = { home: '⌂', reference: '≡', menu: '☰', learn: '▤', lab: '◇', quiz: '✓', java: '⌘', coding: '⌨' };
    return el('span', { class: 'small-icon', 'aria-hidden': 'true' }, glyphs[name]);
  }

  function updateProgress() {
    const completed = ids.filter((id) => solvedCount(id) === lessons[id].questions.length).length;
    const passed = ids.reduce((sum, id) => sum + solvedCount(id), 0);
    const footer = sidebar.querySelector('.study-progress');
    if (footer) {
      footer.querySelector('b').textContent = completed + ' / ' + ids.length;
      footer.querySelector('progress').value = passed;
      footer.querySelector('.progress-caption').textContent = t(b(passed + ' / ' + allQuestions + ' 道题已答对', passed + ' / ' + allQuestions + ' questions correct'));
    }
    const lesson = routeForHash();
    const quota = main.querySelector('.lesson-quota');
    if (quota && lesson.type === 'lesson') quota.textContent = t(b(
      '本讲已答对 ' + solvedCount(lesson.id) + ' / ' + lessons[lesson.id].questions.length,
      solvedCount(lesson.id) + ' / ' + lessons[lesson.id].questions.length + ' correct'));
    for (const id of ids) {
      const done = solvedCount(id) === lessons[id].questions.length;
      const row = sidebar.querySelector('[data-chapter="' + id + '"]');
      if (!row) continue;
      row.querySelector('.nav-check').hidden = !done;
      row.classList.toggle('done', done);
    }
  }
  function navLink(label, href, active, contents, data) {
    return link(contents, href, 'nav-item' + (active ? ' active' : ''), {
      'aria-current': active ? 'page' : null, 'aria-label': label, data
    });
  }
  function buildSidebar(route) {
    sidebar.setAttribute('aria-label', t(b('课程导航', 'Course navigation')));
    sidebar.replaceChildren(
      link([mark(), el('span', { class: 'brand-copy' }, el('strong', {}, 'CS201 Lab'), el('small', {}, t(b('数据结构实验室', 'Data Structures Lab'))))],
        '#home', 'brand', { 'aria-label': t(homeText) }),
      el('nav', { class: 'course-nav' },
        navLink(t(homeText), '#home', route.type === 'home', [smallIcon('home'), el('span', {}, t(homeText))]),
        navLink(t(codingText), '#coding', route.type === 'coding', [smallIcon('coding'), el('span', {}, t(codingText))]),
        groups.map((group) =>
          el('div', { class: 'nav-group tone-' + group.theme },
            el('h2', {}, t(group.title)),
            group.ids.map((id) => navLink(chapterName(id) + ' ' + t(lessons[id].title), lessonLink(id),
              route.type === 'lesson' && route.id === id,
              [el('span', { class: 'nav-number mono' }, pad(id)),
                el('span', { class: 'nav-title' }, t(lessons[id].title)),
                el('span', { class: 'nav-check', hidden: true, 'aria-hidden': 'true' }, '✓')], { chapter: id })))),
        el('div', { class: 'nav-divider' },
          navLink(t(javaText), javaTabs.api.href, route.type === 'java', [smallIcon('java'), el('span', {}, t(javaText))]),
          navLink(t(referenceText), '#reference', route.type === 'reference', [smallIcon('reference'), el('span', {}, t(referenceText))]))),
      el('div', { class: 'study-progress' },
        el('div', { class: 'progress-title' }, el('span', {}, t(b('完成讲数', 'Lectures finished'))), el('b', { class: 'mono' }, '0 / 11')),
        el('progress', { value: 0, max: allQuestions, 'aria-label': t(b('练习完成进度', 'Practice progress')) }),
        el('div', { class: 'progress-caption' }))
    );
    sidebar.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => toggleNav(false)));
  }

  function toggleNav(open) {
    const expanded = mobile.matches && open;
    sidebar.classList.toggle('is-open', expanded);
    scrim.hidden = !expanded;
    sidebar.inert = mobile.matches && !expanded;
    menu?.setAttribute('aria-expanded', String(expanded));
  }
  mobile.addEventListener('change', () => toggleNav(false));
  scrim.addEventListener('click', () => { toggleNav(false); menu?.focus(); });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && sidebar.classList.contains('is-open')) {
      toggleNav(false);
      menu?.focus();
    }
  });
  skip.addEventListener('click', (event) => {
    event.preventDefault();
    main.focus();
    main.scrollIntoView({ block: 'start' });
  });

  function buildHeader(route) {
    menu = button(smallIcon('menu'), () => {
      const opening = !sidebar.classList.contains('is-open');
      toggleNav(opening);
      if (opening) sidebar.querySelector('a')?.focus();
    }, 'menu-button', { 'aria-label': t(b('课程菜单', 'Course menu')), 'aria-controls': 'sidebar' });
    const label = route.type === 'lesson' ? chapterName(route.id) + ' · ' + t(lessons[route.id].title)
      : t(route.type === 'java' ? javaText : route.type === 'coding' ? codingText : route.type === 'reference' ? referenceText : homeText);
    const locale = el('div', { class: 'locale-switch', role: 'group', 'aria-label': t(b('界面语言', 'Language')) },
      [['zh', '中', '中文'], ['en', 'EN', 'English']].map(([key, name, full]) => button(name, () => {
        if (language === key) return;
        language = key;
        saveProgress();
        render(false);
        bar.querySelector('[data-lang="' + key + '"]').focus();
      }, 'locale-button' + (key === language ? ' selected' : ''), {
        'aria-pressed': String(key === language), 'aria-label': full, data: { lang: key }
      })));
    bar.replaceChildren(
      el('div', { class: 'breadcrumb' }, menu,
        link('CS201', '#home', 'crumb-base'), el('span', { class: 'crumb-slash', 'aria-hidden': 'true' }, '/'),
        el('span', { class: 'crumb-current' }, label)),
      el('div', { class: 'top-actions' },
        link([smallIcon('reference'), t(referenceText)], '#reference', 'reference-link'), locale));
    toggleNav(false);
  }

  function heroDemo() {
    const positions = { 8: [156, 25], 4: [88, 84], 12: [224, 84], 2: [50, 144], 6: [122, 144], 10: [188, 144], 14: [262, 144] };
    const activeEdges = [[8, 4], [8, 12], [4, 2], [4, 6], [12, 10], [12, 14]];
    const graph = el('div', { class: 'hero-graph', 'aria-hidden': 'true' });
    const edges = new Map();
    for (const [a, child] of activeEdges) {
      const wire = CS201Visuals.wire(...positions[a], ...positions[child], child === 6 ? 'hero-edge ghost' : 'hero-edge');
      edges.set(child, wire);
      graph.append(wire);
    }
    const nodes = new Map();
    for (const [key, [x, y]] of Object.entries(positions)) {
      const node = el('div', { class: 'hero-node mono' + (key === '8' ? ' root' : '') + (key === '6' ? ' placeholder' : '') }, key === '6' ? '+' : key);
      node.style.left = x + 'px';
      node.style.top = y + 'px';
      nodes.set(Number(key), node);
      graph.append(node);
    }
    let pending = [];
    let stage = 0;
    const trace = el('span', { class: 'hero-trace mono', role: 'status' }, t(b('目标键 6', 'Key to insert: 6')));
    const action = button(t(b('▶ 插入 6', '▶ Insert 6')), () => {
      pending.forEach(clearTimeout);
      pending = [];
      if (stage) {
        for (const node of nodes.values()) node.classList.remove('highlight');
        for (const edge of edges.values()) edge.classList.remove('highlight');
        nodes.get(6).classList.add('placeholder');
        nodes.get(6).textContent = '+';
        trace.textContent = t(b('目标键 6', 'Key to insert: 6'));
        action.textContent = t(b('▶ 插入 6', '▶ Insert 6'));
        stage = 0;
        return;
      }
      stage = 1;
      nodes.get(8).classList.add('highlight');
      trace.textContent = t(b('6 < 8，向左', '6 < 8, go left'));
      const left = () => {
        edges.get(4).classList.add('highlight');
        nodes.get(4).classList.add('highlight');
        trace.textContent = t(b('6 > 4，向右', '6 > 4, go right'));
      };
      const insert = () => {
        edges.get(6).classList.add('highlight');
        nodes.get(6).classList.remove('placeholder');
        nodes.get(6).classList.add('highlight');
        nodes.get(6).textContent = '6';
        trace.textContent = t(b('已接到 4 的右侧', 'Inserted at 4.right'));
        action.textContent = t(b('↺ 重来', '↺ Replay'));
        action.disabled = false;
      };
      if (reducedMotion()) {
        left();
        insert();
      } else {
        action.disabled = true;
        pending = [setTimeout(left, 560), setTimeout(insert, 1200)];
      }
    }, 'hero-play', { data: { heroPlay: '' } });
    dispose = () => pending.forEach(clearTimeout);
    return el('div', { class: 'hero-demo' }, el('div', { class: 'hero-demo-head' },
      el('span', { class: 'hero-demo-dot', 'aria-hidden': 'true' }), t(b('二叉搜索树', 'Binary search tree'))),
    graph, el('div', { class: 'hero-demo-footer' }, trace, action));
  }

  function home() {
    const content = el('div', { class: 'overview' });
    const start = lastLesson
      ? link([t(b('继续第 ' + pad(lastLesson.id) + ' 讲', 'Resume Lecture ' + pad(lastLesson.id))), el('span', { 'aria-hidden': 'true' }, '→')],
        lessonLink(lastLesson.id, lastLesson.tab), 'button hero-primary')
      : link([t(b('从第 9 讲开始', 'Start Lecture 9')), el('span', { 'aria-hidden': 'true' }, '→')], lessonLink(9), 'button hero-primary');
    const roadmap = el('section', { id: 'roadmap', class: 'roadmap' },
      el('div', { class: 'roadmap-top' },
        el('div', {}, el('h2', {}, t(b('学习路线', 'Learning roadmap'))),
          el('p', {}, t(b('从上往下学。每一讲都可以先读、再动手、最后练习。', 'Work from top to bottom. Read, experiment, and practice in each lecture.')))),
        el('div', { class: 'roadmap-count' },
          el('b', { class: 'mono' }, ids.length), t(b(' 讲', ' lectures')),
          el('span', { 'aria-hidden': 'true' }, '·'),
          el('b', { class: 'mono' }, allQuestions), t(b(' 题', ' questions')))),
      groups.map((group) => el('section', { class: 'roadmap-group tone-' + group.theme },
        el('div', { class: 'group-line' }, el('span', { 'aria-hidden': 'true' }), el('h3', {}, t(group.title))),
        el('div', { class: 'course-grid' }, group.ids.map((id) => {
          const l = lessons[id];
          return link([el('div', { class: 'course-card-top' }, el('span', { class: 'course-icon', 'aria-hidden': 'true' }, l.art),
            el('span', { class: 'course-lecture mono' }, chapterName(id))),
          el('h4', {}, t(l.title)), el('p', {}, t(l.lab)),
          el('span', { class: 'card-arrow' }, t(b('开始学习', 'Open lesson')), el('span', { 'aria-hidden': 'true' }, '↗'))],
          lessonLink(id), 'course-card');
        })))));
    content.append(el('section', { class: 'hero' },
      el('div', { class: 'hero-copy' },
        el('div', { class: 'hero-kicker mono' }, t(b('CS201  /  第 09–19 讲', 'CS201  /  LECTURES 09–19'))),
        el('h1', {}, t(b('从零读懂', 'Learn data')), el('br'), el('span', {}, t(b('数据结构', 'structures by doing')))),
        el('p', {}, t(b('拖动曲线、追踪指针、亲手旋转一棵树。跟着课件的顺序，把每一步做明白。', 'Drag a curve, follow a pointer, and rotate a tree. Work through the lecture sequence one operation at a time.'))),
        el('div', { class: 'hero-buttons' }, start,
          button(t(b('查看学习路线', 'View roadmap')), () => roadmap.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' }), 'button hero-secondary'))),
      heroDemo()),
      el('section', { class: 'exam-entry surface' },
        el('div', {}, el('h2', {}, t(javaText)),
          el('p', {}, t(b('从课堂代码练 Box 扩容、节点接线和 Java 方法重载。', 'Use classroom code to practice Box growth, node wiring, and Java overloads.')))),
        el('div', { class: 'exam-actions' },
          link(t(b('辨析方法 →', 'Compare methods →')), javaTabs.api.href, 'button compact primary'),
          link(t(b('追踪节点 →', 'Trace nodes →')), javaTabs.nodes.href, 'button compact'))),
      el('section', { class: 'exam-entry surface' },
        el('div', {}, el('h2', {}, t(codingText)),
          el('p', {}, t(b('补全三道作业题，再用递归、双端队列和节点练挑战题。', 'Complete three assignment problems, then try more challenges with recursion, deques, and nodes.')))),
        el('div', { class: 'exam-actions' },
          link(t(b('做编程题 →', 'Try coding problems →')), '#coding', 'button compact primary'),
          link(t(b('打开编辑器 →', 'Open editor →')), '#coding/free', 'button compact'))),
      roadmap);
    return content;
  }

  function table(data) {
    return el('div', { class: 'table-scroll', tabindex: '0', role: 'region', 'aria-label': t(b('可横向滚动的表格', 'Horizontally scrollable table')) },
      el('table', { class: 'course-table' },
        el('thead', {}, el('tr', {}, data.headers.map((heading) => el('th', { scope: 'col' }, t(heading))))),
        el('tbody', {}, data.rows.map((row) => el('tr', {}, row.map((cell, i) =>
          i === 0 ? el('th', { scope: 'row' }, t(cell)) : el('td', {}, t(cell))))))));
  }

  function slideReference(pages, source) {
    const label = t(b('课件第 ' + pages + ' 页', 'Slides ' + pages));
    return source ? link(label + ' ↗', source + '#page=' + /^\d+/.exec(pages)[0],
      'slide-link', { target: '_blank', rel: 'noopener' }) : el('span', { class: 'slide-citation' }, label);
  }

  function codeBlock(code, compact = false) {
    return el('div', { class: 'code-block' + (compact ? ' exercise-code' : '') },
      el('div', { class: 'code-caption mono' }, 'Java'),
      el('pre', {}, el('code', {}, code)));
  }

  function jumpTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
  }

  function learn(id, lesson) {
    const local = location.protocol === 'file:' || ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
    const source = local ? '../' + ['CS201（2）', 'CS201', lectureFiles[id]].map(encodeURIComponent).join('/') : null;
    const supplement = lesson.chapters.findIndex((chapter) => chapter.classroom);
    const practiceLab = lesson.chapters.find((chapter) => chapter.labLink?.[1].startsWith('#java'))?.labLink[1];
    const codingProblems = CS201Coding.problems.filter((exercise) => exercise.lectures.includes(id));
    const body = el('div', { class: 'article-flow' },
      lesson.chapters.map((chapter, i) =>
        el('section', { class: 'surface article-section' + (chapter.classroom ? ' classroom-start' : ''), id: 'concept-' + i },
          el('h2', {}, t(chapter.title)),
          chapter.paragraphs.map((p) => el('p', {}, t(p))),
          chapter.table ? table(chapter.table) : null,
          chapter.after ? el('div', { class: 'section-note' }, t(chapter.after)) : null,
          chapter.code ? codeBlock(chapter.code) : null,
          chapter.pages ? slideReference(chapter.pages, source) : null,
          chapter.labLink ? link(t(chapter.labLink[0]), chapter.labLink[1], 'slide-link exam-lesson-link') : null)));
    const contents = el('aside', { class: 'article-aside' },
      el('div', { class: 'surface contents' }, el('h3', {}, t(b('本讲内容', 'In this lecture'))),
        lesson.chapters.map((section, i) => button(t(section.title), () => jumpTo('concept-' + i), 'contents-link'))),
      codingProblems.length ? el('div', { class: 'surface contents' },
        el('h3', {}, t(codingText)),
        el('div', { class: 'coding-lecture-links' }, codingProblems.map((item) =>
          link(t(item.title), '#coding/' + item.id, 'slide-link')))) : null,
      lesson.refs ? el('div', { class: 'surface contents api-links' }, el('h3', {}, t(b('Java 官方文档', 'Java API references'))),
        lesson.refs.map(([name, href]) => link(name + ' ↗', href, 'slide-link', { target: '_blank', rel: 'noopener' }))) : null);
    return el('div', {},
      el('div', { class: 'takeaway' }, el('span', { class: 'takeaway-icon', 'aria-hidden': 'true' }, lesson.art),
        el('div', {}, el('h2', {}, t(b('先记住这一点', 'Start with this idea'))), el('p', {}, t(lesson.takeaway))),
        link(t(b('去实验 →', 'Open experiment →')), lessonLink(id, 'lab'), 'button compact primary')),
      supplement >= 0 ? el('div', { class: 'lesson-supplement-links' },
        button(t(b('跳到课堂补充 ↓', 'Jump to the classroom examples ↓')), () => jumpTo('concept-' + supplement), 'button compact'),
        link(t(javaText), practiceLab ?? javaTabs.api.href, 'button compact quiet')) : null,
      el('div', { class: 'guide-layout' }, body, contents));
  }

  const levels = [
    [b('基础', 'Basics'), b('认清概念与返回值。', 'Recognize the basic rules and return values.')],
    [b('应用', 'Apply'), b('跟踪一次具体的操作。', 'Trace a concrete operation.')],
    [b('挑战', 'Challenge'), b('解释细节、边界与取舍。', 'Reason about details, edge cases, and trade-offs.')]
  ];

  function normalize(text) {
    return text.normalize('NFKC').trim().toUpperCase().replace(/[−–]/g, '-')
      .replace(/^[\[(\{]+|[\])\}]+$/g, '')
      .replaceAll('->', ' ').split(/[\s,、→;]+/).filter(Boolean)
      .map((word) => /^[+-]?\d+$/.test(word) ? String(Number(word)) : word);
  }
  function matching(given, expected) {
    const input = normalize(given);
    const answer = normalize(expected);
    if (input.join('|') === answer.join('|')) return true;
    return answer.length > 1 && answer.every((x) => /^[A-Z]$/.test(x))
      && /^[A-Z]+$/.test(input.join('')) && input.join('') === answer.join('');
  }

  function matchesJavaFragment(given, answers) {
    const tokenize = (value) => value.trim().replace(/;$/, '').match(/"[^"]*"|'[^']*'|[\w$]+|[^\s]/g)?.join(' ');
    const tokens = tokenize(given);
    return answers.some((answer) => tokens === tokenize(answer));
  }

  function exercise(id, q, i) {
    const key = id + '-' + i;
    if (!drafts.has(key)) drafts.set(key, { value: '', choice: null, order: [], hint: false, feedback: null });
    const draft = drafts.get(key);
    const check = el('span', { class: 'quiz-solved', hidden: !solved.has(key) }, t(b('✓ 已答对', '✓ Solved')));
    const area = el('div', { class: 'answer-area' });
    const hintId = 'hint-' + key;
    const hint = el('div', { class: 'quiz-hint', hidden: !draft.hint, id: hintId },
      el('strong', {}, t(b('提示 ', 'Hint '))), t(q.hint));
    const feedback = el('div', { class: 'quiz-feedback', role: 'status', 'aria-live': 'polite' });
    const promptId = 'prompt-' + key;
    const form = el('form', { class: 'surface exercise', on: { submit: submit }, 'aria-labelledby': promptId },
      el('div', { class: 'exercise-top' },
        el('span', { class: 'exercise-no mono' }, t(b('第 ' + (i + 1) + ' 题', 'Question ' + (i + 1)))), check),
      el('h3', { id: promptId }, t(q.prompt)), q.code ? codeBlock(q.code, true) : null, area,
      el('div', { class: 'quiz-actions' },
        el('button', { type: 'submit', class: 'button primary compact' }, t(b('检查答案', 'Check answer'))),
        button(t(b('提示', 'Hint')), (event) => {
          draft.hint = !draft.hint;
          hint.hidden = !draft.hint;
          event.currentTarget.setAttribute('aria-expanded', String(draft.hint));
        }, 'button compact', { 'aria-controls': hintId, 'aria-expanded': String(draft.hint) }),
        button(t(b('看解析', 'Show solution')), () => {
          draft.feedback = 'solution';
          renderFeedback();
        }, 'button compact quiet')),
      hint, feedback);

    function orderChoices(focusIndex) {
      area.replaceChildren(
        el('div', { class: 'order-bank' }, q.options.map((item, j) => {
          const rank = draft.order.indexOf(j);
          return button([el('span', { class: 'choice-letter mono' }, rank >= 0 ? rank + 1 : '＋'), t(item)], () => {
            if (rank >= 0) draft.order.splice(rank, 1);
            else draft.order.push(j);
            orderChoices(j);
          }, 'order-choice' + (rank >= 0 ? ' ranked' : ''), {
            'aria-pressed': String(rank >= 0), data: { order: j }
          });
        })),
        el('div', { class: 'order-preview' }, el('span', {}, t(b('已选顺序', 'Selected order'))),
          draft.order.length ? draft.order.map((j) => t(q.options[j])).join('　→　')
            : t(b('点击上面的步骤来排列', 'Select the steps above in order'))),
        draft.order.length ? button(t(b('清空顺序', 'Clear order')), () => { draft.order = []; orderChoices(0); }, 'button compact quiet') : null);
      if (focusIndex != null) area.querySelector('[data-order="' + focusIndex + '"]')?.focus();
    }
    if (q.kind === 'choice') area.append(el('div', { class: 'choice-bank', role: 'radiogroup', 'aria-labelledby': promptId },
      q.options.map((option, j) => el('label', { class: 'choice' },
        el('input', { type: 'radio', name: 'q-' + key, checked: draft.choice === j,
          on: { change: () => { draft.choice = j; } } }),
        el('span', { class: 'choice-face' }, el('span', { class: 'choice-letter mono' }, String.fromCharCode(65 + j)), t(option))))));
    else if (q.kind === 'input') area.append(el('input', {
      class: 'answer-input mono', value: draft.value, maxLength: 160, autoComplete: 'off', spellcheck: false,
      placeholder: q.placeholder ?? t(q.javaAnswers
        ? b('输入 Java 代码，区分大小写', 'Enter Java code, case-sensitive')
        : b('输入你的答案', 'Enter your answer')),
      'aria-label': t(b('你的答案', 'Your answer')), on: { input: (event) => { draft.value = event.target.value; } }
    }));
    else orderChoices();

    function submit(event) {
      event.preventDefault();
      let neutral;
      let right;
      if (q.kind === 'choice') { neutral = draft.choice === null; right = draft.choice === q.answer; }
      else if (q.kind === 'input') {
        neutral = draft.value.trim() === '';
        right = q.javaAnswers ? matchesJavaFragment(draft.value, q.javaAnswers) : matching(draft.value, q.answer);
      }
      else { neutral = draft.order.length !== q.answer.length; right = draft.order.join(',') === q.answer.join(','); }
      draft.feedback = neutral ? 'empty' : right ? 'correct' : 'incorrect';
      if (right && !neutral) {
        solved.add(key);
        check.hidden = false;
        saveProgress();
        updateProgress();
      }
      renderFeedback();
    }
    function renderFeedback() {
      const result = draft.feedback;
      feedback.hidden = !result;
      feedback.className = 'quiz-feedback ' + (result ?? '');
      if (!result) {
        feedback.replaceChildren();
        return;
      }
      if (result === 'empty' || result === 'incorrect') {
        feedback.textContent = t(result === 'empty'
          ? b('先完成作答，再检查。', 'Finish your answer before checking.')
          : b('再试一次。可以先看提示，再把每一步写下来。', 'Try again. Open the hint and write out each step.'));
        return;
      }
      const answer = q.kind === 'choice' ? t(q.options[q.answer])
        : q.kind === 'order' ? q.answer.map((n) => t(q.options[n])).join('　→　') : q.answer;
      feedback.replaceChildren(el('strong', {}, t(result === 'correct' ? b('答对了', 'Correct') : b('答案', 'Answer')) + ' · ' + answer),
        el('p', {}, t(q.explanation)));
    }
    renderFeedback();
    return form;
  }

  function practice(id, lesson) {
    const advancedStart = levels.length * 2;
    const advanced = lesson.questions.slice(advancedStart);
    const base = levels.map(([title, hint], level) => el('section', { class: 'practice-level' },
      el('div', { class: 'practice-heading' }, el('h2', {}, t(title)), el('p', {}, t(hint))),
      lesson.questions.slice(level * 2, level * 2 + 2).map((q, i) => exercise(id, q, level * 2 + i))));
    return el('div', { class: 'practice' },
      advanced.length ? el('div', { class: 'practice-jump' },
        button(t(b('跳到 ' + advanced.length + ' 道进阶坑题 ↓', 'Jump to ' + advanced.length + ' exam traps ↓')),
          () => jumpTo('advanced-practice'), 'button compact primary')) : null,
      base,
      advanced.length ? el('section', { class: 'practice-level advanced-practice', id: 'advanced-practice' },
        el('div', { class: 'practice-heading' },
          el('h2', {}, t(b('进阶坑题', 'Exam traps'))),
          el('p', {}, t(b('盯紧声明类型、实参、引用与运行顺序。', 'Track declared types, arguments, references, and execution order.')))),
        advanced.map((q, i) => exercise(id, q, advancedStart + i))) : null);
  }
  function chapterNav(id) {
    const index = ids.indexOf(id);
    const before = ids[index - 1];
    const after = ids[index + 1];
    return el('nav', { class: 'chapter-nav', 'aria-label': t(b('切换课程', 'Switch lectures')) },
      before ? link([el('small', {}, t(b('← 上一讲', '← Previous lecture'))), t(lessons[before].title)], lessonLink(before), 'chapter-jump') : link(t(b('← 课程总览', '← Course overview')), '#home', 'chapter-jump'),
      after ? link([el('small', {}, t(b('下一讲 →', 'Next lecture →'))), t(lessons[after].title)], lessonLink(after), 'chapter-jump next')
        : link(t(b('速查与术语 →', 'Reference & glossary →')), '#reference', 'chapter-jump next'));
  }

  function chapterPage(id, tab) {
    const l = lessons[id];
    const group = groupOf(id);
    const header = el('div', { class: 'chapter-header' },
      el('div', { class: 'chapter-heading-copy' }, el('div', { class: 'chapter-kicker mono' }, chapterName(id) + '  /  ' + t(group.title)),
        el('h1', {}, t(l.title)), el('p', {}, t(l.intro))),
      el('span', { class: 'chapter-glyph', 'aria-hidden': 'true' }, l.art));
    const navigation = el('div', { class: 'chapter-toolbar' },
      el('nav', { class: 'chapter-tabs', 'aria-label': t(b('本讲导航', 'Lesson navigation')) },
        Object.entries(tabs).map(([key, label]) => link([smallIcon(key), t(label)], lessonLink(id, key),
          'chapter-tab' + (tab === key ? ' selected' : ''), { 'aria-current': tab === key ? 'page' : null }))),
      el('span', { class: 'lesson-quota mono' }));
    const out = el('div', { class: 'lesson-page tone-' + group.theme }, header, navigation);
    if (tab === 'learn') out.append(learn(id, l));
    if (tab === 'lab') {
      const panel = el('div', { class: 'lab-content' });
      dispose = mount(panel, id, t);
      out.append(panel, el('div', { class: 'practice-next' },
        link(t(b('做题检验一下 →', 'Try the practice questions →')), lessonLink(id, 'quiz'), 'button primary')));
    }
    if (tab === 'quiz') out.append(practice(id, l));
    out.append(chapterNav(id));
    return out;
  }

  function javaPage(tab) {
    const spec = javaTabs[tab];
    const panel = el('div', { class: 'lab-content' });
    dispose = mount(panel, spec.lab, t);
    const idsForPractice = tab === 'api' ? [10, 12, 13] : [11, 14, 15];
    return el('div', { class: 'lesson-page java-page tone-' + (tab === 'api' ? 'violet' : 'blue') },
      el('div', { class: 'chapter-header' },
        el('div', { class: 'chapter-heading-copy' },
          el('div', { class: 'chapter-kicker mono' }, 'JAVA SE 17'),
          el('h1', {}, t(javaText)), el('p', {}, t(spec.description))),
        el('span', { class: 'chapter-glyph', 'aria-hidden': 'true' }, tab === 'api' ? '⌘' : '↳')),
      el('div', { class: 'chapter-toolbar' },
        el('nav', { class: 'chapter-tabs', 'aria-label': t(javaText) },
          Object.entries(javaTabs).map(([key, item]) => link(t(item.label), item.href,
            'chapter-tab' + (tab === key ? ' selected' : ''), { 'aria-current': tab === key ? 'page' : null })))),
      panel,
      el('section', { class: 'surface exam-practice-links' },
        el('h2', {}, t(b('做进阶坑题', 'Try the exam traps'))),
        el('div', { class: 'exam-actions' }, idsForPractice.map((id) =>
          link(chapterName(id) + ' · ' + t(lessons[id].title) + ' ↗', lessonLink(id, 'quiz'), 'button compact')))));
  }

  function reference() {
    const grid = el('div', { class: 'glossary-grid' });
    const input = el('input', { type: 'search', class: 'glossary-search', autoComplete: 'off',
      placeholder: t(b('例如：平衡因子、LIFO、碰撞', 'For example: balance factor, LIFO, collision')),
      on: { input: filter } });
    const status = el('div', { class: 'glossary-count', role: 'status' });
    function filter() {
      const query = input.value.trim().toLowerCase();
      const matches = glossary.filter(([term, alias, definition]) =>
        [term.zh, term.en, alias, definition.zh, definition.en].some((x) => x.toLowerCase().includes(query)));
      status.textContent = t(b(matches.length + ' 个术语', matches.length + ' terms'));
      grid.replaceChildren(...matches.map(([term, alias, definition, id]) =>
        el('article', { class: 'term-card' }, el('h3', {}, t(term)), el('p', {}, t(definition)),
          link(chapterName(id) + ' ↗', lessonLink(id), 'slide-link'))));
    }
    filter();
    const rows = [
      ['ArrayList', b('get(i) O(1)', 'get(i) O(1)'), b('尾加摊还 O(1)，中间增删 O(n)', 'Append amortized O(1), middle edits O(n)'), 10],
      [b('单链表（有 tail）', 'Singly linked with tail'), 'get(i) O(n)', b('头部增删、尾加 O(1)，尾删 O(n)', 'Head edits and tail append O(1), tail removal O(n)'), 11],
      [b('双链表 / LinkedList', 'Doubly linked / LinkedList'), 'get(i) O(n)', b('两端增删 O(1)', 'End edits O(1)'), 11],
      [b('栈 / 链式', 'Linked stack'), 'peek O(1)', 'push / pop O(1)', 12],
      [b('队列 / 固定环', 'Queue / fixed ring'), 'peek O(1)', 'offer / poll O(1)', 13],
      ['BST', b('查找 O(h+1)', 'Search O(h+1)'), b('增删 O(h+1)，树高可达 n−1', 'Edits O(h+1), height may reach n−1'), 15],
      [b('二叉堆', 'Binary heap'), b('堆顶 O(1)，找任意键 O(n)', 'Root O(1), find arbitrary key O(n)'), 'offer / poll O(log n)', 16],
      ['AVL / TreeMap', b('查键 O(log n)', 'Key lookup O(log n)'), b('增删 O(log n)', 'Insert/remove O(log n)'), 17],
      [b('哈希表', 'Hash table'), b('分布良好时查找期望 O(1)', 'Expected O(1) lookup with good distribution'), b('负载可控时插入期望摊还 O(1)', 'Expected amortized O(1) insert at bounded load'), 19]
    ];
    return el('div', { class: 'reference-page' }, el('div', { class: 'chapter-header' },
      el('div', { class: 'chapter-heading-copy' }, el('h1', {}, t(referenceText)),
        el('p', {}, t(b('做题时先问：我要按下标、端点、优先级，还是按键取数据？', 'Start with the access pattern: index, end, priority, or key?'))))),
    el('section', { class: 'surface article-section' }, el('h2', {}, t(b('常用操作成本', 'Operation costs'))),
      el('p', {}, t(b('n 是元素数，h 是以边数计的树高。键散列和比较按常数成本估算。', 'n is the number of items and h is height in edges. Hashing and comparisons are treated as constant-time.'))),
      table({ headers: [b('结构', 'Structure'), b('读 / 查', 'Read / find'), b('新增 / 删除', 'Insert / remove')],
        rows: rows.map(([name, read, write]) => [name, read, write]) })),
    el('section', { class: 'surface article-section glossary' }, el('h2', {}, t(b('双语术语表', 'Bilingual glossary'))),
      el('label', { class: 'field' }, el('span', {}, t(b('搜索中文或英文', 'Search in Chinese or English'))), input), status, grid));
  }

  function render(navigate) {
    dispose?.();
    dispose = null;
    const route = routeForHash();
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    document.title = 'CS201 Lab · ' + (route.type === 'lesson' ? t(lessons[route.id].title)
      : route.type === 'java' ? t(javaText) : route.type === 'coding' ? t(codingText)
        : route.type === 'reference' ? t(referenceText) : t(b('数据结构实验室', 'Data Structures Lab')));
    skip.textContent = t(b('跳到内容', 'Skip to content'));
    scrim.setAttribute('aria-label', t(b('关闭导航', 'Close navigation')));
    if (route.type === 'lesson') {
      lastLesson = { id: route.id, tab: route.tab };
      saveProgress();
    }
    buildSidebar(route);
    buildHeader(route);
    let content;
    if (route.type === 'coding') {
      const workshop = CS201Workshop.open(route.id, t, language);
      dispose = workshop.dispose;
      content = workshop.element;
    } else {
      content = route.type === 'lesson' ? chapterPage(route.id, route.tab)
        : route.type === 'java' ? javaPage(route.tab)
          : route.type === 'reference' ? reference() : home();
    }
    main.replaceChildren(content);
    updateProgress();
    if (navigate) {
      window.scrollTo(0, 0);
      main.focus({ preventScroll: true });
    }
  }

  window.addEventListener('hashchange', () => render(true));
  render(false);
})();
