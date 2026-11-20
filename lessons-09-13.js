'use strict';

(() => {
  const { bi: b, section: s, mc, enter, order, java, lessons } = CS201;

  lessons[9] = {
    title: b('复杂度与 Big O', 'Complexity & Big O'),
    icon: 'growth', art: '↗',
    intro: b('同一件事可以有很多种做法。输入从 10 个变成 10 万个时，哪一种更能撑得住？', 'There are many ways to solve the same problem. Which one holds up when the input goes from 10 items to 100,000?'),
    takeaway: b('先数最关键的操作，再看它随输入大小 n 怎么增长。', 'Count the work that matters, then see how it grows with input size n.'),
    lab: b('拖动 n，对比 7 条增长曲线，并数一数循环到底执行了几次。', 'Drag n to compare seven growth curves and count exactly how many times a loop runs.'),
    chapters: [
      s(b('从输入和输出开始', 'Start with input and output'), [
        b('算法是一组解决问题的步骤。找一张写着 7 的卡片，输入是所有卡片和目标 7，输出是它的位置或“没有找到”。这里 n 是卡片数。分析时你可以数“比较一次卡片”这种基本操作。', 'An algorithm is a procedure for solving a problem. To find a card labeled 7, the cards and target are the input. Its position or “missing” is the output. Here n is the number of cards. Count a basic operation such as comparing one card.'),
        b('同样是 n 张卡，目标在第一张只比较 1 次，目标在最后或缺席则比较 n 次。前者是最好情况，后者是最坏情况，平均情况需要说明输入分布（例如目标等概率出现在每个位置）。', 'With n cards, a target on the first card takes one comparison. A target at the end or absent takes n. These are the best and worst cases. An average case needs an input distribution, such as each position being equally likely.')
      ], { pages: '2–4' }),
      s(b('实测时间与增长趋势', 'Timing and growth'), [
        b('把同一段程序在不同 n 下运行并计时，可以发现趋势。机器、编译器、JVM 预热以及输入形状都会影响毫秒数。比较算法的增长速度时，我们约定操作模型，例如复制一个字符计 1 次。', 'Timing a program at several values of n can reveal a trend. Hardware, compiler, JVM warmup, and input shape affect milliseconds. To compare growth, choose a cost model, such as one unit for copying a character.'),
        b('课件的例子要拼 n 个星号。String 不可变，逐次执行 s += "*" 会反复复制前缀，复制量约为 1 + 2 + … + n，即 Θ(n²)。StringBuilder 追加字符到可增长缓冲区，扩容的总复制量为 O(n)，最后 toString 再复制一次，总时间 Θ(n)。', 'The lecture builds a string of n stars. Strings are immutable. Repeated s += "*" copies growing prefixes, with roughly 1 + 2 + … + n characters copied, or Θ(n²). StringBuilder appends into a growable buffer, with O(n) total copying during growth and one final toString copy, giving Θ(n) time.'),
        b('排序也一样。插入排序最坏 Θ(n²)，归并排序最坏 Θ(n log n)。输入足够大时，增长类别比机器快多少更能说明差距。', 'The same idea applies to sorting. Insertion sort has worst-case Θ(n²) time while merge sort has worst-case Θ(n log n). At large inputs, the growth classes explain why faster hardware alone cannot close the gap.')
      ], { pages: '5–10' }),
      s(b('Big O 是渐近上界', 'Big O is an asymptotic upper bound'), [
        b('f(n) 是 O(g(n))，意思是存在常数 c > 0 和 n₀，使所有 n ≥ n₀ 都满足 0 ≤ f(n) ≤ c·g(n)。乘上 c 让 g 有足够的高度，从 n₀ 开始逐点压住 f。', 'f(n) is O(g(n)) if constants c > 0 and n₀ exist so that 0 ≤ f(n) ≤ c·g(n) for every n ≥ n₀. Multiplying g by c gives it enough room to cover f from n₀ onward.'),
        b('例如 n ≥ 1 时，3n + 5 ≤ 8n，所以 3n + 5 是 O(n)。它也是 O(n²)，平常分析会给出能说明增长类别的紧上界。Θ(n) 表示再有一个同阶下界。最坏情况是在选取 f，Big O 是给该函数的上界；最好、平均和最坏的函数都可以各自用 Big O 描述。', 'For n ≥ 1, 3n + 5 ≤ 8n, so 3n + 5 is O(n). It is also O(n²), though analysis usually reports a tight growth class. Θ(n) supplies a matching lower bound too. Choosing the worst case selects f. Big O bounds that function, and it can also bound a best-case or average-case function.')
      ], { pages: '11–12, 20–23' }),
      s(b('七种增长函数', 'Seven growth functions'), [
        b('下面从慢到快按 n 足够大时的增长速度排列。log 通常按 2 为底来想，换成任意固定底数 > 1 只会乘上常数。', 'Read the rows in increasing asymptotic growth order. Base 2 is convenient for logs. Any fixed base above 1 changes only a constant factor.')
      ], { pages: '10, 13–19', table: {
        headers: [b('增长率', 'Growth'), b('n 翻倍后的变化', 'When n doubles'), b('典型例子', 'Example')],
        rows: [
          ['1', b('保持不变', 'Unchanged'), b('按有效下标读数组', 'Read an array at a valid index')],
          ['log₂ n', b('加 1', 'Add 1'), b('有序数组的二分搜索', 'Binary search in a sorted array')],
          ['n', b('乘 2', 'Multiply by 2'), b('扫描所有元素', 'Scan every element')],
          ['n log₂ n', b('略多于 2 倍', 'A little over 2×'), b('归并排序', 'Merge sort')],
          ['n²', b('乘 4', 'Multiply by 4'), b('遍历所有有序下标对', 'Visit every ordered pair of indices')],
          ['n³', b('乘 8', 'Multiply by 8'), b('三个独立的 n 次循环嵌套', 'Three nested n-iteration loops')],
          ['2ⁿ', b('平方', 'Square the previous count'), b('枚举 n 个元素的所有子集', 'Enumerate all subsets of n items')]
        ]
      } }),
      s(b('循环次数怎么数', 'Count loop iterations'), [
        b('先选你要数的那一行。i 从 0 开始，i < n，i++ 时执行 n 次；i += 3 执行 ⌈n/3⌉ 次，仍是 Θ(n)。固定跑 100 次的循环属于 Θ(1)。每次 i *= 2（由 1 起，i < n）只需约 log₂ n 次。', 'Pick the line to count. Starting i at 0 with i < n, i++ gives n iterations and i += 3 gives ⌈n/3⌉. Both are Θ(n). A loop fixed at 100 iterations is Θ(1). Doubling i from 1 until i ≥ n takes about log₂ n iterations.'),
        b('连续代码块相加。相互独立的嵌套循环相乘。若内层次数依赖外层，用求和。下面外层 i = 0 时有 n 次，i = 1 时有 n−1 次，最后是 1 次，合计 n(n+1)/2。', 'Add costs of consecutive blocks. Multiply independent nested loops. When inner work depends on the outer index, sum it. Below, i = 0 gives n iterations, i = 1 gives n−1, and the last i gives one, totaling n(n+1)/2.')
      ], { pages: '24–28', code: `long visits = 0;
for (int i = 0; i < n; i++) {
    for (int j = i; j < n; j++) {
        visits++;
    }
}` }),
      s(b('把长式子化成增长类别', 'Reduce a long expression to its growth class'), [
        b('多项式保留最高次项并去掉固定系数。例如 2n² + 1000n + 50 是 Θ(n²)。外层跑 n 次，里面依次跑 3n 次、2n 次，内层合起来是 5n，总成本 Θ(n²)。', 'Keep the highest-degree term of a polynomial and drop its fixed coefficient. For example, 2n² + 1000n + 50 is Θ(n²). If each of n outer iterations runs blocks of 3n and 2n, the total is 5n², or Θ(n²).'),
        b('课件最后一道题的固定循环从 10 跑到 50（含 50），实际是 41 次。步长 2 的另一段是 ⌈n³/2⌉ 次。外层 3n 次，所以总数是 3n(41 + ⌈n³/2⌉)，增长类别 Θ(n⁴)。空间复杂度也可以同样分析，例如先定义要度量的是辅助空间还是包含输入的总空间。', 'The lecture’s final fixed loop runs from 10 through 50, for 41 iterations. The stride-2 block takes ⌈n³/2⌉. The outer loop has 3n iterations, totaling 3n(41 + ⌈n³/2⌉) and growing as Θ(n⁴). The same notation measures space. State whether you are counting auxiliary storage or total storage including input.')
      ], { pages: '21–28' })
    ],
    questions: [
      mc(b('n 是任意项数。按已知下标读取数组里的一个元素是哪个增长类别？', 'For an array of n items, what is the growth class of one access at a known index?'), ['Θ(n)', 'Θ(1)', 'Θ(log n)'], 1, b('想想数组能否直接定位格子。', 'Can the array jump to that slot?'), b('用下标直接定位一次。n 再大也只访问一个格子。', 'The index identifies one slot directly. There is one access regardless of n.')),
      mc(b('4n² + 10n + 7 的紧增长类别是什么？', 'What is the tight growth class of 4n² + 10n + 7?'), ['Θ(n²)', 'Θ(n)', 'Θ(n³)'], 0, b('找 n 的最高次幂。', 'Find the highest power of n.'), b('n² 主导增长。低次项和固定倍数 4 都不改变增长类别。', 'n² dominates. The lower terms and the fixed factor of 4 leave the class unchanged.')),
      enter(b('双层循环中 i 从 0 到 4，内层 j 从 i 到 4（两端都含）。内层循环体总共执行多少次？', 'i runs from 0 through 4. For each i, j runs from i through 4. How many inner-body executions occur in total?'), '15', b('把每一轮 i 的内层次数依次写出来。', 'Write the inner count for each i.'), b('五轮的次数依次为 5、4、3、2、1，总共 15 次。', 'The five counts are 5, 4, 3, 2, and 1, totaling 15.')),
      mc(b('i = 1，每轮 i 翻倍，直到 i ≥ n。循环体属于哪个增长类别？', 'Starting at i = 1, double i until i ≥ n. What is the growth class of the loop body count?'), ['Θ(n)', 'Θ(2ⁿ)', 'Θ(log n)'], 2, b('跑 k 次后 i 是多少？', 'What is i after k iterations?'), b('跑 k 次后 i = 2ᵏ，解 2ᵏ ≥ n 得 k = ⌈log₂ n⌉。', 'After k iterations i = 2ᵏ. The smallest k satisfying 2ᵏ ≥ n is ⌈log₂ n⌉.')),
      mc(b('某个算法的最坏时间是 Θ(n)。以下哪个关于该最坏时间的说法成立？', 'An algorithm has worst-case time Θ(n). Which statement about that worst-case time is true?'), [b('它是 O(n²)', 'It is O(n²)'), b('它是 O(1)', 'It is O(1)'), b('它必定执行恰好 n 次操作', 'It does exactly n operations')], 0, b('Big O 表示上界，试着令 n ≥ 1。', 'Big O gives an upper bound. Try n ≥ 1.'), b('n ≥ 1 时 n ≤ n²，所以平方函数也是一个较松的上界。Θ(n) 给出紧增长类别。', 'Since n ≤ n² for n ≥ 1, the square is a looser upper bound. Θ(n) gives the tight growth class.')),
      mc(b('外层运行 3n 次，每轮先做 41 次，然后做 ⌈n³/2⌉ 次。总复杂度是什么？', 'The outer loop runs 3n times. Each iteration does 41 steps and then ⌈n³/2⌉ steps. What is the total complexity?'), ['Θ(n³)', 'Θ(n⁶)', 'Θ(n⁴)'], 2, b('把每一轮的两个工作块相加，再乘外层次数。', 'Add the two blocks in each iteration, then multiply by the outer count.'), b('每轮成本 Θ(n³)，乘以 3n 后增长为 Θ(n⁴)。', 'Each iteration costs Θ(n³). Multiplying by 3n gives Θ(n⁴).'))
    ]
  };

  lessons[10] = {
    title: b('泛型与 ArrayList', 'Generics & ArrayList'),
    icon: 'array', art: '▦',
    intro: b('给数据排上编号，再准备一些备用格子。学会用 Java 写能自动长大的列表。', 'Number the items and keep some spare slots. Learn to use a Java list that grows as needed.'),
    takeaway: b('List 定义列表的操作，ArrayList 用可扩容数组实现它，泛型让编译器检查元素类型。', 'List defines the operations, ArrayList implements them with a resizable array, and generics let the compiler check element types.'),
    lab: b('在数组里读、改、插入和删除。装满后追加一次，看看每一个元素如何被复制。', 'Read, replace, insert, and delete in an array. Append to a full list and watch each element get copied.'),
    chapters: [
      s(b('先区分契约和实现', 'Separate the contract from the implementation'), [
        b('抽象数据类型（ADT）描述能做哪些操作及它们的行为。List 表示有顺序的元素序列，可按位置增加、删除和访问，允许重复。ArrayList 与 LinkedList 都实现这个接口，各自选择内部存储方式。', 'An abstract data type (ADT) describes operations and their behavior. A List is an ordered sequence with positional insertion, removal, and access, and it permits duplicates. ArrayList and LinkedList implement this interface with different storage.'),
        b('封装把内部数组藏起来，调用方用公开方法。模块化把程序分成职责清楚的部分。Collection 是 List、Set、Queue 等接口的共同上层之一，Iterator 为遍历定义统一接口，Collections 是工具类，Map 有独立的接口层次。', 'Encapsulation hides the backing array behind public methods. Modularity splits a program into parts with defined jobs. Collection is a shared superinterface of List, Set, and Queue. Iterator defines traversal. Collections is a utility class and Map has a separate interface hierarchy.'),
        b('位置与键是两种找数据的方法。List 用从 0 开始的位置，而学生档案也可以按唯一学号查找。按键查找会在第 18 讲出现。', 'Position and key are two ways to find data. A List uses positions starting at 0. Student records could also be retrieved by unique ID. Key-based lookup appears in Lecture 18.')
      ], { pages: '7–22' }),
      s(b('类型参数 E 是什么', 'What the type parameter E means'), [
        b('int[] 的元素类型是 int，数组长度在创建时固定。Animal[] 可以放 Animal 和它的子类。ArrayList<Animal> 也可放 Tiger 和 Lion，并自动扩容，前提是这些类继承 Animal。ArrayList<Shape> 则需要 Shape 或其子类型。', 'An int[] stores ints and has a length fixed at creation. Animal[] can hold Animal and its subtypes. ArrayList<Animal> can also take Tiger and Lion, assuming they extend Animal, and it can grow. ArrayList<Shape> requires Shape or one of its subtypes.'),
        b('E 是元素类型的占位符。ArrayList<String> 的 get 返回 String，于是可以接着调用 charAt。尖括号 <> 用于构造器时让编译器推断类型。List<Integer> 可接收字面量 5，编译器会装箱为 Integer。泛型的类型参数使用引用类型，int 对应 Integer，double 对应 Double。', 'E stands for the element type. get on ArrayList<String> returns String, so charAt is available. The diamond <> lets the compiler infer a constructor’s type arguments. List<Integer> accepts literal 5 through autoboxing to Integer. Type arguments are reference types, so use Integer for int and Double for double.'),
        b('省略泛型写成原始类型 ArrayList 会失去编译期的元素类型保护，并可能得到 unchecked 警告。raw.get(0) 的静态类型是 Object，直接调用 String 的 charAt 会编译失败。强制转换虽然能编译，遇到不同类型的对象时可能抛出 ClassCastException。', 'Omitting type arguments creates a raw ArrayList and loses compile-time protection for element types. Some calls produce unchecked warnings. raw.get(0) has static type Object, so calling String.charAt directly fails to compile. A cast can compile and still throw ClassCastException for a different type.')
      ], { pages: '3–6, 22–26, 34', code: `List<String> names = new ArrayList<>();
names.add("Isabelle");
char letter = names.get(0).charAt(2);  // 'a'

List<Integer> scores = new ArrayList<>();
scores.add(5);  // int autoboxes to Integer` }),
      s(b('写一个通用的 Pair', 'Write a reusable Pair'), [
        b('泛型类可以声明多个类型参数。同一个 Pair<A, B> 可以表示姓名与分数，也可以表示坐标的两个数值。字母名是惯例，通常 E 表示元素，T 表示类型，K 和 V 表示键和值。', 'A generic class can declare multiple type parameters. One Pair<A, B> can represent a name and a score or the two components of a coordinate. The letters are conventions. E often means element, T means type, and K and V mean key and value.')
      ], { pages: '37–38', code: `class Pair<A, B> {
    final A first;
    final B second;

    Pair(A first, B second) {
        this.first = first;
        this.second = second;
    }
}

// In a method:
// Pair<String, Integer> p = new Pair<>("Mina", 90);` }),
      s(b('size、capacity 与下标', 'Size, capacity, and indices'), [
        b('size 是当前元素数，capacity 是内部数组能装多少元素。备用槽不在列表的有效下标里。get、set、remove 的下标必须在 0 到 size−1，add(index, value) 还允许 index = size，因为可以追加。', 'Size counts current elements. Capacity counts slots in the backing array. Spare slots are outside the list’s valid indices. get, set, and remove use indices 0 through size−1. add(index, value) also accepts index = size to append.'),
        b('例如 [A, B, C] 执行 add(1, X)，先把 C、B 分别右移一格，再写入 X，得到 [A, X, B, C]。remove(2) 删掉 B，并把 C 左移，得到 [A, X, C]。set(1, Y) 直接覆盖 X，size 保持不变。', 'For [A, B, C], add(1, X) shifts C and B one slot right, then writes X to obtain [A, X, B, C]. remove(2) deletes B and shifts C left to obtain [A, X, C]. set(1, Y) overwrites X and preserves size.'),
        b('数组放满后，会分配更大的新数组并复制有效元素。本实验用小容量并按 2 倍演示。Java API 文档给出默认初始容量 10，内部数组可以延迟分配，增长倍率属于实现细节。', 'When the backing array fills, a larger array is allocated and the live elements are copied. The lab uses small capacities and doubles them for illustration. The Java API documents a default initial capacity of 10. Allocation can be deferred, and the growth multiplier is an implementation detail.')
      ], { pages: '30–36' }),
      s(b('为什么追加是摊还 O(1)', 'Why append is amortized O(1)'), [
        b('有空位的追加只写 1 个槽。一次扩容可能复制 n 个元素，最坏 O(n)。如果容量几何增长，例如 4、8、16、32，多次扩容的总复制量 4 + 8 + 16 + … 只与最后的容量同阶。连续追加 n 次总成本 O(n)，分摊到每次是 O(1)。', 'An append with spare capacity writes one slot. A resize may copy n elements, costing O(n) on that call. With geometric capacity growth such as 4, 8, 16, 32, total copying 4 + 8 + 16 + … is of the same order as the final capacity. n appends cost O(n) in total, or O(1) amortized each.'),
        b('get 和 set 直接定位，O(1)。在 i 插入要移动 n−i 个元素，在 i 删除要移动 n−i−1 个元素，最坏 O(n)。从末尾删除一般只需清空末槽，O(1)。indexOf 按值查找要逐项比较，最坏 O(n)。', 'get and set use direct indexing in O(1). Inserting at i shifts n−i elements and removing at i shifts n−i−1, both O(n) in the worst case. Removing the last item just clears the final slot in O(1). indexOf scans for a value and takes O(n) in the worst case.')
      ], { pages: '31–36' }),
      s(b('遍历与删除的 Java 细节', 'Traversal and removal in Java'), [
        b('需要下标时用普通 for。只读元素时用增强 for。有迭代中的删除需求时，可在每次 next 后对同一个迭代器调用一次 remove。遍历期间通过列表本身做结构修改，典型迭代器可能抛出 ConcurrentModificationException。', 'Use an indexed for loop when you need positions and an enhanced for loop when reading values. To remove as you traverse, call remove on the iterator once after its next. Structural changes to the list made outside that iterator during traversal can trigger ConcurrentModificationException.'),
        b('在 List<Integer> 中，remove(1) 绑定到 remove(int index)。要删除值 1，传入 Integer.valueOf(1)。indexOf 用相等性（对象通常是 equals），给自定义名录记录按姓名查找可以写循环，或者先定义正确的 equals 规则。未找到返回 −1。', 'On List<Integer>, remove(1) calls remove(int index). To remove the value 1, pass Integer.valueOf(1). indexOf uses equality, generally equals for objects. For a custom directory entry, scan the names explicitly or define an appropriate equals rule. An absent value returns −1.')
      ], { pages: '27–29, 33–35', code: `for (Iterator<String> it = names.iterator(); it.hasNext(); ) {
    String name = it.next();
    if (name.isBlank()) {
        it.remove();
    }
}` })
    ],
    refs: [['ArrayList', java('java/util/ArrayList')], ['Iterator', java('java/util/Iterator')]],
    questions: [
      mc(b('你打算存 Java 的整数 3 和 9。哪一条声明保留了编译期的元素类型检查？', 'You want to store Java integers 3 and 9. Which declaration preserves compile-time element type checks?'), ['ArrayList<int> a = new ArrayList<>();', 'ArrayList a = new ArrayList();', 'ArrayList<Integer> a = new ArrayList<>();'], 2, b('泛型需要引用类型。', 'Generics need a reference type.'), b('Integer 是 int 的包装类。a.add(3) 会把 3 自动装箱。', 'Integer is the wrapper for int. a.add(3) autoboxes 3.')),
      enter(b('列表当前是 [7, 11, 20]，内部容量为 8。size() 返回多少？', 'The list is [7, 11, 20] with capacity 8. What does size() return?'), '3', b('数实际放入列表的项。', 'Count the actual list elements.'), b('三个位置装有元素，列表大小是 3，内部还有五个备用槽。', 'There are three list elements and five spare slots. The size is 3.')),
      enter(b('对 [4, 5, 6, 7] 执行 add(1, 9)，写出新列表。', 'Apply add(1, 9) to [4, 5, 6, 7]. Enter the new list.'), '4 9 5 6 7', b('下标 1 目前放着 5，插入会把后缀右移。', 'Index 1 holds 5. Insertion shifts the suffix to the right.'), b('从 0 数，第 1 号槽放 9。5、6、7 依次向右移到下标 2、3、4。', 'Slot 1 becomes 9. The values 5, 6, and 7 move to indices 2, 3, and 4.'), '4, …'),
      mc(b('逐次在空 ArrayList 尾部加 n 项，单次追加的摊还成本是多少？', 'When appending n items one at a time to an empty ArrayList, what is the amortized cost per append?'), ['O(n)', 'O(1)', 'O(log n)'], 1, b('总复制量是几何级数，把它分摊给 n 次操作。', 'Total copying forms a geometric sum. Spread it across n calls.'), b('有空位时常数成本，偶尔的扩容总共复制 O(n) 项。总成本 O(n)，每次摊还 O(1)。', 'An append with spare room is constant-time. Resizes copy O(n) items in total, so n calls cost O(n) and each costs O(1) amortized.')),
      mc(b('List<Integer> [1, 9, 4] 调用 remove(1) 后变成什么？', 'What is List<Integer> [1, 9, 4] after remove(1)?'), ['[9, 4]', '[1, 9]', '[1, 4]'], 2, b('参数 1 是 int 字面量。Java 会选择哪个重载？', 'The argument 1 is an int literal. Which overload is selected?'), b('remove(int) 删除下标 1 处的 9。remove(Integer.valueOf(1)) 才会按值删除 1。', 'remove(int) deletes the 9 at index 1. remove(Integer.valueOf(1)) would remove the value 1.')),
      order(b('底层容量已满，现在在中间插入。按本实验的实现排序。', 'The backing array is full. Order the steps for a middle insertion in this lab.'), [b('写入新元素并更新 size', 'Write the new item and update size'), b('申请更大的数组', 'Allocate a larger array'), b('把新数组里的插入点及之后元素右移', 'Shift the suffix right in the new array'), b('复制旧元素到新数组', 'Copy the old items to the new array')], [1, 3, 2, 0], b('先准备存储空间，最后把新元素放进腾出的洞。', 'Prepare storage first. Place the new item in the opened gap at the end.'), b('先扩容并复制存量，再从后往前挪动，避免覆盖尚未读出的值，最后填入并更新 size。', 'Allocate and copy, then shift from right to left so unread values survive. Finally fill the gap and update size.'))
    ]
  };
  lessons[11] = {
    title: b('链表', 'Linked lists'),
    icon: 'link', art: '↔',
    intro: b('一组车厢可以靠挂钩连在一起。链表靠引用把分散的节点串成一条路线。', 'Train cars connect with couplers. A linked list uses references to connect separate nodes into one route.'),
    takeaway: b('改连线通常很快。沿连线找到要改的位置，可能才是最花时间的一步。', 'Reconnecting links is usually quick. Following links to reach the right position can be the expensive part.'),
    lab: b('切换单链、双链和循环链表。逐步看到查找、插入和删除会访问哪些节点、修改哪些引用。', 'Switch among singly, doubly, and circular lists. Trace which nodes search, insertion, and removal visit and which references they change.'),
    chapters: [
      s(b('引用是怎么连起来的', 'How references connect nodes'), [
        b('Java 的引用变量指向一个对象，null 表示当前没有对象。两个变量可以引用同一个对象。a == b 可以比较引用身份，比如两个单独 new 的 ArrayList 即使内容一样，== 也为 false。若 List 的元素按顺序相等，a.equals(b) 则为 true。', 'A Java reference refers to an object, and null denotes no object. Two variables can refer to the same object. a == b checks identity for references. Two separately created ArrayLists with matching contents give false with == and true with List.equals.'),
        b('单链的节点包含 data 和 next。head 指向第一项，tail（若维护）指向最后一项，末节点的 next 是 null。空链表的 head 和 tail 都是 null，size = 0。逻辑先后由引用连接决定，节点可分散在内存各处。', 'A singly linked node stores data and next. head refers to the first item. tail, when maintained, refers to the last. The last node’s next is null. An empty list has null head and tail and size 0. Links determine the logical order even when nodes are scattered in memory.')
      ], { pages: '3–16, 44–46', code: `class Node<E> {
    E data;
    Node<E> next;

    Node(E data) {
        this.data = data;
    }
}` }),
      s(b('单链表插入', 'Insert into a singly linked list'), [
        b('头插时先让 newNode.next = head，再让 head = newNode。若原列表为空，还要让 tail 指向新节点。为了把 X 插在 B 后面，先令 X.next = B.next 保存余下的链，再令 B.next = X。先覆盖 B.next 会丢失原后继，除非先用变量记住它。', 'For a front insertion, set newNode.next = head and then head = newNode. If the list was empty, set tail too. To insert X after B, set X.next = B.next to preserve the suffix, then set B.next = X. Overwriting B.next first loses its old successor unless it was saved.'),
        b('尾插首先确认空链情况，再用 tail.next = newNode 和 tail = newNode。维护 tail 时尾插 O(1)，只有 head 时要遍历到末尾，最坏 O(n)。按下标 i 插入得先找 i−1 处的前驱，改两个 next 本身是 O(1)。每次成功插入 size 加 1。', 'To append, handle an empty list first, then set tail.next = newNode and tail = newNode. A maintained tail gives O(1) append. With only head, reaching the end takes O(n). Inserting at index i first locates predecessor i−1, then rewires two references in O(1). Increment size after success.')
      ], { pages: '17–27' }),
      s(b('单链表删除与查找', 'Remove and find in a singly linked list'), [
        b('头删保存待返回的 data，把 head 移到 head.next。最后一个元素离开时，head 与 tail 都要置空。中间删除让前驱的 next 跳过该节点，接到原来的后继。被绕开的节点不可达后才可由 Java 垃圾回收器回收。', 'To remove the head, save its data and move head to head.next. If it was the last element, clear both head and tail. For a middle removal, point the predecessor at the removed node’s successor. Java can collect the detached node once it becomes unreachable.'),
        b('单链即使有 tail，尾删也通常要从 head 出发找倒数第二个节点，把它的 next 置为 null 并更新 tail，最坏 O(n)。找值可从 head 用 next 逐个比较，遇到第一个相等项返回它的下标，走过整个链仍找不到则返回 −1。', 'Even with tail, singly linked tail removal typically walks from head to find the penultimate node, clears its next, and updates tail, costing O(n). To find a value, compare from head through next, return the first match’s index, or return −1 after scanning the list.')
      ], { pages: '28–33', code: `int index = 0;
for (Node<E> p = head; p != null; p = p.next, index++) {
    if (Objects.equals(p.data, target)) return index;
}
return -1;` }),
      s(b('双向和循环结构', 'Doubly linked and circular lists'), [
        b('双链节点多一个 prev。把 X 插在 P 与 Q 之间，要连接 X.prev = P、X.next = Q、P.next = X、Q.prev = X。遇到空的邻居时更新 head 或 tail。删除则让左右邻居互相接上。拿到节点引用以后双链两端增删都是 O(1)，代价是每个节点多存一个引用。', 'A doubly linked node also has prev. To insert X between P and Q, set X.prev = P, X.next = Q, P.next = X, and Q.prev = X. An absent neighbor means updating head or tail. Deletion links the neighbors to each other. Doubly linked end operations are O(1) once the relevant node is known, at the cost of an extra reference per node.'),
        b('循环单链让 tail.next 指回 head。走完一圈回到起点，遍历时可数 size 步，或检测是否回到 head。只有一个节点时，它的 next 指向自己。可用这个思路表示循环播放列表或轮流调度。', 'A circular singly linked list points tail.next back to head. Traversal can count size steps or stop upon returning to head. A one-node list points to itself. This models a looping playlist or round-robin scheduling.')
      ], { pages: '34–43' }),
      s(b('ArrayList 与 LinkedList 怎么选', 'Choosing ArrayList or LinkedList'), [
        b('Java 的 LinkedList<E> 是双链，实现 List 和 Deque。它可以从较近的一端走向指定下标，最坏仍是 O(n)。addFirst、addLast、removeFirst、removeLast 都可直接处理端点。频繁按下标读取更适合 ArrayList。频繁端点操作常用 ArrayDeque，可在第 13 讲比较。', 'Java LinkedList<E> is doubly linked and implements List and Deque. Indexed access starts from the closer end and still costs O(n) in the worst case. addFirst, addLast, removeFirst, and removeLast operate directly at the ends. ArrayList suits frequent indexed access. ArrayDeque is common for frequent end operations, as covered in Lecture 13.')
      ], { pages: '39–42, 47–48', table: {
        headers: [b('操作', 'Operation'), 'ArrayList', b('带尾引用的单链', 'Singly linked with tail'), b('双链', 'Doubly linked')],
        rows: [
          [b('任意下标取值', 'Read by index'), 'O(1)', 'O(n)', 'O(n)'],
          [b('尾部追加', 'Append'), b('摊还 O(1)', 'O(1) amortized'), 'O(1)', 'O(1)'],
          [b('删尾', 'Remove last'), 'O(1)', 'O(n)', 'O(1)'],
          [b('在已知中间节点后插入', 'Insert after known middle node'), 'O(n)', 'O(1)', 'O(1)'],
          [b('按下标增删（最坏）', 'Indexed insertion/removal (worst)'), 'O(n)', 'O(n)', 'O(n)']
        ]
      } })
    ],
    refs: [['LinkedList', java('java/util/LinkedList')]],
    questions: [
      mc(b('普通单链表里，尾节点的 next 是什么？', 'What is next on the last node of a regular singly linked list?'), ['head', 'null', 'tail'], 1, b('从尾节点再走一次会到哪里？', 'Where can you go after the tail?'), b('没有后继，所以 next 为 null。循环单链才会让它指回 head。', 'The tail has no successor, so next is null. A circular list points back to head.')),
      mc(b('两个单独 new 的 ArrayList 都只有整数 12。a == b 和 a.equals(b) 依次是什么？', 'Two separately created ArrayLists each contain the integer 12. What are a == b and a.equals(b), respectively?'), ['true, true', 'false, false', 'false, true'], 2, b('先看它们是不是同一个对象，再看元素序列。', 'Check identity first, then the element sequences.'), b('== 比较引用身份，equals 按顺序比较列表内容。', '== tests reference identity. equals compares the ordered contents.')),
      order(b('单链 A → B → C 中，把 X 插在 B 后面。按顺序选操作。', 'Insert X after B in A → B → C. Select the operations in order.'), ['B.next = X', 'X.next = B.next', 'size++'], [1, 0, 2], b('先把 B 原来的后继保存到 X 里。', 'First save B’s original successor in X.'), b('先让 X 连上 C，再让 B 连上 X，最后更新大小。', 'Set X to point to C, then B to point to X, and finally update size.')),
      mc(b('单链表已有 tail。为什么删尾仍可能要 O(n)？', 'A singly linked list already has tail. Why can deleting the tail still take O(n)?'), [b('需要从 head 找尾巴的前驱', 'You must find the tail’s predecessor from head'), b('需要把所有值复制到新数组', 'All values must be copied to a new array'), b('Java 会立刻回收所有节点', 'Java immediately collects every node')], 0, b('新的 tail 是谁？从旧的 tail 能直接到它吗？', 'Which node becomes the new tail? Can the old tail reach it directly?'), b('前驱成为新 tail，单链只能往后走，所以要沿 next 找到它。', 'The predecessor becomes the new tail. A singly linked node only points forward, so you must find it by following next.')),
      enter(b('从循环单链的 head 开始，size 为 4。沿 next 走几步首次回到 head？', 'Starting at head in a circular singly linked list of size 4, how many next steps first return you to head?'), '4', b('画四个节点，令最后一个指向第一个。', 'Draw four nodes and make the last point to the first.'), b('三步到达尾节点，第四步沿尾节点的 next 回到 head。', 'Three steps reach the tail. The fourth follows tail.next back to head.')),
      mc(b('删除双链中间节点 X，令 P = X.prev，Q = X.next。哪组改动能维持两个方向的链接？', 'Delete interior node X from a doubly linked list. P = X.prev and Q = X.next. Which writes preserve both directions?'), ['P.next = Q; Q.prev = P', 'P.prev = Q; Q.next = P', 'P.next = Q; Q.prev = X'], 0, b('要让 P 往后到 Q，也能让 Q 往前回到 P。', 'Forward from P should reach Q and backward from Q should reach P.'), b('P.next 跳过 X，Q.prev 也跳过 X，两个方向都闭合。', 'P.next skips X, and Q.prev skips X in the other direction.'))
    ]
  };

  lessons[12] = {
    title: b('栈', 'Stacks'),
    icon: 'stack', art: '▤',
    intro: b('洗干净的盘子一层层叠上去。下一次取盘子，总是先取最上面那一个。', 'Clean plates pile up one on top of another. The next plate you take is always the one at the top.'),
    takeaway: b('栈顶是唯一操作端。最后入栈的元素最先出栈（LIFO）。', 'The top is the only operating end. The last item pushed is the first one popped (LIFO).'),
    lab: b('动手压栈、弹栈、看栈顶，再把字符一个个送入括号匹配器。', 'Push, pop, and peek, then feed characters through a bracket matcher one at a time.'),
    chapters: [
      s(b('栈顶与操作结果', 'The top and operation results'), [
        b('push(x) 把 x 加到顶端，pop() 移除并返回顶端的值，peek() 只看顶端，size() 数元素，isEmpty() 判断是否为空。若依次 push(10)、push(20)、push(30)，从底到顶是 10、20、30。peek 得到 30，随后 pop 也得到 30，此时新栈顶才变成 20。', 'push(x) adds x on top, pop() removes and returns the top, peek() reads it, size() counts elements, and isEmpty() checks for emptiness. After pushing 10, 20, and 30, bottom to top is 10, 20, 30. peek reads 30. A subsequent pop also returns 30 and reveals 20 as the top.'),
        b('在空栈弹出称为下溢。Java 的 Stack.pop() 和 Stack.peek() 会抛 EmptyStackException，Deque.pop() 在空时抛 NoSuchElementException，Deque.peek() 在空时返回 null。选择操作时要知道它的返回契约。', 'Popping from an empty stack is underflow. Java Stack.pop() and Stack.peek() throw EmptyStackException on empty. Deque.pop() throws NoSuchElementException, while Deque.peek() returns null. Check the contract of the operation you use.')
      ], { pages: '4–14' }),
      s(b('用数组或链表实现', 'Use an array or a linked list'), [
        b('数组栈可以用 size 指向下一个空槽。push 写入 a[size] 后递增，pop 先递减 size 再读取并清空 a[size]。有空槽时 O(1)，几何扩容下 push 摊还 O(1)，固定容量满时可显式报溢出。栈占 O(n) 存储。', 'An array stack can let size name the next free slot. push writes a[size] then increments. pop decrements first, reads a[size], and clears that slot. With spare capacity pushes cost O(1), and geometric resizing gives O(1) amortized push. A full fixed stack can report overflow. Storage is O(n).'),
        b('链表栈用 head 作栈顶，头插和头删都为 O(1)，自然支持任意剩余内存允许的大小。Java 课件展示 Stack 类，它继承 Vector。实际用 Java 的栈接口写法还可以用 Deque<E> s = new ArrayDeque<>() 并调用 push、pop、peek。', 'A linked stack uses head as the top. Front insertion and removal are both O(1), and the list can grow as memory allows. The lecture uses Java’s Stack class, which extends Vector. A Java stack can also be written as Deque<E> s = new ArrayDeque<>() with push, pop, and peek.')
      ], { pages: '11–14, 17–19' }),
      s(b('循环边删边读 size 的陷阱', 'The shrinking size trap'), [
        b('若栈里是 0、1、2、3、4（4 在顶），for (int i=0; i<s.size(); i++) 每轮 pop 一次，输出 4、3、2 后停止。此时 i = 3 而 size = 2，动态边界提前终止。想清空可先保存初始 size，或用下面的 while。', 'For a stack containing 0, 1, 2, 3, 4 with 4 on top, popping in for (int i=0; i<s.size(); i++) prints 4, 3, 2 and stops. i has reached 3 while size has shrunk to 2. To empty it, capture the original size or use this while loop.')
      ], { pages: '15–16', code: `Deque<Integer> stack = new ArrayDeque<>();
for (int i = 0; i < 5; i++) stack.push(i);

while (!stack.isEmpty()) {
    System.out.println(stack.pop());
}` }),
      s(b('用栈匹配括号', 'Match brackets with a stack'), [
        b('从左到右读字符。读到左括号就压栈，读到右括号就检查栈顶有没有对应类型并弹出。遇到空栈或类型不符立刻失败。读完整段后必须为空栈，否则仍有左括号没有闭合。', 'Read left to right. Push opening brackets. For a closing bracket, check the type at the top and pop a matching opening bracket. Fail immediately for underflow or a type mismatch. At the end the stack must be empty, or an opening bracket remains unmatched.'),
        b('例如 {[()]} 恰好反向闭合。([)] 即使每种括号数量相等也失败，因为第一个 ) 要匹配的栈顶是 [。扫描 n 个字符花 O(n) 时间，左括号全部尚未闭合时需要 O(n) 辅助空间。这个练习逐字符匹配，实际语言解析还会区分引号、注释等。', 'For example, {[()]} closes in reverse opening order. ([)] fails even with equal counts of each type, because the first ) finds [ on top. Scanning n characters takes O(n) time and O(n) auxiliary space if all opening brackets are pending. This lab matches individual characters. A language parser also accounts for quoted strings and comments.')
      ], { pages: '20' }),
      s(b('哪里还会用到栈', 'Where stacks show up'), [
        b('撤销时先取最近的编辑。浏览器前进和后退可用两份历史栈理解。函数调用也会把调用帧叠在调用栈上，其中记录参数、局部变量和返回位置。函数返回时移除自己的帧，恢复上一层。递归太深会耗尽调用栈，出现 StackOverflowError。', 'Undo starts with the most recent edit. Browser back and forward can be modeled with two history stacks. A function call pushes a frame holding arguments, locals, and the return point. Returning removes the frame and resumes its caller. Deep recursion can exhaust the call stack and cause StackOverflowError.')
      ], { pages: '2–5' })
    ],
    refs: [['Stack', java('java/util/Stack')], ['Deque', java('java/util/Deque')]],
    questions: [
      enter(b('栈为空，依次 push(4)、push(7)、push(9)。第一次 pop 返回什么？', 'An empty stack receives push(4), push(7), push(9). What does the first pop return?'), '9', b('谁最后被放上去？', 'Which item was placed last?'), b('9 在顶端，按照 LIFO 最先离开。', '9 is on top, so it leaves first under LIFO.')),
      mc(b('执行 peek() 后，非空栈的 size 怎么变？', 'How does peek() change the size of a nonempty stack?'), [b('减 1', 'Decreases by 1'), b('保持原值', 'Stays the same'), b('变成 0', 'Becomes 0')], 1, b('想想 peek 这个词的意思。', 'Think of taking a quick look.'), b('peek 读取顶端，栈内容保持原样。', 'peek reads the top and leaves the contents as they are.')),
      mc(b('下列字符串哪一个括号嵌套正确？', 'Which string has correctly nested brackets?'), ['([)]', '{[()]}', '(()'], 1, b('每个右括号必须匹配最后打开且未关闭的括号。', 'Each closing bracket must match the last unmatched opening bracket.'), b('{[()]} 的栈顶依次与 )、]、} 匹配，最终栈为空。', 'In {[()]}, the top matches ), then ], then }, leaving an empty stack.')),
      enter(b('栈底到栈顶为 0 1 2 3 4。循环 for (int i=0; i<s.size(); i++) 每轮打印并弹出顶端。输出什么？', 'Bottom to top is 0 1 2 3 4. A loop for (int i=0; i<s.size(); i++) prints and pops the top each time. What is printed?'), '4 3 2', b('同时记录 i 上升、size 下降。', 'Track i rising and size shrinking.'), b('三轮后 i = 3，size = 2，条件失败。输出 4 3 2。', 'After three iterations i = 3 and size = 2. The condition fails after printing 4 3 2.'), '4, …'),
      mc(b('对括号串 (([ 截止文件末尾，扫描结果是什么？', 'The scan reaches the end of (([. What is the result?'), [b('合法，扫描途中没有右括号', 'Valid because no closing bracket appeared'), b('非法，栈还保留三个左括号', 'Invalid because three opening brackets remain'), b('非法，扫描时立即下溢', 'Invalid because the stack underflowed during scanning')], 1, b('在最后还应检查什么？', 'What needs to be checked at the end?'), b('三个开括号都在栈里。完成时栈应当为空。', 'All three opening brackets remain. A successful scan must finish with an empty stack.')),
      mc(b('你要实现撤销最近的一次编辑，后续还能继续撤销。哪种安排符合这个需求？', 'You need to undo the latest edit and then undo earlier edits in turn. Which arrangement fits?'), [b('每次把新编辑加入栈顶，撤销时弹出栈顶', 'Push each edit on top, then pop for undo'), b('把新编辑加入队尾，撤销时从队头取', 'Enqueue edits, then dequeue from the front for undo'), b('按编辑文本字母序取最小的一项', 'Take the edit with the alphabetically smallest text')], 0, b('倒序重放已经发生的操作。', 'Reverse the history of operations.'), b('LIFO 正好产生从最近到最早的撤销顺序。', 'LIFO produces the undo order from most to least recent.'))
    ]
  };

  lessons[13] = {
    title: b('队列与双端队列', 'Queues & deques'),
    icon: 'queue', art: '⇥',
    intro: b('在窗口排队时，新来的人到尾部，最早到的人在前端先办事。', 'At a service counter, arrivals join at the back and the person who arrived earliest is served at the front.'),
    takeaway: b('FIFO 队列尾加头删。循环数组让空槽循环复用，双端队列把两端都开放。', 'A FIFO queue adds at the rear and removes at the front. A circular array reuses slots, and a deque opens both ends.'),
    lab: b('用 5 个槽位做环形队列。让下标跨过最后一格，再试试双端操作。', 'Run a circular queue in five slots. Watch an index wrap past the last slot and then try both ends.'),
    chapters: [
      s(b('入队、出队、看队首', 'Enqueue, dequeue, and peek'), [
        b('FIFO 是 First In, First Out（先进先出）。enqueue(x) 在 rear 加入元素，dequeue() 从 front 删除并返回最早加入且尚未离开的元素，peek() 读队首。依次加入 3、6、9，出队返回 3、6、9。栈会按 9、6、3 返回。', 'FIFO means first in, first out. enqueue(x) joins the rear, dequeue() removes and returns the oldest remaining item from the front, and peek() reads the front. Enqueue 3, 6, 9 and they leave as 3, 6, 9. A stack returns them as 9, 6, 3.'),
        b('用途包括等待处理的消息、打印作业、BFS，以及轮转调度。轮转时，队首任务运行一个时间片，若没完成，再放回队尾，让后面的任务有机会执行。', 'Applications include pending messages, print jobs, BFS, and round-robin scheduling. In a round-robin queue, the front task gets a time slice, then returns to the back if unfinished so other tasks get a turn.')
      ], { pages: '2–11' }),
      s(b('Java Queue 的两套操作', 'Two Java Queue method families'), [
        b('Queue<E> 是接口。用 Queue<Integer> q = new ArrayDeque<>() 建立一个 FIFO 队列。实现可以说明自己的顺序，例如 PriorityQueue 的队首按优先级决定，会在第 16 讲讲到。', 'Queue<E> is an interface. Queue<Integer> q = new ArrayDeque<>() gives a FIFO queue. An implementation specifies its ordering, such as the priority-based head of PriorityQueue in Lecture 16.')
      ], { pages: '12, 18–19', table: {
        headers: [b('用途', 'Purpose'), b('失败时抛异常', 'Throws on failure'), b('失败时返回特殊值', 'Returns a sentinel on failure')],
        rows: [
          [b('入队', 'Insert'), b('add(e)，容量不足时抛异常', 'add(e), throws when capacity is exhausted'), b('offer(e)，容量不足时返回 false', 'offer(e), returns false when capacity is exhausted')],
          [b('出队', 'Remove'), b('remove()，空时抛异常', 'remove(), throws when empty'), b('poll()，空时返回 null', 'poll(), returns null when empty')],
          [b('查看队首', 'Examine head'), b('element()，空时抛异常', 'element(), throws when empty'), b('peek()，空时返回 null', 'peek(), returns null when empty')]
        ]
      }, code: `Queue<Integer> q = new ArrayDeque<>();
q.offer(3);
q.offer(6);
System.out.println(q.peek()); // 3
System.out.println(q.poll()); // 3
System.out.println(q.poll()); // 6
System.out.println(q.poll()); // null` }),
      s(b('循环数组为何不用搬元素', 'Why a circular array avoids shifting'), [
        b('固定容量 C 的数组记住 front 和 size。本实验用 rear = (front + size) % C 表示“下次写的槽”。入队写 rear 再 size++，出队读并清空 front 再令 front = (front + 1) % C，最后 size--。余数把超过末端的下标卷回 0。', 'A fixed array of capacity C tracks front and size. In this lab, rear = (front + size) % C names the next write slot. Enqueue writes rear and increments size. Dequeue reads and clears front, sets front = (front + 1) % C, and decrements size. The modulus wraps the index to zero after the last slot.'),
        b('例如 C = 5，front = 3，size = 3。物理下标为 3、4、0 的槽按顺序组成队列，rear = 1。因为满和空时 rear 都会等于 front，用 size == C 判断满，用 size == 0 判断空。还有一种实现留一个空槽区分二者，有效容量会少 1。', 'For C = 5, front = 3, and size = 3, the queue occupies slots 3, 4, 0 in that order, with rear = 1. Both full and empty can give rear == front, so use size == C for full and size == 0 for empty. Another design reserves one unused slot to distinguish them and sacrifices one slot of usable capacity.'),
        b('这种环形结构的入队、出队、peek 都是 O(1)。动态数组环几何扩容时，把旧队列按逻辑顺序复制到新数组，端点插入为摊还 O(1)。也可以用维护 head 和 tail 的链表，尾入头出都是 O(1)。', 'Enqueue, dequeue, and peek in a fixed ring cost O(1). An expanding ring copies in logical order and uses geometric growth, giving amortized O(1) insertion at its ends. A linked queue with head and tail also enqueues at the back and dequeues at the front in O(1).')
      ], { pages: '8–11, 20' }),
      s(b('双端队列 Deque', 'The double-ended queue'), [
        b('Deque（读作 deck）扩展 Queue，允许两端插入和两端删除。offerFirst / offerLast 插入，pollFirst / pollLast 删除，peekFirst / peekLast 查看。尾入头出是 FIFO，头入头出可作 LIFO 栈。', 'Deque (pronounced “deck”) extends Queue and permits insertion and removal at both ends. offerFirst/offerLast insert, pollFirst/pollLast remove, and peekFirst/peekLast inspect. Add at the rear and remove at the front for FIFO. Add and remove at the front for a LIFO stack.'),
        b('ArrayDeque 是可扩容的 Deque 实现，禁止存 null，避免把数据与空队列返回值混淆。固定五槽是实验设定，真实 ArrayDeque 会按需增长。', 'ArrayDeque is a resizable Deque implementation that prohibits null, so null is unambiguous as an empty return. The lab uses a fixed five-slot ring. ArrayDeque grows as needed.')
      ], { pages: '13–17' })
    ],
    refs: [['Queue', java('java/util/Queue')], ['Deque', java('java/util/Deque')], ['ArrayDeque', java('java/util/ArrayDeque')]],
    questions: [
      enter(b('空队列依次 offer(3)、offer(6)、offer(9)。第一次 poll 得到什么？', 'An empty queue receives offer(3), offer(6), offer(9). What does the first poll return?'), '3', b('队首是哪一个最早进入的值？', 'Which value entered first and is at the front?'), b('3 最早进入，位于队首，所以先出队。', '3 entered earliest and is at the front, so it leaves first.')),
      mc(b('对空的 ArrayDeque 调用 Queue 接口的 poll()，结果是什么？', 'What does Queue.poll() return on an empty ArrayDeque?'), ['0', 'null', 'NoSuchElementException'], 1, b('对照 poll 和 remove 的契约。', 'Compare the contracts of poll and remove.'), b('poll 返回 null。无参数的 remove 在队列空时抛异常。', 'poll returns null. The no-argument remove throws when empty.')),
      enter(b('容量为 5，front = 4、size = 2。下一次入队写哪个下标？', 'Capacity is 5, front = 4, and size = 2. Which index does the next enqueue write to?'), '1', b('用 (front + size) % 5。', 'Use (front + size) % 5.'), b('元素按顺序占 4 和 0，下一写入下标 (4+2)%5 = 1。', 'Slots 4 and 0 are occupied in that order. The next write is (4+2)%5 = 1.')),
      mc(b('本实验的循环队列发现 rear == front。用什么信息确认是否已满？', 'In the lab’s circular queue, rear == front. How can you tell if the queue is full?'), [b('检查 size == capacity', 'Check size == capacity'), b('只检查 rear == 0', 'Only check rear == 0'), b('front 与 rear 相等就一定满', 'Equal indices always mean full')], 0, b('画出完全装满和完全空的两个环。', 'Draw a completely full ring and a completely empty one.'), b('相等也可能是空环。独立的 size 给出确切的占用。', 'Equal indices can also occur on an empty ring. size tells you the occupancy.')),
      enter(b('从空 deque 开始，依次 offerLast(4)、offerFirst(2)、offerLast(8)、pollLast()、pollFirst()。两次 poll 依次返回什么？', 'Start with an empty deque. Run offerLast(4), offerFirst(2), offerLast(8), pollLast(), pollFirst(). What do the two polls return in order?'), '8 2', b('先写出三次插入后的左右顺序。', 'Write the left-to-right order after the three insertions.'), b('顺序是 [2, 4, 8]。先从右端取 8，再从左端取 2。', 'The order is [2, 4, 8]. Remove 8 from the right and 2 from the left.'), '8, …'),
      mc(b('队列 [A, B, C] 正在轮转调度。A 在一个时间片后尚未完成，被移回队尾。随后队首是谁？', 'A round-robin scheduler starts with [A, B, C]. A is unfinished after one time slice and rejoins the rear. Who is at the front now?'), ['A', 'B', 'C'], 1, b('先移除原队首，再附到队尾。', 'Remove the old head and append it to the rear.'), b('新顺序是 [B, C, A]，接下来给 B 时间片。', 'The new order is [B, C, A]. B gets the next time slice.'))
    ]
  };
})();
