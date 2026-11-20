'use strict';

(() => {
  const { bi: b } = CS201;
  const { trace, mod, fmt, limits } = CS201Models;
  const mapSeed = () => ({ entries: [['S12', 'Lin'], ['S04', 'Ava'], ['S09', 'Noah']] });

  function mapAction(source, op, key, value) {
    const { model: m, frames, step } = trace(source, b('从键定位整条映射。', 'Use the key to locate a mapping.'));
    const i = m.entries.findIndex(([k]) => k === key);
    const present = i >= 0;
    const old = present ? m.entries[i][1] : null;
    step(present ? b('键 ' + fmt(key) + ' 当前映射到 ' + fmt(old) + '。', 'Key ' + fmt(key) + ' currently maps to ' + fmt(old) + '.')
      : b('键 ' + fmt(key) + ' 还没有对应项。', 'There is no mapping for ' + fmt(key) + '.'), [key]);
    if (op === 'put') {
      if (present) m.entries[i][1] = value;
      else if (m.entries.length < limits.map) m.entries.push([key, value]);
      else {
        step(b('实验映射已达到最大键数。', 'This lab map has reached its entry limit.'));
        return frames;
      }
      step(present ? b('替换值并返回旧值，size 不变。', 'Replace the value, return the old value, and keep the size.')
        : b('写入新的键值对，返回 null。', 'Write a new pair and return null.'), [key], { result: old });
    } else if (op === 'remove') {
      if (present) m.entries.splice(i, 1);
      step(present ? b('移除映射并返回旧值。', 'Remove the mapping and return the old value.')
        : b('键缺席，返回 null。', 'The key is absent. Return null.'), [], { result: old });
    } else {
      step(op === 'has' ? b('返回该键是否存在。', 'Return whether the key is present.')
        : b('返回查到的值，缺席时返回 null。', 'Return the value, or null for a missing key.'),
      [key], { result: op === 'has' ? present : old });
    }
    return frames;
  }

  const hashModes = {
    chain: b('拉链法', 'Chaining'), linear: b('线性探测', 'Linear probing'),
    quadratic: b('二次探测', 'Quadratic probing'), double: b('双重哈希', 'Double hashing')
  };
  function hashCode(key) {
    if (typeof key === 'number') return key | 0;
    let hash = 0;
    for (let i = 0; i < key.length; i++) hash = (Math.imul(hash, 31) + key.charCodeAt(i)) | 0;
    return hash;
  }

  function emptyHash(mode, capacity, keyType) {
    return { mode, keyType, slots: Array.from({ length: capacity }, () => mode === 'chain' ? [] : null) };
  }

  function hashEntries(m) {
    if (m.mode === 'chain') return m.slots.flat();
    return m.slots.filter((x) => x && !x.dead).map((x) => x.key);
  }

  function hashLocate(m, key, observe = () => {}) {
    const hash = hashCode(key);
    const size = m.slots.length;
    const home = mod(hash, size);
    if (m.mode === 'chain') {
      const bucket = m.slots[home];
      if (!bucket.length) observe(home, 0, null);
      const j = bucket.findIndex((stored, i) => {
        observe(home, i, { key: stored });
        return stored === key;
      });
      return { index: home, j, found: j >= 0 };
    }
    let tomb = -1;
    const stride = m.mode === 'double' ? 1 + mod(hash, size - 1) : 1;
    for (let i = 0; i < size; i++) {
      const index = (home + (m.mode === 'quadratic' ? i * i : i * stride)) % size;
      const entry = m.slots[index];
      observe(index, i, entry);
      if (entry === null) return { index: tomb >= 0 ? tomb : index, found: false };
      if (entry.dead) {
        if (tomb < 0) tomb = index;
      } else if (entry.key === key) {
        return { index, found: true };
      }
    }
    return { index: tomb, found: false };
  }

  function storeHash(m, where, key) {
    if (where.index < 0) return false;
    if (!where.found) {
      if (m.mode === 'chain') m.slots[where.index].push(key);
      else m.slots[where.index] = { key };
    }
    return true;
  }

  function hashSeed(mode = 'chain', capacity = 7, keyType = 'int',
    keys = keyType === 'str' ? ['Ea'] : [43, 70, 76]) {
    const m = emptyHash(mode, capacity, keyType);
    for (const key of keys) storeHash(m, hashLocate(m, key), key);
    return m;
  }

  function hashAction(source, op, key) {
    const { model: m, frames, step } = trace(source, b('准备计算键的起始桶。', 'Prepare to compute the home bucket.'));
    const hash = hashCode(key);
    const home = mod(hash, m.slots.length);
    const path = [];
    const routing = { key, hash, home, path };
    const detail = () => ({ routing });
    if (typeof key === 'string') {
      let h = 0;
      for (let i = 0; i < key.length; i++) {
        const previous = h;
        const c = key.charCodeAt(i);
        h = (Math.imul(h, 31) + c) | 0;
        const expression = '31 × ' + previous + ' + ' + c + ' → ' + h;
        step(b('UTF-16 单元 ' + i + '，按 int 计算 ' + expression + '。',
          'UTF-16 unit ' + i + ' with int arithmetic gives ' + expression + '.'),
        [], { hashProgress: { key, i, h } });
      }
    }
    step(b('floorMod(' + hash + ', ' + m.slots.length + ') 得到起始桶 ' + home + '。',
      'floorMod(' + hash + ', ' + m.slots.length + ') gives home bucket ' + home + '.'), [home], detail());
    const where = hashLocate(m, key, (index, i, entry) => {
      path.push(index);
      let message;
      if (!entry) message = b('桶或槽 ' + index + ' 为空。', 'Bucket or slot ' + index + ' is empty.');
      else if (entry.dead) message = b('槽 ' + index + ' 是墓碑，继续探测。', 'Slot ' + index + ' has a tombstone. Keep probing.');
      else message = entry.key === key ? b('在 ' + index + ' 处比较键，命中。', 'Compare the key at ' + index + ' and match.')
        : b('在 ' + index + ' 处遇到不同的键 ' + fmt(entry.key) + '。', 'At ' + index + ', encounter a different key ' + fmt(entry.key) + '.');
      step(message, [index], { ...detail(), probe: i });
    });
    if (op === 'insert') {
      if (where.found) {
        step(b('键已经存在，集合大小不变。', 'The key is present, so the set size stays the same.'), [where.index], { ...detail(), result: false });
      } else if (where.index < 0 || hashEntries(m).length >= limits.hash) {
        step(where.index < 0
          ? b('探测范围内没有可写槽。试试扩容或改变策略。', 'The probe sequence reached no writable slot. Try resizing or switching strategies.')
          : b('实验已达到最大键数。', 'This lab has reached its key limit.'), [], { ...detail(), result: false });
      } else {
        storeHash(m, where, key);
        step(b('在 ' + where.index + ' 处写入新键。', 'Store the new key at ' + where.index + '.'), [where.index], { ...detail(), result: true });
      }
    } else if (op === 'delete' && where.found) {
      if (m.mode === 'chain') m.slots[where.index].splice(where.j, 1);
      else m.slots[where.index] = { dead: true };
      step(m.mode === 'chain' ? b('从该桶的链中摘除这个键。', 'Unlink this key from the bucket chain.')
        : b('移除键，在槽位留下墓碑。', 'Remove the key and leave a tombstone.'), [where.index], { ...detail(), result: true });
    } else {
      step(where.found ? b('找到与目标相等的键。', 'Found a matching key.')
        : b('到达搜索终点，键缺席。', 'The search ended without a matching key.'),
      where.found ? [where.index] : [], { ...detail(), result: where.found });
    }
    return frames;
  }

  function hashRebuild(source, mode, capacity) {
    const { model: m, frames, step } = trace(source, b('保存所有当前活动的键。', 'Save all current live keys.'));
    const entries = hashEntries(m);
    const next = emptyHash(mode, capacity, m.keyType);
    const placements = [];
    for (const key of entries) {
      const where = hashLocate(next, key);
      if (!storeHash(next, where, key)) {
        step(b('目标表无法放下所有键。已保留原表，可选更大的容量。', 'The target table could not place every key. The original remains active. Try a larger capacity.'));
        return frames;
      }
      placements.push([key, where.index]);
    }
    Object.assign(m, emptyHash(mode, capacity, m.keyType));
    step(b('创建容量为 ' + capacity + ' 的新表。', 'Create a new table with capacity ' + capacity + '.'));
    for (const [key, index] of placements) {
      storeHash(m, { index, found: false }, key);
      const hash = hashCode(key);
      const home = mod(hash, capacity);
      step(b('重新定位 ' + fmt(key) + ' 并写到 ' + index + '。', 'Recompute the location for ' + fmt(key) + ' and write at ' + index + '.'),
        [index], { routing: { key, hash, home, path: [] } });
    }
    step(b('重新散列完成。', 'Rehash complete.'));
    return frames;
  }

  Object.assign(CS201Models, {
    mapSeed, mapAction, hashModes, hashCode, hashEntries, hashSeed, hashAction, hashRebuild
  });
})();
