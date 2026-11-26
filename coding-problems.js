'use strict';

window.CS201Coding = (() => {
  const { bi: b } = CS201;
  const problems = [];
  const test = (label, input, output) => ({ label, input, output });
  const sample = b('题面样例', 'Sample');
  const base = b('基础', 'Foundations');
  const stretch = b('提升', 'Stretch');
  const challenge = b('综合', 'Challenge');

  function add(problem, template, body) {
    const marker = '/* IMPLEMENT */';
    problems.push({
      ...problem,
      starter: template.replace(marker, '// TODO\n        throw new UnsupportedOperationException("TODO");'),
      solution: template.replace(marker, body)
    });
  }

  add({
    id: 'hanoi', className: 'Hanoi', assigned: true, level: base, lectures: [9],
    title: b('汉诺塔的移动顺序', 'Towers of Hanoi moves'),
    summary: b('用递归把 n 个盘子从 A 移到 C。', 'Use recursion to move n disks from A to C.'),
    description: b('三个柱子叫 A、B、C。所有盘子起初在 A，最大的在底部。一次移动一个盘子，大盘不得压在小盘上。完成 moves，保留 main 中从 A 到 C、以 B 为备用柱的调用。', 'All disks start on peg A, largest at the bottom. Move one disk at a time and keep larger disks below smaller ones. Fill in moves and keep the main call that moves A to C using B.'),
    input: b('一个整数 n，作业范围 1 ≤ n ≤ 8。附加测试也检查递归终止条件 n = 0。', 'One integer n, with 1 ≤ n ≤ 8 in the assignment. An extra test checks the recursive base case n = 0.'),
    output: b('输出 2ⁿ − 1 行，每行像 A -> C，每个箭头的两边各有一个空格。n = 0 不输出。', 'Print 2ⁿ − 1 lines, each like A -> C, with one space on either side of the arrow. Print nothing for n = 0.'),
    hints: [
      b('n = 0 时当前调用应该直接结束。', 'An n = 0 call should return immediately.'),
      b('先把顶部 n−1 个盘子移到备用柱，最大盘才可以直接从起点移到终点。', 'Clear the largest disk by moving the top n−1 disks to the spare peg.'),
      b('第一段递归的目标是 spare。打印最大盘移动后，第二段递归的起点变成 spare，备用柱变成 from。', 'The first recursive destination is spare. After printing the large move, the second call starts at spare and uses from as its temporary peg.')
    ],
    rationale: b('递归假设 moves 能合法搬运 n−1 个盘子。先把它们暂放到 spare，移动盘 n，再把它们从 spare 叠到盘 n 上。两次调用都少一个盘，直到 n = 0。输出和时间是 Θ(2ⁿ)，调用栈 O(n)。', 'Assume moves correctly transfers n−1 disks. Move them out of the way, transfer disk n, then stack them onto it. Each call has one fewer disk until n = 0. Output and time are Θ(2ⁿ), with O(n) stack space.'),
    tests: [
      test(sample, '3\n', 'A -> C\nA -> B\nC -> B\nA -> C\nB -> A\nB -> C\nA -> C\n'),
      test(b('一个盘子', 'One disk'), '1\n', 'A -> C\n'),
      test(b('两个盘子', 'Two disks'), '2\n', 'A -> B\nA -> C\nB -> C\n'),
      test(b('递归终止', 'Base case'), '0\n', '')
    ]
  }, `import java.util.Scanner;

public class Hanoi {
    public static void moves(int n, char from, char to, char spare) {
        /* IMPLEMENT */
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        moves(n, 'A', 'C', 'B');
    }
}
`, `if (n == 0) return;
        moves(n - 1, from, spare, to);
        System.out.println(from + " -> " + to);
        moves(n - 1, spare, to, from);`);

  add({
    id: 'collapse', className: 'Collapse', assigned: true, level: base, lectures: [9, 10],
    title: b('合并连续斜线', 'Collapse slash runs'),
    summary: b('单次扫描，把连续的 / 写成一个 /。', 'Reduce each run of / to one slash in a single scan.'),
    description: b('只折叠连续的斜线。孤立斜线和所有其他字符按原顺序保留，字符串首尾用同一条规则。用 StringBuilder 或字符数组从左向右构造结果。', 'Collapse only adjacent slashes. Keep isolated slashes and all other characters in order. Apply the same rule at both ends. Build the result left to right with a StringBuilder or character array.'),
    input: b('一行，长度最多 200,000，允许空行。字符是字母、数字、点和斜线。', 'One possibly empty line of at most 200,000 characters containing letters, digits, dots, and slashes.'),
    output: b('一行折叠后的字符串。', 'One line containing the collapsed string.'),
    hints: [
      b('每读一个字符，只需要知道上一个读到的是不是斜线。', 'For each character, track whether the previous input character was a slash.'),
      b('当前与上一个都为 / 时才跳过。遇到非斜线时要把状态设回 false。', 'Skip only when the current and previous characters are both /. Reset the flag on a non-slash.'),
      b('用 StringBuilder.append 追加字符。读完再 toString()，这样不用为每个字符重新复制已有前缀。', 'Append with StringBuilder.append, then call toString once at the end.')
    ],
    rationale: b('读完任意前缀，输出已经恰好保留该前缀中每段斜线的第一个字符和所有非斜线字符。读下一个字符时保持这个规则，扫描一次结束。时间 Θ(n)，缓冲区最多 O(n)。', 'After any input prefix, the output keeps each first slash and every non-slash in that prefix. Processing the next character preserves that property. One pass takes Θ(n) time with O(n) buffer space.'),
    tests: [
      test(sample, '/d1///d2////d3/test.html\n', '/d1/d2/d3/test.html\n'),
      test(b('只含斜线', 'Only slashes'), '///\n', '/\n'),
      test(b('同时检查首尾', 'Leading and trailing runs'), '//a///b//\n', '/a/b/\n'),
      test(b('空行', 'Empty line'), '\n', '\n'),
      test(b('无需改动', 'Already collapsed'), 'a/b.c\n', 'a/b.c\n')
    ]
  }, `import java.util.Scanner;

public class Collapse {
    static String collapse(String s) {
        /* IMPLEMENT */
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.hasNextLine() ? sc.nextLine() : "";
        System.out.println(collapse(s));
    }
}
`, `StringBuilder out = new StringBuilder(s.length());
        boolean previousSlash = false;
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c != '/' || !previousSlash) out.append(c);
            previousSlash = c == '/';
        }
        return out.toString();`);

  add({
    id: 'dominant', className: 'Dominant', assigned: true, level: base, lectures: [9],
    title: b('找多项式的主导项', 'Dominant polynomial term'),
    summary: b('从系数和指数求增长阶，检查零项和相消。', 'Find the growth order and handle zero terms and cancellation.'),
    description: b('coeff[i] 与 exp[i] 对应一项。按多项式的次数求紧的增长阶。这个版本先合并相同指数，因为相同次幂的非零系数也可能相消。', 'coeff[i] and exp[i] describe one term. Use the polynomial degree to identify the tight growth order. This version combines equal powers so that cancellation is handled.'),
    input: b('先读 T（1–100），每组先读 k（1–20），再读 k 对系数 c 与指数 e。c 是有符号 int，0 ≤ e ≤ 10。', 'Read T (1–100). For each case read k (1–20), then k pairs c and e. c is a signed int and 0 ≤ e ≤ 10.'),
    output: b('每组输出 O(1)、O(n) 或 O(n^k)。常数和零多项式输出 O(1)。', 'Print O(1), O(n), or O(n^k) per case. Use O(1) for constant and zero polynomials.'),
    hints: [
      b('指数范围只有 0 到 10，可以让数组槽代表指数。', 'Exponents range from 0 to 10, so array indices can represent powers.'),
      b('对同一指数把系数加起来。用 long 作和，避免多个 int 大系数相加溢出。', 'Sum coefficients with the same exponent. Use long so adding int coefficients does not overflow.'),
      b('从最高指数向下找第一个和非零的位置。指数 1 的输出特例是 O(n)。', 'Scan downward for the first nonzero coefficient sum. Exponent 1 is formatted as O(n).')
    ],
    rationale: b('每一格保存该指数的真实系数和。降序扫出第一个非零系数就得到最高次数，零数组自然回到 O(1)。这里指数范围固定，一组 k 项花 Θ(k) 时间和 O(1) 额外空间。', 'Each slot stores the combined coefficient for one power. The first nonzero sum in descending order gives the degree, and an all-zero array falls back to O(1). The exponent range is fixed, so k terms take Θ(k) time and O(1) extra space.'),
    tests: [
      test(sample, '3\n2\n3 1\n5 0\n3\n2 2\n1000 1\n50 0\n2\n3 4\n120 1\n', 'O(n)\nO(n^2)\nO(n^4)\n'),
      test(b('最高项为零或相消', 'Zero or cancelled leading terms'), '3\n2\n0 10\n5 0\n3\n8 9\n-8 9\n-2 3\n2\n4 7\n-4 7\n', 'O(1)\nO(n^3)\nO(1)\n'),
      test(b('和超出 int 范围', 'Sum beyond int range'), '1\n3\n-2147483648 10\n-2147483648 10\n1 0\n', 'O(n^10)\n')
    ]
  }, `import java.util.Scanner;

public class Dominant {
    static String bigO(int[] coeff, int[] exp) {
        /* IMPLEMENT */
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int t = sc.nextInt();
        for (int tc = 0; tc < t; tc++) {
            int k = sc.nextInt();
            int[] coeff = new int[k];
            int[] exp = new int[k];
            for (int i = 0; i < k; i++) {
                coeff[i] = sc.nextInt();
                exp[i] = sc.nextInt();
            }
            System.out.println(bigO(coeff, exp));
        }
    }
}
`, `long[] combined = new long[11];
        for (int i = 0; i < coeff.length; i++) {
            combined[exp[i]] += coeff[i];
        }
        for (int degree = 10; degree >= 1; degree--) {
            if (combined[degree] != 0) {
                return degree == 1 ? "O(n)" : "O(n^" + degree + ")";
            }
        }
        return "O(1)";`);

  add({
    id: 'hanoi-step', className: 'HanoiStep', level: stretch, lectures: [9, 14],
    title: b('汉诺塔的第 k 次移动', 'The kth Hanoi move'),
    summary: b('只找一行输出，跳过整段递归。', 'Find one output line by skipping entire recursive blocks.'),
    description: b('仍按 Hanoi 的顺序从 A 移到 C。只输出第 k 次移动，k 从 1 开始。盘子可多到 60 个，不能生成完整移动序列。', 'Use the Hanoi order from A to C. Print only move k, counted from 1. Up to 60 disks are allowed, so generating the whole sequence is too expensive.'),
    input: b('两个整数 n 和 k。1 ≤ n ≤ 60，1 ≤ k ≤ 2ⁿ − 1。用 long 读取 k。', 'Two integers n and k, where 1 ≤ n ≤ 60 and 1 ≤ k ≤ 2ⁿ − 1. Read k as long.'),
    output: b('一行，格式为 A -> C。', 'One move in the format A -> C.'),
    hints: [
      b('把完整序列分成左递归、中间移动、右递归三部分。', 'Split the sequence into the first recursive block, the middle move, and the second block.'),
      b('中间移动前有 2ⁿ⁻¹ − 1 次移动，因此它的位置是 1L << (n - 1)。', 'There are 2ⁿ⁻¹ − 1 moves before the middle move, whose position is 1L << (n - 1).'),
      b('若 k 在右半部分，减去中间位置再递归。两个分支的柱子排列和原题一致。', 'For k in the second block, subtract the middle position before recursing. Use the original peg order for each recursive branch.')
    ],
    rationale: b('两个长度相同的递归块由中间移动分隔。比较 k 与中间位置即可选定唯一相关的块并换算编号，每次只递归一次。时间 O(n)，栈空间 O(n)。', 'Two equal-length recursive blocks surround the middle move. Compare k with the middle position, then translate k into the relevant block. Only one branch runs, giving O(n) time and stack space.'),
    tests: [
      test(sample, '3 6\n', 'B -> C\n'),
      test(b('在中间', 'Middle move'), '3 4\n', 'A -> C\n'),
      test(b('在第一个块', 'First block'), '2 1\n', 'A -> B\n'),
      test(b('超出 int 的位置', 'Position beyond int'), '60 576460752303423488\n', 'A -> C\n'),
      test(b('最后一行', 'Last move'), '60 1152921504606846975\n', 'B -> C\n')
    ]
  }, `import java.util.Scanner;

public class HanoiStep {
    static String kth(int n, long k, char from, char to, char spare) {
        /* IMPLEMENT */
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        long k = sc.nextLong();
        System.out.println(kth(n, k, 'A', 'C', 'B'));
    }
}
`, `long middle = 1L << (n - 1);
        if (k == middle) return from + " -> " + to;
        if (k < middle) return kth(n - 1, k, from, spare, to);
        return kth(n - 1, k - middle, spare, to, from);`);

  add({
    id: 'normalize-path', className: 'NormalizePath', level: stretch, lectures: [10, 12, 13],
    title: b('用双端队列整理路径', 'Normalize a path with a deque'),
    summary: b('折叠斜线，并处理 . 和 .. 两种路径段。', 'Collapse repeated slashes and handle . and .. segments.'),
    description: b('把绝对路径当一行文本处理。忽略空段和 .。遇到 .. 就删除最近加入且仍保留的段，已经在根目录时停在根。其他段原样保留。', 'Treat the absolute path as text. Skip empty segments and single dots. For a .. segment, remove the most recent retained name if present. Stay at the root if there is no name to remove. Keep all other names as written.'),
    input: b('一行由 / 开始的路径，长度 1–100,000。路径名可由字母、数字和点组成。', 'A path beginning with / on one line, with length 1–100,000. Names may contain letters, digits, and dots.'),
    output: b('规范化后仍以 / 开头，段之间恰好一个 /。根目录输出 /，其余路径末尾不加斜线。', 'Print a leading / with one separator between segments. Print / for the root, and omit the trailing slash for every other path.'),
    hints: [
      b('先按 / 拆出各段，不要逐个删除字符。', 'Split into segments at /. Work with whole names rather than deleting characters one at a time.'),
      b('普通段在 deque 尾部添加。.. 用 pollLast()，空时返回 null，状态自然留在根。', 'Append names at the deque rear. Use pollLast() for .., which returns null at an empty stack.'),
      b('最后按队首到队尾拼接。... 与 .、.. 是不同的普通名字。', 'Join from front to rear. A name of three dots is ordinary. Only . and .. are special.')
    ],
    rationale: b('处理完每个段后，deque 中正好保存当前路径从根到末尾的各个目录名。每段最多入队、出队一次，扫描与拼接共 O(n) 时间和 O(n) 空间。', 'After each segment, the deque stores the current path’s directory names in order. Each segment enters and leaves at most once. Scanning and joining take O(n) time and space.'),
    tests: [
      test(sample, '/a//b/./../c//\n', '/a/c\n'),
      test(b('根处的 ..', '.. at root'), '/../../x/..\n', '/\n'),
      test(b('点出现在普通名字里', 'Dots in names'), '/a.b/.../x/../.\n', '/a.b/...\n'),
      test(b('全是斜线', 'Only slashes'), '////\n', '/\n')
    ]
  }, `import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Scanner;

public class NormalizePath {
    static String normalize(String path) {
        /* IMPLEMENT */
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println(normalize(sc.nextLine()));
    }
}
`, `Deque<String> names = new ArrayDeque<>();
        for (String part : path.split("/")) {
            if (part.isEmpty() || part.equals(".")) continue;
            if (part.equals("..")) names.pollLast();
            else names.addLast(part);
        }
        return "/" + String.join("/", names);`);

  add({
    id: 'sparse-degree', className: 'SparseDegree', level: challenge, lectures: [9, 18, 19],
    title: b('稀疏多项式的最高次项', 'Leading term of a sparse polynomial'),
    summary: b('指数很大、项数较少，用 Map 合并。', 'Use a map to merge a few terms with very large exponents.'),
    description: b('读入若干个单项，合并指数相同的项。输出最高的非零项的指数和系数。指数很大，不能用指数作为数组长度。', 'Combine terms with equal exponents. Report the power and coefficient of the highest surviving term. Exponents are too large to use as array lengths.'),
    input: b('先读 k（1–100,000）。再读 k 对 c e，c 是 int，0 ≤ e ≤ 10⁹，允许相消。', 'Read k (1–100,000) and then k pairs c e. c is an int, 0 ≤ e ≤ 10⁹, and terms can cancel.'),
    output: b('零多项式输出 ZERO。否则输出最高指数与该项系数，中间用一个空格分隔。', 'Print ZERO if all terms cancel. Otherwise print the leading exponent and coefficient separated by one space.'),
    hints: [
      b('键用指数，值用同一指数的系数和。', 'Use the exponent as the key and its coefficient sum as the value.'),
      b('map.merge(e, (long)c, Long::sum) 能一次表达初次写入和后续累加。', 'map.merge(e, (long)c, Long::sum) handles both insertion and accumulation.'),
      b('遍历 entrySet，跳过和等于 0 的项。只跟踪最高的指数。', 'Scan entrySet, skip zero sums, and retain the largest exponent.')
    ],
    rationale: b('合并后每个键代表多项式的一个次幂。系数为零的项可跳过。HashMap 在通常的分布条件下期望 O(k) 时间，使用 O(k) 空间，容量与最大指数无关。', 'After merging, each key represents one power, and zero coefficients can be skipped. HashMap gives expected O(k) time under typical hashing assumptions and O(k) space independent of the largest exponent.'),
    tests: [
      test(sample, '5\n7 1000000000\n-7 1000000000\n3 5\n4 5\n-9 2\n', '5 7\n'),
      test(b('全消掉', 'All cancel'), '3\n-100 8\n100 8\n0 7\n', 'ZERO\n'),
      test(b('系数和需要 long', 'Coefficient sum needs long'), '2\n2147483647 99\n2147483647 99\n', '99 4294967294\n'),
      test(b('负常数', 'Negative constant'), '1\n-4 0\n', '0 -4\n')
    ]
  }, `import java.util.HashMap;
import java.util.Map;
import java.util.Scanner;

public class SparseDegree {
    static String leading(Map<Integer, Long> sums) {
        /* IMPLEMENT */
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int k = sc.nextInt();
        Map<Integer, Long> sums = new HashMap<>();
        for (int i = 0; i < k; i++) {
            long c = sc.nextInt();
            int e = sc.nextInt();
            sums.merge(e, c, Long::sum);
        }
        System.out.println(leading(sums));
    }
}
`, `int degree = -1;
        long coefficient = 0;
        for (var term : sums.entrySet()) {
            if (term.getValue() != 0 && term.getKey() > degree) {
                degree = term.getKey();
                coefficient = term.getValue();
            }
        }
        return degree < 0 ? "ZERO" : degree + " " + coefficient;`);

  add({
    id: 'bracket-index', className: 'BracketIndex', level: stretch, lectures: [12, 13],
    title: b('第一个括号错误在哪里', 'Locate the first bracket error'),
    summary: b('用 ArrayDeque 做栈，同时报告精确下标。', 'Use ArrayDeque as a stack and report the exact position.'),
    description: b('从左到右匹配括号。某个右括号无对应左括号，或类型与当前栈顶不同，就立即报告它的位置。读到结尾后如果仍有未闭合的左括号，报告字符串长度。', 'Match brackets left to right. Report the position of the first closing bracket that has no compatible opening bracket at the top of the stack. If some openings remain at the end, report the line length.'),
    input: b('一行，由 ()[]{} 组成，允许空行。长度最多 100,000。', 'One line of up to 100,000 characters, consisting of ()[]{}. An empty line is allowed.'),
    output: b('输出第一个错误的 0 起始下标。若读到末尾才发现有未配对的左括号，输出行长度。完全匹配时输出 −1。', 'Print the zero-based index of the first error. Use the line length for unmatched openings at EOF, or −1 if fully balanced.'),
    hints: [
      b('左括号遇到就 push。新右括号只可能与当前栈顶对应。', 'Push each opening bracket. Any closer must match the current top.'),
      b('先检查 isEmpty()，再 pop() 比较。空栈 pop 会抛异常。', 'Check isEmpty() before popping and comparing. pop on an empty deque throws.'),
      b('全部字符处理完还要检查栈是否为空。未配对的左括号使用 s.length()。', 'At the end, check the stack again. If any openings remain, return s.length().')
    ],
    rationale: b('栈按先后顺序记住尚未关闭的左括号，栈顶是下一次唯一允许配对的开括号。每个字符至多入栈和出栈各一次，时间 O(n)，最坏辅助空间 O(n)。', 'The stack stores pending openings in order, with the sole eligible match at the top. Each character is pushed and popped at most once. Time and worst-case auxiliary space are O(n).'),
    tests: [
      test(sample, '([)]\n', '2\n'),
      test(b('正确嵌套', 'Valid nesting'), '{[()]}\n', '-1\n'),
      test(b('右括号先出现', 'Closing bracket first'), ')[]\n', '0\n'),
      test(b('结尾未闭合', 'Open at EOF'), '(([])\n', '5\n'),
      test(b('空行', 'Empty line'), '\n', '-1\n')
    ]
  }, `import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Scanner;

public class BracketIndex {
    static int firstError(String s) {
        /* IMPLEMENT */
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.hasNextLine() ? sc.nextLine() : "";
        System.out.println(firstError(s));
    }
}
`, `Deque<Character> openings = new ArrayDeque<>();
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c == '(' || c == '[' || c == '{') {
                openings.push(c);
            } else {
                char expected = c == ')' ? '(' : c == ']' ? '[' : '{';
                if (openings.isEmpty() || openings.pop() != expected) return i;
            }
        }
        return openings.isEmpty() ? -1 : s.length();`);

  add({
    id: 'list-from-end', className: 'ListFromEnd', level: stretch, lectures: [11],
    title: b('链表的倒数第 k 个节点', 'Find the kth node from the end'),
    summary: b('让两个引用保持固定距离。', 'Maintain a fixed gap between two references.'),
    description: b('链表已经由 main 按输入顺序建立。在 find 中只能沿 next 前进。用 O(1) 辅助空间和一趟双指针扫描找到倒数第 k 项，k = 1 是最后一项。', 'main builds the list in input order. In find, follow next links with a two-pointer scan and O(1) auxiliary space. k = 1 means the last item.'),
    input: b('先读 n 与 k。0 ≤ n ≤ 100,000，k 为 int。随后读 n 个 int 作为节点数据。', 'Read n and k, where 0 ≤ n ≤ 100,000 and k is an int, followed by n int payloads.'),
    output: b('输出目标节点里的整数。若 k 不在 1 到 n 的范围，输出 NONE。', 'Print the target payload. If k is outside 1 through n, print NONE.'),
    hints: [
      b('快慢引用都从 head 开始。先建立 k 步的间隔。', 'Start both references at head and first create a gap of k links.'),
      b('让 fast 先执行 k 次 fast = fast.next，每一步都先确保 fast 非空。', 'Advance fast k times, checking it is non-null before each hop.'),
      b('之后两个引用一起移动，直到 fast 指向 null。此刻 slow 正好指着倒数第 k 项。', 'Then move both together until fast is null. slow points to the kth item from the end.')
    ],
    rationale: b('快指针先走 k 步。保持两者的间隔，到 fast 穿过尾节点时，slow 与链尾的相对位置就是答案。find 时间 O(n)，只有两个额外引用。', 'The fast pointer gets a head start of k links. Maintain that gap. When fast moves past the tail, the position of slow is the answer. find takes O(n) time and two extra references.'),
    tests: [
      test(sample, '5 2\n10 20 30 40 50\n', '40\n'),
      test(b('倒数第 n 个是头节点', 'k = n reaches the head'), '3 3\n-2 0 20\n', '-2\n'),
      test(b('取尾节点', 'Take the tail'), '2 1\n4 9\n', '9\n'),
      test(b('链表太短', 'List too short'), '0 1\n', 'NONE\n'),
      test(b('k 不是正数', 'Nonpositive k'), '2 0\n0 1\n', 'NONE\n')
    ]
  }, `import java.util.Scanner;

public class ListFromEnd {
    static class Node {
        final int value;
        Node next;

        Node(int value) {
            this.value = value;
        }
    }

    static Node find(Node head, int k) {
        /* IMPLEMENT */
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int k = sc.nextInt();
        Node head = null;
        Node tail = null;
        for (int i = 0; i < n; i++) {
            Node node = new Node(sc.nextInt());
            if (head == null) head = node;
            else tail.next = node;
            tail = node;
        }
        Node answer = find(head, k);
        System.out.println(answer == null ? "NONE" : Integer.toString(answer.value));
    }
}
`, `if (k <= 0) return null;
        Node fast = head;
        Node slow = head;
        for (int i = 0; i < k; i++) {
            if (fast == null) return null;
            fast = fast.next;
        }
        while (fast != null) {
            fast = fast.next;
            slow = slow.next;
        }
        return slow;`);

  add({
    id: 'tree-leaves', className: 'TreeLeaves', level: challenge, lectures: [13, 14],
    title: b('按层序输出二叉树的叶子', 'Print tree leaves in level order'),
    summary: b('把数组位置接成 Node，再把真实节点放进 BFS 队列。', 'Link array positions into Nodes and queue only real nodes for BFS.'),
    description: b('main 已把输入位置转换成各节点的 left / right 引用。完成 leaves，从 root 层序遍历，只输出没有左右孩子的节点。相同层按从左到右输出。', 'main converts the input slots into left and right references. Complete leaves to visit the tree in level order and report the nodes with no children, left to right within each level.'),
    input: b('先读槽位数 n（0–127），再读 n 个标记。# 表示该槽为空，其他标记为 int。槽位从 0 开始，i 的孩子位是 2i+1、2i+2。每个非空的非根槽都保证有非空父节点。', 'Read n (0–127) slot tokens. # marks an empty slot, and every other token is an int. Indices are zero-based with children at 2i+1 and 2i+2. Every occupied non-root slot has an occupied parent.'),
    output: b('叶子数据用一个空格分隔，空树输出 EMPTY。', 'Separate leaf payloads with single spaces. Print EMPTY for an empty tree.'),
    hints: [
      b('叶子需要同时满足 left == null 和 right == null。', 'A leaf requires both left == null and right == null.'),
      b('用 Queue<Node> pending = new ArrayDeque<>()。先检查根，然后检查每个孩子的引用再 offer。', 'Use Queue<Node> pending = new ArrayDeque<>(), checking the root and each child before offer.'),
      b('从队首 poll，然后先入队左孩子，再入队右孩子。StringJoiner 可以处理分隔空格。', 'Poll the front, then enqueue the left child before the right. StringJoiner handles separating spaces.')
    ],
    rationale: b('队列保持层序，每个真实节点恰好入队一次。一个节点当且仅当两个孩子引用均空时输出。对 m 个实际节点，遍历时间 O(m)，队列最坏 O(m)。', 'The queue maintains level order and each real node enters exactly once. Output a node only if both child links are null. For m real nodes, traversal takes O(m) time and up to O(m) queue space.'),
    tests: [
      test(sample, '7\n8 4 12 # 6 10 #\n', '6 10\n'),
      test(b('叶子深度不同', 'Leaves at different depths'), '4\n8 4 12 -9\n', '12 -9\n'),
      test(b('根也是叶子', 'Root is a leaf'), '1\n-5\n', '-5\n'),
      test(b('没有槽位', 'No slots'), '0\n', 'EMPTY\n'),
      test(b('根槽为空', 'Empty root slot'), '3\n# # #\n', 'EMPTY\n')
    ]
  }, `import java.util.ArrayDeque;
import java.util.Queue;
import java.util.Scanner;
import java.util.StringJoiner;

public class TreeLeaves {
    static class Node {
        final int value;
        Node left;
        Node right;

        Node(int value) {
            this.value = value;
        }
    }

    static String leaves(Node root) {
        /* IMPLEMENT */
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        Node[] slots = new Node[n];
        for (int i = 0; i < n; i++) {
            String token = sc.next();
            if (!token.equals("#")) slots[i] = new Node(Integer.parseInt(token));
        }
        for (int i = 0; i < n; i++) {
            if (slots[i] == null) continue;
            int left = 2 * i + 1;
            int right = left + 1;
            if (left < n) slots[i].left = slots[left];
            if (right < n) slots[i].right = slots[right];
        }
        System.out.println(leaves(n == 0 ? null : slots[0]));
    }
}
`, `if (root == null) return "EMPTY";
        Queue<Node> pending = new ArrayDeque<>();
        StringJoiner output = new StringJoiner(" ");
        pending.offer(root);
        while (!pending.isEmpty()) {
            Node node = pending.poll();
            if (node.left == null && node.right == null) {
                output.add(Integer.toString(node.value));
            }
            if (node.left != null) pending.offer(node.left);
            if (node.right != null) pending.offer(node.right);
        }
        return output.toString();`);

  add({
    id: 'list-append', className: 'TailAppendCheck', level: base, lectures: [11],
    title: b('验证泛型链表尾插', 'Verify generic list append'),
    summary: b('补全 MyLinkedList<E>.add，检查节点身份、接线和计数。', 'Complete MyLinkedList<E>.add and check node identity, links, and size.'),
    description: b('在只记录 head 和 size 的单链表末尾追加新节点。每次调用都创建一个新节点，即使数据相同。main 会逐次检查新增节点是否接对、旧节点是否仍在原位置，以及 size 是否正确。', 'Append a new node to a singly linked list that stores head and size. Each call creates a new node, even for duplicate data. After every call, main checks the new link, the identities and order of existing nodes, and the size.'),
    input: b('先读 n（0–100），再读 n 个无空格的单词。测试程序用 String 实例化 E。', 'Read n (0–100), then n words without spaces. The checker instantiates E as String.'),
    output: b('结构检查通过时，按先后顺序输出数据，用一个空格分隔。空表输出 EMPTY。检查失败时给出 Java 诊断。', 'After the structural checks pass, print the data in insertion order, separated by single spaces. Print EMPTY for an empty list. A failed check produces a Java diagnostic.'),
    hints: [
      b('先创建 next 为 null 的 Node<E>，再分空表和非空表处理。', 'Create a Node<E> with a null next, then handle the empty and nonempty lists.'),
      b('非空时只移动局部引用。在 currentNode.next == null 的节点处停下。', 'In a nonempty list, move a local reference. Stop at the node whose next is null.'),
      b('循环结束后才写 currentNode.next。空表直接赋值 head。分支结束后 size 加 1。', 'Write currentNode.next after the loop. Assign head directly for the empty list. Increment size after either branch.')
    ],
    rationale: b('设插入前有 k 个节点。空表把新节点设为 head，非空表遍历到末节点并接上新链。新尾节点的 next 为 null，每次调用增加一个节点，原有节点的顺序和引用都保留。尾插时间 Θ(k+1)，额外空间 Θ(1)。', 'Let k be the size before insertion. For an empty list the new node becomes head. Otherwise the former tail links to it. The new tail has null next, size increases by one, and existing nodes keep their order and identity. Append takes Θ(k+1) time and Θ(1) extra space.'),
    tests: [
      test(b('单节点变两节点', 'One node to two'), '2\nA B\n', 'A B\n'),
      test(b('空表', 'Empty list'), '0\n', 'EMPTY\n'),
      test(b('首次尾插', 'First insertion'), '1\nJava\n', 'Java\n'),
      test(b('多次尾插和重复值', 'Repeated appends and values'), '5\nB A B C A\n', 'B A B C A\n')
    ]
  }, `import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;
import java.util.StringJoiner;

class Node<E> {
    E data;
    Node<E> next;

    Node(E data) {
        this.data = data;
    }
}

class MyLinkedList<E> {
    Node<E> head;
    int size;

    void add(E e) {
        /* IMPLEMENT */
    }
}

public class TailAppendCheck {
    private static void require(boolean ok, String message) {
        if (!ok) throw new IllegalStateException(message);
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        MyLinkedList<String> list = new MyLinkedList<>();
        List<Node<String>> inserted = new ArrayList<>();
        StringJoiner output = new StringJoiner(" ");
        require(list.head == null && list.size == 0, "A new list must be empty");
        for (int i = 0; i < n; i++) {
            String word = sc.next();
            list.add(word);
            require(list.size == i + 1, "size must increase by one");
            Node<String> current = list.head;
            for (Node<String> old : inserted) {
                require(current == old, "The positions of existing nodes must stay the same");
                current = current.next;
            }
            require(current != null && !inserted.contains(current), "A fresh node must be appended");
            require(word.equals(current.data), "The tail must store the new value");
            require(current.next == null, "The new tail's next must be null");
            inserted.add(current);
        }
        for (Node<String> node = list.head; node != null; node = node.next) {
            output.add(node.data);
        }
        System.out.println(n == 0 ? "EMPTY" : output.toString());
    }
}
`, CS201.classroomTailAdd);

  const free = {
    id: 'free', className: 'Main',
    title: b('自由编辑器', 'Free editor'),
    description: b('写自己的单文件 Java 程序。在主类名填写包含 main 的类名，输入区提供给 System.in。', 'Write your own single-file Java program. Set the entry class to the class with main. The input box feeds System.in.'),
    starter: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");
    }
}
`
  };
  return { problems, free };
})();
