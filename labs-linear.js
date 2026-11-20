'use strict';

(() => {
  const { bi: b } = CS201;
  const { el, labs } = CS201UI;
  const { stat, stats, sub, empty, cells, sequence, chart } = CS201Visuals;
  const M = CS201Models;
  const index = b('下标', 'Index');
  const value = b('数值', 'Value');

  labs[9] = {
    title: b('增长曲线与循环计数器', 'Growth curves and loop counter'),
    ready: b('虚线标记当前 n。对数纵轴让相差几亿倍的值也能同屏比较。', 'The dashed line marks the current n. A log scale shows values that differ by hundreds of millions on one plot.'),
    seed: () => ({}), static: true,
    pref: { n: 12, scale: 'log', loop: 'triangle', active: [0, 1, 2, 3, 4, 5, 6] },
    setup(ui) {
      const count = el('output', { class: 'range-number mono', htmlFor: 'growth-n' }, ui.pref.n);
      const slider = el('input', { id: 'growth-n', type: 'range', min: '2', max: '32', value: ui.pref.n,
        on: { input: () => {
          ui.pref.n = Number(slider.value);
          count.value = slider.value;
          ui.paint();
        } } });
      ui.row(el('label', { class: 'field range-field' }, el('span', {}, ui.t(b('输入大小 n', 'Input size n')), count), slider),
        ui.select('scale', b('纵轴刻度', 'Y-axis'), { log: b('对数', 'Logarithmic'), linear: b('线性', 'Linear') }, ui.paint),
        ui.select('loop', b('循环样例', 'Loop example'), Object.fromEntries(Object.entries(M.loops).map(([key, x]) => [key, x.title])), ui.paint));
      ui.row(el('div', { class: 'curve-options', role: 'group', 'aria-label': ui.t(b('显示函数', 'Visible functions')) },
        M.curves.map((f, i) => {
          const control = el('input', { type: 'checkbox', checked: ui.pref.active.includes(i), on: { change: () => {
            ui.pref.active = ui.pref.active.filter((x) => x !== i);
            if (control.checked) ui.pref.active.push(i);
            ui.paint();
          } } });
          const color = el('i', { class: 'curve-dot' });
          color.style.backgroundColor = f.color;
          return el('label', { class: 'curve-toggle' }, control, el('span', { class: 'mono' }, color, f.name));
        })));
    },
    view(f, ui) {
      const { n, active, scale, loop } = ui.pref;
      const x = M.loops[loop];
      const counts = M.curves.map((curve, i) => active.includes(i)
        ? stat(curve.name, curve.count(n).toLocaleString('en-US', { maximumFractionDigits: 2 })) : null);
      return el('div', {}, chart(ui.t, n, active, scale, ui.memory),
        stats(...counts),
        el('div', { class: 'loop-card' },
          el('div', {}, sub(ui.t(b('数 tick() 的次数', 'Count calls to tick()'))), el('pre', { class: 'mini-code mono' }, x.code)),
          stats(stat('n', n), stat(ui.t(b('精确次数', 'Exact count')), x.count(n)), stat(ui.t(b('增长类别', 'Growth class')), x.growth))));
    },
    tryIt: [
      b('把 n 从 8 调到 16。比较 n、n²、2ⁿ 各变成原来的多少。', 'Move n from 8 to 16. Compare the factors by which n, n², and 2ⁿ grow.'),
      b('只留 n 和 n²，切换线性纵轴。再把循环样例切换到三角形和方形，比较同一个 n 的精确次数。', 'Keep n and n² and switch to a linear axis. Compare exact counts for the triangular and square loops at the same n.')
    ]
  };

  labs[10] = {
    title: b('动态数组工作台', 'Dynamic array workbench'),
    ready: b('起始数组正好装满。按 add(x) 观察扩容，或用 get(i) 直接读取。', 'The starting array is full. Press add(x) to watch a resize, or use get(i) for a direct read.'),
    seed: M.arraySeed, pref: { value: '99', index: '1' },
    setup(ui) {
      ui.row(ui.number('value', value), ui.number('index', index, 0, M.limits.array));
      const op = (name, label, needsIndex, needsValue, tone) => ui.action(name, label, () => {
        const i = needsIndex ? ui.integer('index', 0, M.limits.array) : null;
        if (i === undefined) return;
        const v = needsValue ? ui.integer('value') : null;
        if (v !== undefined) ui.setFrames(M.arrayAction(ui.model(), name, i, v));
      }, tone);
      ui.row(op('append', b('add(x) 追加', 'add(x) Append'), false, true, 'primary'),
        op('insert', b('add(i, x) 插入', 'add(i, x) Insert'), true, true),
        op('get', 'get(i)', true, false), op('set', 'set(i, x)', true, true),
        op('remove', 'remove(i)', true, false));
    },
    view(f, ui) {
      return el('div', { class: 'linear-visual' },
        stats(stat('size', f.model.size), stat('capacity', f.model.slots.length)),
        f.oldSlots ? [sub(ui.t(b('旧数组', 'Old array'))), cells(f.oldSlots, f.marks)] : null,
        sub(ui.t(f.oldSlots ? b('新数组', 'New array') : b('底层数组 · 0 起始下标', 'Backing array · zero-based indices'))),
        cells(f.model.slots, f.marks));
    },
    tryIt: [
      b('保留初始数据，追加 99。用“上一步”数一数复制了多少项。', 'Append 99 to the initial data. Use Previous step to count the copied items.'),
      b('在下标 1 插入 15，再删除下标 2。比较两次移动方向。', 'Insert 15 at index 1, then remove at index 2. Compare the directions of the shifts.')
    ]
  };

  const linkModes = { single: b('单链', 'Singly linked'), double: b('双链', 'Doubly linked'), circular: b('循环单链', 'Circular singly linked') };
  labs[11] = {
    title: b('引用与连线工作台', 'Reference and link workbench'),
    ready: b('每个节点有独立编号。观察 next 和 prev 指到哪个编号。', 'Each node has its own ID. Watch where next and prev point.'),
    seed: M.linkedSeed, pref: { mode: 'single', index: '1', value: '25' },
    setup(ui) {
      ui.row(ui.select('mode', b('结构', 'Structure'), linkModes, (mode) => {
        const m = ui.model();
        ui.newModel(M.linkedSeed(mode, m.ids.map((id) => m.nodes[id].value)), true,
          b('用相同的数据顺序展示所选链表结构。', 'Show the selected link structure with the same value order.'));
      }, true), ui.number('index', index, 0, M.limits.linked), ui.number('value', value));
      const op = (name, label, needsIndex, needsValue, tone) => ui.action(name, label, () => {
        const i = needsIndex ? ui.integer('index', 0, M.limits.linked) : null;
        if (i === undefined) return;
        const v = needsValue ? ui.integer('value') : null;
        if (v !== undefined) ui.setFrames(M.linkedAction(ui.model(), name, i, v));
      }, tone);
      ui.row(op('insert', b('按下标插入', 'Insert at index'), true, true, 'primary'),
        op('append', b('尾插', 'Append'), false, true),
        op('remove', b('按下标删', 'Remove at index'), true, false),
        op('remove-head', b('删头', 'Remove head'), false, false),
        op('remove-tail', b('删尾', 'Remove tail'), false, false),
        op('find', b('查找值', 'Find value'), false, true));
    },
    view(f, ui) {
      const m = f.model;
      const name = (x) => x == null ? 'null' : '#' + x;
      const order = [...m.ids];
      if (f.pending) order.splice(f.pendingIndex, 0, f.pending);
      return el('div', { class: 'linear-visual' },
        stats(stat('head', name(m.head)), stat('tail', name(m.tail)), stat('size', m.ids.length)),
        order.length ? el('div', { class: 'diagram-scroll', data: { scroll: '' } },
          el('div', { class: 'link-strip' }, order.map((id, i) => {
            const node = m.nodes[id];
            const n = order[i + 1];
            const forward = n !== undefined && node.next === n;
            const backward = n !== undefined && m.mode === 'double' && m.nodes[n].prev === id;
            return [
              el('div', { class: 'linked-node' + (f.marks.includes(id) ? ' is-active' : '') +
                (f.pending === id ? ' pending' : '') + (f.detached === id ? ' detached' : '') },
              el('span', { class: 'linked-id mono' }, name(id), f.pending === id ? ' · ' + ui.t(b('新', 'new')) : ''),
              el('strong', { class: 'mono' }, node.value),
              el('span', { class: 'node-ref mono' }, 'next → ' + name(node.next)),
              m.mode === 'double' ? el('span', { class: 'node-ref mono' }, 'prev → ' + name(node.prev)) : null),
              n !== undefined ? el('span', { class: 'link-arrow', 'aria-hidden': 'true' },
                forward && backward ? '⇄' : forward ? '→' : backward ? '←' : '·') : null
            ];
          }))) : empty(ui.t),
        m.mode === 'circular' && m.tail != null ? el('div', { class: 'return-link mono' },
          '↶  tail.next → ' + name(m.nodes[m.tail].next)) : null);
    },
    tryIt: [
      b('在下标 1 插入 25。暂停后辨认新节点的 next 第一次指向谁。', 'Insert 25 at index 1. Pause and identify where the new next first points.'),
      b('分别在单链和双链中删尾，比较访问节点的数量。切换循环单链，定位回到 head 的边。', 'Remove the tail in singly and doubly linked modes and compare the visits. Switch to a circular list and spot the link back to head.')
    ]
  };

  labs[12] = {
    title: b('栈操作与括号扫描', 'Stack operations and bracket scan'),
    ready: b('从上方操作栈顶。先试 peek，再试 pop，比较 size。', 'Work from the top. Try peek, then pop, and compare the size.'),
    seed: M.stackSeed, pref: { mode: 'stack', value: '42', text: '{[()]}' },
    setup(ui) {
      ui.row(ui.select('mode', b('实验', 'Experiment'), { stack: b('栈操作', 'Stack operations'), brackets: b('括号匹配', 'Bracket matching') }, () =>
        ui.newModel(ui.model(), false, ui.pref.mode === 'brackets'
          ? b('输入括号串并开始扫描。', 'Enter a bracket string and start the scan.') : null)));
      if (ui.pref.mode === 'brackets') {
        ui.row(ui.field('text', b('要扫描的文本', 'Text to scan'), { maxLength: 32, class: 'text-field' }),
          ui.action('scan', b('开始扫描', 'Scan'), () => ui.setFrames(M.bracketTrace(ui.model(), ui.pref.text)), 'primary'),
          ui.action('mismatch', b('试试 ([)]', 'Try ([)]'), () => {
            ui.pref.text = '([)]';
            ui.setup();
            ui.setFrames(M.bracketTrace(ui.model(), ui.pref.text));
          }));
      } else {
        ui.row(ui.number('value', value),
          ui.intAction('push', 'push(x)', 'value', (m, n) => M.stackAction(m, 'push', n), 'primary'),
          ui.action('pop', 'pop()', () => ui.setFrames(M.stackAction(ui.model(), 'pop'))),
          ui.action('peek', 'peek()', () => ui.setFrames(M.stackAction(ui.model(), 'peek'))));
      }
    },
    view(f, ui) {
      if (ui.pref.mode === 'brackets') {
        const scan = f.brackets ?? { chars: Array.from(ui.pref.text), index: -1, stack: [] };
        return el('div', { class: 'linear-visual' },
          sub(ui.t(b('输入，从左向右读', 'Input, read left to right'))),
          el('div', { class: 'char-strip' }, scan.chars.map((c, i) =>
            el('span', { class: 'char mono' + (scan.index === i ? ' is-active' : '') + (scan.index > i ? ' scanned' : '') }, c === ' ' ? '␣' : c))),
          sequence(ui.t(b('栈底 → 栈顶', 'Bottom → top')), scan.stack, true),
          scan.valid == null ? null : el('p', { class: 'scan-status ' + (scan.valid ? 'good' : 'bad') },
            ui.t(scan.valid ? b('匹配成功', 'Brackets match') : b('匹配失败', 'Bracket mismatch'))));
      }
      const items = f.model.items;
      return el('div', { class: 'linear-visual' },
        stats(stat('size', items.length), stat('top', items.at(-1) ?? '∅')),
        el('div', { class: 'stack-space' }, el('div', { class: 'stack-pile' },
          el('span', { class: 'stack-label' }, ui.t(b('↓ 栈顶　TOP', '↓ STACK TOP'))),
          items.length ? [...items].reverse().map((n, i) =>
            el('div', { class: 'plate mono' + (i === 0 ? ' is-top' : '') +
              (f.marks.includes(items.length - i - 1) ? ' is-active' : '') +
              (f.exiting === items.length - i - 1 ? ' exiting' : '') }, n)) : empty(ui.t),
          el('div', { class: 'stack-base' }))));
    },
    tryIt: [
      b('压入 42，然后 peek。猜猜接下来的 pop 返回什么，再动手验证。', 'Push 42 and peek. Predict the result of the next pop and test it.'),
      b('切到括号匹配，先扫描 {[()]}，再扫描 ([)]。观察哪一个字符最先遇到类型不符。', 'Switch to brackets. Scan {[()]} and then ([)]. See which character first finds the wrong type.')
    ]
  };

  labs[13] = {
    title: b('五槽环形队列', 'Five-slot circular queue'),
    ready: b('起始队首在槽 3，队尾元素已经绕到槽 0。物理下标和出队顺序都显示在下面。', 'The initial front is slot 3 and the last item has wrapped to slot 0. Compare physical indices with dequeue order below.'),
    seed: M.queueSeed, pref: { type: 'fifo', value: '12' },
    setup(ui) {
      ui.row(ui.select('type', b('操作模式', 'Operations'), { fifo: 'FIFO', deque: 'Deque' }, () => {
        ui.setup();
        ui.paint();
      }, true), ui.number('value', value));
      const op = (key, title, add, tone) => add ? ui.intAction(key, title, 'value',
        (m, n) => M.queueAction(m, key, n), tone) : ui.action(key, title, () => ui.setFrames(M.queueAction(ui.model(), key)), tone);
      const deque = ui.pref.type === 'deque';
      ui.row(op('add-last', deque ? 'offerLast(x)' : 'offer(x)', true, 'primary'),
        op('remove-first', deque ? 'pollFirst()' : 'poll()', false),
        op('peek', 'peek()', false),
        deque ? [op('add-first', 'offerFirst(x)', true), op('remove-last', 'pollLast()', false)] : null);
    },
    view(f, ui) {
      const m = f.model;
      const rear = (m.front + m.size) % m.slots.length;
      const tags = {};
      (tags[m.front] ??= []).push('front');
      (tags[rear] ??= []).push('rear');
      return el('div', { class: 'linear-visual' },
        stats(stat('size', m.size), stat('capacity', m.slots.length), stat('front', m.front), stat('rear', rear)),
        sub(ui.t(b('物理槽位 · 最后一格之后回到 0', 'Physical slots · wrap from the last slot to 0'))),
        cells(m.slots, f.marks, tags),
        sequence(ui.t(b('逻辑顺序（队首先出）', 'Logical order (front leaves first)')), M.queueOrder(m), true));
    },
    tryIt: [
      b('连续出队两次，看 front 从 3 走到 4，再走到 0。再入队一个数。', 'Dequeue twice and watch front move from 3 to 4 and then to 0. Enqueue a new value.'),
      b('切到 Deque，把一个值插到前端，再从后端取值。对照逻辑顺序。', 'Switch to Deque, insert at the front, and remove at the rear. Check the logical order.')
    ]
  };
})();
