'use strict';

window.CS201UI = (() => {
  const { bi: b } = CS201;
  const labs = {};
  const sessions = new Map();
  const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  function el(tag, attributes = {}, ...children) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attributes)) {
      if (value == null) continue;
      if (key === 'class') node.className = value;
      else if (key === 'on') {
        for (const [event, handler] of Object.entries(value)) node.addEventListener(event, handler);
      } else if (key === 'data') Object.assign(node.dataset, value);
      else if (key in node) node[key] = value;
      else node.setAttribute(key, String(value));
    }
    for (const child of children.flat(Infinity)) {
      if (child != null && child !== false) node.append(child);
    }
    return node;
  }

  function button(text, action, css = 'button', attrs = {}) {
    return el('button', { type: 'button', class: css, on: { click: action }, ...attrs }, text);
  }

  function mount(host, id, t) {
    const lab = labs[id];
    if (!sessions.has(id)) sessions.set(id, {
      model: lab.seed(), pref: structuredClone(lab.pref ?? {}), frames: [], cursor: 0, speed: 1
    });
    const session = sessions.get(id);
    const pref = session.pref;
    let timer = 0;
    let locked = [];
    const memory = {};
    const fields = el('div', { class: 'lab-controls' });
    const stage = el('div', { class: 'lab-stage' });
    const message = el('div', { class: 'frame-message', role: 'status', 'aria-atomic': 'true' });
    const result = el('span', { class: 'frame-result', hidden: true });
    const alert = el('p', { class: 'lab-alert', role: 'alert', hidden: true });
    const stepCount = el('span', { class: 'step-count' });
    const progress = el('input', { class: 'timeline', type: 'range', min: '0', step: '1',
      'aria-label': t(b('动画时间轴', 'Animation timeline')), on: { input: seek } });
    const prev = transportButton('←', b('上一步', 'Previous step'), () => go(session.cursor - 1));
    const play = transportButton('▶', b('播放', 'Play'), () => {
      if (timer) {
        pause();
        sync();
      } else {
        if (session.cursor === session.frames.length - 1) session.cursor = 0;
        start();
        paint();
      }
    }, 'is-play');
    const next = transportButton('→', b('下一步', 'Next step'), () => go(session.cursor + 1), '', 'next-step');
    const end = transportButton('⇥', b('跳到最后一步', 'Jump to the last step'), () => go(session.frames.length - 1), '', 'finish-step');
    const speed = el('select', {
      class: 'speed-select', 'aria-label': t(b('播放速度', 'Playback speed')),
      on: { change: () => {
        session.speed = Number(speed.value);
        if (timer) {
          pause();
          start();
        }
      } }
    }, [0.5, 1, 2, 4].map((x) => el('option', { value: String(x) }, x + '×')));
    speed.value = String(session.speed);

    function transportButton(glyph, label, action, css = '', command = '') {
      return button(glyph, action, 'transport-button ' + css, {
        title: t(label), 'aria-label': t(label), data: command ? { command } : {}
      });
    }
    const transport = el('div', { class: 'transport' },
      el('div', { class: 'transport-buttons' }, prev, play, next, end),
      progress, stepCount, speed);
    const title = el('div', { class: 'lab-head' },
      el('div', { class: 'lab-head-copy' },
        el('h2', {}, t(lab.title)),
        el('p', {}, t(lab.intro ?? CS201.lessons[id].lab))),
      button(t(b('↺ 重置', '↺ Reset')), reset, 'button compact quiet', { data: { labReset: '' } }));
    host.append(el('div', { class: 'surface lab-card' }, title, fields, alert,
      el('div', { class: 'frame-bar' }, el('span', { class: 'frame-light', 'aria-hidden': 'true' }), message, result),
      transport, stage));
    if (lab.tryIt) {
      host.append(el('aside', { class: 'surface try-card' },
        el('h3', {}, t(b('按这个顺序试一遍', 'Try this sequence'))),
        el('ol', {}, lab.tryIt.map((item) => el('li', {}, t(item))))));
    }

    function busy() { return session.cursor < session.frames.length - 1; }
    function pause() {
      if (timer) clearInterval(timer);
      timer = 0;
    }
    function start() {
      if (session.frames.length < 2) return;
      timer = setInterval(() => {
        session.cursor++;
        if (!busy()) pause();
        paint();
      }, 620 / session.speed);
    }
    function seek() { go(Number(progress.value)); }
    function go(index) {
      pause();
      session.cursor = Math.max(0, Math.min(index, session.frames.length - 1));
      paint();
    }
    function noteError(content) {
      alert.hidden = !content;
      alert.textContent = content ? t(content) : '';
    }
    function sync() {
      const max = Math.max(0, session.frames.length - 1);
      progress.max = String(max);
      progress.value = String(session.cursor);
      progress.disabled = max === 0;
      transport.hidden = lab.static === true;
      prev.disabled = session.cursor === 0;
      next.disabled = end.disabled = !busy();
      play.disabled = max === 0;
      const playLabel = timer ? t(b('暂停', 'Pause')) : t(b('播放', 'Play'));
      play.title = playLabel;
      play.setAttribute('aria-label', playLabel);
      play.textContent = timer ? 'Ⅱ' : '▶';
      stepCount.textContent = session.frames.length ? (session.cursor + 1) + ' / ' + session.frames.length : '—';
      progress.setAttribute('aria-valuetext', stepCount.textContent);
      locked.forEach((node) => { node.disabled = busy(); });
    }
    function paint() {
      const f = session.frames[session.cursor] ?? {
        model: session.model, message: lab.ready, marks: []
      };
      const scroll = Array.from(stage.querySelectorAll('[data-scroll]'), (n) => [n.scrollLeft, n.scrollTop]);
      stage.replaceChildren(lab.view(f, api));
      stage.querySelectorAll('[data-scroll]').forEach((n, i) => {
        if (scroll[i]) [n.scrollLeft, n.scrollTop] = scroll[i];
        const active = n.querySelector('.is-active');
        if (!active || !session.frames.length) return;
        const panel = n.getBoundingClientRect();
        const box = active.getBoundingClientRect();
        if (box.right > panel.right - 8) n.scrollLeft += box.right - panel.right + 22;
        if (box.left < panel.left + 8) n.scrollLeft += box.left - panel.left - 22;
        if (box.bottom > panel.bottom - 8) n.scrollTop += box.bottom - panel.bottom + 22;
        if (box.top < panel.top + 8) n.scrollTop += box.top - panel.top - 22;
      });
      message.textContent = t(f.message);
      result.hidden = !Object.hasOwn(f, 'result');
      result.textContent = result.hidden ? '' : t(b('返回', 'Returns')) + '  ' +
        (f.walk ? f.result : CS201Models.fmt(f.result));
      sync();
    }
    function setFrames(frames) {
      pause();
      noteError(null);
      session.frames = frames;
      session.model = frames.at(-1).model;
      session.cursor = 0;
      if (frames.length > 1 && !reducedMotion()) start();
      paint();
    }
    function newModel(model, keepControls = true, notice = null) {
      pause();
      noteError(null);
      session.frames = notice ? [{ model, message: notice, marks: [] }] : [];
      session.model = model;
      session.cursor = 0;
      if (!keepControls) setup();
      paint();
    }
    function reset() {
      for (const key of Object.keys(pref)) delete pref[key];
      Object.assign(pref, structuredClone(lab.pref ?? {}));
      newModel(lab.seed(), false);
    }
    function setup() {
      const active = document.activeElement;
      const focusKey = fields.contains(active) && ['field', 'select', 'action'].find((key) => active.dataset[key]);
      locked = [];
      fields.replaceChildren();
      if (lab.setup) lab.setup(api);
      if (focusKey) {
        fields.querySelector('[data-' + focusKey + '="' + active.dataset[focusKey] + '"]')?.focus();
      }
    }
    function field(key, label, options = {}) {
      const input = el('input', { type: 'text', value: String(pref[key] ?? ''), autoComplete: 'off',
        spellcheck: false, data: { field: key }, ...options,
        on: { input: () => { pref[key] = input.value; noteError(null); } } });
      return el('label', { class: 'field' }, el('span', {}, t(label)), input);
    }
    function number(key, label, min = -999, max = 999) {
      return field(key, label, { type: 'number', step: '1', min: String(min), max: String(max),
        inputMode: 'numeric', class: 'number-field' });
    }
    function integer(key, min = -999, max = 999) {
      const raw = String(pref[key] ?? '').trim();
      const value = Number(raw);
      if (/^[+-]?\d+$/.test(raw) && Number.isInteger(value) && value >= min && value <= max) return value;
      noteError(b('请输入 ' + min + ' 到 ' + max + ' 之间的整数。', 'Enter an integer from ' + min + ' to ' + max + '.'));
      fields.querySelector('[data-field="' + key + '"]')?.focus();
      return undefined;
    }
    function select(key, label, choices, onChange, lock = false) {
      const choicesNode = el('select', { data: { select: key }, on: { change: () => {
        pref[key] = choicesNode.value;
        noteError(null);
        onChange?.(choicesNode.value);
      } } }, Object.entries(choices).map(([value, name]) => el('option', { value }, t(name))));
      choicesNode.value = String(pref[key]);
      if (lock) locked.push(choicesNode);
      return el('label', { class: 'field' }, el('span', {}, t(label)), choicesNode);
    }
    function action(key, label, exec, tone = '', lock = true) {
      const node = button(t(label), () => {
        noteError(null);
        exec();
      }, 'button compact ' + tone, { data: { action: key } });
      if (lock) locked.push(node);
      return node;
    }
    function row(...items) { fields.append(el('div', { class: 'control-row' }, items)); }

    const api = {
      t, pref, memory, field, number, select, integer, action, row, setFrames, newModel, paint, setup,
      noteError, reducedMotion, model: () => session.model,
      intAction(key, label, fieldKey, execute, tone) {
        return action(key, label, () => {
          const value = integer(fieldKey);
          if (value !== undefined) setFrames(execute(session.model, value));
        }, tone);
      }
    };
    setup();
    paint();
    return () => {
      pause();
      memory.chartObserver?.disconnect();
    };
  }

  return { el, button, reducedMotion, mount, labs };
})();
