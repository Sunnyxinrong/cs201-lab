'use strict';

window.CS201 = (() => {
  const bi = (zh, en) => ({ zh, en });
  const section = (title, paragraphs, extras = {}) => ({ title, paragraphs, ...extras });
  const mc = (prompt, options, answer, hint, explanation) =>
    ({ kind: 'choice', prompt, options, answer, hint, explanation });
  const enter = (prompt, answer, hint, explanation, placeholder) =>
    ({ kind: 'input', prompt, answer, hint, explanation, placeholder });
  const order = (prompt, options, answer, hint, explanation) =>
    ({ kind: 'order', prompt, options, answer, hint, explanation });
  const groups = [
    { title: bi('打好基础', 'Foundations'), ids: [9, 10, 11], theme: 'violet' },
    { title: bi('线性结构', 'Linear structures'), ids: [12, 13], theme: 'teal' },
    { title: bi('树与优先级', 'Trees & priority'), ids: [14, 15, 16, 17], theme: 'blue' },
    { title: bi('键值检索', 'Key-based lookup'), ids: [18, 19], theme: 'amber' }
  ];
  const lectureFiles = {
    9: 'Lecture -9- bigO.pdf',
    10: 'Lecture - 10 - genericType+ArrayList.pdf',
    11: 'Lecture - 11 - linked list.pdf',
    12: 'Lecture - 12 - stack.pdf',
    13: 'Lecture - 13 - queue.pdf',
    14: 'Lecture - 14 - tree (binary tree).pdf',
    15: 'Lecture - 15 - binary search tree.pdf',
    16: 'Lecture - 16 - heap, priorityQue.pdf',
    17: 'Lecture - 17 - avl tree.pdf',
    18: 'Lecture - 18 - map.pdf',
    19: 'Lecture - 19 - hashTable.pdf'
  };
  const java = (name) => 'https://docs.oracle.com/en/java/javase/17/docs/api/java.base/' + name + '.html';
  const glossary = [
    [bi('抽象数据类型', 'Abstract data type'), 'ADT', bi('规定数据和操作的行为。栈的 LIFO 规则可以由数组或链表实现。', 'A contract for data and operations. An array or a linked list can implement the LIFO stack contract.'), 10],
    [bi('摊还复杂度', 'Amortized complexity'), 'amortized', bi('把一系列操作的总成本分摊到每次操作，例如 ArrayList 的多次尾部追加。', 'The total cost of a sequence divided across its operations, as with repeated ArrayList appends.'), 10],
    [bi('引用', 'Reference'), 'reference', bi('用来找到对象的值。链表的 next 引用指向下一个节点。', 'A value that refers to an object. A linked-list next reference refers to the following node.'), 11],
    [bi('后进先出', 'Last in, first out'), 'LIFO', bi('最后放入的元素最先取出，例如栈顶的盘子。', 'The most recently inserted item leaves first, like the top plate on a stack.'), 12],
    [bi('先进先出', 'First in, first out'), 'FIFO', bi('最早放入的元素最先取出，例如先到先服务的队列。', 'The earliest inserted item leaves first, as in a first-come, first-served line.'), 13],
    [bi('深度与高度', 'Depth & height'), 'depth height', bi('深度是根到节点的边数。节点高度是它到最深叶子的最长向下路径的边数。', 'Depth counts edges from the root to a node. Node height counts edges on its longest downward path to a leaf.'), 14],
    [bi('遍历', 'Traversal'), 'BFS DFS preorder inorder postorder', bi('按规则访问节点。BFS 逐层访问，DFS 深入分支。', 'Visiting nodes according to a rule. BFS explores by level and DFS descends into branches.'), 14],
    [bi('中序后继', 'Inorder successor'), 'successor', bi('中序序列中紧接在该节点之后的节点。若它有右子树，后继是右子树的最小节点。', 'The next node in inorder. When a right subtree exists, its smallest node is the successor.'), 15],
    [bi('堆序', 'Heap order'), 'heap', bi('二叉堆必须是完全二叉树，并且每条父子边都满足同一个大小关系。', 'A binary heap is complete and uses the same order relation on every parent–child edge.'), 16],
    [bi('平衡因子', 'Balance factor'), 'BF AVL', bi('左子树高度减右子树高度。AVL 中每个节点的结果都是 −1、0 或 1。', 'Left subtree height minus right subtree height. Every AVL node has a result of −1, 0, or 1.'), 17],
    [bi('键与值', 'Key & value'), 'Map key value', bi('键标识一条映射，值是由它取回的数据。相同的值可以被不同键共享。', 'A key identifies a mapping. Its value is the data retrieved by key. Multiple keys may share a value.'), 18],
    [bi('碰撞', 'Collision'), 'collision', bi('两个不同的键被映射到同一个桶。此时仍需比较键的相等性。', 'Two distinct keys map to the same bucket. The table still checks key equality.'), 19],
    [bi('装载因子', 'Load factor'), 'load factor α', bi('活动条目数除以桶或槽位数。开放寻址还需留意墓碑占用。', 'Active entries divided by the number of buckets or slots. In open addressing, tombstones also affect probe lengths.'), 19]
  ];
  return { bi, section, mc, enter, order, groups, lectureFiles, java, glossary, lessons: {} };
})();
