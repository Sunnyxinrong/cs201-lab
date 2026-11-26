'use strict';

(() => {
  const { bi: b, section: s, mc, enter, java, lessons } = CS201;
  const apiLab = '#java';
  const nodeLab = '#java/nodes';
  const apiLink = [b('在方法实验里验证 →', 'Verify in the method lab →'), apiLab];
  const nodeLink = [b('跟着代码追踪引用 →', 'Trace the references →'), nodeLab];
  CS201.classroomTailAdd = `Node<E> newNode = new Node<>(e);
        if (head == null) {
            head = newNode;
        } else {
            Node<E> currentNode = head;
            while (currentNode.next != null) {
                currentNode = currentNode.next;
            }
            currentNode.next = newNode;
        }
        size++;`;
  const headers = [b('Java 17 签名', 'Java 17 signature'), b('参数怎么写', 'Arguments'), b('结果与边界', 'Result and edge cases')];

  lessons[10].chapters.push(
    s(b('课堂补充 · Box<E> 怎样扩容', 'Classroom example · How Box<E> grows'), [
      b('把老师的 Box<Book> 分成两层看。外层 add(E data) 约束你给它什么，E 已经确定为 Book。内层 Object[] 保存传进来的对象引用。数组可以装不同对象，但用 bookBox.add(new TennisRacket("Head")) 会在编译时被拒绝。new Box<>() 让编译器从左边推断 Book。', 'Read the classroom Box<Book> in two layers. The public-facing add(E data) restricts what you can pass because E is Book. Inside, Object[] stores object references. The array could hold other objects, but bookBox.add(new TennisRacket("Head")) is rejected at compile time. The diamond in new Box<>() infers Book from the left-hand side.'),
      b('构造时 size = 0，但 dataArray.length = 10。每次 add 先检查有没有空位，再写入 dataArray[size]，最后 size++。第 10 本写入下标 9，容量仍为 10。第 11 本触发 Arrays.copyOf，容量变成 20，旧下标 0 到 9 的引用被复制，第 11 本写到下标 10。', 'The constructor starts at size 0 with dataArray.length 10. Each add checks for room, writes dataArray[size], then increments size. Book 10 goes to index 9 and capacity stays 10. Book 11 triggers Arrays.copyOf to length 20, copies references at old indices 0 through 9, then writes the new book at index 10.'),
      b('扩容的那次要复制 n 个引用，所以一次 add 最坏 O(n)。按 2 倍增长，多次尾加的摊还成本是 O(1)。这个 2 倍规则来自课堂 Box 的代码。Java ArrayList 的 API 不规定增长倍率。', 'A resize copies n references, giving O(n) worst-case cost for one add. Doubling makes repeated tail appends O(1) amortized. The factor of two belongs to this classroom Box. The Java ArrayList API leaves the growth multiplier unspecified.')
    ], { classroom: true, labLink: [b('看课堂 Box 从 10 格扩到 20 格 →', 'Watch the classroom Box grow from 10 to 20 slots →'), '#lesson-10/lab'], code: `import java.util.Arrays;

class Box<E> {
    Object[] dataArray = new Object[10];
    int size = 0;

    void add(E data) {
        if (size == dataArray.length) {
            dataArray = Arrays.copyOf(dataArray, size * 2);
        }
        dataArray[size] = data;
        size++;
    }
}` }),
    s(b('Object[] 读出来为什么要转换', 'Why reads from Object[] need a cast'), [
      b('编译器只知道 dataArray[i] 的静态类型是 Object，不能直接读 .title。课堂代码中的 (Book) 告诉编译器把这个结果当作 Book，并在实际值非 null 时检查对象类型。实际对象为 TennisRacket 会抛 ClassCastException。转换只检查引用指向的对象类型，不会把球拍变成书。', 'The static type of dataArray[i] is Object, so the compiler cannot directly access .title. The classroom cast (Book) gives the expression type Book and checks the runtime type of a non-null object. An actual TennisRacket throws ClassCastException. A cast checks what the reference points to.'),
      b('打印列表时用 i < size。size 以后的槽只是备用容量，初始为 null。把 null 转成 Book 仍然是 null，接着读 b.title 才抛 NullPointerException。Box.add(null) 也能编译，所以 size 的边界保证逻辑位置有效，不能保证每个存进去的值都非 null。', 'Use i < size when printing the list. Spare slots start as null. Casting null to Book still gives null. Reading b.title then throws NullPointerException. Box.add(null) also compiles, so a valid logical position does not guarantee a non-null element.'),
      b('Arrays.copyOf 新建的是数组，复制的是 Book 引用。若事先保存 Object[] old = bookBox.dataArray，扩容后 old.length 还是 10，old[0] 和新数组的第 0 项仍可指向同一本书。Java 禁止 new E[10]。把 Object[] 简单强转为 E[] 会产生未检查转换，暴露成 Book[] 使用时可能抛 ClassCastException。实际类常把数组设为 private，并让 get(int index) 在检查逻辑下标后通过 E 返回值。', 'Arrays.copyOf creates a new array but copies the Book references. If you save Object[] old = bookBox.dataArray before growth, old.length stays 10 and old[0] can still point to the same Book as the new slot 0. Java rejects new E[10]. Casting an Object[] to E[] is unchecked and may throw ClassCastException if exposed as Book[]. A real implementation often makes the array private and gives get(int index) an E return type after validating the logical index.')
    ], { code: `Box<Book> bookBox = new Box<>();
bookBox.add(new Book("Machine Learning"));
bookBox.add(new Book("AI by Hassan"));

for (int i = 0; i < bookBox.size; i++) {
    Book book = (Book) bookBox.dataArray[i];
    System.out.println(book.title);
}` }),
    s(b('ArrayList 方法签名速查', 'ArrayList method signatures'), [
      b('看签名时同时圈出参数类型和返回类型。按下标取、改、删（get、set、remove 的 int 版本）要求 0 ≤ index < size()。插入 add(index, value) 多允许一个位置 index == size()，含义是在末尾接上。ArrayList 的 remove 需要一个下标或值，光写 remove() 会编译失败。', 'Circle both the argument types and the return type. Indexed get, set, and the int version of remove require 0 ≤ index < size(). Insertion with add(index, value) also allows index == size() to append. ArrayList removal needs an index or a value, so remove() with no argument fails to compile.')
    ], { table: { headers, rows: [
      ['int size()', b('无参数', 'No arguments'), b('返回元素数。数组用 .length，ArrayList 用 .size()。', 'Returns the count. Arrays use .length and ArrayList uses .size().')],
      ['boolean isEmpty()', b('无参数', 'No arguments'), b('size() 为 0 时返回 true。', 'True when size() is zero.')],
      ['boolean add(E value)', b('传元素', 'Pass an element'), b('追加到末尾，成功返回 true。', 'Appends at the end and returns true.')],
      ['void add(int index, E value)', b('先下标，再元素', 'Index, then element'), b('插入并右移后缀。没有返回值。', 'Inserts and shifts the suffix right. No return value.')],
      ['E get(int index)', b('只传下标', 'Pass an index'), b('读取该项，越界抛 IndexOutOfBoundsException。', 'Reads that item. An invalid index throws IndexOutOfBoundsException.')],
      ['E set(int index, E value)', b('先下标，再新元素', 'Index, then new element'), b('覆盖该槽，返回旧值。size 不变。', 'Replaces the item and returns its old value. Size is unchanged.')],
      ['E remove(int index)', b('传 int 下标', 'Pass an int index'), b('删除该位置并返回旧元素，越界抛异常。', 'Deletes and returns that item. An invalid index throws.')],
      ['boolean remove(Object value)', b('传要删除的值', 'Pass a value to remove'), b('删除第一个相等项，存在并删除时为 true。', 'Removes the first equal item and returns true if removed.')],
      ['int indexOf(Object value)', b('传要查找的值', 'Pass a value to find'), b('返回第一个相等项的下标，缺席时为 −1。', 'Index of the first equal item, or −1 if absent.')],
      ['boolean contains(Object value)', b('传要查找的值', 'Pass a value to find'), b('只返回有没有，不给下标。', 'Reports whether it is present.')],
      ['void clear()', b('无参数', 'No arguments'), b('清空列表。', 'Empties the list.')]
    ] }, after: b('本网站按 Java 17 做方法题。Java 21 起，ArrayList 另有 addFirst/addLast、getFirst/getLast、removeFirst/removeLast。比如 Java 21 的 getFirst() 在空列表上会抛 NoSuchElementException。ArrayList 依然没有 peek() 或 poll()。', 'The method drills use Java 17. Starting with Java 21, ArrayList also has addFirst/addLast, getFirst/getLast, and removeFirst/removeLast. For example, getFirst() throws NoSuchElementException on an empty Java 21 list. ArrayList still has no peek() or poll().'), labLink: apiLink }),
    s(b('Integer 列表的 remove 重载陷阱', 'The Integer list remove overload trap'), [
      b('先用接收者的声明类型找可用方法，再用实参的编译期类型选重载。Java 会先尝试不需要装箱、拆箱的调用。remove(1) 的 1 是 int，选 remove(int)。remove(Integer.valueOf(1)) 的参数是 Integer，可直接拓宽为 Object，选 remove(Object)。', 'First use the receiver’s declared type to find available methods. Then resolve the overload using the argument’s compile-time type. Java first tries calls without boxing or unboxing. The literal in remove(1) is int, so it selects remove(int). Integer.valueOf(1) gives an Integer that widens to Object, so it selects remove(Object).'),
      b('赋值左边写 boolean 不能改变重载。boolean ok = xs.remove(1) 会先选返回 Integer 的下标版本，接着因返回类型不匹配而编译失败。indexOf(1) 则只有 Object 参数版本，会把 1 装箱再按值找。remove("1") 能编译，因为 String 是 Object，但 String "1" 和 Integer 1 不相等。', 'A boolean variable on the left cannot switch overloads. boolean ok = xs.remove(1) still selects the indexed overload returning Integer, and the assignment fails to compile. indexOf(1) has only the Object overload, so it boxes 1 and searches by value. remove("1") compiles because a String is an Object. String "1" and Integer 1 are unequal.'),
      b('按值查找用 equals。课堂 Book 没重写 equals 时，用另一个 new Book("Machine Learning") 查找，即使标题相同也找不到。用原来加进去的 Book 引用查找才能找到那个对象。', 'Value lookup uses equals. With the classroom Book, which does not override equals, another new Book("Machine Learning") is absent even with the same title. The Book reference originally added to the list will find that object.')
    ], { code: `ArrayList<Integer> xs = new ArrayList<>(List.of(1, 7, 1, 9));
Integer removed = xs.remove(1);                 // 7, xs = [1, 1, 9]
boolean changed = xs.remove(Integer.valueOf(1)); // true, xs = [1, 9]
int where = xs.indexOf(9);                       // 1
boolean found = xs.remove("9");                 // false`, labLink: apiLink })
  );
  lessons[10].refs.push(['Arrays.copyOf', java('java/util/Arrays') + '#copyOf(T%5B%5D,int)'],
    ['ArrayList · Java 21', 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/ArrayList.html'],
    ['JLS · Overload resolution', 'https://docs.oracle.com/javase/specs/jls/se17/html/jls-15.html#jls-15.12.2']);

  lessons[11].chapters.push(
    s(b('课堂补充 · 引用、节点、数据各是什么', 'Classroom example · Reference, node, and payload'), [
      b('画三样东西。变量 n1 保存一个节点引用。这个节点对象有 data 与 next 两个字段。data 保存 Book 引用，next 保存另一个 Node<Book> 的引用。所以 n1.data.title 会先找到节点，再找到书，最后读书名。next = null 说明后面还没接节点。', 'Draw three things. Variable n1 holds a node reference. The node object has data and next fields. data refers to a Book, and next refers to another Node<Book>. Thus n1.data.title reaches the node, then the book, and then its title. next = null means no node is attached yet.'),
      b('老师的 n1、n2、ns1 分别由构造器创建。单独 new 三次只会得到三个独立节点，执行 n1.next = n2 才把前两个连起来。Node<Book> 的 next 需要另一个 Node<Book>，所以不能接上 Node<TennisRacket>。两种类型共享同一份 Node<E> 的类代码。', 'The classroom n1, n2, and ns1 are created by separate constructor calls. They start as independent nodes. n1.next = n2 links the first two. next of Node<Book> expects another Node<Book>, so connecting Node<TennisRacket> cannot compile. Both types use the same Node<E> definition.')
    ], { classroom: true, code: `class Node<E> {
    E data;
    Node<E> next;

    Node(E data) {
        this.data = data;
        this.next = null;
    }
}

// In a method:
// Node<Book> n1 = new Node<>(new Book("cs201"));
// Node<Book> n2 = new Node<>(new Book("Math202"));
// n1.next = n2;`, labLink: nodeLink }),
    s(b('MyLinkedList.add 的尾插代码', 'The classroom MyLinkedList.add tail insertion'), [
      b('用 new Node<>(e) 创建节点，初始 next 为 null。空表把 head 指向它。非空表从 head 出发，沿 next 移动到最后一个节点，再令它的 next 指向新节点。', 'Create a node with new Node<>(e). Its next starts as null. In an empty list, point head to it. In a nonempty list, follow next from head to the final node and set that node’s next to the new node.'),
      b('遍历期间 currentNode 始终指向一个已有节点，非空表的 head 保持原来的引用。while 退出后才接上新节点，两个分支结束后都执行一次 size++。可以用空表、单节点表和多节点表检查这些条件。', 'During traversal, currentNode always refers to an existing node and the head of a nonempty list retains its original reference. Attach the new node after the while loop. Both branches increment size once. Verify these properties with an empty list, a single node, and multiple nodes.')
    ], { code: `class MyLinkedList<E> {
    Node<E> head;
    int size;

    MyLinkedList() {
        size = 0;
        head = null;
    }

    void add(E e) {
        ${CS201.classroomTailAdd}
    }
}`, labLink: [b('运行尾插结构测试 →', 'Run the tail-append checks →'), '#coding/list-append'] }),
    s(b('移动变量和修改节点是两种操作', 'Moving a reference versus changing a node'), [
      b('Node<E> currentNode = head 会复制引用。此刻两个变量指向同一个节点。currentNode = currentNode.next 只移动局部变量，head 保持指向首节点。currentNode.next = newNode 修改的是节点对象里的字段，其他沿这个节点走的引用也会看到新连接。', 'Node<E> currentNode = head copies a reference. Both variables initially point to one node. currentNode = currentNode.next moves the local variable and head still points to the first node. currentNode.next = newNode edits a field of the shared node, so other references through it observe the new link.'),
      b('尾插要停在有效的最后一个节点，所以用 currentNode.next != null。若循环条件写成 currentNode != null，离开循环时变量本身已是 null，再写 currentNode.next 就会抛 NullPointerException。', 'Insertion must stop on the last real node, so the condition checks currentNode.next != null. A condition of currentNode != null walks one step further. Writing currentNode.next afterward throws NullPointerException.'),
      b('这个课堂实现只记 head，空表和单节点表不用沿 next 跳转。已有 k ≥ 1 个节点时需要 k−1 次跳转，从空表连续尾插 n 项的总时间是 Θ(n²)。如果另外维护 tail，尾插每次可做 Θ(1)，仍要处理由空变非空的分支。', 'This classroom implementation stores head. Empty and one-node lists need zero next hops. With k ≥ 1 existing nodes it takes k−1 hops, so n appends from empty take Θ(n²) total time. Maintaining tail makes each append Θ(1), with a branch for the first insertion.')
    ], { labLink: nodeLink })
  );

  lessons[12].chapters.push(
    s(b('考点补充 · 同一个 ArrayDeque 怎样当栈', 'Exam focus · Using ArrayDeque as a stack'), [
      b('把队首当栈顶。push(E) 从队首加，返回 void。pop() 从队首删并返回 E，空时抛 NoSuchElementException。peek() 从队首看，空时返回 null。不传下标也不传待查找的元素。', 'Use the front as the top. push(E) adds at the front and returns void. pop() removes and returns the front, throwing NoSuchElementException when empty. peek() reads the front and returns null when empty. Neither pop nor peek takes an index or a value.'),
      b('混用方法时每次标出两端。add(E) 和 offer(E) 都加到队尾，push(E) 加到队首。ArrayDeque<Integer> 空时 peek() 返回的类型是 Integer，赋给 Integer 可以得到 null，赋给 int 会在拆箱时抛 NullPointerException。', 'Track both ends when mixing methods. add(E) and offer(E) add at the rear, while push(E) adds at the front. Empty peek() on ArrayDeque<Integer> returns a null Integer. Assigning it to Integer is fine, while assigning it to int throws NullPointerException during unboxing.')
    ], { classroom: true, code: `ArrayDeque<Integer> d = new ArrayDeque<>();
d.add(4);       // [4]
d.push(7);      // [7, 4]
d.offer(9);     // [7, 4, 9]
int x = d.pop(); // 7, deque = [4, 9]
int y = d.peek(); // 4`, labLink: apiLink })
  );

  lessons[13].chapters.push(
    s(b('考点补充 · ArrayDeque 的两端与异常', 'Exam focus · ArrayDeque ends and exceptions'), [
      b('把纸上的顺序固定为「队首 → 队尾」。ArrayDeque<Integer> 用 d.add(7) 或 d.offer(7) 都是在尾部加 7。双端方法带 First 或 Last，指定哪一端。下表各名字后面的空括号表示取端点时不传参数。', 'Write contents in front-to-rear order. d.add(7) and d.offer(7) both append 7 to an ArrayDeque<Integer>. First and Last identify an end. Empty parentheses in the table mean end access takes no arguments.')
    ], { classroom: true, table: { headers: [b('动作', 'Action'), b('严格的一组', 'Exception family'), b('返回特殊值的一组', 'Sentinel family')], rows: [
      [b('在尾部加', 'Add at rear'), 'boolean add(E) / void addLast(E)', 'boolean offer(E) / boolean offerLast(E)'],
      [b('在头部加', 'Add at front'), 'void addFirst(E) / void push(E)', 'boolean offerFirst(E)'],
      [b('从头部删除并取值', 'Remove and return front'), 'E remove() / E removeFirst() / E pop()', 'E poll() / E pollFirst()'],
      [b('从尾部删除并取值', 'Remove and return rear'), 'E removeLast()', 'E pollLast()'],
      [b('查看头部', 'Inspect front'), 'E element() / E getFirst()', 'E peek() / E peekFirst()'],
      [b('查看尾部', 'Inspect rear'), 'E getLast()', 'E peekLast()']
    ] }, after: b('空 deque 的严格读删方法抛 NoSuchElementException，peek/poll 系列返回 null。ArrayDeque 会按需扩容，正常添加成功时 offer 返回 true。添加 null 会抛 NullPointerException，offer(null) 也一样。', 'Strict read/remove operations throw NoSuchElementException on an empty deque, while peek and poll variants return null. ArrayDeque grows as needed, so successful offers return true. Inserting null throws NullPointerException even with offer(null).'), labLink: apiLink }),
    s(b('同样写 remove(1)，参数含义取决于容器', 'The receiver changes what remove(1) means'), [
      b('ArrayDeque 没有 remove(int index)、get(int) 和 indexOf(Object)。d.remove(1) 会装箱成 Integer，再调用 boolean remove(Object) 删除第一个值为 1 的项。d.remove() 是另一个重载，取走队首并返回那个元素。要从尾方向找并删除第一个匹配项，可用 removeLastOccurrence(Object)。', 'ArrayDeque has no indexed remove, get(int), or indexOf(Object). d.remove(1) boxes 1 into Integer and calls boolean remove(Object), removing the first value equal to 1. d.remove() is a separate overload that removes and returns the front. removeLastOccurrence(Object) removes the first match when scanning from the rear.'),
      b('按对象删除、contains 都可能扫描 n 个元素，所以最坏 O(n)。两端增删通常是摊还 O(1)，扩容那次会有额外的复制。由此也能记住常见拼写错误的原因：peek(0) 多传了参数，add(2, 8) 假设 deque 支持按位置插入。', 'Removal by value and contains may scan n items, so their worst case is O(n). End operations are typically O(1) amortized; a resize can copy items. This explains common signature errors: peek(0) supplies an extra argument, and add(2, 8) assumes a deque accepts a position.'),
      b('变量的声明类型决定编译器允许写哪些方法。Queue<Integer> q = new ArrayDeque<>(); 可以 q.peek()，但 q.peekLast() 编译失败。若要用两端操作，可以把声明类型写成 Deque<Integer>。', 'The declared type controls which methods the compiler exposes. Queue<Integer> q = new ArrayDeque<>(); supports q.peek(), but q.peekLast() fails to compile. Declare it as Deque<Integer> to use both ends.')
    ], { code: `ArrayDeque<Integer> d = new ArrayDeque<>(List.of(5, 1, 1, 9));
boolean ok = d.remove(1); // true, [5, 1, 9]
Integer head = d.remove(); // 5, [1, 9]
Integer last = d.peekLast(); // 9, [1, 9]`, labLink: apiLink })
  );

  lessons[14].chapters.push(
    s(b('从 next 走到 left 和 right', 'From next to left and right'), [
      b('链表节点的 next 和树节点的 left/right 都是「指向另一个同类型节点」的引用。链表从 head 开始，二叉树从 root 开始。把 next 换成两个独立的方向后，可以一个为空、两个都为空，或两个都接上节点。两个孩子都为空才是叶子。', 'A list node’s next and a tree node’s left/right are references to other nodes of the same type. A list starts at head and a tree starts at root. With two independent links, either one, both, or neither may be null. A leaf has both links null.'),
      b('创建节点不等于接到树上。先单独 new 一个孩子，再执行 root.left = child 才有左边的连接。TreeNode<Integer> cursor = root 让两个变量指向同一个对象，写 cursor.left 会改这棵树。后续 cursor = cursor.left 只移动变量。', 'Allocating a node does not attach it. Create a child and set root.left = child to establish the link. TreeNode<Integer> cursor = root gives two references to the same object, so a write to cursor.left changes the tree. cursor = cursor.left only moves the variable.'),
      b('编译器检查 left 与 right 的类型。例如 TreeNode<Book> 只能接同类型孩子。程序仍需自己保证树的结构。root.left = root 类型合法，却形成环，直接用递归遍历会不断回到同一节点。', 'The compiler checks the types of left and right. For example, TreeNode<Book> accepts children of the same type. The program still enforces tree shape. root.left = root type-checks, but creates a cycle that ordinary recursive traversal keeps revisiting.')
    ], { classroom: true, code: `class TreeNode<E> {
    E data;
    TreeNode<E> left;
    TreeNode<E> right;

    TreeNode(E data) {
        this.data = data;
    }
}

// In a method:
// TreeNode<Integer> root = new TreeNode<>(8);
// root.left = new TreeNode<>(4);
// root.right = new TreeNode<>(12);`, labLink: nodeLink }),
    s(b('BFS 的队列里放的是节点引用', 'BFS queues node references'), [
      b('层序遍历要在取出节点后继续访问它的 left 和 right，所以队列的元素类型用 TreeNode<Integer>。如果只把 8、4、12 这些整数放进队列，就丢失了“这是谁的左右孩子”的信息。', 'A level-order traversal needs left and right after dequeuing a node, so the queue stores TreeNode<Integer> references. Integers such as 8, 4, and 12 alone do not carry child links.'),
      b('先检查根，再检查每个孩子是否非 null 后入队。ArrayDeque 禁止 null，即使 offer 的名字看起来像“试试看”。这个非空条件也是普通遍历与某些需要记录空位置的序列化题的分界。', 'Check the root and enqueue a child only when its reference is non-null. ArrayDeque rejects null even with offer. That guard is important when contrasting ordinary traversal with a serialization task that must encode missing child slots.')
    ], { code: `void bfs(TreeNode<Integer> root) {
    if (root == null) return;
    Queue<TreeNode<Integer>> pending = new ArrayDeque<>();
    pending.offer(root);
    while (!pending.isEmpty()) {
        TreeNode<Integer> p = pending.poll();
        System.out.println(p.data);
        if (p.left != null) pending.offer(p.left);
        if (p.right != null) pending.offer(p.right);
    }
}`, labLink: nodeLink })
  );

  lessons[15].chapters.push(
    s(b('递归插入怎样把返回的节点接回去', 'Reconnect the node returned by recursive insertion'), [
      b('把 insert(p, key) 理解成「插好以后，返回这棵子树的根」。当 p == null，新建的节点通过 return 交给调用者，必须由调用者接到 root、left 或 right。对参数 p 赋值只改变这次调用里的局部变量。', 'Read insert(p, key) as “return the subtree root after inserting.” At p == null, the new node is returned to the caller, which must store it in root, left, or right. Assigning p changes only the local parameter variable.'),
      b('沿左侧插入时，p.left = insert(p.left, key) 会把修改过的左子树接回去。顶层调用也写 root = insert(root, key)，这样一开始为空时也能保存新根。相等分支直接返回旧 p，这个版本忽略重复键。', 'For a smaller key, p.left = insert(p.left, key) reconnects the changed left subtree. Use root = insert(root, key) at the top as well so an empty tree keeps its first root. The equal case returns the existing p, skipping duplicate keys.'),
      b('TreeNode<E> 本身只规定连接和数据类型。写任意 E 的 BST 要另外定义顺序，例如通过 Comparator<? super E>，再看 compare(a, b) 的符号。Java 的 < 和 > 不能用于任意 E。若 Book 比较器只看 title，两个不同的对象也可能比较为 0，这个拒绝重复的插入策略就把它们当成同一个键。', 'TreeNode<E> specifies links and data type. A generic BST also needs an order, for example via Comparator<? super E> and the sign of compare(a, b). Java does not allow < and > for arbitrary E. A Book comparator that compares title alone may return zero for two distinct objects, making them one key under a duplicate-rejecting insertion policy.')
    ], { classroom: true, code: `TreeNode<Integer> insert(TreeNode<Integer> p, int key) {
    if (p == null) return new TreeNode<>(key);
    if (key < p.data) {
        p.left = insert(p.left, key);
    } else if (key > p.data) {
        p.right = insert(p.right, key);
    }
    return p;
}

// At the call site:
// root = insert(root, 8);`, labLink: nodeLink })
  );

  const snippet = (code, question) => ({ ...question, code });
  const call = (code, prompt, answers, hint, explanation) =>
    ({ ...enter(prompt, answers[0], hint, explanation), code, javaAnswers: answers });

  lessons[10].questions.push(
    snippet('Box<Book> box = new Box<>();\nfor (int i = 0; i < 11; i++) box.add(new Book("B" + i));',
      enter(b('在第 11 次 add 中，有多少个旧引用被复制？完成后 size 和 capacity 各是多少？按顺序写三个数。',
        'On the eleventh add, how many old references are copied? What are size and capacity afterward? Enter three numbers in order.'),
      '10 11 20', b('第 10 次 add 执行前，size 还只有 9。', 'Before the tenth add, size is only 9.'),
      b('第 10 本刚好填满下标 9。第 11 次先复制 10 个引用到长度 20 的新数组，再写入下标 10 并把 size 增为 11。', 'Book 10 fills slot 9. The eleventh add copies ten references to a new length-20 array, writes index 10, and increments size to 11.'), '10, …')),
    snippet('Object[] old = box.dataArray; // size == 10\nbox.add(new Book("Extra"));\nSystem.out.println(old == box.dataArray);\nSystem.out.println(old[0] == box.dataArray[0]);',
      enter(b('课堂 Box 的 10 个槽都已装书。两次 println 依次输出什么？',
        'All ten slots of the classroom Box hold books. What do the two println calls print, in order?'),
      'false true', b('分别比较数组对象身份和数组里存的书引用。', 'Compare array identity and the stored book reference separately.'),
      b('Arrays.copyOf 产生新数组，所以第一项为 false。书本身未被克隆，两个数组的下标 0 指向同一本书，所以第二项为 true。', 'Arrays.copyOf creates a different array, so the first result is false. Both slots at index 0 point to the same book, so the second is true.'), 'false, …')),
    snippet('Box<Book> box = new Box<>();\nbox.add(new Book("CS201"));\nBook late = (Book) box.dataArray[9];\nSystem.out.println(late.title);',
      mc(b('这段代码执行到哪里出问题？', 'Where does this code fail?'),
      [b('读取下标 9 时抛 ArrayIndexOutOfBoundsException', 'Reading slot 9 throws ArrayIndexOutOfBoundsException'),
       b('把 null 转成 Book 时抛 ClassCastException', 'Casting null to Book throws ClassCastException'),
       b('读取 late.title 时抛 NullPointerException', 'Reading late.title throws NullPointerException'),
       b('编译失败，因为 Object[] 永远不能强转元素', 'It cannot compile because an Object[] element cannot be cast')],
      2, b('区分物理下标、转换与对 null 访问字段。', 'Separate the physical index, the cast, and field access on null.'),
      b('长度为 10，物理下标 9 有效，未用槽放 null。转成 Book 后仍为 null，随后访问字段才抛异常。', 'With length 10, physical index 9 is valid and holds null. The cast still gives null. The field read throws.'))),
    snippet('class Box<E> {\n    E[] data = new E[10];\n}',
      mc(b('关于这一行，哪项正确？', 'Which statement about this line is correct?'),
      [b('能编译，new Box<Book>() 会自动创建 Book[]', 'It compiles and new Box<Book>() automatically creates Book[]'),
       b('不能编译。数组创建需要运行时组件类型，E 是泛型类型参数', 'It does not compile. Array creation needs a runtime component type, and E is a type variable'),
       b('能编译，但第一次 add 会把数组变成 Object[]', 'It compiles, and the first add changes its component type to Object')],
      1, b('想想课堂实现选择 Object[] 的原因。', 'Recall why the classroom implementation chooses Object[].'),
      b('Java 禁止直接创建类型变量数组。参数化 Box<Book> 不会在运行时把 new E[10] 转写为 new Book[10]。', 'Java prohibits direct array creation with a type-variable component. Parameterizing Box<Book> does not rewrite new E[10] into new Book[10] at runtime.'))),
    snippet('ArrayList<Integer> xs = new ArrayList<>(List.of(1, 7, 1, 9));\nInteger a = xs.remove(1);\nboolean b = xs.remove(Integer.valueOf(1));\nint c = xs.indexOf(9);\nboolean d = xs.remove("9");',
      enter(b('按顺序写出 a、b、c、d 的值，然后写出 xs 最终的两个元素。',
        'Enter a, b, c, and d in order, followed by the two final elements of xs.'),
      '7 true 1 false 1 9', b('每一步改完列表后再做下一步。String "9" 也能作 Object 参数。', 'Update the list after each step. A String "9" is a legal Object argument.'),
      b('先删下标 1 得 7，变 [1, 1, 9]。再按值删第一个 1 返回 true，变 [1, 9]。9 在下标 1，字符串 "9" 查不到。', 'Index removal returns 7 and leaves [1, 1, 9]. Value removal deletes the first 1 and returns true, leaving [1, 9]. The index of 9 is 1, and String "9" is absent.'), '7, …')),
    snippet('ArrayList<Integer> xs = new ArrayList<>(List.of(5, 8, 1));\nboolean changed = xs.remove(1);',
      mc(b('赋值左边是 boolean，这行会发生什么？', 'What happens with a boolean variable on the left?'),
      [b('选 remove(Object)，删除值 1，changed = true', 'It selects remove(Object), removes value 1, and sets changed to true'),
       b('选 remove(int)，删除下标 1，再把 8 转成 true', 'It removes index 1 and converts 8 to true'),
       b('先选 remove(int)，返回 Integer 与 boolean 不匹配，编译失败', 'It selects remove(int), then fails to compile because Integer cannot be assigned to boolean')],
      2, b('重载先看实参的类型。', 'Start overload resolution from the argument type.'),
      b('int 实参匹配下标版本。赋给 boolean 的类型错误发生在重载选定之后。程序没有执行到删除。', 'The int argument selects the indexed overload. The incompatible boolean assignment is diagnosed after selection, so no removal runs.'))),
    call('ArrayList<Integer> xs = new ArrayList<>(List.of(8, 1, 1));',
      b('只写一条调用。按值删第一个 1，并用 Integer.valueOf 表明你要选的重载。',
        'Write one call that removes the first value 1. Use Integer.valueOf to select the intended overload.'),
      ['xs.remove(Integer.valueOf(1))'],
      b('remove(1) 的实参是 int。先构造 Integer 实参。', 'remove(1) uses int. Form an Integer argument first.'),
      b('Integer 实参可直接作为 Object，调用返回 boolean 的按值版本。原列表变成 [8, 1]。', 'The Integer argument widens to Object, selecting the boolean value overload. The list becomes [8, 1].')),
    snippet('ArrayList<Integer> xs = new ArrayList<>(List.of(5, 1, 1));\nSystem.out.println(xs.indexOf(1));\nSystem.out.println(xs.indexOf("1"));\nSystem.out.println(xs.contains(5));',
      enter(b('写出三个输出。','Enter the three printed values.'),
      '1 -1 true', b('indexOf 接收的是要匹配的值，第一项的下标为 0。', 'indexOf takes a value to match. The first slot is index 0.'),
      b('整数 1 首次出现在下标 1。字符串 "1" 没有相等项，所以是 −1。contains(5) 为 true。', 'Integer 1 first appears at index 1. String "1" has no equal item, so it gives −1. contains(5) is true.'), '1, …')),
    snippet('ArrayList<Integer> xs = new ArrayList<>(List.of(4, 8));\nxs.add(xs.size(), 10);\nSystem.out.println(xs.set(1, 7));\nSystem.out.println(xs.get(xs.size()));',
      mc(b('执行顺序与结果是什么？', 'What is the execution order and outcome?'),
      [b('add 已越界。后面的语句都没运行', 'add is already out of bounds. The later statements do not run'),
       b('先追加，打印旧值 8，然后 get 抛 IndexOutOfBoundsException', 'It appends, prints old value 8, then get throws IndexOutOfBoundsException'),
       b('先追加，打印 7，然后打印 10', 'It appends, prints 7, then prints 10')],
      1, b('插入的允许区间和读取的允许区间差一个位置。', 'The insertion range has one more position than the read range.'),
      b('add(2,10) 允许尾插。set 返回被覆盖的 8。新 size 为 3，有效读取下标仍只到 2。', 'add(2,10) appends. set returns the overwritten 8. The new size is 3, so the last valid read index is 2.'))),
    snippet('Book ref = new Book("CS201");\nArrayList<Book> shelf = new ArrayList<>();\nshelf.add(ref);\nint a = shelf.indexOf(new Book("CS201"));\nint b = shelf.indexOf(ref);',
      enter(b('课堂 Book 只有 title 和构造器，没重写 equals。a、b 分别是什么？',
        'The classroom Book has only title and a constructor, with no equals override. What are a and b?'),
      '-1 0', b('标题相同和引用指向同一本书是不同条件。', 'Equal titles and identical object references are different conditions.'),
      b('默认 equals 比较对象身份。新建的书找不到，原引用能在下标 0 找到。', 'Default equals uses object identity. The new book is absent and the original reference is found at index 0.'), '-1, …'))
  );

  lessons[11].questions.push(
    call('void add(E e) {\n    Node<E> newNode = /* fill here */;\n    // Connect newNode...\n}',
      b('补上等号右边的构造表达式。写出 Java 泛型构造器调用。', 'Fill the right side with the Java generic constructor expression.'),
      ['new Node<>(e)', 'new Node<E>(e)'],
      b('构造新对象需要关键字 new。', 'Allocation uses the new keyword.'),
      b('new Node<>(e) 从左侧推断 E。显式写 new Node<E>(e) 也正确。直接写 Node<E>(e) 不是构造器调用。', 'new Node<>(e) infers E from the target. new Node<E>(e) spells it out. Node<E>(e) alone is not a constructor invocation.')),
    snippet('Book b = new Book("CS201");\nNode<Book> a = new Node<>(b);\nNode<Book> c = new Node<>(b);\nSystem.out.println(a == c);\nSystem.out.println(a.data == c.data);\nSystem.out.println(a.next == null);',
      enter(b('按顺序写出三个布尔结果。', 'Enter the three boolean results in order.'), 'false true true',
        b('数一数 new 创建了几个节点、几本书。', 'Count how many nodes and books were created with new.'),
        b('a 与 c 指向两个节点，节点的 data 引用都指向 b。构造器没把节点互连，a.next 仍是 null。', 'a and c point to two different nodes whose data fields both refer to b. The constructors make no link between them, so a.next is null.'), 'false, …')),
    snippet('Node<String> head = new Node<>("A");\nhead.next = new Node<>("B");\nNode<String> p = head;\np = p.next;\np.data = "C";\nSystem.out.println(head.data + " " + head.next.data);',
      enter(b('输出哪两个字母？', 'Which two letters are printed?'), 'A C',
        b('p = p.next 只移动 p，p.data = "C" 改的是 p 此刻所在的节点。', 'p = p.next moves only p. p.data = "C" edits the node currently referenced by p.'),
        b('head 仍指向 A，p 移到原来存 B 的节点后修改它的数据。因此沿 head 仍可到这个节点，输出 A C。', 'head still points to A. After moving to the node that held B, p changes its data. The node is still reachable from head, so the output is A C.'), 'A, …')),
    snippet('Node<E> p = head; // head is non-null\nwhile (p != null) {\n    p = p.next;\n}\np.next = new Node<>(e);',
      mc(b('这段尾插为什么在最后一行失败？', 'Why does this tail insertion fail on its last line?'),
        [b('条件把 p 移到末节点之后，触发 NullPointerException', 'The guard moves p past the last node, causing NullPointerException'),
         b('p = p.next 删除了首节点', 'p = p.next deleted the first node'),
         b('最后一行会自动把新节点接成 head', 'The last line automatically sets the new node as head')],
        0, b('写出循环退出时条件为 false 代表什么。', 'Work out what it means for the loop condition to be false.'),
        b('退出时 p == null。尾插要停在仍存在的末节点，应该检查 p.next != null。', 'The loop exits with p == null. Tail insertion must stop on the real final node, so check p.next != null.'))),
    snippet('Node<E> p = head; // list contains exactly one node\nwhile (p.next != null) {\n    p = p.next;\n    p.next = newNode;\n}\nsize++;',
      mc(b('花括号把接线也包进 while。已有一个节点时，执行完会怎样？',
        'The braces put the link assignment inside the while loop. With one existing node, what happens?'),
        [b('成功插入，size 也正确', 'It inserts successfully and the size is correct'),
         b('while 一次也不进，新节点未接入，但 size 仍加 1', 'The loop runs zero times and leaves the node detached, but size increments'),
         b('进循环一次后在 p.next 抛异常', 'It loops once and throws when accessing p.next')],
        1, b('只有一个节点，它的 next 是什么？', 'What is next on a one-node list?'),
        b('p.next 为 null，所以不进入循环。要把 p.next = newNode 移到循环外，再在确认链接完成后计数。', 'p.next is null, so the loop does not run. Put the link assignment after the loop and count the insertion after linking.'))),
    enter(b('从空表连续做 5 次课堂 MyLinkedList.add。只数 currentNode = currentNode.next 实际执行了几次。',
      'Append five times to an empty classroom MyLinkedList. Count executions of currentNode = currentNode.next only.'),
      '6', b('分别看插入前有 0、1、2、3、4 个节点的情况。', 'Consider the list with 0, 1, 2, 3, and 4 nodes before insertion.'),
      b('跳转次数依次为 0、0、1、2、3，总计 6。推广到 n 次，跳转次数随 n 以 Θ(n²) 增长。', 'The hop counts are 0, 0, 1, 2, and 3, totaling 6. For n appends this grows as Θ(n²).'))
  );

  lessons[12].questions.push(
    snippet('ArrayDeque<Integer> d = new ArrayDeque<>();\nd.add(4);\nd.push(7);\nd.offer(9);\nSystem.out.println(d.pop());\nSystem.out.println(d.peek());\nSystem.out.println(d.pollLast());',
      enter(b('三个输出依次是什么？', 'Enter the three printed values in order.'), '7 4 9',
        b('push 和 pop 操作队首，offer 操作队尾。', 'push and pop use the front, while offer uses the rear.'),
        b('三次添加后是 [7, 4, 9]。pop 取走 7，peek 读 4，pollLast 移除并返回 9。', 'The additions give [7, 4, 9]. pop removes 7, peek reads 4, and pollLast removes and returns 9.'), '7, …')),
    snippet('ArrayDeque<Integer> d = new ArrayDeque<>();\nInteger a = d.peek();\nint b = d.peek();',
      mc(b('两次 peek 的结果和赋值行为是什么？', 'What do both peek calls return, and what happens on assignment?'),
        [b('两次都抛 NoSuchElementException', 'Both calls throw NoSuchElementException'),
         b('a 得到 null，b 变成 0', 'a receives null and b becomes zero'),
         b('a 得到 null，第二行赋值因拆箱 null 抛 NullPointerException', 'a receives null, and the second assignment throws NullPointerException when unboxing')],
        2, b('peek 的返回类型是 Integer，空时给 null。', 'peek returns Integer and uses null for empty.'),
        b('引用变量 a 可持有 null。给基本类型 b 赋值要拆箱，拆箱 null 会抛异常。', 'The reference a can hold null. Assigning to primitive b unboxes null and throws.'))),
    snippet('ArrayDeque<Integer> d = new ArrayDeque<>();\n// Remove the stack top safely, even when empty.',
      mc(b('想取走栈顶，空时得到 null。此处应该写哪一个调用？', 'Which call removes the top and gives null when the stack is empty?'),
        ['d.pop()', 'd.peek()', 'd.pollFirst()', 'd.pollLast()'],
        2, b('push 把新值放在队首，需要从同一端安全取走。', 'push puts the top at the front. Remove safely from that same end.'),
        b('pollFirst 取走队首，空时返回 null。pop 空时抛异常，peek 不删除，pollLast 从另一端取走。', 'pollFirst removes at the front and returns null on empty. pop throws on empty, peek leaves the item in place, and pollLast works at the other end.')))
  );

  lessons[13].questions.push(
    snippet('ArrayDeque<Integer> d = new ArrayDeque<>(List.of(5, 1, 1, 9));\nboolean a = d.remove(1);\nInteger b = d.remove();',
      enter(b('按顺序写出 a、b，然后写出 d 中从队首到队尾剩下的两个值。',
        'Enter a and b in order, followed by the two remaining values from front to rear.'),
      'true 5 1 9', b('第一次调用有一个实参，第二次是空括号。', 'The first call has an argument and the second has empty parentheses.'),
      b('remove(1) 删除第一个值 1，返回 true。remove() 删除并返回队首 5。剩下 [1, 9]。', 'remove(1) deletes the first value 1 and returns true. remove() removes and returns front 5. The deque is [1, 9].'), 'true, …')),
    snippet('ArrayDeque<Integer> d = new ArrayDeque<>(List.of(1));\n// Consider each line independently.\nboolean removed = d.remove("1");\nd.add("1");',
      mc(b('分别判断 remove("1") 与 add("1")。', 'Judge remove("1") and add("1") independently.'),
        [b('两句都编译失败', 'Both fail to compile'),
         b('remove 能编译并返回 false，add 编译失败', 'remove compiles and returns false, while add fails to compile'),
         b('remove 返回 true，add 会自动把字符串变成整数', 'remove returns true, and add converts the string to an integer')],
        1, b('取出两个签名，Object 和 E 的限制不同。', 'Compare the signatures: Object and E impose different constraints.'),
        b('remove(Object) 能接 String，但没有相等的项。add(E) 这里需要 Integer，String 无法作为该实参。', 'remove(Object) takes the String but finds no matching item. add(E) needs an Integer here, so that String argument cannot compile.'))),
    snippet('ArrayList<Integer> xs = new ArrayList<>(List.of(3, 4));\nArrayDeque<Integer> d = new ArrayDeque<>(List.of(3, 4));\n// Consider each call independently.',
      mc(b('想把 9 插到原下标 1，哪项判断正确？', 'You want to insert 9 before the old item at index 1. Which analysis is correct?'),
        [b('xs.add(1, 9) 合法，d.add(1, 9) 编译失败', 'xs.add(1, 9) is valid, while d.add(1, 9) does not compile'),
         b('两者都有按下标插入，结果相同', 'Both have indexed insertion and produce the same result'),
         b('xs.add(9, 1) 合法并插到中间，d.add(9, 1) 编译失败', 'xs.add(9, 1) inserts in the middle and d.add(9, 1) does not compile')],
        0, b('ArrayList 的两参数 add 先写下标。', 'In the two-argument ArrayList add, index comes first.'),
        b('列表调用得到 [3, 9, 4]。ArrayDeque 的公开接口没有按下标插入的方法，内部用数组与能不能传下标无关。', 'The list becomes [3, 9, 4]. ArrayDeque exposes no indexed insertion, regardless of its internal array.'))),
    snippet('ArrayDeque<Integer> d = new ArrayDeque<>();\nSystem.out.println(d.poll());\nSystem.out.println(d.peekLast());\nSystem.out.println(d.element());',
      mc(b('程序打印什么，哪里停止？', 'What is printed, and where does execution stop?'),
        [b('打印 null、null、null', 'It prints null, null, null'),
         b('第一行 println 的 poll 就抛异常', 'poll in the first println already throws'),
         b('打印两个 null，element 抛 NoSuchElementException', 'It prints two nulls, then element throws NoSuchElementException')],
        2, b('空表先分辨特殊返回值和严格版本。', 'Distinguish sentinel methods from the exception family.'),
        b('poll 与 peekLast 都返回 null。element 等价于严格读队首，空时抛异常，第三个 println 不会执行。', 'poll and peekLast return null. element is strict front inspection and throws, so the third println never runs.'))),
    snippet('Queue<Integer> q = new ArrayDeque<>(List.of(4, 8));',
      mc(b('保持 q 的声明原样，哪一行能编译？', 'With q declared exactly this way, which line compiles?'),
        ['Integer a = q.peekLast();', 'Integer a = q.peek();', 'q.push(2);', 'Integer a = q.get(0);'],
        1, b('先看等号左边的 Queue 声明。', 'Look at the Queue declaration to the left of the equals sign.'),
        b('Queue 暴露 peek()。两端专用方法要用 Deque 声明。get(int) 不属于 ArrayDeque。', 'Queue exposes peek(). Deque exposes end-specific methods. get(int) is not an ArrayDeque operation.'))),
    snippet('ArrayDeque<Integer> d = new ArrayDeque<>();\nboolean accepted = d.offer(null);',
      mc(b('关于这一行，哪个结果正确？', 'What is the outcome of this line?'),
        [b('能编译，运行时抛 NullPointerException', 'It compiles, then throws NullPointerException'),
         b('能编译，accepted = false', 'It compiles and sets accepted to false'),
         b('编译失败，null 不能作为 Integer 实参', 'It fails to compile because null cannot be passed as Integer')],
        0, b('分别看 Java 的引用类型，和容器的 null 契约。', 'Separate Java reference types from the collection’s null contract.'),
        b('null 可传给 Integer，因此编译通过。ArrayDeque 明确不存 null，offer(null) 抛异常。', 'The null argument is valid for Integer at compile time. ArrayDeque rejects stored nulls, so offer(null) throws.'))),
    call('ArrayDeque<Integer> d = new ArrayDeque<>(List.of(3, 8, 5));',
      b('只写一条以 peek 开头的方法调用，读队尾，并在空表时返回 null。', 'Write one peek-family call that reads the rear and returns null when empty.'),
      ['d.peekLast()'],
      b('队尾用 Last，查看不改容器。', 'Last refers to the rear. Inspection does not remove.'),
      b('peekLast() 无参数，读到 5，队列仍是 [3, 8, 5]。', 'peekLast() takes no arguments, reads 5, and leaves the deque [3, 8, 5].')),
    call('ArrayDeque<Integer> d = new ArrayDeque<>(List.of(1, 5, 1, 9));',
      b('只写一条调用，参数直接写整数 1。删除最靠队尾的那个 1，并返回是否删掉。',
        'Write one call using the integer literal 1. Remove the 1 nearest the rear and report whether it was removed.'),
      ['d.removeLastOccurrence(1)'],
      b('LastOccurrence 会从队尾方向找匹配值。', 'LastOccurrence scans for a matching value from the rear.'),
      b('removeLastOccurrence(1) 找到下标 2 的值 1 并删除，返回 true，结果为 [1, 5, 9]。', 'removeLastOccurrence(1) deletes the 1 at position 2, returns true, and leaves [1, 5, 9].')),
    snippet('ArrayDeque<Integer> d = new ArrayDeque<>(List.of(7));',
      mc(b('哪一行能编译，同时把 2 加到队首并把成功状态存进 boolean？',
        'Which line compiles, adds 2 at the front, and stores the success status in a boolean?'),
        ['boolean ok = d.push(2);', 'boolean ok = d.addFirst(2);', 'boolean ok = d.offerLast(2);', 'boolean ok = d.offerFirst(2);'],
        3, b('先检查返回类型，再检查操作端点。', 'Check the return type and then the end.'),
        b('push 与 addFirst 返回 void。offerLast 返回 boolean 但加在尾部。offerFirst 满足两个条件，结果为 [2, 7]。', 'push and addFirst return void. offerLast returns boolean but uses the rear. offerFirst meets both constraints and produces [2, 7].')))
  );

  lessons[14].questions.push(
    snippet('TreeNode<Book> root = new TreeNode<>(new Book("CS201"));\nroot.left = new TreeNode<>(new TennisRacket("Head"));',
      mc(b('能不能把球拍节点接到这棵树？', 'Can this racket node become a child in the given tree?'),
        [b('能，left 只管连接，里面的数据类型可以不同', 'Yes, left is a link, so payload types can differ'),
         b('不能，root.left 的声明类型是 TreeNode<Book>', 'No, root.left has declared type TreeNode<Book>'),
         b('能，但每次访问必须先强转为 Book', 'Yes, but each read must cast to Book first')],
        1, b('用 Book 替换 TreeNode<E> 中的 E。', 'Substitute Book for E in the TreeNode<E> definition.'),
        b('root.left 需要 TreeNode<Book>。TennisRacket 与所需的 Book 类型不匹配，赋值编译失败。', 'root.left requires TreeNode<Book>. TennisRacket does not match the required Book type, so the assignment fails to compile.'))),
    snippet('TreeNode<Integer> root = new TreeNode<>(8);\nTreeNode<Integer> cursor = root;\ncursor.left = new TreeNode<>(4);\ncursor = cursor.left;\ncursor.right = new TreeNode<>(6);\nroot.right = new TreeNode<>(12);',
      enter(b('从 root 开始做前序遍历，依次访问哪些值？', 'What is the preorder traversal starting from root?'),
      '8 4 6 12', b('cursor 移到 4 后，写的是哪一个节点的 right？', 'After cursor moves to 4, whose right field is written?'),
      b('根仍为 8。左子树是 4 的右孩子 6，根的右子树是 12。前序先根、再左子树、最后右子树。', 'The root stays 8. Its left subtree has 4 with right child 6, and its right subtree is 12. Preorder visits root, left subtree, right subtree.'), '8, …')),
    snippet('TreeNode<Integer> root = new TreeNode<>(8);\nroot.right.left = new TreeNode<>(10);',
      mc(b('执行第二行时会怎样？', 'What happens on the second line?'),
        [b('编译失败，因为 right 的值为 null', 'It fails to compile because right holds null'),
         b('自动创建中间右孩子，再把 10 接上', 'It creates the missing intermediate child and attaches 10'),
         b('可以编译，但对 null 的 right 子节点访问 left 会抛 NullPointerException', 'It compiles, but accessing left on the null right-child reference throws NullPointerException')],
        2, b('Java 会自动 new 没有创建的中间对象吗？', 'Does Java allocate the missing intermediate object automatically?'),
        b('新根的 right 默认为 null。必须先给 root.right 赋一个有效节点，才能修改它的 left 字段。', 'The new root’s right field is initially null. Assign a real node to root.right before writing its left field.'))),
    snippet('TreeNode<Integer> root = new TreeNode<>(8);\nroot.right = new TreeNode<>(12);\nQueue<TreeNode<Integer>> q = new ArrayDeque<>();\nq.offer(root);\nTreeNode<Integer> p = q.poll();\nSystem.out.println(p.data);\nq.offer(p.left);\nq.offer(p.right);',
      mc(b('忘记判断孩子为 null 的这段 BFS 代码会怎样？', 'What happens in this BFS fragment with the missing null guards?'),
        [b('打印 8 后抛 NullPointerException，12 没有入队', 'It prints 8 and throws NullPointerException before enqueuing 12'),
         b('打印 8，offer(p.left) 返回 false，再入队 12', 'It prints 8, gets false from offer(p.left), and enqueues 12'),
         b('打印 8，两个孩子按 left、right 正常入队', 'It prints 8 and enqueues both children in left-to-right order')],
        0, b('先执行 left，然后才会执行 right。', 'The left offer executes before the right offer.'),
        b('p.left 是 null，ArrayDeque.offer(null) 抛异常，下一行还没执行。正确做法是分别检查两个引用。', 'p.left is null, so ArrayDeque.offer(null) throws before the next line. Guard each child separately.'))),
    snippet('TreeNode<Integer> root = new TreeNode<>(8);\nroot.left = root;',
      mc(b('这两行的类型检查与结构结果分别是什么？', 'How do these lines fare in type checking, and what structure do they create?'),
        [b('编译器知道这是环，会在编译时拒绝', 'The compiler recognizes the cycle and rejects the assignment'),
         b('能编译，但左链接形成环，普通递归 DFS 会不断深入', 'It compiles, but the left link forms a cycle and ordinary recursive DFS keeps descending'),
         b('能编译，赋值会复制一个独立的根节点作为左孩子', 'It compiles and copies a separate root as the left child')],
        1, b('赋值复制引用。TreeNode<Integer> 匹配 left 的类型。', 'Assignment copies a reference, and TreeNode<Integer> matches the left field.'),
        b('left 和 root 指向同一个对象。类型合法，树的无环结构被破坏，未经防护的递归最终可能抛 StackOverflowError。', 'left and root refer to the same object. Types are valid but the acyclic tree property is broken. Unguarded recursion can eventually throw StackOverflowError.')))
  );

  lessons[15].questions.push(
    call('TreeNode<Integer> root = null;\n// insert(p, key) returns the updated root of p.',
      b('调用课上补充的 insert，把 8 接成整棵空树的新根。只写一条语句。', 'Call the lesson’s insert to attach 8 as the root of the empty tree. Write one statement.'),
      ['root = insert(root, 8)'],
      b('递归返回的新节点需要写回保存根的变量。', 'Store the returned node in the variable holding the root.'),
      b('root 为 null 时，insert 返回新建节点。把返回值赋给 root 才形成外部可达的根。', 'With null root, insert returns the new node. Assign it back to root to make it reachable from the caller.')),
    snippet('TreeNode<Integer> root = new TreeNode<>(8);\n// In insert, the smaller-key branch uses:\ninsert(p.left, key);\n// instead of assigning its result.\n// Then run root = insert(root, 4);',
      mc(b('只改掉这处左分支赋值，执行插入 4 后，root.left 是什么？',
        'After removing the left-branch assignment as shown, what is root.left after inserting 4?'),
        [b('指向数据为 4 的节点，因为 Java 会自动同步局部参数', 'It points to 4 because Java automatically synchronizes parameter variables'),
         b('指向数据为 8 的节点，因为返回值变成旧根', 'It points to 8 because the return value is the old root'),
         b('仍为 null。空子树返回了新节点，但返回值被丢弃', 'It stays null. The empty subtree returns a new node, but the caller discards it')],
        2, b('看空子树那层的返回值被谁接住。', 'Check who receives the return from the empty subtree.'),
        b('新节点 4 只存在于递归返回值上。没有 p.left = 就丢失这条连接，因此原根的 left 仍是 null。', 'The new 4 is returned by the recursive call. Without p.left =, that new link is lost, so left on the original root stays null.'))),
    snippet('Book a = new Book("CS201");\nBook b = new Book("CS201");\n// cmp compares Book.title. Insert treats cmp.compare(x, p.data) == 0 as a duplicate.',
      mc(b('依次把 a、b 插进空 BST。结点个数与 a == b 的结果是什么？',
        'Insert a and then b into an empty BST. How many nodes are there, and what is a == b?'),
        ['2, true', '1, false', '2, false'],
        1, b('分开判断对象身份与 BST 的键比较。', 'Judge object identity and BST comparison independently.'),
        b('两个 new 创建不同对象，所以 a == b 为 false。title 比较为 0，第二次插入按重复键处理，树里只有一个结点。', 'The two new calls create different objects, so a == b is false. Equal titles compare as zero, so the second insertion is a duplicate and the tree has one node.')))
  );
})();
