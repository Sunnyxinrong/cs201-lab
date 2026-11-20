'use strict';

window.CS201Models = (() => {
  const { bi: b } = CS201;
  const mod = (x, m) => ((x % m) + m) % m;
  const fmt = (value) => typeof value === 'string' ? JSON.stringify(value) : String(value);
  const limits = { array: 16, linked: 9, stack: 8, tree: 17, heap: 19, map: 12, hash: 24 };

  function trace(source, note, extra) {
    const model = structuredClone(source);
    const frames = [];
    function step(message, marks = [], detail = {}) {
      frames.push({ model: structuredClone(model), message, marks: [...marks], ...structuredClone(detail) });
    }
    step(note, [], extra);
    return { model, frames, step };
  }

  const curves = [
    { name: '1', color: '#596984', count: () => 1 },
    { name: 'log₂ n', color: '#148670', count: Math.log2 },
    { name: 'n', color: '#3568d1', count: (n) => n },
    { name: 'n log₂ n', color: '#7b54cf', count: (n) => n * Math.log2(n) },
    { name: 'n²', color: '#bc5a15', count: (n) => n ** 2 },
    { name: 'n³', color: '#b03170', count: (n) => n ** 3 },
    { name: '2ⁿ', color: '#c43146', count: (n) => 2 ** n }
  ];
  const loops = {
    constant: { title: b('固定次数', 'Fixed count'), code: 'for (int i = 0; i < 8; i++) tick();', count: () => 8, growth: 'Θ(1)' },
    stride: { title: b('步长为 3', 'Stride of 3'), code: 'for (int i = 0; i < n; i += 3) tick();', count: (n) => Math.ceil(n / 3), growth: 'Θ(n)' },
    double: { title: b('每轮翻倍', 'Double each time'), code: 'for (int i = 1; i < n; i *= 2) tick();', count: (n) => Math.ceil(Math.log2(n)), growth: 'Θ(log n)' },
    square: { title: b('方形嵌套', 'Square nest'), code: 'for (int i = 0; i < n; i++)\n    for (int j = 0; j < n; j++) tick();', count: (n) => n * n, growth: 'Θ(n²)' },
    triangle: { title: b('三角形嵌套', 'Triangular nest'), code: 'for (int i = 0; i < n; i++)\n    for (int j = i; j < n; j++) tick();', count: (n) => n * (n + 1) / 2, growth: 'Θ(n²)' }
  };

  const arraySeed = () => ({ slots: [12, 24, 36, 48], size: 4 });
  function arrayAction(source, op, index, value) {
    const { model: m, frames, step } = trace(source, b('先看操作前的数组。', 'Start with the current backing array.'));
    const inserting = op === 'insert' || op === 'append';
    if (op === 'append') index = m.size;
    if (!Number.isInteger(index) || index < 0 || index > m.size - (inserting ? 0 : 1)) {
      step(b('下标超出当前操作的允许范围。', 'That index is outside the range for this operation.'));
      return frames;
    }
    if (op === 'get' || op === 'set') {
      const old = m.slots[index];
      if (op === 'set') m.slots[index] = value;
      step(op === 'get' ? b('直接读取下标 ' + index + '。', 'Read index ' + index + ' directly.')
        : b('覆盖下标 ' + index + '，size 保持不变。', 'Overwrite index ' + index + ' and keep the same size.'),
      [index], { result: old });
      return frames;
    }
    function move(from, to) {
      m.slots[to] = m.slots[from];
      m.slots[from] = null;
      step(b('把下标 ' + from + ' 处的元素移动到 ' + to + '。', 'Move the item at index ' + from + ' to ' + to + '.'), [from, to]);
    }
    if (inserting) {
      if (m.size === limits.array) {
        step(b('实验已达 16 项。可以先删除一项。', 'This lab holds up to 16 items. Remove one to make room.'));
        return frames;
      }
      if (m.size === m.slots.length) {
        const oldSlots = m.slots;
        m.slots = Array(oldSlots.length * 2).fill(null);
        step(b('槽位已满，申请容量为 ' + m.slots.length + ' 的新数组。', 'Allocate a new array of capacity ' + m.slots.length + ' because the old array is full.'), [], { oldSlots });
        for (let i = 0; i < m.size; i++) {
          m.slots[i] = oldSlots[i];
          step(b('复制旧数组下标 ' + i + '。', 'Copy index ' + i + ' from the old array.'), [i], { oldSlots });
        }
      }
      for (let i = m.size - 1; i >= index; i--) move(i, i + 1);
      m.slots[index] = value;
      m.size++;
      step(b('写入 ' + value + '，size 加 1。', 'Store ' + value + ' and increment size.'), [index]);
    } else {
      const old = m.slots[index];
      m.slots[index] = null;
      step(b('保存待返回的 ' + old + '，空出下标 ' + index + '。', 'Save ' + old + ' for the return and clear index ' + index + '.'), [index]);
      for (let i = index + 1; i < m.size; i++) move(i, i - 1);
      m.size--;
      step(b('删除完成，size 减 1。', 'Removal complete. Decrease size by one.'), [], { result: old });
    }
    return frames;
  }

  function linkedSeed(mode = 'single', values = [18, 32, 45]) {
    const ids = values.map((_, i) => i + 1);
    const head = ids[0] ?? null;
    const tail = ids.at(-1) ?? null;
    const nodes = Object.fromEntries(values.map((value, i) => [
      ids[i], {
        value,
        next: ids[i + 1] ?? (mode === 'circular' ? head : null),
        prev: mode === 'double' ? ids[i - 1] ?? null : null
      }
    ]));
    return { mode, ids, nodes, head, tail, counter: values.length };
  }

  function linkedAction(source, op, index, value) {
    const { model: m, frames, step } = trace(source, b('看当前的 head、tail 和各节点的引用。', 'Inspect head, tail, and the node references.'));
    const n = m.ids.length;
    const twice = m.mode === 'double';
    const round = m.mode === 'circular';
    const name = (id) => id === null ? 'null' : '#' + id;

    function visit(target, fromBack = false) {
      const direction = fromBack ? 'prev' : 'next';
      let i = fromBack ? n - 1 : 0;
      let id = fromBack ? m.tail : m.head;
      while (i !== target) {
        step(b('在 ' + name(id) + ' 沿 ' + direction + ' 走一步。', 'At ' + name(id) + ', follow ' + direction + '.'), [id]);
        id = m.nodes[id][direction];
        i += fromBack ? -1 : 1;
      }
      step(b('抵达下标 ' + i + ' 的节点 ' + name(id) + '。', 'Reached node ' + name(id) + ' at index ' + i + '.'), [id]);
      return id;
    }

    if (op === 'find') {
      let id = m.head;
      for (let i = 0; i < n; i++) {
        const node = m.nodes[id];
        step(b('把 ' + value + ' 与 ' + name(id) + ' 中的 ' + node.value + ' 比较。',
          'Compare ' + value + ' with ' + node.value + ' in ' + name(id) + '.'), [id]);
        if (value === node.value) {
          step(b('找到第一个相等元素。', 'Found the first matching element.'), [id], { result: i });
          return frames;
        }
        id = node.next;
      }
      step(b('已检查完 ' + n + ' 个节点。', 'All ' + n + ' nodes have been checked.'), [], { result: -1 });
      return frames;
    }
    const adding = op === 'insert' || op === 'append' || op === 'prepend';
    if (op === 'append') index = n;
    if (op === 'prepend' || op === 'remove-head') index = 0;
    if (op === 'remove-tail') index = n - 1;
    if (!Number.isInteger(index) || index < 0 || index > n - (adding ? 0 : 1)) {
      step(b('这个操作的下标超出范围。', 'The index is out of range for this operation.'));
      return frames;
    }

    if (adding) {
      if (n === limits.linked) {
        step(b('实验已达到节点数上限。', 'The lab has reached its node limit.'));
        return frames;
      }
      const prev = index === 0 ? null : visit(index - 1, index === n || (twice && index > n / 2));
      const next = m.ids[index] ?? null;
      const id = ++m.counter;
      m.nodes[id] = { value, next: next ?? (round ? m.head ?? id : null), prev: twice ? prev : null };
      const preview = { pending: id, pendingIndex: index };
      step(b('准备 ' + name(id) + '，设置 next = ' + name(m.nodes[id].next) + '。',
        'Prepare ' + name(id) + ' with next = ' + name(m.nodes[id].next) + '.'), [id], preview);
      if (prev === null) m.head = id;
      else m.nodes[prev].next = id;
      step(prev === null ? b('把 head 指向新节点。', 'Point head at the new node.')
        : b('令 ' + name(prev) + '.next 指向新节点。', 'Point ' + name(prev) + '.next at the new node.'), [id, prev], preview);
      if (twice && next !== null) {
        m.nodes[next].prev = id;
        step(b('让原后继的 prev 接回新节点。', 'Point the old successor’s prev to the new node.'), [id, next], preview);
      }
      if (next === null) m.tail = id;
      if (round) m.nodes[m.tail].next = m.head;
      m.ids.splice(index, 0, id);
      step(b('插入完成。端点引用和 size 已更新。', 'Insertion complete. End references and size are up to date.'), [id]);
    } else {
      const id = m.ids[index];
      const next = m.ids[index + 1] ?? null;
      const prev = index === 0 ? null
        : twice ? m.nodes[visit(index, index >= n / 2)].prev
          : visit(index - 1);
      const removed = m.nodes[id].value;
      if (prev === null) m.head = next;
      else m.nodes[prev].next = next ?? (round ? m.head : null);
      if (twice && next !== null) m.nodes[next].prev = prev;
      step(b('绕过 ' + name(id) + '，把保留的邻居接起来。', 'Bypass ' + name(id) + ' and reconnect the remaining neighbors.'), [prev, id, next], { detached: id });
      if (next === null) m.tail = prev;
      if (round && m.tail !== null) m.nodes[m.tail].next = m.head;
      delete m.nodes[id];
      m.ids.splice(index, 1);
      step(b('移出节点并更新端点引用，size 减 1。', 'Detach the node, update end references, and decrement size.'), [prev, next], { result: removed });
    }
    return frames;
  }

  const stackSeed = () => ({ items: [10, 20, 30] });
  function stackAction(source, op, value) {
    const { model: m, frames, step } = trace(source, b('所有操作都发生在栈顶。', 'Every operation happens at the top.'));
    const i = m.items.length - 1;
    if (op === 'push') {
      if (m.items.length === limits.stack) {
        step(b('实验栈已满。先弹出一些值。', 'This lab stack is full. Pop an item to make room.'));
      } else {
        m.items.push(value);
        step(b('压入 ' + value + '。它成为新的栈顶。', 'Push ' + value + ' to make it the new top.'), [i + 1]);
      }
    } else if (i < 0) {
      step(b('栈为空。当前没有栈顶。', 'The stack is empty. There is no top.'), [], { result: null });
    } else if (op === 'peek') {
      step(b('读栈顶，栈的大小保持不变。', 'Read the top while keeping the size.'), [i], { result: m.items[i] });
    } else {
      const old = m.items[i];
      step(b('取出栈顶 ' + old + '。', 'Take ' + old + ' from the top.'), [i], { exiting: i });
      m.items.pop();
      step(m.items.length ? b('原先第二高的一项成为栈顶。', 'The item just below becomes the top.')
        : b('最后一项已弹出，栈为空。', 'The last item was popped. The stack is empty.'), [i - 1], { result: old });
    }
    return frames;
  }

  function bracketTrace(source, input) {
    const stack = [];
    const chars = Array.from(input);
    const pairs = { ')': '(', ']': '[', '}': '{' };
    const { frames, step } = trace(source, b('从空栈和第一个字符开始。', 'Start with an empty stack and the first character.'), {
      brackets: { chars, index: -1, stack }
    });
    for (let i = 0; i < chars.length; i++) {
      const c = chars[i];
      let message;
      if ('([{'.includes(c)) {
        stack.push(c);
        message = b('读到左括号 ' + c + '，压栈。', 'Read opening ' + c + ' and push it.');
      } else if (Object.hasOwn(pairs, c)) {
        if (stack.at(-1) !== pairs[c]) {
          step(stack.length
            ? b(c + ' 需要 ' + pairs[c] + '，当前栈顶是 ' + stack.at(-1) + '。', c + ' needs ' + pairs[c] + ', but the top is ' + stack.at(-1) + '.')
            : b('读到右括号 ' + c + ' 时栈为空。', 'Read closing ' + c + ' with an empty stack.'),
          [], { brackets: { chars, index: i, stack, valid: false }, result: false });
          return frames;
        }
        const opening = stack.pop();
        message = b(c + ' 匹配 ' + opening + '，弹栈。', c + ' matches ' + opening + '. Pop it.');
      } else {
        message = b('跳过普通字符。', 'Skip the ordinary character.');
      }
      step(message, [], { brackets: { chars, index: i, stack } });
    }
    const valid = stack.length === 0;
    step(valid ? b('扫描完成且栈为空，括号匹配。', 'The scan finished with an empty stack. The brackets match.')
      : b('扫描完成，栈内仍有未闭合的左括号。', 'The scan finished with unmatched opening brackets.'),
    [], { brackets: { chars, index: chars.length, stack, valid }, result: valid });
    return frames;
  }

  const queueSeed = () => ({ slots: [9, null, null, 3, 6], front: 3, size: 3 });
  const queueOrder = (m) => Array.from({ length: m.size }, (_, i) => m.slots[(m.front + i) % m.slots.length]);
  function queueAction(source, op, value) {
    const { model: m, frames, step } = trace(source, b('先看物理槽位和逻辑顺序。', 'Start with the physical slots and logical order.'));
    const c = m.slots.length;
    const rear = (m.front + m.size) % c;
    const adding = op.startsWith('add');
    if (adding && m.size === c) {
      step(b('环已满。等腾出一个槽以后再放入。', 'The ring is full. Remove an item before adding one.'), [], { result: false });
    } else if (!adding && m.size === 0) {
      step(b('队列为空，返回 null。', 'The queue is empty. Return null.'), [], { result: null });
    } else if (op === 'peek') {
      step(b('读取 front 指向的槽。', 'Read the slot at front.'), [m.front], { result: m.slots[m.front] });
    } else if (adding) {
      const first = op === 'add-first';
      const index = first ? mod(m.front - 1, c) : rear;
      const formula = first ? 'floorMod(front − 1, ' + c + ') = ' : '(front + size) % ' + c + ' = ';
      step(b('计算写入下标 ' + formula + index + '。', 'Compute the write index ' + formula + index + '.'), [index]);
      if (first) m.front = index;
      m.slots[index] = value;
      m.size++;
      step(b('写入 ' + value + ' 并增加 size。rear 也重新计算。', 'Write ' + value + ', increase size, and recompute rear.'), [index], { result: true });
    } else {
      const first = op === 'remove-first';
      const index = first ? m.front : mod(rear - 1, c);
      const old = m.slots[index];
      step(b('读出 ' + old + '，即将清空下标 ' + index + '。', 'Read ' + old + ' and prepare to clear index ' + index + '.'), [index]);
      m.slots[index] = null;
      if (first) m.front = (m.front + 1) % c;
      m.size--;
      step(first ? b('front 向前移动一格，超过末端就绕回下标 0。', 'Advance front one slot and wrap to index 0 after the last slot.')
        : b('清空尾项，size 减 1，rear 随之回退。', 'Clear the last item, decrement size, and move rear back.'),
      [index], { result: old });
    }
    return frames;
  }

  return {
    trace, fmt, mod, limits, curves, loops, arraySeed, arrayAction, linkedSeed, linkedAction,
    stackSeed, stackAction, bracketTrace, queueSeed, queueOrder, queueAction
  };
})();
