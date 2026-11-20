'use strict';

(() => {
  const { bi: b } = CS201;
  const { el, labs } = CS201UI;
  const { stat, stats, sub, empty, sequence } = CS201Visuals;
  const M = CS201Models;

  labs[18] = {
    title: b('键值实验台', 'Key–value workbench'),
    ready: b('用现有的键 S04 做一次 put，注意返回的旧值与表中的新值。', 'Try put with the existing key S04. Compare the returned old value and the new value in the table.'),
    seed: M.mapSeed,
    pref: { key: 'S04', value: 'Mei', order: 'entry', nullable: false },
    setup(ui) {
      const val = ui.field('value', b('值', 'Value'), { maxLength: 24, class: 'text-field', disabled: ui.pref.nullable });
      const check = el('input', { type: 'checkbox', checked: ui.pref.nullable, data: { nullValue: '' },
        on: { change: () => {
          ui.pref.nullable = check.checked;
          val.querySelector('input').disabled = check.checked;
        } } });
      ui.row(ui.field('key', b('键', 'Key'), { maxLength: 18, class: 'text-field' }), val,
        el('label', { class: 'check-field mono' }, check, ui.t(b('存 null', 'Store null'))),
        ui.select('order', b('表格顺序', 'Row order'), { entry: b('录入顺序（演示）', 'Entry order (demo)'), sorted: b('按键排序', 'Sorted by key') }, ui.paint));
      const op = (name, label, tone) => ui.action(name, label, () => {
        const key = ui.pref.key;
        if (key.length === 0) {
          ui.noteError(b('给这条记录输入一个键。', 'Enter a key for this entry.'));
          return;
        }
        ui.setFrames(M.mapAction(ui.model(), name, key, ui.pref.nullable ? null : ui.pref.value));
      }, tone);
      ui.row(op('put', 'put(k, v)', 'primary'), op('get', 'get(k)'), op('remove', 'remove(k)'), op('has', 'containsKey(k)'),
        ui.action('empty', b('空映射', 'Empty map'), () => ui.newModel({ entries: [] }), 'quiet'));
    },
    view(f, ui) {
      const { t, pref } = ui;
      const rows = [...f.model.entries];
      if (pref.order === 'sorted') rows.sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0);
      return el('div', { class: 'linear-visual' },
        stats(stat('size', rows.length)),
        rows.length ? el('div', { class: 'map-entries' },
          el('div', { class: 'map-labels' }, t(b('键 · Key', 'Key')), el('span'), t(b('值 · Value', 'Value'))),
          rows.map(([key, value]) =>
            el('div', { class: 'map-row' + (f.marks.includes(key) ? ' is-active' : '') },
              el('span', { class: 'map-key mono' }, key), el('span', { class: 'map-arrow', 'aria-hidden': 'true' }, '→'),
              el('span', { class: 'map-value mono' + (value === null ? ' is-null' : '') }, M.fmt(value))))) : empty(t),
        el('p', { class: 'diagram-footnote' }, t(pref.order === 'sorted'
          ? b('这里按键的自然字符串顺序显示，类似 TreeMap 的迭代顺序。', 'This view uses natural string order, as TreeMap iteration does.')
          : b('录入顺序只是实验的显示选项。HashMap 的迭代顺序无保证。', 'Entry order is a display choice for the lab. HashMap iteration order is unspecified.'))));
    },
    tryIt: [
      b('用 S04 存一个新名字，先预测 put 返回什么，再用 get 检查新值。', 'Store a new name at S04. Predict the put return value, then use get to check the new value.'),
      b('勾选“存 null”，用键 S00 执行 put，再对它执行 get 和 containsKey。与缺席的键 S99 比较。', 'Check Store null, put at S00, then try get and containsKey. Compare with absent key S99.')
    ]
  };

  labs[19] = {
    title: b('桶、碰撞与探测', 'Buckets, collisions, and probing'),
    ready: b('43 已在起始桶 1。试插入同样从 1 开始的 78，观察冲突后怎么处理。', '43 starts at bucket 1. Insert 78, which also starts at 1, and see how the collision is handled.'),
    seed: M.hashSeed,
    pref: { mode: 'chain', capacity: '7', keyType: 'int', key: '78' },
    setup(ui) {
      const fromType = (type) => {
        const m = ui.model();
        ui.pref.key = type === 'str' ? 'FB' : '78';
        ui.newModel(M.hashSeed(m.mode, m.slots.length, type), false,
          b('已按键类型换成对应的起始样例。', 'Loaded the starter example for this key type.'));
      };
      ui.row(ui.select('mode', b('目标策略', 'Target strategy'), M.hashModes, null, true),
        ui.select('capacity', b('目标容量', 'Target capacity'), { 7: '7', 11: '11', 13: '13' }, null, true),
        ui.action('rehash', b('应用并重散列', 'Apply and rehash'), () =>
          ui.setFrames(M.hashRebuild(ui.model(), ui.pref.mode, Number(ui.pref.capacity)))),
        ui.select('keyType', b('键类型', 'Key type'), { int: b('整数 int', 'Integer int'), str: b('字符串 String', 'String') }, fromType, true));
      const operation = (name, label, tone) => ui.action(name, label, () => {
        const key = ui.model().keyType === 'str' ? ui.pref.key : ui.integer('key', -2147483648, 2147483647);
        if (key !== undefined) ui.setFrames(M.hashAction(ui.model(), name, key));
      }, tone);
      ui.row(ui.model().keyType === 'str' ? ui.field('key', b('字符串键', 'String key'), { maxLength: 18, class: 'text-field' })
        : ui.number('key', b('整数键', 'Integer key'), -2147483648, 2147483647),
      operation('insert', b('插入', 'Insert'), 'primary'), operation('find', b('查找', 'Find')), operation('delete', b('删除', 'Delete')),
      ui.action('empty', b('清空表', 'Empty table'), () => {
        const m = ui.model();
        ui.newModel(M.hashSeed(m.mode, m.slots.length, m.keyType, []), true,
          b('从空表开始，容量和策略保持。', 'Start with an empty table at the same capacity and strategy.'));
      }, 'quiet'));
    },
    view(f, ui) {
      const { t } = ui;
      const m = f.model;
      const count = M.hashEntries(m).length;
      const locate = f.routing;
      const chain = m.mode === 'chain';
      const label = t(chain ? b('每个桶有一条链', 'One chain per bucket') : b('每个槽最多放一个键', 'At most one key per slot'));
      return el('div', { class: 'linear-visual hash-visual' },
        stats(stat(t(b('当前策略', 'Current strategy')), t(M.hashModes[m.mode])),
          stat('m', m.slots.length), stat('n', count), stat('α = n/m', (count / m.slots.length).toFixed(2))),
        locate ? el('div', { class: 'hash-flow mono' },
          el('span', {}, M.fmt(locate.key)), el('span', {}, '→'), el('span', {}, 'hash ' + locate.hash),
          el('span', {}, '→'), el('span', {}, t(b('起始桶', 'Home')) + ' ' + locate.home))
          : f.hashProgress ? el('div', { class: 'hash-flow mono' },
            el('span', {}, M.fmt(f.hashProgress.key)), el('span', {}, '→'), el('span', {}, 'h = ' + f.hashProgress.h)) : null,
        sub(label),
        el('div', { class: 'buckets' }, m.slots.map((entry, i) => {
          const keys = chain ? entry : entry && !entry.dead ? [entry.key] : [];
          const active = f.marks.includes(i);
          return el('div', { class: 'bucket-row' + (active ? ' is-active' : ''), data: { bucket: i } },
            el('span', { class: 'bucket-index mono' }, i),
            el('div', { class: 'bucket-content' },
              keys.length ? keys.map((k, j) => [
                j > 0 ? el('span', { class: 'sequence-arrow', 'aria-hidden': 'true' }, '→') : null,
                el('span', { class: 'bucket-key mono' + (active && (j === f.probe && chain || k === locate?.key) ? ' traced' : '') }, M.fmt(k))
              ]) : entry?.dead ? el('span', { class: 'tombstone' }, t(b('墓碑', 'Tombstone'))) : el('span', { class: 'sequence-none' }, '∅')));
        })),
        locate ? sequence(t(chain ? b('访问过的桶', 'Bucket visits') : b('探测路径', 'Probe path')), locate.path, true) : null);
    },
    tryIt: [
      b('切换到线性探测并应用，插入 78，再删除 43。查 78 时看它如何越过墓碑。', 'Apply linear probing. Insert 78, delete 43, then search for 78 and watch it cross the tombstone.'),
      b('切到字符串，在已有 Ea 的表里插入 FB。看两个键的 hash，再把目标容量改为 13 并重散列。', 'Switch to strings and insert FB alongside Ea. Compare their hashes, then set target capacity 13 and rehash.'),
      b('改为二次探测、容量 7，清空后依次加 43、50、57、64、71。最后一次为何失败？', 'Use quadratic probing with capacity 7. Empty the table and insert 43, 50, 57, 64, 71. Why does the last insertion fail?')
    ]
  };
})();
