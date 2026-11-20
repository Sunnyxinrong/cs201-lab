'use strict';

(() => {
  const { bi: b } = CS201;
  const { trace, limits } = CS201Models;
  const height = (node) => node?.height ?? -1;
  const refresh = (node) => { node.height = 1 + Math.max(height(node.left), height(node.right)); };
  const factor = (node) => height(node.left) - height(node.right);
  const leaf = (key, id) => ({ key, id, height: 0, left: null, right: null });
  const treeHeight = (root) => root ? 1 + Math.max(treeHeight(root.left), treeHeight(root.right)) : -1;

  function inorder(root) {
    return root ? [...inorder(root.left), root.key, ...inorder(root.right)] : [];
  }

  function treeFromLevel(level, i = 0) {
    if (i >= level.length || level[i] == null) return null;
    const root = leaf(level[i], i);
    root.left = treeFromLevel(level, 2 * i + 1);
    root.right = treeFromLevel(level, 2 * i + 2);
    refresh(root);
    return root;
  }

  const treeSamples = {
    complete: { values: ['A', 'B', 'C', 'D', 'E', 'F'], title: b('完全树', 'Complete') },
    full: { values: ['A', 'B', 'C', null, null, 'D', 'E'], title: b('严格树', 'Full') },
    perfect: { values: ['A', 'B', 'C', 'D', 'E', 'F', 'G'], title: b('完美树', 'Perfect') },
    skewed: { values: ['A', null, 'B', null, null, null, 'C'], title: b('偏斜树', 'Skewed') },
    expression: { values: ['÷', '×', 'D', 'A', '+', null, null, null, null, 'B', 'C'], title: b('表达式树', 'Expression') }
  };

  function treeFacts(root) {
    const nodes = root ? [[root, 0]] : [];
    let full = true;
    let balanced = true;
    for (const [node, index] of nodes) {
      if (node.left) nodes.push([node.left, 2 * index + 1]);
      if (node.right) nodes.push([node.right, 2 * index + 2]);
      full &&= Boolean(node.left) === Boolean(node.right);
      balanced &&= Math.abs(treeHeight(node.left) - treeHeight(node.right)) <= 1;
    }
    const h = treeHeight(root);
    return {
      size: nodes.length, height: h, full, balanced,
      complete: (nodes.at(-1)?.[1] ?? -1) === nodes.length - 1,
      perfect: nodes.length === 2 ** (h + 1) - 1
    };
  }

  const walkTitles = {
    pre: b('前序 · NLR', 'Preorder · NLR'), in: b('中序 · LNR', 'Inorder · LNR'),
    post: b('后序 · LRN', 'Postorder · LRN'), bfs: b('层序 · BFS', 'Level order · BFS')
  };

  function walkTree(source, kind) {
    const history = [];
    const pending = [];
    const detail = () => ({ walk: { history, pending, kind } });
    const { model: m, frames, step } = trace(source,
      b('从根开始，输出序列目前为空。', 'Start at the root with an empty output sequence.'), detail());
    function visit(node) {
      history.push(node.key);
      step(b('访问 ' + node.key + '，把它加到输出。', 'Visit ' + node.key + ' and append it to the output.'), [node.id], detail());
    }
    function depth(node) {
      if (!node) return;
      pending.push(node.key);
      step(b('进入 ' + node.key + ' 的调用帧。', 'Enter the call frame for ' + node.key + '.'), [node.id], detail());
      if (kind === 'pre') visit(node);
      depth(node.left);
      if (kind === 'in') visit(node);
      depth(node.right);
      if (kind === 'post') visit(node);
      pending.pop();
      step(b('从 ' + node.key + ' 返回上一层。', 'Return from ' + node.key + ' to its caller.'), [node.id], detail());
    }
    if (kind === 'bfs' && m.root) {
      const queue = [m.root];
      pending.push(m.root.key);
      step(b('把根节点入队。', 'Enqueue the root.'), [m.root.id], detail());
      while (queue.length) {
        const node = queue.shift();
        pending.shift();
        visit(node);
        const kids = [node.left, node.right].filter(Boolean);
        if (kids.length) {
          queue.push(...kids);
          pending.push(...kids.map((x) => x.key));
          step(b('按先左后右的顺序将孩子入队。', 'Enqueue the children in left-to-right order.'), kids.map((x) => x.id), detail());
        }
      }
    } else {
      depth(m.root);
    }
    step(b('遍历完成。', 'Traversal complete.'), [], { ...detail(), result: history.join(' → ') });
    return frames;
  }

  // A position identifies a link rather than a node, so rotations can replace that link.
  function rotate(at, direction, step) {
    const old = at.parent[at.edge];
    const side = direction === 'right' ? 'left' : 'right';
    const newRoot = old[side];
    old[side] = newRoot[direction];
    newRoot[direction] = old;
    refresh(old);
    refresh(newRoot);
    at.parent[at.edge] = newRoot;
    step(direction === 'right'
      ? b('对 ' + old.key + ' 右旋，' + newRoot.key + ' 成为子树根。', 'Rotate right at ' + old.key + ' and promote ' + newRoot.key + '.')
      : b('对 ' + old.key + ' 左旋，' + newRoot.key + ' 成为子树根。', 'Rotate left at ' + old.key + ' and promote ' + newRoot.key + '.'),
    [old.id, newRoot.id]);
  }

  function repair(ancestors, avl, step) {
    for (const at of ancestors.reverse()) {
      const node = at.parent[at.edge];
      refresh(node);
      if (!avl) continue;
      const bf = factor(node);
      step(b('从下往上检查 ' + node.key + '，BF = ' + bf + '。', 'Check ' + node.key + ' on the way up. BF = ' + bf + '.'), [node.id]);
      if (bf > 1) {
        const zigzag = factor(node.left) < 0;
        step(zigzag ? b('左重且左孩子右重，属于 LR。', 'Left-heavy with a right-heavy left child (LR).')
          : b('左重且左孩子 BF ≥ 0，属于 LL。', 'Left-heavy with left-child BF ≥ 0 (LL).'), [node.id, node.left.id]);
        if (zigzag) rotate({ parent: node, edge: 'left' }, 'left', step);
        rotate(at, 'right', step);
      } else if (bf < -1) {
        const zigzag = factor(node.right) > 0;
        step(zigzag ? b('右重且右孩子左重，属于 RL。', 'Right-heavy with a left-heavy right child (RL).')
          : b('右重且右孩子 BF ≤ 0，属于 RR。', 'Right-heavy with right-child BF ≤ 0 (RR).'), [node.id, node.right.id]);
        if (zigzag) rotate({ parent: node, edge: 'right' }, 'right', step);
        rotate(at, 'left', step);
      }
    }
  }

  function treeAction(source, op, key, avl = false) {
    const { model: m, frames, step } = trace(source, b('从根开始比较键。', 'Start comparing keys at the root.'));
    const path = [];
    const ancestors = [];
    let at = { parent: m, edge: 'root' };
    let node = m.root;

    if (op === 'min' || op === 'max') {
      const side = op === 'min' ? 'left' : 'right';
      while (node?.[side]) {
        step(side === 'left' ? b('往左走寻找更小的键。', 'Follow left to a smaller key.')
          : b('往右走寻找更大的键。', 'Follow right to a larger key.'), [node.id]);
        node = node[side];
      }
      step(node ? b('到达所选方向的末端。', 'Reached the end in that direction.') : b('树为空。', 'The tree is empty.'),
        node ? [node.id] : [], { result: node?.key ?? null });
      return frames;
    }

    while (node && node.key !== key) {
      path.push(node.id);
      const left = key < node.key;
      step(left ? b(key + ' < ' + node.key + '，走左边。', key + ' < ' + node.key + '. Go left.')
        : b(key + ' > ' + node.key + '，走右边。', key + ' > ' + node.key + '. Go right.'), [node.id], { path });
      ancestors.push(at);
      at = { parent: node, edge: left ? 'left' : 'right' };
      node = node[at.edge];
    }
    if (op === 'find') {
      step(node ? b('相等，找到键 ' + key + '。', 'Equal. Found key ' + key + '.')
        : b('走到空引用，目标不在树里。', 'Reached a null link. The key is absent.'),
      node ? [node.id] : [], { path, result: Boolean(node) });
      return frames;
    }
    if (op === 'insert') {
      if (node || inorder(m.root).length >= limits.tree) {
        step(node ? b('树里已有这个键。', 'This key already exists.') : b('实验已达到节点数上限。', 'The lab has reached its node limit.'),
          node ? [node.id] : [], { result: false });
        return frames;
      }
      const added = leaf(key, ++m.serial);
      at.parent[at.edge] = added;
      step(b('在空链接处接上新叶子 ' + key + '。', 'Attach new leaf ' + key + ' at the empty link.'), [added.id], { path });
    } else {
      if (!node) {
        step(b('走到空链接，树中没有该键。', 'Reached a null link. This key is absent.'), [], { path, result: false });
        return frames;
      }
      step(b('定位要删除的节点 ' + key + '。', 'Locate the deletion target ' + key + '.'), [node.id], { path });
      if (node.left && node.right) {
        ancestors.push(at);
        let slot = { parent: node, edge: 'right' };
        let next = node.right;
        while (next.left) {
          step(b('在右子树里向左寻找中序后继。', 'Walk left within the right subtree to find the successor.'), [next.id]);
          ancestors.push(slot);
          slot = { parent: next, edge: 'left' };
          next = next.left;
        }
        node.key = next.key;
        step(b('将后继 ' + next.key + ' 的键复制到删除位置。', 'Copy successor key ' + next.key + ' into the deletion site.'), [node.id, next.id]);
        slot.parent[slot.edge] = next.right;
        step(b('移除原后继，其右孩子（可能为空）接回原位置。', 'Remove the original successor and reconnect its right child, possibly null.'), [node.id]);
      } else {
        const child = node.left ?? node.right;
        at.parent[at.edge] = child;
        step(child ? b('用唯一的孩子接替节点 ' + key + '。', 'Replace node ' + key + ' with its sole child.')
          : b('它是叶子，把对应的链接置空。', 'It is a leaf. Clear the corresponding link.'), child ? [child.id] : []);
      }
    }
    repair(ancestors, avl, step);
    step(avl ? b('完成。检查每个节点的平衡因子。', 'Done. Inspect the balance factors.')
      : b('完成。检查最新的中序序列。', 'Done. Inspect the new inorder sequence.'), [], { result: true });
    return frames;
  }

  function treeSeed(keys = [8, 4, 12, 2, 6, 10, 14], avl = false) {
    let model = { root: null, serial: 0 };
    for (const key of keys) model = treeAction(model, 'insert', key, avl).at(-1).model;
    return model;
  }

  const heapSeed = () => ({ kind: 'max', items: [90, 40, 60, 10, 25] });
  function heapAction(source, op, value, kind = source.kind, keys = source.items) {
    const { model: m, frames, step } = trace(source, b('数组和树表示同一个堆。', 'The array and tree represent the same heap.'));
    const outranks = (x, y) => m.kind === 'max' ? x > y : x < y;
    function exchange(x, y) {
      [m.items[x], m.items[y]] = [m.items[y], m.items[x]];
      step(b('交换下标 ' + x + ' 和 ' + y + '。', 'Swap indices ' + x + ' and ' + y + '.'), [x, y]);
    }
    function siftDown(i) {
      while (2 * i + 1 < m.items.length) {
        const left = 2 * i + 1;
        const right = left + 1;
        const child = right < m.items.length && outranks(m.items[right], m.items[left]) ? right : left;
        step(b('先挑更优先的孩子，再与父节点比较。', 'Choose the higher-priority child and compare it with the parent.'),
          [i, child], { candidates: [left, right] });
        if (!outranks(m.items[child], m.items[i])) break;
        exchange(i, child);
        i = child;
      }
    }
    if (op === 'build') {
      m.kind = kind;
      m.items = [...keys];
      step(b('从最后一个非叶子开始，自底向上逐个下沉。', 'From the last internal node, sift down each internal node in reverse index order.'));
      for (let i = Math.floor(m.items.length / 2) - 1; i >= 0; i--) siftDown(i);
      step(b('建堆完成。堆顶是当前最优先的键。', 'Heap built. The root holds the highest-priority key.'), [0]);
    } else if (op === 'insert') {
      if (m.items.length === limits.heap) {
        step(b('实验堆已达到最大项数。', 'The lab heap has reached its size limit.'));
        return frames;
      }
      let i = m.items.push(value) - 1;
      step(b('把新值放到末尾，保持完全树形。', 'Append the new value to preserve the complete shape.'), [i]);
      while (i > 0) {
        const p = Math.floor((i - 1) / 2);
        step(b('比较新项与它的父节点。', 'Compare the new item with its parent.'), [i, p]);
        if (!outranks(m.items[i], m.items[p])) break;
        exchange(i, p);
        i = p;
      }
      step(b('上浮完成，所有父子边满足堆序。', 'Sifting up is complete. Every edge satisfies heap order.'), [i]);
    } else if (op === 'peek' || m.items.length === 0) {
      step(m.items.length ? b('堆顶是当前最优先的键。', 'The root is the current highest-priority key.')
        : b('堆为空，返回 null。', 'The heap is empty. Return null.'), [0], { result: m.items[0] ?? null });
    } else {
      const result = m.items[0];
      step(b('保存即将取出的 ' + result + '。', 'Save root ' + result + ' for the return.'), [0], { exiting: 0 });
      const last = m.items.pop();
      if (m.items.length) {
        m.items[0] = last;
        step(b('用末尾值 ' + last + ' 补到堆顶。', 'Move the last value ' + last + ' into the root.'), [0]);
        siftDown(0);
      }
      step(b('取出完成，剩余节点满足堆序。', 'Extraction complete. The remaining nodes satisfy heap order.'), [], { result });
    }
    return frames;
  }

  Object.assign(CS201Models, {
    treeFromLevel, treeSamples, treeFacts, treeHeight, inorder, walkTitles, walkTree, treeSeed, treeAction,
    heapSeed, heapAction
  });
})();
