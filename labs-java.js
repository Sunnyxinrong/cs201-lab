'use strict';

(() => {
  const { bi: b } = CS201;
  const { el, labs } = CS201UI;
  const { cells, empty, sequence, stat, stats, sub, tree } = CS201Visuals;
  const { trace } = CS201Models;

  const receiverNames = {
    list: 'ArrayList<Integer>',
    deque: 'ArrayDeque<Integer>',
    queue: 'Queue<Integer>'
  };
  const dataSets = {
    sample: { values: [1, 7, 1, 9], label: '[1, 7, 1, 9]' },
    empty: { values: [], label: '[]' }
  };
  const judgment = {
    value: b('正常结束，有返回值', 'Succeeds and returns a value'),
    void: b('正常结束，返回类型 void', 'Succeeds with return type void'),
    compile: b('编译失败', 'Compile-time error'),
    runtime: b('运行时异常', 'Runtime exception')
  };
  const method = (signature, returnType, apply) => ({ signature, returnType, apply });
  const fail = (exception) => ({ exception });
  const ok = (value) => ({ value });

  function removeValue(value, fromRear = false) {
    return (items) => {
      const index = fromRear ? items.lastIndexOf(value) : items.indexOf(value);
      if (index >= 0) items.splice(index, 1);
      return ok(index >= 0);
    };
  }

  function addValue(value, front = false, rejectsNull = false) {
    return (items) => {
      if (value === null && rejectsNull) return fail('NullPointerException');
      if (front) items.unshift(value);
      else items.push(value);
      return ok(true);
    };
  }

  function atIndex(index, apply) {
    return (items) => {
      if (index < 0 || index >= items.length) return fail('IndexOutOfBoundsException');
      return ok(apply(items, index));
    };
  }

  function readEnd(fromRear, remove, strict) {
    return (items) => {
      if (items.length === 0) return strict ? fail('NoSuchElementException') : ok(null);
      if (remove) return ok(fromRear ? items.pop() : items.shift());
      return ok(items.at(fromRear ? -1 : 0));
    };
  }

  const removeAt = (i) => method('E remove(int index)', 'Integer', atIndex(i, (a, index) => a.splice(index, 1)[0]));
  const removeObject = (value) => method('boolean remove(Object o)', 'boolean', removeValue(value));
  const insertAt = (getIndex) => method('void add(int index, E element)', 'void', (items) => {
    const index = getIndex(items);
    if (index < 0 || index > items.length) return fail('IndexOutOfBoundsException');
    items.splice(index, 0, 8);
    return ok();
  });
  const indexOf = (value) => method('int indexOf(Object o)', 'int', (items) => ok(items.indexOf(value)));
  const append = (value, rejectsNull = false) => method('boolean add(E element)', 'boolean', addValue(value, false, rejectsNull));
  const endMethod = (name, rear, remove, strict) => method('E ' + name + '()', 'Integer', readEnd(rear, remove, strict));

  function example(expression, list, deque, queueVisible = false, note) {
    return { expression, list, deque, queueVisible, note };
  }
  const calls = {
    removeInt: example('remove(1)', removeAt(1), removeObject(1), true, {
      list: b('字面量 1 是 int。编译器选下标版本。', 'Literal 1 is an int, so the indexed overload is selected.'),
      deque: b('这个接收者只有按值的单参数 remove，1 装箱后作为 Object。', 'The one-argument overload here is removal by value. The 1 boxes to Integer and passes as Object.')
    }),
    removeBoxed: example('remove(Integer.valueOf(1))', removeObject(1), removeObject(1), true, {
      list: b('Integer 可以直接拓宽成 Object，所以按值删除，返回 boolean。', 'Integer widens directly to Object, selecting value removal with boolean result.')
    }),
    removeString: example('remove("1")', removeObject('1'), removeObject('1'), true, {
      list: b('String 可作为 Object 实参，但 "1" 和 Integer 1 不相等。', 'A String is a valid Object argument, but "1" is unequal to Integer 1.'),
      deque: b('String 可作为 Object 实参，但 "1" 和 Integer 1 不相等。', 'A String is a valid Object argument, but "1" is unequal to Integer 1.')
    }),
    removeLarge: example('remove(99)', removeAt(99), removeObject(99), true),
    removeHead: example('remove()', null, endMethod('remove', false, true, true), true),
    removeLastMatch: example('removeLastOccurrence(1)', null, method('boolean removeLastOccurrence(Object o)', 'boolean', removeValue(1, true))),
    indexOfInt: example('indexOf(1)', indexOf(1), null),
    indexOfString: example('indexOf("1")', indexOf('1'), null),
    contains: example('contains(1)', method('boolean contains(Object o)', 'boolean', (a) => ok(a.includes(1))),
      method('boolean contains(Object o)', 'boolean', (a) => ok(a.includes(1))), true),
    add: example('add(8)', append(8), append(8, true), true),
    addNull: example('add(null)', append(null), append(null, true), true),
    addString: example('add("8")', null, null),
    addIndexed: example('add(2, 8)', insertAt(() => 2), null),
    addAtEnd: example('add(items.size(), 8)', insertAt((a) => a.length), null),
    get: example('get(1)', method('E get(int index)', 'Integer', atIndex(1, (a, i) => a[i])), null),
    readPastEnd: example('get(items.size())', method('E get(int index)', 'Integer', () => fail('IndexOutOfBoundsException')), null),
    set: example('set(1, 8)', method('E set(int index, E element)', 'Integer', atIndex(1, (a, i) => a.splice(i, 1, 8)[0])), null),
    peek: example('peek()', null, endMethod('peek', false, false, false), true),
    peekArg: example('peek(1)', null, null),
    peekLast: example('peekLast()', null, endMethod('peekLast', true, false, false)),
    poll: example('poll()', null, endMethod('poll', false, true, false), true),
    pollLast: example('pollLast()', null, endMethod('pollLast', true, true, false)),
    element: example('element()', null, endMethod('element', false, false, true), true),
    getLast: example('getLast()', null, endMethod('getLast', true, false, true)),
    offer: example('offer(8)', null, method('boolean offer(E element)', 'boolean', addValue(8, false, true)), true),
    offerFirst: example('offerFirst(8)', null, method('boolean offerFirst(E element)', 'boolean', addValue(8, true, true))),
    offerNull: example('offer(null)', null, method('boolean offer(E element)', 'boolean', addValue(null, false, true)), true),
    addFirst: example('addFirst(8)', null, method('void addFirst(E element)', 'void', addValue(8, true, true))),
    push: example('push(8)', null, method('void push(E element)', 'void', addValue(8, true, true))),
    pop: example('pop()', null, endMethod('pop', false, true, true))
  };

  const apiIntro = b('用同一批元素比较签名、参数和结果。按 Java 17 的行为模拟所选语句，每次从选定样例开始。',
    'Compare signatures, arguments, and outcomes on the same data. Each run simulates the selected Java 17 statement from the chosen starting state.');
  const apiReady = b('默认列表的下标 1 是 7，第一个值 1 却在下标 0。先猜 remove(1) 会移走谁。', 'Index 1 holds 7, while the first value 1 is at index 0. Predict which item remove(1) removes.');
  const apiDefaults = { receiver: 'list', shape: 'sample', call: 'removeInt', predict: 'none' };

  function apiSeed(pref = apiDefaults) {
    const values = dataSets[pref.shape].values;
    const implementation = pref.receiver === 'list' ? 'ArrayList' : 'ArrayDeque';
    const declared = pref.receiver === 'list' ? 'ArrayList' : pref.receiver === 'queue' ? 'Queue' : 'ArrayDeque';
    const input = values.length ? 'List.of(' + values.join(', ') + ')' : '';
    return {
      receiver: pref.receiver, initial: [...values], items: [...values], call: pref.call,
      declaration: declared + '<Integer> items = new ' + implementation + '<>(' + input + ');'
    };
  }

  function unavailable(receiver, key, choice) {
    if (key === 'addString') return b('add(E) 在这里要求 Integer，String 实参不匹配。', 'add(E) requires Integer here. A String argument does not match.');
    if (key === 'peekArg' && receiver !== 'list') return b('peek() 的参数列表是空的。删掉括号里的 1。', 'peek() takes no arguments. Remove the 1 inside the parentheses.');
    if (receiver === 'queue' && choice.deque) return b('声明类型 Queue 没有这个双端方法。可把变量声明成 Deque。', 'The declared type Queue lacks this end-specific method. Deque exposes it.');
    return b('这个声明类型没有匹配的 Java 17 方法签名。', 'This declared type has no matching Java 17 method signature.');
  }

  function apiTrace(pref) {
    const { model, step, frames } = trace(apiSeed(pref),
      b('先看接收者的声明和括号内实参，再决定调用哪个方法。', 'Look at the declared receiver type and arguments to identify the method.'));
    const choice = calls[pref.call];
    const fromList = pref.receiver === 'list';
    const binding = fromList ? choice.list : pref.receiver === 'queue' && !choice.queueVisible ? null : choice.deque;
    function finish(kind, message, detail = {}) {
      step(message, [], { apiOutcome: { kind, prediction: pref.predict, signature: binding?.signature, ...detail } });
    }
    if (!binding) {
      finish('compile', unavailable(pref.receiver, pref.call, choice));
      return frames;
    }
    const resolution = choice.note?.[fromList ? 'list' : 'deque'] ??
      b('找到匹配签名。接下来检查运行时的边界。', 'The signature matches. Now check runtime conditions.');
    step(resolution, [], { apiBinding: binding.signature });

    const result = binding.apply(model.items);
    if (result.exception) {
      const messages = {
        IndexOutOfBoundsException: b('签名合法，但当前 size 下的下标越界。', 'The call matches the signature, but its index is out of range for the current size.'),
        NoSuchElementException: b('从空队列严格取值会抛 NoSuchElementException。', 'A strict end operation on an empty deque throws NoSuchElementException.'),
        NullPointerException: b('ArrayDeque 的添加方法拒绝 null，offer 也一样。', 'ArrayDeque insertion methods reject null, including offer.')
      };
      finish('runtime', messages[result.exception], result);
    } else {
      const isVoid = binding.returnType === 'void';
      finish(isVoid ? 'void' : 'value', isVoid
        ? b('操作完成。void 表示这句没有返回值。', 'The operation completed. void means it has no return value.')
        : b('操作完成。对比返回值和调用后的容器。', 'The operation completed. Compare the return value with the contents afterward.'),
      { returnType: binding.returnType, value: result.value });
    }
    return frames;
  }

  function apiResult(frame, ui) {
    const { t } = ui;
    const outcome = frame.apiOutcome;
    if (!outcome && !frame.apiBinding) return null;
    const signature = outcome?.signature ?? frame.apiBinding;
    const prediction = outcome?.prediction;
    const predicted = prediction && prediction !== 'none';
    const status = outcome ? t(judgment[outcome.kind]) : t(b('已匹配的签名', 'Resolved signature'));
    const resultText = outcome?.exception || (outcome?.kind === 'value' ? outcome.returnType + ' → ' + String(outcome.value)
      : outcome?.kind === 'void' ? 'void' : null);
    return el('div', { class: 'method-outcome ' + (outcome?.kind ?? 'resolved'), role: 'status' },
      el('strong', {}, status),
      signature ? el('code', { class: 'mono' }, signature) : null,
      resultText ? el('span', { class: 'method-return mono' }, resultText) : null,
      predicted ? el('span', { class: 'method-prediction' + (prediction === outcome.kind ? ' correct' : '') },
        t(prediction === outcome.kind
          ? b('✓ 预测正确', '✓ Prediction correct')
          : b('你的预测是「' + t(judgment[prediction]) + '」', 'Your prediction: ' + t(judgment[prediction])))) : null);
  }

  function apiBoard(frame, ui) {
    const { t } = ui;
    const m = frame.model;
    const isList = m.receiver === 'list';
    function sample(label, values) {
      return el('div', { class: 'method-example' },
        sub(label),
        isList && values.length ? cells(values.map(String))
          : isList ? empty(t, b('空列表', 'Empty list'))
            : sequence(t(b('队首 → 队尾', 'Front → rear')), values.map(String), true));
    }
    return el('div', { class: 'method-board' },
      el('pre', { class: 'live-java mono' }, m.declaration + '\nitems.' + calls[m.call].expression + ';'),
      apiResult(frame, ui),
      el('div', { class: 'method-comparison' },
        sample(t(b('调用前', 'Before the call')), m.initial),
        frame.apiOutcome ? sample(t(frame.apiOutcome.kind === 'compile'
          ? b('未执行', 'No execution') : b('调用后', 'After the call')), m.items) : null));
  }

  labs['java-api'] = {
    title: b('一句 Java 到底会怎样', 'Predict what one Java call does'),
    intro: apiIntro,
    ready: apiReady,
    seed: apiSeed,
    pref: apiDefaults,
    setup(ui) {
      const change = () => ui.newModel(apiSeed(ui.pref), true,
        b('样例已就绪。先预测，再检查签名和实际结果。', 'The sample is ready. Predict the outcome and inspect the resolved call.'));
      ui.row(
        ui.select('receiver', b('接收者的声明类型', 'Declared receiver type'), receiverNames, change, true),
        ui.select('shape', b('初始元素', 'Starting contents'), Object.fromEntries(Object.entries(dataSets).map(([k, v]) => [k, v.label])), change, true));
      ui.row(
        ui.select('call', b('要写的调用', 'Method call'), Object.fromEntries(Object.entries(calls).map(([k, v]) => [k, 'items.' + v.expression])), change, true),
        ui.select('predict', b('先预测一下', 'Predict first'), { none: b('直接观察', 'Just observe'), ...judgment }, change, true),
        ui.action('run-method', b('检查这一句', 'Check this call'), () => ui.setFrames(apiTrace(ui.pref)), 'primary'));
    },
    view: apiBoard,
    tryIt: [
      b('在默认 [1, 7, 1, 9] 上比较 ArrayList 和 ArrayDeque 的 remove(1)。分别记下删的是哪一个，以及返回类型。', 'Try remove(1) on the default data with ArrayList and with ArrayDeque. Compare the removed item and the return type.'),
      b('把 ArrayList 的实参换成 Integer.valueOf(1)，再试 indexOf("1")。找出是哪一步改变了含义。', 'With ArrayList, change the argument to Integer.valueOf(1), then try indexOf("1"). See what changes the meaning.'),
      b('切到空 ArrayDeque，依次比较 peek()、element()、offer(null)。然后选 Queue 声明，试 peekLast()。', 'On an empty ArrayDeque, compare peek(), element(), and offer(null). Then choose a Queue declaration and try peekLast().')
    ]
  };

  const nodeModes = {
    list: b('链表尾插 · MyLinkedList.add', 'Linked-list append · MyLinkedList.add'),
    tree: b('二叉树 · 接上左右孩子', 'Binary tree · Attach children'),
    recursive: b('BST · 接回递归返回值', 'BST · Reconnect a recursive return')
  };
  const nodeDefaults = { mode: 'list', start: 'two', title: 'Machine Learning', reconnect: 'yes' };
  const bookNode = (id, title, next = null) => ({ id, data: { title }, next });
  const treeNode = (id, key) => ({ id, key, left: null, right: null });
  const listLines = [
    'Node<E> newNode = new Node<>(e);',
    'if (head == null) {',
    '    head = newNode;',
    '} else {',
    '    Node<E> currentNode = head;',
    '    while (currentNode.next != null) {',
    '        currentNode = currentNode.next;',
    '    }',
    '    currentNode.next = newNode;',
    '}',
    'size++;'
  ];
  const treeLines = [
    'TreeNode<Integer> root = new TreeNode<>(8);',
    'TreeNode<Integer> child = new TreeNode<>(4);',
    'TreeNode<Integer> cursor = root;',
    'cursor.left = child;',
    'cursor = cursor.left;',
    'cursor.right = new TreeNode<>(6);',
    'root.right = new TreeNode<>(12);'
  ];

  function nodeSeed(pref = nodeDefaults) {
    if (pref.mode === 'list') {
      const populated = pref.start === 'two';
      return {
        mode: 'list', head: populated ? bookNode(1, 'cs201', bookNode(2, 'Math202')) : null,
        size: populated ? 2 : 0, newNode: null, currentNode: null
      };
    }
    return { mode: pref.mode, root: pref.mode === 'recursive' ? treeNode(1, 8) : null,
      current: null, child: null, returned: null, reconnect: pref.reconnect };
  }

  function nodeTrace(pref, initialMessage) {
    const { model, step, frames } = trace(nodeSeed(pref), initialMessage);
    return { model, frames, mark(line, message, ...nodes) {
      step(message, nodes.filter(Boolean).map((node) => node.id), { traceLine: line });
    } };
  }

  function listTrace(pref) {
    const { model: m, frames, mark } = nodeTrace(pref,
      b('从课堂 MyLinkedList.add 进入，e 保存传入的 Book 引用。', 'Enter MyLinkedList.add with e referring to the Book argument.'));
    m.newNode = bookNode(m.size + 1, pref.title.trim());
    mark(1, b('new 分配一个节点，data 指向传入的 Book，next 初始为 null。', 'new allocates a node. data refers to the incoming Book and next starts as null.'), m.newNode);
    mark(2, m.head ? b('head 指向现有首节点，进入 else。', 'head refers to an existing node, so enter else.')
      : b('head 是 null，走空链表分支。', 'head is null, so take the empty-list branch.'), m.head);
    if (!m.head) {
      m.head = m.newNode;
      mark(3, b('head 改为指向新节点。现在从 head 就能找到它。', 'Set head to the new node. The node is now reachable from head.'), m.newNode);
    } else {
      m.currentNode = m.head;
      mark(5, b('把 head 的引用复制给 currentNode。两者此刻指向同一个节点。',
        'Copy the head reference into currentNode. They now refer to one node.'), m.currentNode);
      while (m.currentNode.next !== null) {
        mark(6, b('currentNode.next 非空，还能往后走。', 'currentNode.next is non-null, so the loop can advance.'), m.currentNode);
        m.currentNode = m.currentNode.next;
        mark(7, b('只移动 currentNode，head 与已有的 next 字段都不变。', 'Move only currentNode. head and existing next fields stay the same.'), m.currentNode);
      }
      mark(6, b('currentNode.next 为 null。循环在仍有效的末节点停下。', 'currentNode.next is null. The loop stops on the last real node.'), m.currentNode);
      m.currentNode.next = m.newNode;
      mark(9, b('写入最后一个旧节点的 next。原来的链现在能走到新节点。', 'Write the old tail’s next field. The original chain now reaches the new node.'), m.currentNode, m.newNode);
    }
    m.currentNode = null;
    m.size++;
    mark(11, b('两条分支最终都执行一次 size++。此时 size 与可达节点数一致。',
      'Both branches reach size++ once. size now matches the number of reachable nodes.'), m.newNode);
    return frames;
  }

  function treeTrace(pref) {
    const { model: m, frames, mark } = nodeTrace(pref,
      b('跟踪 root、child、cursor 三个引用。', 'Track the root, child, and cursor references.'));
    m.root = treeNode(1, 8);
    mark(1, b('创建根节点 8，两个孩子起初都为 null。', 'Create root 8, with both child links initially null.'), m.root);
    m.child = treeNode(2, 4);
    mark(2, b('创建节点 4。child 指向它，它尚未接到根。', 'Create node 4. child refers to it, and it is still detached.'), m.child);
    m.current = m.root;
    mark(3, b('cursor = root 复制引用，两者都指向节点 8。', 'cursor = root copies a reference. Both now refer to node 8.'), m.root);
    m.current.left = m.child;
    mark(4, b('cursor.left 写的是节点 8 的左链接。从 root 也能沿 left 找到 4。', 'Writing cursor.left changes node 8. Its left link now reaches 4 from root.'), m.root, m.child);
    m.current = m.current.left;
    mark(5, b('cursor 移到 4。root 仍然指向 8，已有链接不变。', 'Move cursor to 4. root still refers to 8, and existing links stay intact.'), m.current);
    m.current.right = treeNode(3, 6);
    mark(6, b('给 4 接上右孩子 6。此刻根的右孩子仍为空。', 'Attach 6 as the right child of 4. The root’s right link is still null.'), m.current, m.current.right);
    m.root.right = treeNode(4, 12);
    mark(7, b('使用 root.right 接上 12。先确定变量指向谁，再判断改的是哪个字段。', 'Attach 12 through root.right. Identify the referenced object first, then the field being written.'), m.root, m.root.right);
    return frames;
  }

  function recursiveLines(reconnect) {
    return [
      'root = insert(root, 4);',
      '',
      'TreeNode<Integer> insert(TreeNode<Integer> p, int key) {',
      '    if (p == null) return new TreeNode<>(key);',
      '    if (key < p.data) {',
      reconnect === 'yes' ? '        p.left = insert(p.left, key);' : '        insert(p.left, key);',
      '    } else if (key > p.data) {',
      '        p.right = insert(p.right, key);',
      '    }',
      '    return p;',
      '}'
    ];
  }

  function recursiveTrace(pref) {
    const { model: m, frames, mark } = nodeTrace(pref,
      b('树里只有 8。把 4 插进它的空左子树。', 'The tree only contains 8. Insert 4 into its empty left subtree.'));
    m.current = m.root;
    mark(1, b('顶层把 root 的引用和 key = 4 传给 insert。', 'Pass root and key = 4 into the top-level insert call.'), m.root);
    mark(5, b('当前 p 指向 8。4 < 8，对 p.left 调用 insert。', 'p refers to 8. Since 4 < 8, call insert on p.left.'), m.current);
    m.current = null;
    m.returned = treeNode(2, 4);
    mark(4, b('递归这一层拿到 null，创建并返回新节点 4。此刻它还没接到原树上。',
      'The recursive call receives null and returns a fresh node 4. The original tree does not yet reach it.'), m.returned);
    m.current = m.root;
    if (pref.reconnect === 'yes') {
      m.current.left = m.returned;
      mark(6, b('返回上一层，把新节点写到 8 的 left。', 'Back in the caller, write the returned node into left on 8.'), m.current, m.returned);
    } else {
      m.returned = null;
      mark(6, b('调用返回的新节点没有赋给任何字段，8 的 left 仍为 null。',
        'The returned node is not stored in a field. The left link on 8 is still null.'), m.current);
    }
    m.returned = m.current;
    mark(10, b('这一层返回节点 8，作为更新后的整棵子树根。', 'This call returns 8 as the root of its updated subtree.'), m.current);
    m.root = m.returned;
    m.current = null;
    mark(1, b('在调用处保存最终的根。观察 root.left 有没有接上 4。', 'Save the returned root at the outer call. Check whether root.left reaches 4.'), m.root);
    return frames;
  }

  function codeTrace(lines, active, t) {
    return el('div', { class: 'trace-code' },
      el('div', { class: 'trace-code-heading' }, t(b('当前执行的代码', 'Code being traced'))),
      el('ol', { class: 'mono', data: { scroll: '' } }, lines.map((line, index) =>
        el('li', { class: active === index + 1 ? 'is-active' : '',
          'aria-current': active === index + 1 ? 'step' : null, data: { line: index + 1 } },
        el('code', {}, line || ' ')))));
  }

  function detached(label, content) {
    return el('div', { class: 'detached-node' }, el('span', {}, label), el('code', { class: 'mono' }, content));
  }
  const ref = (node) => node ? '#' + node.id : 'null';
  const key = (node) => node ? node.key : 'null';

  function listBoard(frame, ui) {
    const { t } = ui;
    const m = frame.model;
    const chain = [];
    for (let p = m.head; p !== null; p = p.next) chain.push(p);
    const newBook = m.newNode;
    return el('div', { class: 'reference-board' },
      stats(stat('head', ref(m.head)), stat('currentNode', m.currentNode ? ref(m.currentNode) : '—'),
        stat('newNode', newBook ? ref(newBook) : '—'), stat('size', m.size)),
      sub(t(b('从 head 可以走到的节点', 'Nodes reachable from head'))),
      chain.length ? el('div', { class: 'diagram-scroll', data: { scroll: '' } },
        el('div', { class: 'link-strip' }, chain.flatMap((node) => [
          el('div', { class: 'linked-node' + (frame.marks.includes(node.id) ? ' is-active' : ''), data: { bookNode: node.id } },
            el('span', { class: 'linked-id mono' }, ref(node)),
            el('strong', {}, node.data.title),
            el('span', { class: 'node-ref mono' }, 'next → ' + ref(node.next))),
          node.next ? el('span', { class: 'link-arrow', 'aria-hidden': 'true' }, '→') : null
        ]))) : empty(t, b('head 为空', 'head is null')),
      newBook && !chain.includes(newBook)
        ? detached(t(b('单独创建、尚未接线', 'Allocated and still detached')),
          ref(newBook) + ' · data → Book(' + JSON.stringify(newBook.data.title) + ') · next → null') : null,
      el('p', { class: 'reference-caption' },
        t(b('书名来自 data 所指的 Book。# 编号代表节点对象，— 表示这一行没有该局部变量。', 'Titles come from the Book referenced by data. # identifies node objects, and — marks a local variable outside its scope at this line.'))));
  }

  function reaches(node, target) {
    return Boolean(node && (node === target || reaches(node.left, target) || reaches(node.right, target)));
  }

  function treeBoard(frame, ui) {
    const { t } = ui;
    const m = frame.model;
    const recursive = m.mode === 'recursive';
    const candidate = recursive ? m.returned : m.child;
    const detachedNode = candidate && !reaches(m.root, candidate);
    return el('div', { class: 'reference-board' },
      stats(stat('root', key(m.root)), stat(recursive ? 'p' : 'cursor', key(m.current)),
        stat(recursive ? t(b('返回的节点', 'Returned node')) : 'child', key(candidate))),
      detachedNode ? detached(t(b('新节点还在树外', 'The new node is still detached')), 'data = ' + candidate.key + ' · left = null · right = null') : null,
      tree(m.root, frame, ui));
  }

  labs['java-nodes'] = {
    title: b('跟着引用走', 'Follow the references'),
    intro: b('看清楚每句代码是在创建节点、移动一个变量，还是改写一个节点的连接。',
      'See whether each line allocates a node, moves a variable, or rewires a field on a node.'),
    ready: b('选择一个场景开始。链表尾插用的正是课堂代码的 head、currentNode 和 newNode。',
      'Choose a scenario. The append trace uses head, currentNode, and newNode from the classroom code.'),
    seed: nodeSeed,
    pref: nodeDefaults,
    setup(ui) {
      const change = () => ui.newModel(nodeSeed(ui.pref), true,
        b('初始状态已就绪，可以开始单步追踪。', 'The starting state is ready. Start the code trace.'));
      ui.row(ui.select('mode', b('场景', 'Scenario'), nodeModes,
        () => ui.newModel(nodeSeed(ui.pref), false, b('已切换场景。', 'Scenario changed.')), true));
      const { mode } = ui.pref;
      ui.row(
        mode === 'list' ? [
          ui.select('start', b('初始链表', 'Starting list'), { two: b('已有两本书', 'Two books'), empty: b('空链表', 'Empty list') }, change, true),
          ui.field('title', b('要加入的书名', 'Book title to add'), { class: 'text-field', maxLength: 24 })
        ] : mode === 'recursive' ? ui.select('reconnect', b('左分支写法', 'Left-branch statement'), {
          yes: 'p.left = insert(p.left, key);', no: 'insert(p.left, key);'
        }, change, true) : null,
        ui.action('run-nodes', b('开始追踪', 'Trace the code'), () => {
          if (mode === 'list' && !ui.pref.title.trim()) {
            ui.noteError(b('先给新书输入一个书名。', 'Enter a title for the new book.'));
            return;
          }
          const run = mode === 'list' ? listTrace : mode === 'tree' ? treeTrace : recursiveTrace;
          ui.setFrames(run(ui.pref));
        }, 'primary'));
    },
    view(frame, ui) {
      const m = frame.model;
      const lines = m.mode === 'list' ? listLines : m.mode === 'tree' ? treeLines : recursiveLines(m.reconnect);
      return el('div', { class: 'reference-trace' },
        codeTrace(lines, frame.traceLine, ui.t),
        m.mode === 'list' ? listBoard(frame, ui) : treeBoard(frame, ui));
    },
    tryIt: [
      b('先对有两本书的链表运行尾插。找到只有 currentNode 移动的那一步，再找真正改变 next 的一步。', 'Append to a two-book list. Find the step that moves only currentNode and then the one that writes next.'),
      b('把初始链表切换为「空链表」，观察为什么这次只需要改 head。', 'Switch to the empty list and see why this branch only needs to write head.'),
      b('试二叉树接孩子，再用 BST 场景分别运行两种左分支。对比最终的 root.left。', 'Attach children in the binary-tree scenario, then try both BST left-branch statements and compare the final root.left.')
    ]
  };
})();
