'use strict';

window.CS201Workshop = (() => {
  const { bi: b, lessons } = CS201;
  const { el, button } = CS201UI;
  const { problems, free } = CS201Coding;
  const title = b('Java 编程工坊', 'Java coding workshop');
  const levelOrder = { Foundations: 0, Stretch: 1, Challenge: 2 };
  const drafts = new Map();
  const link = (label, href, css) => el('a', { href, class: css }, label);
  const courseLink = (id, t) => link(t(lessons[id].title), '#lesson-' + id, 'coding-topic');
  const newline = (text) => text.replace(/\r\n?/g, '\n');

  function readDraft(exercise) {
    if (drafts.has(exercise.id)) return drafts.get(exercise.id);
    const initial = { code: exercise.starter, className: exercise.className, input: exercise.tests?.[0].input ?? '', testIndex: exercise.tests ? 0 : -1 };
    try {
      const saved = JSON.parse(localStorage.getItem('cs201-java-draft:' + exercise.id));
      if (typeof saved?.code === 'string') initial.code = saved.code;
      if (typeof saved?.className === 'string') initial.className = saved.className;
      if (typeof saved?.input === 'string') initial.input = saved.input;
      if (Number.isInteger(saved?.testIndex) && saved.testIndex >= -1 && saved.testIndex < (exercise.tests?.length ?? 0)) {
        initial.testIndex = saved.testIndex;
      }
    } catch {
      // Keep drafts in memory when storage is unavailable.
    }
    drafts.set(exercise.id, initial);
    return initial;
  }

  function header(text, summary, action, t) {
    return el('div', { class: 'chapter-header' },
      el('div', { class: 'chapter-heading-copy' }, el('h1', {}, t(text)), el('p', {}, t(summary))),
      action);
  }

  function catalog(t) {
    const card = (item) => link([
      el('div', { class: 'coding-card-meta' },
        el('span', { class: 'mono' }, item.className + '.java'), el('span', { class: 'coding-level' }, t(item.level))),
      el('h3', {}, t(item.title)), el('p', {}, t(item.summary)),
      el('span', { class: 'coding-card-action' }, t(b('打开题目', 'Open problem')), el('span', { 'aria-hidden': 'true' }, '↗'))
    ], '#coding/' + item.id, 'coding-card');
    return el('div', { class: 'coding-page tone-violet' },
      header(title, b('读题、写代码，用标准输入和边界测试检验结果。', 'Read a problem, write Java, and check the output against sample and edge cases.'),
        link(t(b('打开自由编辑器 →', 'Open free editor →')), '#coding/free', 'button primary'), t),
      ...[
        [b('作业原题', 'Assignment problems'), problems.filter((item) => item.assigned)],
        [b('同类加练', 'Related challenges'), problems.filter((item) => !item.assigned)
          .sort((left, right) => levelOrder[left.level.en] - levelOrder[right.level.en])]
      ].map(([heading, items]) => el('section', { class: 'coding-collection' },
        el('h2', {}, t(heading)), el('div', { class: 'coding-grid' }, items.map(card)))));
  }

  function editor(exercise, t, language) {
    const tests = exercise.tests ?? [];
    const draft = readDraft(exercise);
    let job = null;
    let disposed = false;
    let results = [];
    let lastEvidence = null;
    const source = el('textarea', {
      class: 'coding-source mono', value: draft.code, wrap: 'off', spellcheck: false, autocapitalize: 'off',
      autocorrect: 'off', autocomplete: 'off', 'aria-label': t(b('Java 源代码', 'Java source code'))
    });
    const gutter = el('pre', { class: 'coding-gutter mono', 'aria-hidden': 'true' });
    const entry = el('input', {
      class: 'coding-class mono', type: 'text', value: draft.className, spellcheck: false, autocapitalize: 'off',
      autocomplete: 'off', maxLength: 64
    });
    const stdin = el('textarea', {
      id: 'coding-stdin', class: 'coding-stdin mono', rows: 3, value: draft.input, spellcheck: false,
      'aria-label': 'STDIN'
    });
    const preset = el('select', { class: 'coding-select', 'aria-label': t(b('选择输入用例', 'Choose an input case')) },
      tests.map((test, index) => el('option', { value: String(index) }, t(test.label))),
      el('option', { value: '-1' }, t(b('自定义输入', 'Custom input'))));
    preset.value = String(draft.testIndex);
    const expected = el('pre', { class: 'coding-io mono' });
    const expectedBox = el('div', { class: 'coding-expected' },
      el('h3', {}, t(b('预期标准输出', 'Expected stdout'))), expected);
    const runButton = button(t(b('运行', 'Run')), () => run(false, false), 'button primary');
    const allButton = tests.length ? button(t(b('检查全部用例', 'Check all cases')), () => run(false, true)) : null;
    const stopButton = button(t(b('停止', 'Stop')), () => {
      job?.abort();
      setStatus(b('运行已停止。', 'Run stopped.'), 'neutral');
    }, 'button', { disabled: true });
    const referenceButton = tests.length ? button(t(b('运行参考解', 'Run reference solution')), () => run(true, true), 'button compact') : null;
    const status = el('p', { class: 'coding-status', role: 'status', 'aria-atomic': 'true' });
    const resultList = el('div', { class: 'coding-results', 'aria-label': t(b('用例结果', 'Case results')) });
    const output = el('div', { class: 'coding-output' });
    const diagnostics = el('details', { class: 'coding-detail', hidden: true },
      el('summary', {}, t(b('编译器诊断', 'Compiler diagnostics'))), el('pre', { class: 'coding-io mono' }));
    const nothing = t(b('（无输出）', '(no output)'));
    const blankLine = t(b('（空行）', '(blank line)'));
    const format = (value) => value === '' ? nothing : newline(value) === '\n' ? blankLine : value;

    function remember() {
      Object.assign(draft, { code: source.value, className: entry.value, input: stdin.value, testIndex: Number(preset.value) });
      try {
        localStorage.setItem('cs201-java-draft:' + exercise.id, JSON.stringify(draft));
      } catch {
        // The current browser session still retains the draft.
      }
    }

    function updateGutter() {
      const count = source.value.split('\n').length;
      gutter.textContent = Array.from({ length: count }, (_, i) => i + 1).join('\n');
      gutter.scrollTop = source.scrollTop;
    }

    function updateExpected() {
      const test = tests[Number(preset.value)];
      expectedBox.hidden = !test;
      expected.textContent = test ? format(test.output) : '';
    }

    function setStatus(message, state = 'neutral') {
      status.textContent = t(message);
      status.dataset.state = state;
    }

    function showDiagnostics(detail) {
      diagnostics.hidden = !detail;
      diagnostics.open = Boolean(detail);
      diagnostics.querySelector('pre').textContent = detail;
    }

    function showResult(record, index) {
      for (const [position, item] of [...resultList.children].entries()) {
        item.setAttribute('aria-pressed', String(position === index));
      }
      const block = (label, value) => el('div', {},
        el('h3', {}, t(label)), el('pre', { class: 'coding-io mono' }, format(value)));
      const sections = [el('p', { class: 'coding-result-name' }, record.label),
        block(b('程序标准输出', 'Program stdout'), record.stdout),
        record.expected != null ? block(b('预期标准输出', 'Expected stdout'), record.expected) : null,
        record.stderr ? block(b('标准错误 / 异常', 'Stderr / exception'), record.stderr) : null];
      output.replaceChildren(...sections.filter(Boolean));
    }

    function showResults() {
      const names = {
        passed: b('通过', 'Pass'), wrong: b('输出不符', 'Mismatch'), ok: b('已运行', 'Ran'),
        runtime: b('运行异常', 'Runtime error'), limit: b('超出运行限制', 'Limit exceeded')
      };
      resultList.replaceChildren(...results.map((record, index) =>
        button(record.label + ' · ' + t(names[record.state]), () => showResult(record, index), 'coding-result-button', {
          data: { state: record.state }, 'aria-pressed': 'false'
        })));
      const index = results.findIndex((record) => !['passed', 'ok'].includes(record.state));
      if (results.length) showResult(results[index < 0 ? 0 : index], index < 0 ? 0 : index);
    }

    function lock(busy) {
      runButton.disabled = busy;
      if (allButton) allButton.disabled = busy;
      if (referenceButton) referenceButton.disabled = busy;
      stopButton.disabled = !busy;
    }

    async function run(reference, all) {
      if (job) return;
      const className = reference ? exercise.className : entry.value.trim();
      const code = reference ? exercise.solution : source.value;
      if (!/^[A-Za-z_$][A-Za-z0-9_$]{0,63}$/.test(className)) {
        setStatus(b('主类名应是简单的 Java 标识符，例如 Main。', 'Enter a simple Java class name, such as Main.'), 'error');
        return;
      }
      if (!code.trim()) {
        setStatus(b('请先在编辑器里写代码。', 'Write Java code in the editor first.'), 'error');
        return;
      }
      const selected = tests[Number(preset.value)];
      const cases = all ? tests : [{ label: selected?.label ?? b('自定义输入', 'Custom input'), input: stdin.value, output: selected?.output }];
      const controller = new AbortController();
      job = controller;
      results = [];
      lastEvidence = null;
      output.replaceChildren();
      resultList.replaceChildren();
      showDiagnostics('');
      lock(true);
      setStatus(b('正在准备 Java 运行环境…', 'Preparing the Java runtime…'));
      try {
        const info = await CS201Java.run({
          className, source: code, inputs: cases.map((test) => test.input), signal: controller.signal,
          onPhase: (phase, index) => {
            if (phase === 'compiling') setStatus(b('正在编译…', 'Compiling…'));
            if (phase === 'running') setStatus(b('正在运行 ' + (index + 1) + ' / ' + cases.length + '…', 'Running ' + (index + 1) + ' / ' + cases.length + '…'));
          },
          onResult: (result, index) => {
            const test = cases[index];
            const state = result.status !== 'ok' ? result.status : test.output == null ? 'ok'
              : newline(result.stdout) === newline(test.output) ? 'passed' : 'wrong';
            results.push({ ...result, state, label: t(test.label), expected: test.output });
          }
        });
        showDiagnostics(info.diagnostics);
        showResults();
        const failed = results.findIndex((record) => !['ok', 'passed'].includes(record.state));
        const graded = results.some((record) => record.expected != null);
        const passed = results.filter((record) => record.state === 'passed').length;
        const label = reference ? t(b('参考解 · ', 'Reference · ')) : '';
        if (!reference && failed >= 0) lastEvidence = { code, input: cases[failed].input, result: results[failed] };
        const message = graded
          ? b(label + passed + ' / ' + cases.length + ' 个用例通过。', label + passed + ' / ' + cases.length + ' cases passed.')
          : failed < 0 ? b('运行完成。', 'Run complete.') : b('运行未成功，查看下面的结果。', 'Run failed. See the result below.');
        setStatus(message, failed < 0 ? 'success' : 'error');
      } catch (error) {
        if (controller.signal.aborted) return;
        const failure = {
          compile: b('编译失败，查看行号和诊断。', 'Compilation failed. See the line numbers and diagnostics.'),
          timeout: b('运行超时。可重试，或检查循环和递归终止条件。', 'The run timed out. Retry or check loop and recursion termination.'),
          limit: b('代码或输入超出本编辑器的长度限制。', 'The source or input exceeds the editor’s size limit.'),
          unavailable: b('Java 运行环境暂时无法连接。请稍后重试。', 'The Java runtime could not be reached. Try again later.')
        };
        showResults();
        showDiagnostics(error.detail ?? '');
        if (!reference && error.kind === 'compile') lastEvidence = { code, input: stdin.value, diagnostic: error.detail };
        setStatus(failure[error.kind] ?? failure.unavailable, 'error');
      } finally {
        if (job === controller) job = null;
        if (!disposed) lock(false);
      }
    }

    const selectTest = () => {
      const test = tests[Number(preset.value)];
      if (test) stdin.value = test.input;
      updateExpected();
      remember();
    };

    const problemPane = tests.length ? el('section', { class: 'surface coding-problem' },
      el('div', { class: 'coding-level' }, t(exercise.level)),
      el('h2', {}, t(b('题目要求', 'Problem'))), el('p', {}, t(exercise.description)),
      el('h3', {}, t(b('输入', 'Input'))), el('p', {}, t(exercise.input)),
      el('h3', {}, t(b('输出', 'Output'))), el('p', {}, t(exercise.output)),
      el('div', { class: 'coding-topics' }, exercise.lectures.map((id) => courseLink(id, t))),
      el('details', { class: 'coding-detail coding-reference' },
        el('summary', {}, t(b('参考解与思路', 'Reference solution and reasoning'))),
        el('p', {}, t(exercise.rationale)),
        el('pre', { class: 'coding-reference-code mono', tabindex: 0 }, el('code', {}, exercise.solution)),
        referenceButton)) : null;

    const hints = CS201JavaHints.mount(exercise, t, language, () => ({
      code: source.value,
      input: lastEvidence?.code === source.value ? lastEvidence.input : stdin.value,
      expected: lastEvidence?.code === source.value ? lastEvidence.result?.expected : tests[Number(preset.value)]?.output,
      evidence: lastEvidence?.code === source.value
        ? lastEvidence.diagnostic ?? (lastEvidence.result?.stdout + '\n' + lastEvidence.result?.stderr)
        : ''
    }));
    const consolePanel = el('section', { class: 'surface coding-console' },
      el('div', { class: 'coding-console-head' },
        el('h2', {}, t(b('Java 编辑器', 'Java editor'))),
        el('label', {}, el('span', {}, t(b('主类名', 'Entry class'))), entry)),
      el('div', { class: 'coding-edit-area' }, gutter, source),
      el('div', { class: 'coding-run-panel' },
        el('div', { class: 'coding-stdin-head' }, el('label', { htmlFor: 'coding-stdin' }, 'STDIN'), tests.length ? preset : null),
        stdin, expectedBox,
        el('div', { class: 'coding-actions' }, runButton, allButton, stopButton),
        el('p', { class: 'coding-note' }, t(CS201Java.note), ' ', el('a', {
          href: CS201Java.credit.href, target: '_blank', rel: 'noopener noreferrer'
        }, CS201Java.credit.label)),
        status, diagnostics, resultList, output));

    source.addEventListener('input', () => { updateGutter(); remember(); });
    source.addEventListener('scroll', () => { gutter.scrollTop = source.scrollTop; });
    source.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        run(false, false);
      }
    });
    entry.addEventListener('input', remember);
    preset.addEventListener('change', selectTest);
    stdin.addEventListener('input', () => {
      preset.value = '-1';
      updateExpected();
      remember();
    });
    updateGutter();
    updateExpected();
    const panel = el('div', { class: 'coding-page tone-violet' },
      el('nav', { class: 'coding-nav', 'aria-label': t(title) },
        link(t(b('← 全部题目', '← All problems')), '#coding', 'slide-link'),
        exercise.id === 'free' ? null : link(t(free.title), '#coding/free', 'slide-link')),
      header(exercise.title, exercise.summary ?? exercise.description, null, t),
      el('div', { class: 'coding-layout' + (tests.length ? '' : ' coding-layout-free') },
        problemPane ? el('div', { class: 'coding-left' }, problemPane, hints.element) : null,
        consolePanel, problemPane ? null : hints.element));
    return {
      element: panel,
      dispose() {
        disposed = true;
        job?.abort();
        hints.dispose();
      }
    };
  }

  function open(id, t, language) {
    const item = id === 'free' ? free : problems.find((problem) => problem.id === id);
    return item ? editor(item, t, language) : { element: catalog(t) };
  }

  return { title, open };
})();
