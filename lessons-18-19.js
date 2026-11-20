'use strict';

(() => {
  const { bi: b, section: s, mc, enter, order, java, lessons } = CS201;

  lessons[18] = {
    title: b('映射 Map', 'Maps'),
    icon: 'map', art: '⇢',
    intro: b('查词典靠单词，查档案靠学号。Map 把这样的识别信息与需要取回的数据配成一对。', 'A dictionary uses a word and a record system uses an ID. A map pairs that identifier with the data you want back.'),
    takeaway: b('每个键最多对应一个值。用同一个键再次 put 会更新该项，并返回旧值。', 'Each key maps to at most one value. Putting the same key updates the mapping and returns its old value.'),
    lab: b('输入键和值，运行 put、get、remove 和 containsKey。切换显示方式，观察按键排序的效果。', 'Enter a key and value, then run put, get, remove, and containsKey. Switch the display to see ordering by key.'),
    chapters: [
      s(b('键和值各指什么', 'What keys and values mean'), [
        b('Map 也叫字典或关联容器。每条记录是 (key, value) 这一对，键用于定位，值是要取回的信息。键可为字符串、数字或合适的自定义对象。重复值很常见，例如两个学号可以同名。每个键只对应一条映射。', 'A map is also called a dictionary or associative container. Each pair is (key, value). The key locates the entry and the value is the payload. Keys can be strings, numbers, or suitable custom objects. Values may repeat, as when two student IDs have the same name. A key has at most one mapping.'),
        b('键值对内部有先后，整张映射的迭代顺序由具体实现决定。Java 的 Map<K,V> 是接口，两个类型参数分别约束键和值。', 'Within a pair the key and value occupy distinct positions. Iteration order across pairs depends on the implementation. Java Map<K,V> is an interface whose two type parameters constrain keys and values.')
      ], { pages: '2–6' }),
      s(b('四个方法及返回值', 'Four methods and their return values'), [
        b('返回值和修改后的容器要分开记录。比如 put(2, "C") 首次加键返回 null，put(2, "E") 返回旧的 "C"，此后 get(2) 返回 "E"。', 'Record the return value separately from the resulting map. A first put(2, "C") returns null. put(2, "E") returns the old mapping "C", and get(2) now returns "E".')
      ], { pages: '7–8', table: {
        headers: [b('方法', 'Method'), b('对容器做什么', 'Effect'), b('返回', 'Returns')],
        rows: [
          ['put(k, v)', b('添加 k 或替换原值', 'Add k or replace its value'), b('旧值，缺席时 null', 'Old value, or null when absent')],
          ['get(k)', b('查看 k 的值', 'Inspect the value at k'), b('当前值，缺席时 null', 'Current value, or null when absent')],
          ['remove(k)', b('有 k 就移除其映射', 'Remove k’s mapping if present'), b('旧值，缺席时 null', 'Old value, or null when absent')],
          ['containsKey(k)', b('检查键是否存在', 'Check key presence'), 'true / false']
        ]
      }, after: b('课件第 8 页插入 (2, C) 后没有更新键 2，因此 get(2) 和 remove(2) 都返回 C。要返回 E，须先执行 put(2, E)。', 'Slide 8 inserts (2, C) without updating key 2, so both get(2) and remove(2) return C. To return E, first execute put(2, E).') }),
      s(b('空值、缺席与便利操作', 'Null values, absent keys, and helper operations'), [
        b('HashMap 允许 null 键和 null 值，所以 get(k) 的 null 可能表示缺席，也可能表示该键存的就是 null。containsKey 可以区分。自然排序的 TreeMap 不接受 null 键，自定义 Comparator 可以定义是否接受。', 'HashMap permits a null key and null values. A null result from get(k) can mean absent or mapped to null. containsKey distinguishes them. A naturally ordered TreeMap rejects null keys, while a custom comparator determines whether null keys can be compared.'),
        b('词频计数可以用 count.put(word, count.getOrDefault(word, 0) + 1)。它先读该词旧计数，缺席取 0，再写回 +1。遍历键用 keySet，遍历键值对用 entrySet。', 'For word counts, use count.put(word, count.getOrDefault(word, 0) + 1). This reads the old count, uses zero if the key is absent, and writes back one more. Use keySet for keys and entrySet for key–value pairs.')
      ], { pages: '5–9', code: `Map<String, Integer> counts = new HashMap<>();
for (String word : List.of("tea", "milk", "tea")) {
    counts.put(word, counts.getOrDefault(word, 0) + 1);
}
for (Map.Entry<String, Integer> item : counts.entrySet()) {
    System.out.println(item.getKey() + " " + item.getValue());
}` }),
      s(b('HashMap 与 TreeMap 的取舍', 'Choosing HashMap or TreeMap'), [
        b('HashMap 用哈希表。在散列分布良好且查键成本视为常数时，get 的期望时间 O(1)，put 的期望摊还时间 O(1)，迭代顺序无保证。相等键靠 equals 判定，hashCode 帮忙缩小查找范围。详细过程在第 19 讲。', 'HashMap uses a hash table. With well-distributed hashes and constant-cost key operations, get is expected O(1) and put expected amortized O(1). Iteration order is unspecified. equals identifies equal keys, while hashCode helps narrow the search. Lecture 19 covers the details.'),
        b('TreeMap 用红黑树，get、put、remove 对 n 条映射保证 O(log n)（把键比较视为常数）。迭代按键的自然顺序或给出的 Comparator 排序，并支持找相邻键和取范围。比较器返回 0 的两个键会被当作同一个键，通常应让它与 equals 一致。', 'TreeMap uses a red-black tree, giving O(log n) get, put, and remove for n mappings when each key comparison is constant-time. It iterates in key order according to natural ordering or a Comparator and supports neighboring keys and ranges. Two keys that compare as zero are treated as the same key, so the comparator should generally be consistent with equals.')
      ], { pages: '9–11' })
    ],
    refs: [['Map', java('java/util/Map')], ['HashMap', java('java/util/HashMap')], ['TreeMap', java('java/util/TreeMap')]],
    questions: [
      mc(b('用学号查询学生姓名，Map 中学号是什么？', 'You retrieve a student’s name by student ID. What is the ID in the map?'), [b('值', 'Value'), b('键', 'Key'), b('数组容量', 'Array capacity')], 1, b('定位到一条记录用的是哪个信息？', 'Which piece of information locates the record?'), b('学号用于定位，所以是键。姓名是与它关联的值。', 'The ID locates the entry, so it is the key. The name is its associated value.')),
      enter(b('空 Map 执行 put(2, "C")，随后 get(2)。get 返回哪个字母？', 'Run put(2, "C") on an empty map, then get(2). Which letter is returned?'), 'C', b('跟踪键 2 当前绑定的值。', 'Track the value currently bound to key 2.'), b('键 2 只写入过一次，值是 C。', 'Key 2 has been written once and holds C.')),
      enter(b('执行 put(2, "C")，再执行 put(2, "E")。第二次 put 返回哪个字母？', 'After put(2, "C"), call put(2, "E"). Which letter does the second put return?'), 'C', b('put 返回发生覆盖之前的值。', 'put returns the value from before the update.'), b('第二次 put 返回旧值 C 并写入 E。若随后 get(2)，才会读到 E。', 'The second put returns old value C and stores E. The following get(2) would return E.')),
      mc(b('HashMap 的 get("x") 返回 null。怎样查明 "x" 是否存在？', 'HashMap.get("x") returns null. How do you determine whether "x" is present?'), ['containsKey("x")', 'containsValue("x")', 'size() == 0'], 0, b('值允许是真正的 null，需单独检查键。', 'The actual value may be null. Check the key separately.'), b('containsKey 单独检查映射身份，存在但映射到 null 时也返回 true。', 'containsKey tests key presence and returns true even for a mapping to null.')),
      mc(b('需要持续插入记录，并依键的升序遍历或获取一段键范围。选哪个实现？', 'You need to keep inserting records, iterate in ascending key order, and retrieve key ranges. Which implementation fits?'), ['HashMap', 'TreeMap', 'ArrayDeque'], 1, b('哪种结构会维护键的顺序？', 'Which structure maintains key order?'), b('TreeMap 内部是红黑树，保持键序，提供范围查询。', 'TreeMap uses a red-black tree to maintain key order and offers range queries.')),
      mc(b('TreeMap 用比较器只比较字符串长度。依次 put("cat", 1) 和 put("dog", 2)。size 和 get("cat") 依次是什么？', 'A TreeMap comparator compares strings only by length. Run put("cat", 1) and put("dog", 2). What are size and get("cat")?'), ['2, 1', '2, 2', '1, 2'], 2, b('两个长度都是 3，比较器返回多少？', 'Both lengths are 3. What does the comparator return?'), b('比较为 0 意味着同一个映射位置。第二次更新值为 2，size 为 1。', 'A comparison of zero means the same mapping position. The second put updates the value to 2, and size stays 1.'))
    ]
  };

  lessons[19] = {
    title: b('哈希表', 'Hash tables'),
    icon: 'hash', art: '#',
    intro: b('如果能先算出钥匙应该放在哪一格，就不用翻整箱。两把钥匙算到同一格时，还要知道去哪找。', 'If you can calculate a key’s slot, you can skip most of the box. When two keys land in the same place, you need a rule for searching further.'),
    takeaway: b('先算哈希码，再算起始桶。碰撞靠链或探测解决，装载因子影响查找长度。', 'Compute the hash code, then the home bucket. Resolve collisions with chains or probes, and track load because it affects search lengths.'),
    lab: b('试四种碰撞处理方法。插入、查找、删除整数或字符串，再扩容看看键去了哪里。', 'Try four collision strategies. Insert, search, and delete integer or string keys, then resize to see where they move.'),
    chapters: [
      s(b('键到桶有两步', 'From key to bucket in two steps'), [
        b('哈希表用数组存桶或槽。第一步把键映射到整数 hashCode，第二步把整数压缩成 0 到 m−1 的下标，m 是容量。实验用 Math.floorMod(hash, m)。Java 的 % 在左操作数为负时可能得到负数，比如 −9 % 7 = −2，而 floorMod(−9, 7) = 5。', 'A hash table stores buckets or slots in an array. First map the key to an integer hash code. Then compress it into an index in 0 through m−1, where m is capacity. The lab uses Math.floorMod(hash, m). Java % can give a negative result, such as −9 % 7 = −2, while floorMod(−9, 7) = 5.'),
        b('哈希表追求计算快、分布均匀。另一个领域的密码哈希有不同要求，实际密码存储需要专用方案。这里用 Java 的对象哈希来做快速查找。', 'A table hash aims for fast computation and even distribution. Password hashing has different requirements and uses specialized schemes. Here object hashes serve fast lookup.')
      ], { pages: '2–7, 9–11' }),
      s(b('Java 的 String.hashCode', 'Java String.hashCode'), [
        b('从 h = 0 开始，每读一个 UTF-16 代码单元 c，就算 h = 31*h + c。展开为 s[0]·31ⁿ⁻¹ + s[1]·31ⁿ⁻² + … + s[n−1]。Java int 是有符号 32 位，溢出按低 32 位保留，因此哈希码可以是负数。Cindy 的哈希码是 65,112,893。', 'Start with h = 0 and update h = 31*h + c for each UTF-16 code unit c. This expands to s[0]·31ⁿ⁻¹ + s[1]·31ⁿ⁻² + … + s[n−1]. Java int is signed 32-bit and overflow keeps the low 32 bits, so hashes may be negative. Cindy hashes to 65,112,893.'),
        b('若 a.equals(b)，则 a.hashCode() 必须等于 b.hashCode()。反方向并不成立，例如 Ea 和 FB 的哈希码都是 2236，但字符串不同。重写 equals 时也重写 hashCode，并避免在键入表后修改用于相等性或哈希计算的字段。', 'If a.equals(b), then a.hashCode() must equal b.hashCode(). The reverse implication fails: Ea and FB both hash to 2236 but are different strings. Override hashCode when overriding equals, and avoid mutating key fields used in equality or hashing after insertion.')
      ], { pages: '8–13', code: `int stringHash(String key) {
    int h = 0;
    for (int i = 0; i < key.length(); i++) {
        h = 31 * h + key.charAt(i);
    }
    return h;
}` }),
      s(b('碰撞与拉链法', 'Collisions and separate chaining'), [
        b('不同键可能因为哈希码相同或压缩后结果相同而落到同一个桶，这叫碰撞。例如容量 7，43 % 7 和 78 % 7 都是 1，两个整数本身却不同。发生碰撞时还要用键相等性来区分。', 'Different keys collide when they compress to the same bucket, even if their raw hash codes differ. At capacity 7, 43 % 7 and 78 % 7 both give 1. Equality still distinguishes the two keys.'),
        b('分离链表法（拉链法，课件也称 open hashing）在每个桶维护一组条目，常用链表。查找只扫描起始桶的链。插入先检查是否已有相等键，再插入新条目或更新值。删除从链里摘下该条目。链可以增长到比桶数更多的总条目，代价是额外链接、较差的局部性和长链风险。', 'Separate chaining, also called open hashing in the slides, keeps a collection of entries per bucket, often a linked list. Lookup scans only the home bucket’s chain. Insert checks for an equal key, then adds or updates. Delete unlinks the entry. Chains permit more entries than buckets, while adding link overhead, weaker locality, and the risk of long chains.')
      ], { pages: '14–18' }),
      s(b('开放寻址的三种探测', 'Three open-addressing probe rules'), [
        b('开放寻址（课件也称 closed hashing）把键和值直接放在数组槽内。遇到占用就继续试其他槽。插入和查找对同一个键使用同样的探测序列。设起始槽 h，尝试编号 i 从 0 开始。', 'Open addressing, also called closed hashing in the slides, stores entries directly in array slots. If a slot is occupied, try another. Insert and search reproduce the same probe sequence for a key. Let h be its home index and start attempt i at zero.')
      ], { pages: '15, 19–21', table: {
        headers: [b('方法', 'Strategy'), b('探测下标', 'Probe index'), b('性质', 'Behavior')],
        rows: [
          [b('线性探测', 'Linear probing'), '(h + i) mod m', b('逐格检查并绕回 0，连续占用区容易聚集。', 'Walk consecutive slots and wrap. Occupied runs tend to cluster.')],
          [b('二次探测', 'Quadratic probing'), '(h + i²) mod m', b('缓解连续聚集，有些参数无法走遍所有槽。', 'Reduces contiguous clustering, but some parameters leave slots unreachable.')],
          [b('双重哈希', 'Double hashing'), '(h + i·step) mod m', b('第二个哈希决定非零步长。步长与 m 互质时可以走完一圈。', 'A second hash supplies a nonzero step. A step coprime to m visits every slot.')]
        ]
      }, after: b('例如 m = 7、h = 1，二次探测依次试 1, 2, 5, 3, 3, 5, 2。只触及 4 个槽，这 4 格占满时插入可能失败，即使别处有空。实验的双重哈希用质数 m，步长取 1 + floorMod(hash, m−1)。', 'At m = 7 and h = 1, quadratic probing tries 1, 2, 5, 3, 3, 5, 2. That reaches only four slots. Insertion can fail when they are occupied even with room elsewhere. For double hashing, the lab uses prime m and step = 1 + floorMod(hash, m−1).') }),
      s(b('删除、墓碑与重新散列', 'Deletion, tombstones, and rehashing'), [
        b('例如 43 落在槽 1，78 线性探测落到槽 2。若删除 43 时把槽 1 标为从未使用，之后查 78 一看到空槽就会错误停下。用墓碑（曾用、已删除）保留探测路径。查找越过墓碑，插入可记住第一座墓碑并在确认重复键缺席后重用。有限探测步数可避免满表或循环轨迹使查找不终止。', 'Suppose 43 occupies slot 1 and 78 probes to slot 2. Marking slot 1 never used when 43 is deleted would make lookup for 78 stop too early. Use a tombstone for a deleted slot. Search crosses tombstones. Insertion remembers the first tombstone and can reuse it after ruling out a duplicate. Bound the number of attempts so full tables or repeating sequences terminate.'),
        b('装载因子 α = n/m，n 为活动条目数。α 越高通常探测越长。开放寻址还需留意墓碑所占的槽，拉链法允许 α 超过 1。扩容用新的 m 对所有活条目重新计算下标，顺便移除墓碑。所有条目都要重新安置。在分布良好时一次重建的期望成本为 O(n)，分摊到长期操作才得到摊还结论。', 'Load is α = n/m for n active entries. Higher load typically lengthens probe paths. In open addressing, tombstones also occupy slots, while chaining can exceed load 1. On resize, recompute indices for all live entries using the new m and discard tombstones. A rebuild relocates every entry. With good distribution it takes expected O(n), which is spread across operations for amortized bounds.')
      ], { pages: '18–22' }),
      s(b('哈希表的性能条件', 'When a hash table is fast'), [
        b('拉链长度有望随 α 变化，在分布良好、α 受控且单次散列和比较为 O(1) 的模型下，查找期望 O(1)。所有键挤进同一条链或开放寻址需走大量槽位时，经典方案最坏 O(n)（探测上界可按容量 m 表达）。字符串的哈希计算本身还要考虑键的长度。', 'With well-distributed hashes, bounded load, and constant-cost hashing and equality, lookup is expected O(1). Classical chaining can take O(n) in the worst case if all entries land in one chain, and open addressing can probe many slots, bounded by capacity m. Computing a string hash also depends on the key length.'),
        b('Java HashMap 的默认装载因子是 0.75。它实现 Map 并用自己的混合哈希和桶布局。一些碰撞严重的桶在满足条件时可以变成树。实验采用直观的取模和四种可切换策略，便于观察一般原理。', 'Java HashMap has a default load factor of 0.75. It implements Map using its own hash spreading and bucket layout. A heavily collided bucket can become a tree under certain conditions. The lab uses direct modular indexing and four strategies to expose the general mechanics.')
      ], { pages: '22–23' })
    ],
    refs: [['String.hashCode', java('java/lang/String') + '#hashCode()'], ['Object.hashCode', java('java/lang/Object') + '#hashCode()'], ['HashMap', java('java/util/HashMap')]],
    questions: [
      enter(b('容量 7，以整数本身为 hash。43 映射到哪个起始桶？', 'Capacity is 7 and the integer key is its own hash. What is the home bucket of 43?'), '1', b('想 43 除以 7 的余数。', 'Find the remainder when dividing 43 by 7.'), b('43 = 6×7+1，对应桶 1。', '43 = 6×7+1, so the bucket is 1.')),
      mc(b('两个对象的 hashCode 都是 2236。能直接断定 equals 为 true 吗？', 'Two objects both hash to 2236. Can you conclude that equals is true?'), [b('可以，相同哈希等于相同键', 'Yes, equal hashes mean equal keys'), b('不能，例如 Ea 与 FB 就发生撞码', 'No, Ea and FB are a counterexample'), b('只有对象类型为 String 时可以', 'Yes, for String objects')], 1, b('哈希整数的取值有限，不同键能撞到一起。', 'An integer hash has a finite range, so different keys can collide.'), b('等键必须同哈希，反方向不成立。落到同桶后还要比较键。', 'Equal keys must have equal hashes. The reverse does not follow. Compare the keys in the bucket.')),
      enter(b('容量 7，用线性探测依次插入 43、50、57（它们的起始槽都是 1）。57 最后在哪一槽？', 'At capacity 7, linear-probe insert 43, 50, 57 in order. All start at 1. Where does 57 land?'), '3', b('从下标 1 开始，总是向右试下一格。', 'Start at index 1 and try each next slot to the right.'), b('43 用槽 1，50 到槽 2，57 试过两格后写在槽 3。', '43 uses slot 1, 50 slot 2, and 57 writes to slot 3 after two collisions.')),
      mc(b('槽 1 的 43 与槽 2 的 78 具有同一初始槽 1。删除 43 后，怎样保证还能找到 78？', '43 in slot 1 and 78 in slot 2 both start at 1. After deleting 43, how do you preserve lookup of 78?'), [b('槽 1 标为从未使用', 'Mark slot 1 never used'), b('把 78 判定为同键并同时删掉', 'Treat 78 as the same key and delete it too'), b('槽 1 放墓碑，让查询继续', 'Put a tombstone in slot 1 so lookup continues')], 2, b('查找会在从未使用的槽上提前停。', 'Lookup stops upon a never-used slot.'), b('墓碑表明这个位置以前有过元素，后面仍可能有被挤开的项。', 'A tombstone says the slot once held an entry, so displaced entries may follow.')),
      enter(b('容量从 7 扩到 13，用整数键本身取模。键 78 在新表的起始桶是多少？', 'Resize from 7 to 13 with integer keys hashed by their own values. What is key 78’s new home bucket?'), '0', b('用新容量重算，别照搬旧桶。', 'Recompute with the new capacity.'), b('78 是 13 的 6 倍，因此新起始桶为 0。', '78 is six times 13, so the new home bucket is 0.')),
      mc(b('m = 7，二次探测从 h = 1 开始。1、2、5、3 四槽已占，另外三槽为空。再插入一个 h = 1 的不同键会怎样？', 'm = 7, with quadratic probes starting at h = 1. Slots 1, 2, 5, and 3 are occupied and the other three are empty. What happens when inserting a new key with h = 1?'), [b('必定找到空槽，因为还有空间', 'It always finds a free slot because there is space'), b('本轮失败，因为探测只能到这四槽', 'It fails in this table because it reaches only those four slots'), b('覆盖槽 1 的旧键', 'It overwrites the old key in slot 1')], 1, b('列出 (1 + i²) % 7，i 为 0 到 6。', 'List (1 + i²) % 7 for i from 0 through 6.'), b('轨迹是 1, 2, 5, 3, 3, 5, 2。可扩容重散列或改用不同策略。', 'The sequence is 1, 2, 5, 3, 3, 5, 2. Rehashing into a larger table or changing strategies can resolve it.'))
    ]
  };
})();
