'use strict';

(() => {
  const { bi: b, section: s, mc, enter, order, java, lessons } = CS201;

  lessons[14] = {
    title: b('二叉树与遍历', 'Binary trees & traversal'),
    icon: 'tree', art: '⋔',
    intro: b('文件夹里面还可以套文件夹。树用父子关系表示这种层级，二叉树给每个节点左右两个位置。', 'Folders can contain more folders. A tree represents that hierarchy. A binary tree gives each node two positions for children, left and right.'),
    takeaway: b('BFS 一层层走，DFS 走完一个分支再回头。前、中、后序说的是何时处理根。', 'BFS visits by level. DFS finishes a branch before returning. Preorder, inorder, and postorder describe when the root is processed.'),
    lab: b('切换树形并点选节点。逐步运行四种遍历，看访问序列和待处理的队列或调用栈。', 'Switch tree shapes and inspect nodes. Step through four traversals and track the visit order and pending queue or call stack.'),
    chapters: [
      s(b('树的名字和数字', 'Vocabulary and measurements'), [
        b('树是一种非线性层级结构。非空树只有一个根，根以外每个节点恰有一个父节点。两个同父节点是兄弟节点。连线是一条边，没有孩子的是叶子，有至少一个孩子的是内部节点。以某节点为根和它的所有后代组成子树。', 'A tree is a nonlinear hierarchy. A nonempty tree has one root, and every other node has exactly one parent. Nodes with the same parent are siblings. Each link is an edge. A leaf has no children, and an internal node has at least one. A subtree consists of a node and all its descendants.'),
        b('深度数从整棵树的根到某节点有多少条边，根深度为 0。节点高度数它往下到最深叶子的最长路径边数。树高就是根的高度，本网站约定叶子高 0、空树高 −1。有些书按节点数，叶子高 1、空树高 0，算题先看约定。', 'Depth counts edges from the root to a node. The root has depth 0. A node’s height is its longest downward path length in edges, and the tree’s height is the root’s. This lab uses height 0 for leaves and −1 for empty trees. Some texts count nodes instead, giving 1 and 0, so check the convention.'),
        b('二叉树每个节点最多有两个孩子，左右有区别。只有右孩子的树与只有左孩子的树形不同。二叉树本身允许任意值，第 15 讲才引入键的排序规则。', 'Each binary-tree node has at most two children with distinct left and right positions. A lone right child and a lone left child give different shapes. Binary trees can contain arbitrary values. Lecture 15 adds an ordering rule.')
      ], { pages: '2–13' }),
      s(b('满、完全、完美、平衡', 'Full, complete, perfect, and balanced'), [
        b('术语在不同中文教材里可能有不同翻译，此处按课件的英文定义。特别留意 complete 的最后一层可以只填一部分，但这一层必须从左排起。', 'Chinese textbook translations can vary, so use the English definitions from the slides. In a complete tree, the last level may be partial, but it is filled from the left.')
      ], { pages: '14–19', table: {
        headers: [b('树形', 'Shape'), b('检查方法', 'What to check')],
        rows: [
          [b('严格二叉树 Full', 'Full'), b('每个节点只有 0 个或 2 个孩子。', 'Every node has either 0 or 2 children.')],
          [b('完全二叉树 Complete', 'Complete'), b('最后一层以上全部填满，最后一层从左到右无空隙。', 'All levels above the last are full. The last has no gaps before occupied nodes.')],
          [b('完美二叉树 Perfect', 'Perfect'), b('所有内部节点都有两个孩子，所有叶子同深。', 'Every internal node has two children and all leaves share a depth.')],
          [b('高度平衡 Height-balanced', 'Height-balanced'), b('每个节点的左右子树高度差绝对值 ≤ 1。', 'The two subtree heights differ by at most 1 at every node.')]
        ]
      }, after: b('完美树同时是 Full 和 Complete。根有两个孩子，只有左孩子再带两个叶子，就是同时 Full 和 Complete 却不 Perfect 的例子。高度为 h 的完美树共有 1 + 2 + … + 2ʰ = 2ʰ⁺¹ − 1 个节点。', 'A perfect tree is both full and complete. Give the root two children, then give only the left child two leaf children. That tree is full and complete but not perfect. A perfect tree of height h has 1 + 2 + … + 2ʰ = 2ʰ⁺¹ − 1 nodes.') }),
      s(b('BFS 用队列逐层走', 'BFS uses a queue to visit by level'), [
        b('从根入队开始。每次取队首并访问它，把存在的左孩子、右孩子按顺序入队。上层节点较早进队，所以一定较早被访问。这也是层序遍历。无权图的 BFS 可按边数找最短路，树从根到任意节点本来就只有一条路径。', 'Enqueue the root. Repeatedly dequeue and visit the front node, then enqueue its existing left and right children in order. Earlier levels entered the queue first and are visited first. This is level-order traversal. BFS finds shortest paths by edge count in unweighted graphs. A tree already has a unique path from its root to each node.'),
        b('访问 n 个节点是 Θ(n)。队列规模与树的宽度 w 同阶，具体某一刻可能同时放着相邻两层的部分节点，辅助空间 O(w)。课件第 22–23 页的文字把 BFS 和 DFS 的走法互换了，本实验按上述定义。', 'Visiting n nodes takes Θ(n). The queue may hold parts of two adjacent levels and uses O(w) extra space for tree width w. The prose on slides 22–23 switches the BFS and DFS descriptions. The lab follows the definitions here.')
      ], { pages: '21–24' }),
      s(b('DFS 的三个处理时机', 'Three DFS visit timings'), [
        b('深度优先会深入一个分支，回来再处理另一分支。在递归函数里，把“访问当前节点”放在两次递归之前、之间或之后，分别得到前序 NLR、中序 LNR、后序 LRN。N 是处理节点，L、R 是递归处理两棵子树。遇空子树立刻返回。', 'Depth-first traversal descends along one branch before returning for another. In the recursive method, visit the current node before, between, or after the two recursive calls for preorder NLR, inorder LNR, or postorder LRN. N processes the node. L and R recurse on its subtrees. An empty subtree returns immediately.'),
        b('假设根 A，左右孩子 B、C，B 的孩子 D、E，C 的左孩子 F。前序 A B D E C F，中序 D B E A F C，后序 D E B F C A，层序 A B C D E F。先把每个子树当作一小道同样的题。', 'Let A have children B and C, B have D and E, and C have left child F. Preorder is A B D E C F. Inorder is D B E A F C. Postorder is D E B F C A. Level order is A B C D E F. Treat each subtree as a smaller copy of the same task.'),
        b('三种 DFS 都访问 n 个节点，Θ(n) 时间。递归最深调用链长约 h+1，辅助空间 O(h+1)。可改用显式栈。例如迭代前序先压右孩子再压左孩子，从而先弹左孩子。', 'All three DFS variants visit n nodes in Θ(n) time. The deepest recursive chain has about h+1 active nodes, for O(h+1) extra space. An explicit stack also works. In iterative preorder, push the right child before the left so the left is popped first.')
      ], { pages: '25–43', code: `void inorder(Node node) {
    if (node == null) return;
    inorder(node.left);
    System.out.println(node.data);
    inorder(node.right);
}` }),
      s(b('用不同顺序做不同计算', 'Use traversal order to match the task'), [
        b('复制或序列化时通常希望先处理父节点，适合前序（完整重建还需记录空链接或形状信息）。删除整棵树或算目录总大小适合后序，因为要先处理孩子。BST 的中序会输出排序后的键，第 15 讲会解释为什么。', 'Preorder suits operations that handle a parent before its children, such as serialization with null markers or shape information for reconstruction. Postorder suits deleting a tree or computing directory totals because children go first. Inorder visits BST keys in sorted order, as explained in Lecture 15.'),
        b('表达式 (A × (B + C)) ÷ D 可以建成一棵树。根是 ÷，左为 × 的子树，右为 D。前序给出前缀 ÷ × A + B C D，后序给出后缀 A B C + × D ÷，中序写回中缀时要用括号保留原结构。', 'Represent (A × (B + C)) ÷ D with ÷ at the root, a × subtree on the left, and D on the right. Preorder produces prefix ÷ × A + B C D. Postorder produces postfix A B C + × D ÷. Add parentheses when writing infix from inorder to preserve the structure.')
      ], { pages: '43–44' })
    ],
    questions: [
      mc(b('二叉树中的一个节点最多能有几个孩子？', 'How many children can a binary-tree node have at most?'), ['1', '2', '3'], 1, b('左右各一个位置。', 'Count the left and right positions.'), b('可以有 0、1 或 2 个孩子，所以上限是 2。', 'A node may have 0, 1, or 2 children, so the maximum is 2.')),
      enter(b('根 A → B → C → D 连成一条向下的路径。按数边的约定，树高是多少？', 'Root A → B → C → D forms a downward chain. Using the edge-count convention, what is the tree height?'), '3', b('数箭头，不是字母。', 'Count the arrows between the letters.'), b('最深叶子 D 与根相隔 3 条边。', 'Three edges separate the deepest leaf D from the root.')),
      enter(b('根 A 有孩子 B、C，B 有孩子 D、E，C 只有左孩子 F。写出 BFS 访问顺序。', 'A has children B and C, B has D and E, and C has left child F. Enter the BFS visit order.'), 'A B C D E F', b('走完一层，再进入下一层。', 'Finish one level before starting the next.'), b('先 A，再同层 B C，最后按队列顺序 D E F。', 'Visit A, then B C on the same level, then D E F in queue order.'), 'A, …'),
      enter(b('仍用 A 的孩子是 B、C，B 的孩子是 D、E，C 只有左孩子 F 这棵树。写出后序。', 'Use the same tree: A has B and C, B has D and E, and C has left child F. Enter its postorder.'), 'D E B F C A', b('每个子树都先左、再右、最后根。', 'For each subtree, process left, then right, then root.'), b('左子树得到 D E B，右子树得到 F C，最后处理 A。', 'The left subtree gives D E B, the right gives F C, and A comes last.'), 'D, …'),
      mc(b('根的左、右孩子分别为 B、C，B 有两个叶子，C 是叶子。这棵树属于哪组类型？', 'The root’s children are B and C. B has two leaf children, and C is a leaf. Which types apply?'), [b('Full、Complete、Perfect 都满足', 'Full, complete, and perfect'), b('既 Full 又 Complete，叶子深度不全相同', 'Full and complete, with leaves at different depths'), b('Complete，但存在只有一个孩子的节点', 'Complete, with a node having exactly one child')], 1, b('检查每个节点子节点数和最底层是否靠左。', 'Check child counts and whether the bottom is left-packed.'), b('每个节点都有零或两个孩子，底层靠左，但 C 比另外两个叶子浅。', 'Each node has zero or two children and the last level is left-packed. C is shallower than the other two leaves.')),
      mc(b('你的程序要先计算两个孩子的大小，才能得到父目录的总大小。哪种 DFS 最自然？', 'Your program must compute both child sizes before computing a parent folder’s total. Which DFS order fits?'), [b('前序', 'Preorder'), b('中序', 'Inorder'), b('后序', 'Postorder')], 2, b('根应该在它的孩子前还是后被处理？', 'Should the root be processed before or after its children?'), b('后序处理左子树、右子树，再合并两个结果更新当前节点。', 'Postorder processes both children and then combines their results at the current node.'))
    ]
  };

  lessons[15] = {
    title: b('二叉搜索树', 'Binary search trees'),
    icon: 'search-tree', art: '⌕',
    intro: b('每次比较都能决定往左还是往右。树形合适时，只用看很短的一条路径。', 'Each comparison tells you which way to go. With a good tree shape, you only inspect a short path.'),
    takeaway: b('左子树所有键 < 根 < 右子树所有键。查找、插入、删除的成本随树高增长。', 'Every left-subtree key is smaller than the root, and every right-subtree key is larger. Search, insertion, and deletion depend on height.'),
    lab: b('输入任意整数来查找、插入、删除。对比平衡树和退化成链的树，试删一个有两个孩子的根。', 'Search, add, or delete a custom integer. Compare a balanced tree with a chain, and delete a root with two children.'),
    chapters: [
      s(b('从盲找变成有方向地找', 'From scanning to directed search'), [
        b('普通树没有顺序规则，可以用 BFS 或 DFS 找目标，最坏要查 n 个节点。有序数组则能用二分搜索：取中间值比较，保留可能含目标的一半。例如 [3, 14, 22, 37, 49] 找 37，先比较 22，再在右半边取得 37。每轮减半给出 O(log n)。', 'An unordered tree can search using BFS or DFS, inspecting n nodes in the worst case. A sorted array supports binary search. Compare the midpoint and keep the half that can contain the target. To find 37 in [3, 14, 22, 37, 49], compare 22, then 37 in the right half. Halving each time gives O(log n).'),
        b('BST 通过节点的大小关系提供方向。树的两棵子树未必一样大，能排除一边，代价仍取决于树形。', 'A BST supplies the direction through an ordering rule. The two subtrees can be different sizes. One side can be ruled out, and the total cost depends on the tree shape.')
      ], { pages: '2–9, 19–25' }),
      s(b('不变量检查整棵子树', 'The invariant covers entire subtrees'), [
        b('对每个节点 x，左子树里的所有键都小于 x.key，右子树里的所有键都大于它。左右子树递归满足同一规则。比如根 8，左孩子 4，4 的右孩子 9。9 > 4，但 9 在 8 的左子树，违反全局范围。', 'For each node x, all keys in its left subtree are less than x.key and all in its right subtree are greater. The same rule applies recursively. Suppose 8 has left child 4 and 4 has right child 9. The immediate comparison 9 > 4 passes, but 9 violates the range of 8’s left subtree.'),
        b('实验选用不同整数键，遇到重复就保持树不变。更一般的实现可在节点中存出现次数，或像 Map 一样用同键更新值。字符串比较可用 compareTo，自定义对象可用 Comparator。', 'The lab uses distinct integer keys and leaves the tree as-is on duplicate insertion. A variant can keep a count at each node, or update the value for an existing key as a Map does. Strings can use compareTo and custom objects can use a Comparator.')
      ], { pages: '10–16' }),
      s(b('查找、最小值与插入', 'Search, minimum, and insertion'), [
        b('从根开始。目标等于节点键则找到，较小走左，较大走右。走到 null 说明缺席。最小键一路走左，最大键一路走右。中序先输出所有较小的左子树键，再输出根，再输出较大的右子树键，因此得到升序。', 'Start at the root. Return on equality, go left for smaller, and right for larger. null means absent. Follow left links for the minimum and right links for the maximum. Inorder yields sorted keys because it emits the smaller left subtree, the root, then the larger right subtree.'),
        b('插入先做同样的比较，走到空孩子的位置就接入新叶子。以 8 为根、4 为左孩子、6 为 4 的右孩子为例，插入 7 的路径是 8 左、4 右、6 右，新节点就连到 6.right。空树插入则创建根。', 'Insertion takes the same comparison path and attaches a new leaf at an empty child link. With root 8, left child 4, and right child 6 under 4, inserting 7 goes left at 8, right at 4, right at 6, and creates 6.right. Inserting into an empty tree creates the root.')
      ], { pages: '12, 15–21', code: `Node search(Node root, int key) {
    Node p = root;
    while (p != null) {
        if (key == p.key) return p;
        p = key < p.key ? p.left : p.right;
    }
    return null;
}` }),
      s(b('删除的三个情况', 'Three deletion cases'), [
        b('① 没有孩子（叶子），把父节点指向它的引用改为 null。② 只有一个孩子，用孩子接替它的位置。若被删的是根，就更新 root。', '① For a leaf, clear the parent link to it. ② For one child, replace the deleted node with that child. If deleting the root, update root.'),
        b('③ 有两个孩子，找中序后继，即往右一步后一路向左的最小键。把这个键（及其关联值）复制到待删位置，再从原来的右子树删除后继。后继没有左孩子，所以这一步落回情况 ① 或 ②。也可对称地找左子树最大键（前驱）。', '③ With two children, find the inorder successor by going right once, then left as far as possible. Copy its key and associated value into the deletion site, then remove the original successor from the right subtree. The successor has no left child, so this uses case ① or ②. The predecessor, the maximum of the left subtree, works symmetrically.'),
        b('例如根 8 的子树为 [4, 2, 6] 和 [12, 10, 14]，删 8 时后继是 10。根换成 10，再清除原 12.left 的 10。最终中序为 2 4 6 10 12 14。', 'For root 8 with subtrees [4, 2, 6] and [12, 10, 14], deletion takes successor 10. Replace the root key, then clear the original 10 at 12.left. The final inorder is 2 4 6 10 12 14.')
      ], { pages: '26–29' }),
      s(b('插入顺序改变高度', 'Insertion order changes height'), [
        b('设 h 是以边数计的树高。搜索、插入、删除最坏访问 O(h+1) 个节点。近乎平衡时 h = O(log n)；按升序不断插入不同键时，树可能变为只有右孩子的链，h = n−1，最坏 O(n)。', 'Let h be the height in edges. Search, insertion, and deletion visit O(h+1) nodes in the worst case. A roughly balanced tree has h = O(log n). Inserting distinct keys in increasing order can produce a right-child chain with h = n−1 and worst-case O(n) operations.'),
        b('不同键按均匀随机顺序插入，BST 的期望高度为 O(log n)，具体一次仍可能不平衡。要保证对数高度可以主动旋转，见第 17 讲。', 'Inserting distinct keys in a uniformly random order gives O(log n) expected height, though individual trees can be imbalanced. Rotations can guarantee logarithmic height, as in Lecture 17.')
      ], { pages: '14, 18, 25, 29' })
    ],
    questions: [
      mc(b('BST 当前看到 8，要找 5。下一步走哪里？', 'At node 8 in a BST, you are searching for 5. Where do you go?'), [b('左孩子', 'Left child'), b('右孩子', 'Right child'), b('从队列拿下一层节点', 'Dequeue the next level node')], 0, b('比较 5 和 8。', 'Compare 5 and 8.'), b('5 < 8，目标如果存在，一定在 8 的左子树。', 'Since 5 < 8, a matching key must be in the left subtree.')),
      mc(b('BST 的哪种遍历按升序输出所有键？', 'Which BST traversal outputs all keys in increasing order?'), [b('前序', 'Preorder'), b('后序', 'Postorder'), b('中序', 'Inorder')], 2, b('先输出所有较小值，然后输出根。', 'Emit every smaller key before the root.'), b('中序是左、根、右。BST 的大小不变量让这正好是升序。', 'Inorder is left, root, right. The BST invariant makes that sorted order.')),
      enter(b('将 8, 4, 12, 2, 6, 10, 14 依次插入空 BST。找 6 时依次访问哪些键？', 'Insert 8, 4, 12, 2, 6, 10, 14 in order. Which keys are visited while searching for 6?'), '8 4 6', b('每轮比较后丢掉一侧。', 'After each comparison, rule out one side.'), b('6 小于 8，所以到 4。6 大于 4，所以到 6 并命中。', '6 is below 8, so visit 4. 6 is above 4, so reach 6 and stop.'), '8, …'),
      enter(b('在上述树中删除根 8，用中序后继替换。新根是什么？', 'Delete root 8 from that tree using its inorder successor. What is the new root?'), '10', b('先右走到 12，再一路走左。', 'Go right to 12, then left as far as you can.'), b('右子树最小键是 10。用它替代根，并删除原位置的 10。', 'The minimum key in the right subtree is 10. Move its key to the root and delete the original 10.')),
      mc(b('根为 8，左孩子 4，4 的右孩子 9。该树满足 BST 规则吗？', 'The root is 8, its left child is 4, and 4 has right child 9. Does this satisfy the BST invariant?'), [b('满足，因为每个孩子与父节点都比较正确', 'Yes, each child compares correctly with its parent'), b('不满足，因为 9 落在 8 的左子树', 'No, 9 lies in the left subtree of 8'), b('满足，因为每个节点最多两个孩子', 'Yes, every node has at most two children')], 1, b('左子树的所有后代也继承上界。', 'All descendants in a left subtree inherit an upper bound.'), b('4 的右子树需要大于 4，也要小于祖先 8。9 越界。', '4’s right subtree must be above 4 and below ancestor 8. The key 9 exceeds that upper bound.')),
      mc(b('按 1, 2, …, n 插入普通 BST。搜索最大键要访问多少节点？', 'Insert 1, 2, …, n in a plain BST. How many nodes does a search for the largest key visit?'), ['1', '⌈log₂ n⌉', 'n'], 2, b('画前三次插入，观察路径朝哪个方向延长。', 'Draw the first three insertions and see which way the path grows.'), b('每次追加成为前一键的右孩子。最大键在链末尾，必须走过全部 n 个节点。', 'Each insertion becomes the previous key’s right child. The largest key is at the end, requiring all n visits.'))
    ]
  };
  lessons[16] = {
    title: b('堆与优先队列', 'Heaps & priority queues'),
    icon: 'heap', art: '◆',
    intro: b('等候的任务中，最紧急的可能最后才到。堆把当前优先级最高的任务始终放在入口处。', 'The most urgent waiting job may arrive last. A heap keeps the current highest-priority job at the entry point.'),
    takeaway: b('二叉堆要同时维护完全树形和父子堆序。插入向上修，取根向下修。', 'A binary heap maintains both a complete shape and parent–child heap order. Insertions repair up and root removals repair down.'),
    lab: b('同步观察树和数组。切换最小堆、最大堆，试上浮、下沉和自底向上建堆。', 'Watch the tree and array together. Switch between min and max heaps and try sifting up, sifting down, and bottom-up building.'),
    chapters: [
      s(b('两个条件缺一不可', 'Keep both shape and order'), [
        b('二叉堆首先是完全二叉树，最底层靠左填。最大堆还要求每个父键 ≥ 两个孩子键，最小堆则要求 ≤。沿任意父子路径都能传递大小关系，所以最大堆根是全局最大，最小堆根是全局最小。相等键合法。', 'A binary heap is a complete binary tree with a left-packed bottom level. In a max-heap, each parent is ≥ its children. In a min-heap, each parent is ≤ its children. That relation propagates along every path, so the root is the global maximum or minimum. Equal keys are allowed.'),
        b('只有父子关系受约束，两个兄弟之间、两个不同分支之间可以大小任意。BST 能用键决定去哪棵子树，堆对普通查找没有同样的信息。查看堆顶 O(1)，找任意键最坏 O(n)。', 'Heap order constrains parent–child pairs. Siblings and separate branches can have either relative order. A BST comparison selects a subtree, whereas a heap gives less information for general search. Root access is O(1), and finding an arbitrary key is O(n) in the worst case.')
      ], { pages: '2–13, 27' }),
      s(b('用数组表示完全树', 'Represent completeness with an array'), [
        b('从上到下、同层从左到右写入数组，完全性让中间没有空洞。零基数组的下标 i 对应左孩子 2i+1、右孩子 2i+2。孩子下标 < size 时才存在。i > 0 的父节点是 ⌊(i−1)/2⌋。最后一个非叶子下标是 ⌊size/2⌋−1。', 'Write nodes by level, left to right. Completeness keeps the array gap-free. In a zero-based array, the left child of i is 2i+1 and the right is 2i+2, when below size. For i > 0, the parent is ⌊(i−1)/2⌋. The last non-leaf index is ⌊size/2⌋−1.'),
        b('例如最大堆 [90, 40, 60, 10, 25]。根 90 的孩子是 40、60，40 的孩子是 10、25。60 大于兄弟 40 没问题。层序数组不是全局排序序列。', 'In max-heap [90, 40, 60, 10, 25], root 90 has children 40 and 60, and 40 has children 10 and 25. A larger sibling 60 is fine. Reading heap array indices is level order, which can differ from sorted order.')
      ], { pages: '24–26' }),
      s(b('插入先补形状，再上浮', 'Append first, then sift up'), [
        b('把新键加到数组末尾，刚好占下一个合法的叶子位置。以最大堆为例，只要它比父节点大就交换，直到到根或父节点已足够大。最小堆交换条件反过来。最多经过树高那么多层，O(log n)。', 'Append the new key to the array to occupy the next legal leaf slot. In a max-heap, swap upward while the key exceeds its parent. Stop at the root or at a parent that already dominates it. Reverse the comparison for a min-heap. At most the tree height is traveled, O(log n).'),
        b('向 [90, 40, 60, 10, 25] 加 80，先得到 [90, 40, 60, 10, 25, 80]。下标 5 的父亲是下标 2 的 60，交换后 [90, 40, 80, 10, 25, 60]。80 小于根，结束。', 'Appending 80 to [90, 40, 60, 10, 25] produces [90, 40, 60, 10, 25, 80]. The parent of index 5 is 60 at index 2. Swapping gives [90, 40, 80, 10, 25, 60]. 80 is smaller than the root, so stop.')
      ], { pages: '14–16, 26' }),
      s(b('取出堆顶，尾项补位后下沉', 'Extract the root and sift the last item down'), [
        b('保存原根，把末项移到根并缩小数组。若有孩子比当前项更优先，选择更优先的那一个交换（最大堆选较大的孩子，最小堆选较小的孩子），继续往下。用较弱的孩子交换可能让新父亲仍然违反另一条父子边。', 'Save the old root, move the last item to root, and shrink the array. If a child outranks the current item, swap with the preferred child, larger in a max-heap or smaller in a min-heap, and continue downward. Swapping with the weaker child could leave the new parent in violation of its other edge.'),
        b('例如删 [90, 40, 60, 10, 25] 的根，25 到根，先挑较大的孩子 60。交换后是 [60, 40, 25, 10]，已成合法堆。堆顶删除 O(log n)，单项堆直接清空。删除任意键时，先花最多 O(n) 找位置，再用末项补位，根据比较向上或向下修复。', 'Deleting the root of [90, 40, 60, 10, 25] puts 25 at root. Select the larger child 60. Swapping yields valid heap [60, 40, 25, 10]. Extracting the root takes O(log n). A one-item heap simply becomes empty. For an arbitrary key, locating it can take O(n). Replace it with the last key and repair up or down as needed.')
      ], { pages: '17–23' }),
      s(b('建堆与堆排序', 'Building a heap and sorting'), [
        b('可以逐项插入来建堆，总共 O(n log n)。也可直接把 n 项放入数组，从最后一个非叶子倒序对每个节点下沉。此时孩子子树已成堆。很多节点靠近底部只需下沉很短距离，所有下沉距离之和是 O(n)，所以自底向上建堆为 O(n)。', 'Build a heap by inserting one item at a time in O(n log n), or place all items in the array and sift down in reverse order from the last non-leaf. Its child subtrees are already heaps. Most nodes are near the bottom, and the sum of all possible downward distances is O(n). Thus bottom-up construction costs O(n).'),
        b('建最大堆后重复取根，返回序列从大到小。原地堆排序则每次把最大项交换到有效区间的最后，再缩小堆并下沉，完成时数组从小到大，O(n log n) 时间，迭代下沉只需 O(1) 额外空间。', 'Repeated extraction from a max-heap returns values from largest to smallest. In-place heapsort instead swaps the maximum to the end of the live range, shrinks the heap, and sifts down. The final array is ascending in O(n log n) time and O(1) extra space with iterative sifting.')
      ], { pages: '28' }),
      s(b('堆实现优先队列', 'Implement a priority queue with a heap'), [
        b('优先队列按优先级取出，医院分诊、系统任务调度、负载均衡和 Dijkstra 的待处理顶点都可以用这一思想。相同优先级如需到达顺序，可把到达序号加入比较规则。', 'A priority queue removes the item of highest priority. Triage, task scheduling, load balancing, and Dijkstra’s pending vertices use this idea. Include an arrival counter in the comparison if equal priorities need arrival order.'),
        b('Java 的 PriorityQueue 默认用自然顺序，头是最小项。传 Comparator.reverseOrder() 可以让最大项先出。offer 和 poll 为 O(log n)，peek 为 O(1)，contains 与 remove(Object) 为 O(n)。迭代顺序无排序保证，同优先级的先出者也无保证。', 'Java PriorityQueue defaults to natural order, so the smallest item is at the head. Supply Comparator.reverseOrder() for largest first. offer and poll cost O(log n), peek O(1), and contains and remove(Object) O(n). Iteration has no sorted-order guarantee, and ties may leave in any order.')
      ], { pages: '29–34', code: `Queue<Integer> min = new PriorityQueue<>();
min.offer(8);
min.offer(2);
min.offer(5);
System.out.println(min.poll()); // 2

Queue<Integer> max = new PriorityQueue<>(Comparator.reverseOrder());
max.addAll(List.of(8, 2, 5));
System.out.println(max.poll()); // 8` })
    ],
    refs: [['PriorityQueue', java('java/util/PriorityQueue')]],
    questions: [
      enter(b('最小堆的数组是 [2, 7, 4, 9, 8]。peek 返回什么？', 'A min-heap has array [2, 7, 4, 9, 8]. What does peek return?'), '2', b('堆顶位于数组的哪个下标？', 'What is the array index of the heap root?'), b('数组第 0 项就是根，全局最小值为 2。', 'Index 0 holds the root and global minimum, 2.')),
      mc(b('下面哪个层序数组是最大堆？', 'Which level-order array is a max-heap?'), ['[40, 70, 30]', '[70, 30, 60, 20]', '[70, 30, 60, 45]'], 1, b('检查每条父子边，特别是下标 1 和它的孩子下标 3。', 'Check each edge, especially index 1 and its child at index 3.'), b('70 ≥ 30 和 60，且 30 ≥ 20。选项三的 45 违反它与 30 的边。', '70 dominates 30 and 60, and 30 dominates 20. In the third choice, 45 violates the edge from 30.')),
      enter(b('向最大堆 [90, 40, 60, 10, 25] 插入 80。写出上浮后的完整数组。', 'Insert 80 into max-heap [90, 40, 60, 10, 25]. Enter the full array after sifting up.'), '90 40 80 10 25 60', b('新项的下标是 5，先与下标 2 的父亲比较。', 'The new item is at index 5. Compare it with the parent at index 2.'), b('80 与 60 换位。80 已在 90 之下且比它小，上浮结束。', '80 and 60 swap. 80 is now below 90 and smaller than it, so stop.'), '90, …'),
      enter(b('从初始最大堆 [90, 40, 60, 10, 25] 取出根。写出下沉后的完整数组。', 'Extract the root from the original max-heap [90, 40, 60, 10, 25]. Enter the full array after sifting down.'), '60 40 25 10', b('末尾 25 补根，让它与较大的孩子比较。', 'Move 25 from the end to the root and compare against the larger child.'), b('25 与较大的孩子 60 对换。下标 2 已经没有孩子，结束。', '25 swaps with the larger child, 60. Index 2 has no children, so stop.'), '60, …'),
      mc(b('Java 默认 PriorityQueue<Integer> 依次加入 3、1、9。第一次 poll 后，遍历剩余元素能保证升序吗？', 'Java’s default PriorityQueue<Integer> receives 3, 1, 9. After the first poll, is iteration guaranteed to be ascending?'), [b('会取出 9，且迭代按升序', 'It removes 9 and iteration is ascending'), b('会取出 1，且迭代按升序', 'It removes 1 and iteration is ascending'), b('会取出 1，迭代顺序无保证', 'It removes 1 and iteration order is unspecified')], 2, b('区分 poll 的顺序和 iterator 的顺序。', 'Distinguish poll order from iterator order.'), b('自然排序的最小元素 1 先出。想按次序消费元素，应继续 poll，每次拿到当前最小值。', 'The natural-order minimum 1 leaves first. To consume in order, keep polling to get the current minimum each time.')),
      mc(b('有一个含 n 项的任意数组，使用自底向上建堆，最紧的最坏时间是什么？', 'What is the tight worst-case cost of bottom-up heap building on an arbitrary n-item array?'), ['Θ(n log n)', 'Θ(n)', 'Θ(log n)'], 1, b('统计每个高度有多少节点，而不是给每个节点都乘最大高度。', 'Count the nodes at each height instead of charging the maximum height to every node.'), b('处理线性数量的内部节点，多数下沉距离很短。按高度求和得 Θ(n)。', 'There are linearly many internal nodes, and most sift only a short distance. Summing by node height gives Θ(n).'))
    ]
  };

  lessons[17] = {
    title: b('AVL 树', 'AVL trees'),
    icon: 'balance', art: '⇄',
    intro: b('有序插入能把普通 BST 拉成一条链。AVL 树在局部转一转，就能让搜索路径继续保持短。', 'Sorted insertions can stretch a plain BST into a chain. AVL trees rotate local subtrees to keep search paths short.'),
    takeaway: b('每个节点都检查左右高度差。旋转改变形状，保留所有键的中序顺序。', 'Check left and right heights at every node. A rotation changes the shape while preserving the inorder sequence.'),
    lab: b('运行 LL、RR、LR、RL 四种旋转，再插入或删除整数，观察各节点的平衡因子。', 'Run LL, RR, LR, and RL rotations, then insert or delete integers and inspect the balance factor of every node.'),
    chapters: [
      s(b('AVL 在 BST 上多了什么', 'What AVL adds to a BST'), [
        b('AVL 得名于 Adelson-Velskii 和 Landis。它首先是 BST，然后要求每个节点的左右子树高度相差不超过 1。定义 BF = height(left) − height(right)。按本站约定，null 高度 −1，叶高 0，叶子的 BF 为 0。', 'AVL is named for Adelson-Velskii and Landis. It is a BST that also requires left and right subtree heights to differ by at most 1 at every node. Define BF = height(left) − height(right). Here null has height −1, a leaf has height 0, and a leaf’s BF is 0.'),
        b('必须在每个节点都满足 |BF| ≤ 1。只检查根会漏掉更深处的失衡。最少节点数满足 S(h)=1+S(h−1)+S(h−2)，以 S(−1)=0、S(0)=1 起步，随 h 指数增长，所以高度是 O(log n)。', 'Every node must have |BF| ≤ 1. Checking the root alone misses deeper imbalances. The minimum node count satisfies S(h)=1+S(h−1)+S(h−2) with S(−1)=0 and S(0)=1. It grows exponentially in h, so the height is O(log n).')
      ], { pages: '2–7, 21, 27' }),
      s(b('一次旋转只搬动局部链接', 'A rotation rewires local links'), [
        b('对节点 x 右旋，令 y = x.left。y 升上来成子树根，x 成 y 的右孩子，y 原来的右子树转到 x.left。中间那块子树的值介于 y 与 x，转过去仍满足 BST。左旋是镜像：右孩子升上来，中间子树交给 x.right。', 'To rotate right at x, let y = x.left. Promote y to this subtree’s root, make x its right child, and transfer y’s former right subtree to x.left. The middle subtree’s keys lie between y and x, so BST order survives. A left rotation mirrors this with the right child promoted and the middle subtree going to x.right.'),
        b('旋转的返回值是新的子树根。调用者把它接回更高节点或整棵树的 root。节点可以缓存 height = 1 + max(左高, 右高)，旋转后先更新下去的旧根，再更新升上来的新根。单次旋转只改固定数量的链接和高度，O(1)。', 'A rotation returns the new subtree root, which the caller reconnects to the parent or overall root. Store height = 1 + max(left height, right height) at each node. Refresh the demoted node before the promoted node. Each rotation changes a fixed number of links and heights, O(1).')
      ], { pages: '8–13, 22', code: `Node rotateRight(Node x) {
    Node y = x.left;
    x.left = y.right; // transfer middle subtree
    y.right = x;
    updateHeight(x);
    updateHeight(y);
    return y;
}` }),
      s(b('看两层方向选旋转', 'Choose a rotation using two directions'), [
        b('字母表示从失衡点沿较高子树走的方向。直线 LL、RR 用一次反方向旋转把中间键升起。折线 LR、RL 先把孩子旋成直线，再旋失衡点。', 'The letters give the direction down the taller branches starting from the imbalanced node. Straight LL and RR patterns use one rotation in the opposite direction to promote the middle key. Zigzag LR and RL patterns rotate the child first to straighten the path, then rotate the imbalanced node.')
      ], { pages: '8–13', table: {
        headers: [b('情况', 'Case'), b('识别条件', 'Detection'), b('操作', 'Repair'), b('插入顺序示例', 'Insertion example')],
        rows: [
          ['LL', 'BF(x) > 1, BF(x.left) ≥ 0', b('对 x 右旋', 'Rotate right at x'), '30, 20, 10'],
          ['RR', 'BF(x) < −1, BF(x.right) ≤ 0', b('对 x 左旋', 'Rotate left at x'), '10, 20, 30'],
          ['LR', 'BF(x) > 1, BF(x.left) < 0', b('先对左孩子左旋，再对 x 右旋', 'Left at left child, then right at x'), '30, 10, 20'],
          ['RL', 'BF(x) < −1, BF(x.right) > 0', b('先对右孩子右旋，再对 x 左旋', 'Right at right child, then left at x'), '10, 30, 20']
        ]
      }, after: b('课件第 10 页的图示从 8 的右孩子 15，再走到 15 的左孩子 10，属于 RL，先右旋 15 再左旋 8。最终根是 10。', 'The diagram on slide 10 goes right from 8 to 15, then left to 10. This is RL. Rotate right at 15 then left at 8, yielding root 10.') }),
      s(b('插入后从下往上检查', 'Check upward after insertion'), [
        b('先按 BST 规则插入新叶子，再沿返回路径更新祖先高度。找离新叶子最近的失衡祖先。按上表做单旋或双旋。在原本合法的 AVL 上插入一个键，首次修复后该子树恢复到插入前的高度，上面通常只需确认高度。', 'Insert a leaf using the BST rule, then refresh heights back toward the root. The closest imbalanced ancestor is repaired with one single or double rotation. On insertion into a valid AVL tree, that repaired subtree returns to its pre-insertion height, so no higher rotation is needed.'),
        b('例如 30、10、20 插入后根的左子树高 1、右子树高 −1，BF(30) = 2，左孩子 10 的 BF = −1。按 LR 做先左后右，根变 20，孩子 10 和 30，中序仍为 10、20、30。', 'After inserting 30, 10, 20, the root has left height 1 and right height −1, so BF(30)=2. Its left child 10 has BF=−1. The LR repair rotates left then right and produces root 20 with children 10 and 30. Inorder remains 10, 20, 30.')
      ], { pages: '14–19' }),
      s(b('删除可能一路修到根', 'Deletion can trigger repairs up to the root'), [
        b('先执行 BST 删除，两个孩子时可用中序后继。沿实际删掉节点的路径向上更新高度。在某点旋完后子树可能比删除前矮，新的失衡可继续出现在更高祖先，所以要走到根。', 'Delete as in a BST, using a successor for a two-child node if desired. Update heights upward along the path of the physically removed node. A repaired subtree can be shorter than before deletion. Higher ancestors may then become imbalanced, so continue to the root.'),
        b('例如 [4, 2, 5, 1, 3] 插入后删 5。根 4 的 BF 变成 2，左孩子 2 的 BF = 0。LL 规则依然适用，做一次右旋。这里用的是孩子的 BF，并非被删键走过的方向。', 'Insert [4, 2, 5, 1, 3] and delete 5. Root 4 reaches BF=2 and left child 2 has BF=0. The LL rule applies, so rotate right once. The child’s BF selects the rotation.')
      ], { pages: '20–22' }),
      s(b('保证性能的代价和替代方案', 'The cost of guaranteed height and related trees'), [
        b('AVL 的搜索、插入、删除最坏都是 O(log n)，需额外保存高度或平衡信息并维护旋转逻辑。红黑树用颜色约束保证对数高度，例如根和空叶为黑、红节点不能有红孩子、每个节点到后代空叶的黑节点数一致。Java TreeMap 使用红黑树。', 'AVL search, insert, and delete cost O(log n) in the worst case, with extra height or balance metadata and rotation logic. Red-black trees use color constraints for logarithmic height. The root and null leaves are black, red nodes have no red children, and paths to descendant null leaves have equal black counts. Java TreeMap uses a red-black tree.'),
        b('B 树可让一个节点有多个键和多个孩子，更宽的分支减少访问层数，适合数据库索引和存储页。AVL 更适合用来理解二叉树怎样通过局部调整维持高度。', 'A B-tree can store several keys and children per node. Greater branching reduces the number of levels visited, which suits database indexes and storage pages. AVL trees illustrate how local changes maintain binary-tree height.')
      ], { pages: '21–27' })
    ],
    refs: [['TreeMap', java('java/util/TreeMap')]],
    questions: [
      enter(b('左子树高 2，右子树高 1。按 BF = 左高 − 右高，平衡因子是多少？', 'The left subtree has height 2 and the right height 1. What is the balance factor left minus right?'), '1', b('注意减法方向。', 'Keep the subtraction order.'), b('BF = 2−1 = 1，符合该节点的平衡条件。', 'BF = 2−1 = 1, satisfying the local balance condition.')),
      mc(b('一棵 BST 的根 BF = 0，根的某个后代 BF = 2。整棵树是 AVL 吗？', 'In a BST, the root has BF=0 and a descendant has BF=2. Is the tree AVL?'), [b('是，只需检查根', 'Yes, only the root matters'), b('不是，每个节点都要满足 |BF| ≤ 1', 'No, every node needs |BF| ≤ 1'), b('是，只需检查叶节点', 'Yes, only leaves matter')], 1, b('AVL 条件适用于每棵子树。', 'The AVL condition applies to every subtree.'), b('那个后代的两子树高度差为 2，已经违反平衡条件。', 'That descendant’s subtree heights differ by 2, violating the rule.')),
      mc(b('依次插入 30, 20, 10，使 30 出现 LL 失衡。怎么修？', 'Insert 30, 20, 10, creating an LL imbalance at 30. How do you repair it?'), [b('对 30 右旋', 'Rotate right at 30'), b('对 30 左旋', 'Rotate left at 30'), b('先左旋 20 再右旋 30', 'Rotate left at 20, then right at 30')], 0, b('30 的左侧连着一条向左的直线。', 'The heavy path from 30 is a straight leftward line.'), b('右旋把 20 升到根，10 和 30 变成孩子。', 'The right rotation promotes 20, with children 10 and 30.')),
      order(b('依次插入 10, 30, 20。按先后顺序选 RL 的两次旋转。', 'Insert 10, 30, 20. Select the two RL rotations in order.'), [b('对 10 左旋', 'Rotate left at 10'), b('对 30 右旋', 'Rotate right at 30')], [1, 0], b('先修右孩子内部的折线。', 'First straighten the bend at the right child.'), b('先让 20 成为 10 的右孩子，再左旋 10 使 20 升上来。', 'First make 20 the right child of 10, then rotate left at 10 to promote 20.')),
      mc(b('删去 [4, 2, 5, 1, 3] 构成的 AVL 中的 5。根 BF = 2，左孩子 BF = 0。采取哪一步？', 'Delete 5 from the AVL formed by [4, 2, 5, 1, 3]. Root BF=2 and left child BF=0. What repair applies?'), [b('先左后右', 'Left then right'), b('根左旋', 'Left rotation at the root'), b('根右旋', 'Right rotation at the root')], 2, b('左孩子 BF = 0 属于 LL 条件的 ≥ 0。', 'BF=0 for the left child matches the LL condition ≥ 0.'), b('对 4 右旋后 2 上升。中间子树 3 接到 4.left。', 'Rotate right at 4 to promote 2. The middle subtree 3 becomes 4.left.')),
      mc(b('为什么 AVL 删除后，在第一个失衡点旋转完还要继续向上检查？', 'After rotating at the first imbalance after an AVL deletion, why keep checking upward?'), [b('旋转会打乱中序键顺序', 'Rotations shuffle inorder keys'), b('修复的子树可能变矮，影响其祖先平衡', 'The repaired subtree may be shorter, affecting its ancestors'), b('向上检查只是为了把最大键放到根', 'The checks move the largest key to the root')], 1, b('祖先的 BF 由哪两个数决定？', 'Which two numbers determine an ancestor’s BF?'), b('子树缩短一层可能让上一级的 BF 差变成 2。检查可一直传播到根。', 'A subtree shortening by one can push a higher BF to magnitude 2. Repairs can propagate to the root.'))
    ]
  };
})();
