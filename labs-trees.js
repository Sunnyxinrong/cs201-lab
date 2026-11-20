'use strict';

(() => {
  const { bi: b } = CS201;
  const { el, labs } = CS201UI;
  const { stat, stats, sub, empty, cells, sequence, tree } = CS201Visuals;
  const M = CS201Models;
  const keyLabel = b('整数键', 'Integer key');
  const bool = (t, value) => t(value ? b('是', 'Yes') : b('否', 'No'));

  labs[14] = {
    title: b('遍历一棵树', 'Walk a tree'),
    ready: b('选择树形、遍历顺序，然后从根开始。也可以先点一个节点看看它的关系。', 'Choose a shape and traversal, then start at the root. You can also inspect a node first.'),
    seed: () => ({ root: M.treeFromLevel(M.treeSamples.complete.values) }),
    pref: { sample: 'complete', order: 'bfs' },
    setup(ui) {
      ui.row(ui.select('sample', b('树形', 'Tree shape'), Object.fromEntries(Object.entries(M.treeSamples).map(([k, x]) => [k, x.title])),
        (name) => ui.newModel({ root: M.treeFromLevel(M.treeSamples[name].values) }), true),
      ui.select('order', b('遍历方式', 'Traversal order'), M.walkTitles, null, true),
      ui.action('walk', b('开始遍历', 'Run traversal'),
        () => ui.setFrames(M.walkTree(ui.model(), ui.pref.order)), 'primary'));
    },
    view(f, ui) {
      const facts = M.treeFacts(f.model.root);
      const { t } = ui;
      return el('div', { class: 'tree-visual' },
        stats(stat(t(b('节点数', 'Nodes')), facts.size), stat(t(b('高度', 'Height')), facts.height),
          stat('Full', bool(t, facts.full)), stat('Complete', bool(t, facts.complete)),
          stat('Perfect', bool(t, facts.perfect)), stat(t(b('平衡', 'Balanced')), bool(t, facts.balanced))),
        tree(f.model.root, f, ui),
        f.walk ? [
          sequence(t(f.walk.kind === 'bfs' ? b('队列 · 队首在左', 'Queue · front at left') : b('调用栈 · 栈顶在右', 'Call stack · top at right')), f.walk.pending),
          sequence(t(b('访问输出', 'Visit output')), f.walk.history, true)
        ] : sequence(t(b('访问输出', 'Visit output')), []));
    },
    tryIt: [
      b('用默认树跑一次 BFS。手动前进，找出 B、C 什么时候入队、什么时候输出。', 'Run BFS on the default tree. Step through to see when B and C enter the queue and when they are emitted.'),
      b('在同一棵树上改跑中序。切换到偏斜树，点最深的节点，看它的深度。', 'Run inorder on the same tree. Then switch to the skewed shape and inspect its deepest node.')
    ]
  };

  function searchTreeView(frame, ui, avl) {
    const { root } = frame.model;
    const facts = M.treeFacts(root);
    return el('div', { class: 'tree-visual' },
      stats(stat(ui.t(b('节点数', 'Nodes')), facts.size), stat(ui.t(b('高度', 'Height')), facts.height),
        avl ? stat(ui.t(b('平衡', 'Balanced')), bool(ui.t, facts.balanced)) : null),
      tree(root, frame, ui, avl ? 'avl' : 'plain'),
      sequence(ui.t(b('中序', 'Inorder')), M.inorder(root)));
  }

  function treeOps(ui, avl) {
    const run = (op, label, tone) => ui.intAction(op, label, 'value', (m, key) => M.treeAction(m, op, key, avl), tone);
    ui.row(ui.number('value', keyLabel),
      run('insert', b('插入', 'Insert'), 'primary'), run('find', b('查找', 'Find')),
      run('delete', b('删除', 'Delete')),
      avl ? null : ['min', 'max'].map((op) =>
        ui.action(op, op + '()', () => ui.setFrames(M.treeAction(ui.model(), op)))));
  }

  labs[15] = {
    title: b('二叉搜索树工作台', 'Binary search tree workbench'),
    ready: b('输入 7 试插入。要看后继替换，恢复平衡样例并删除根 8。', 'Try inserting 7. To see a successor replacement, load the balanced example and delete root 8.'),
    seed: M.treeSeed, pref: { value: '7' },
    setup(ui) {
      treeOps(ui, false);
      ui.row(ui.action('balanced', b('平衡样例', 'Balanced example'), () => ui.newModel(M.treeSeed()), 'quiet'),
        ui.action('skewed', b('升序插入的树', 'Sorted-insertion tree'),
          () => ui.newModel(M.treeSeed([2, 4, 6, 8, 10, 12, 14]), true,
            b('键相同，插入顺序从小到大，树变成右链。', 'The same keys inserted in ascending order form a right chain.')), 'quiet'),
        ui.action('empty', b('空树', 'Empty tree'), () => ui.newModel(M.treeSeed([])), 'quiet'));
    },
    view: (f, ui) => searchTreeView(f, ui, false),
    tryIt: [
      b('先在平衡样例中查找 14，再在升序插入的树中查找 14。数一数各比较了几次。', 'Find 14 in the balanced example, then in the sorted-insertion tree. Count comparisons in both.'),
      b('恢复平衡样例，删 8。观察两个 10 短暂同时出现的那一步，再确定最终只剩一个 10。', 'Reload the balanced tree and delete 8. Observe the frame with two copies of 10, then confirm only one remains.')
    ]
  };

  const heapKinds = { max: b('最大堆', 'Max-heap'), min: b('最小堆', 'Min-heap') };
  labs[16] = {
    title: b('二叉堆工作台', 'Binary heap workbench'),
    ready: b('堆顶和数组第 0 项是同一个位置。用 80 试插入，再看 poll 的下沉过程。', 'The root is array index 0. Try inserting 80, then watch poll sift a replacement down.'),
    seed: M.heapSeed, pref: { kind: 'max', value: '80' },
    setup(ui) {
      ui.row(ui.select('kind', b('堆序', 'Heap order'), heapKinds, (kind) =>
        ui.setFrames(M.heapAction(ui.model(), 'build', null, kind)), true),
      ui.number('value', keyLabel),
      ui.intAction('insert', b('offer(x) 插入', 'offer(x) Insert'), 'value',
        (m, n) => M.heapAction(m, 'insert', n), 'primary'),
      ui.action('poll', b('poll() 取根', 'poll() Extract root'), () => ui.setFrames(M.heapAction(ui.model(), 'poll'))),
      ui.action('peek', 'peek()', () => ui.setFrames(M.heapAction(ui.model(), 'peek'))));
      ui.row(ui.action('build', b('用乱序数组建堆', 'Build from an unordered array'), () =>
        ui.setFrames(M.heapAction(ui.model(), 'build', null, ui.model().kind, [26, 12, 54, 8, 91, 41, 33])), 'quiet'),
      ui.action('empty', b('空堆', 'Empty heap'), () => ui.newModel({ kind: ui.model().kind, items: [] }), 'quiet'));
    },
    view(f, ui) {
      const { kind, items } = f.model;
      return el('div', { class: 'tree-visual heap-visual' },
        stats(stat(ui.t(b('堆序', 'Heap order')), ui.t(heapKinds[kind])), stat('size', items.length), stat('root', items[0] ?? '∅')),
        tree(M.treeFromLevel(items), f, ui, 'heap'),
        sub(ui.t(b('层序数组 · 0 起始下标', 'Level-order array · zero-based indices'))),
        items.length ? cells(items, f.marks, {}, f.candidates) : empty(ui.t));
    },
    tryIt: [
      b('比较 offer(80) 和 poll()，看它们为什么沿相反方向修复。', 'Compare offer(80) and poll(). Watch why they repair in opposite directions.'),
      b('换成最小堆，再用乱序数组建堆。预测接下来的三次 poll() 返回值。', 'Switch to a min-heap and build from the unordered array. Predict the next three poll() results.')
    ]
  };

  const pivots = { LL: [30, 20, 10], RR: [10, 20, 30], LR: [30, 10, 20], RL: [10, 30, 20] };
  labs[17] = {
    title: b('平衡因子与旋转', 'Balance factors and rotations'),
    ready: b('默认插入 20 会触发 LR。也可一键运行下面任一旋转样例。', 'Inserting the default key 20 triggers LR. You can also run any rotation example below.'),
    seed: () => M.treeSeed([30, 10], true), pref: { value: '20' },
    setup(ui) {
      treeOps(ui, true);
      function example(keys, op, key) {
        ui.pref.value = String(key);
        ui.setup();
        ui.setFrames(M.treeAction(M.treeSeed(keys, true), op, key, true));
      }
      ui.row(Object.entries(pivots).map(([kind, sequence]) =>
        ui.action(kind.toLowerCase(), kind, () => example(sequence.slice(0, 2), 'insert', sequence[2]), 'quiet')),
      ui.action('delete-example', b('删除触发旋转', 'Deletion rotation'), () => example([4, 2, 5, 1, 3], 'delete', 5), 'quiet'),
      ui.action('empty', b('空树', 'Empty tree'), () => ui.newModel(M.treeSeed([], true)), 'quiet'));
    },
    view: (f, ui) => searchTreeView(f, ui, true),
    tryIt: [
      b('先运行 LL 和 LR，用上一步回看第一次出现 |BF| = 2 的画面。比较两种修复总共转了几次。', 'Run LL and LR. Rewind to the first frame with |BF| = 2 and compare the number of rotations.'),
      b('运行删除样例。检查 BF = 0 的孩子为何仍可以参与单旋，观察中间子树 3 转向哪里。', 'Run the deletion example. See how a BF=0 child can participate in a single rotation and where middle subtree 3 goes.')
    ]
  };
})();
