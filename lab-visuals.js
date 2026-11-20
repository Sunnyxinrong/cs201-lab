'use strict';

window.CS201Visuals = (() => {
  const { el, button } = CS201UI;
  const { bi: b } = CS201;
  const M = CS201Models;

  function stat(name, value) {
    return el('span', { class: 'stat' }, el('span', {}, name), el('b', { class: 'mono' }, String(value)));
  }
  const stats = (...items) => el('div', { class: 'stat-row' }, items);
  const sub = (title) => el('div', { class: 'diagram-label' }, title);
  const empty = (t, phrase = b('当前为空', 'Currently empty')) =>
    el('div', { class: 'diagram-empty' }, el('span', { 'aria-hidden': 'true' }, '∅'), t(phrase));

  function cells(values, marks = [], tags = {}, secondary = []) {
    return el('div', { class: 'diagram-scroll', data: { scroll: '' } },
      el('div', { class: 'cells' }, values.map((value, i) =>
        el('div', { class: 'cell-unit' },
          el('span', { class: 'cell-index mono' }, i),
          el('span', { class: 'cell mono' + (value == null ? ' vacant' : '') +
            (marks.includes(i) ? ' is-active' : '') + (secondary.includes(i) ? ' is-secondary' : ''),
          data: { index: i } }, value ?? '∅'),
          tags[i]?.length ? el('span', { class: 'cell-tag' }, tags[i].join(' / ')) : null))));
  }

  function sequence(label, values, arrows = false) {
    return el('div', { class: 'sequence-row' }, el('span', { class: 'sequence-label' }, label),
      el('div', { class: 'sequence-values' }, values.length
        ? values.map((value, i) => [
          arrows && i > 0 ? el('span', { class: 'sequence-arrow', 'aria-hidden': 'true' }, '→') : null,
          el('span', { class: 'sequence-item mono' }, value)
        ])
        : el('span', { class: 'sequence-none' }, '∅')));
  }

  function wire(x, y, tx, ty, extra = '') {
    const node = el('span', { class: 'tree-wire ' + extra, 'aria-hidden': 'true' });
    node.style.left = x + 'px';
    node.style.top = y + 'px';
    node.style.width = Math.hypot(tx - x, ty - y) + 'px';
    node.style.transform = 'rotate(' + Math.atan2(ty - y, tx - x) + 'rad)';
    return node;
  }

  function tree(root, frame, ui, variant = 'plain') {
    const { t, memory } = ui;
    if (!root) {
      memory.positions = new Map();
      return empty(t, b('树为空', 'The tree is empty'));
    }
    const places = [];
    function walk(node, parent, depth) {
      if (!node) return;
      walk(node.left, node, depth + 1);
      places.push({ node, parent, depth });
      walk(node.right, node, depth + 1);
    }
    walk(root, null, 0);
    const width = Math.max(310, places.length * 58 + 30);
    const height = Math.max(139, M.treeHeight(root) * 72 + 98);
    const index = new Map();
    places.forEach((p, i) => {
      p.x = (width - 32) * (i + 0.5) / places.length + 16;
      p.y = p.depth * 72 + 38;
      index.set(p.node.id, p);
    });
    const diagram = el('div', { class: 'tree-diagram', 'aria-label': t(b('树形图', 'Tree diagram')) });
    diagram.style.width = width + 'px';
    diagram.style.height = height + 'px';
    for (const p of places) {
      if (!p.parent) continue;
      const parent = index.get(p.parent.id);
      const hot = frame.marks.includes(p.node.id) && frame.marks.includes(p.parent.id);
      diagram.append(wire(parent.x, parent.y, p.x, p.y, hot ? 'hot' : ''));
    }
    const inspector = el('div', { class: 'node-inspector', role: 'status' },
      t(b('点选节点查看父节点、左右孩子和深度。', 'Select a node to inspect its parent, children, and depth.')));
    const shift = memory.positions;
    for (const p of places) {
      const n = p.node;
      const active = frame.marks.includes(n.id);
      const seen = frame.path?.includes(n.id) || frame.walk?.history.includes(n.key);
      const bf = M.treeHeight(n.left) - M.treeHeight(n.right);
      const metadata = variant === 'avl' ? 'BF ' + bf : variant === 'heap' ? 'i = ' + n.id : null;
      const node = button(String(n.key), () => {
        const heading = t(b('节点', 'Node')) + ' ' + n.key;
        const data = [
          t(b('父', 'parent')) + ' ' + (p.parent?.key ?? '∅'),
          t(b('左', 'left')) + ' ' + (n.left?.key ?? '∅'),
          t(b('右', 'right')) + ' ' + (n.right?.key ?? '∅'),
          t(b('深度', 'depth')) + ' ' + p.depth
        ];
        if (variant === 'avl') data.push('BF ' + bf);
        inspector.textContent = heading + '  ·  ' + data.join('  ·  ');
        diagram.querySelector('.is-inspected')?.classList.remove('is-inspected');
        node.classList.add('is-inspected');
      }, 'tree-node mono' + (active ? ' is-active' : '') + (seen ? ' is-seen' : '') +
        (!p.parent ? ' is-root' : '') + (variant === 'avl' && Math.abs(bf) > 1 ? ' is-unbalanced' : ''),
      { 'aria-label': t(b('节点 ', 'Node ')) + n.key, data: { node: n.id } });
      if (metadata) node.append(el('small', { class: 'node-sub' }, metadata));
      node.style.left = p.x + 'px';
      node.style.top = p.y + 'px';
      diagram.append(node);
      const previous = shift?.get(n.id);
      if (!ui.reducedMotion() && previous && (previous.x !== p.x || previous.y !== p.y)) {
        node.animate([{ transform: 'translate(' + (previous.x - p.x) + 'px,' + (previous.y - p.y) + 'px)' },
          { transform: 'translate(0,0)' }], { duration: 360, easing: 'cubic-bezier(.2,.7,.2,1)' });
      } else if (!ui.reducedMotion() && !previous && shift) {
        node.animate([{ opacity: 0, transform: 'translateY(-15px) scale(.86)' },
          { opacity: 1, transform: 'translateY(0) scale(1)' }], { duration: 340, easing: 'ease-out' });
      }
    }
    memory.positions = index;
    return el('div', { class: 'tree-panel' },
      el('div', { class: 'tree-scroll', data: { scroll: '' } }, diagram),
      inspector);
  }

  function chart(t, n, active, scale, memory) {
    const canvas = el('canvas', {
      role: 'img', 'aria-label': t(b('增长函数折线图。当前 n = ', 'Growth function plot. Current n = ')) + n
    });
    const ctx = canvas.getContext('2d');
    const chosen = M.curves.filter((_, i) => active.includes(i));
    const max = Math.max(1, ...chosen.map((f) => f.count(32)));
    const log = scale === 'log';
    const ceiling = log ? Math.max(1, Math.ceil(Math.log10(max))) : max;
    const format = (v) => v >= 100000 ? v.toExponential(1) : Number(v.toFixed(1)).toLocaleString('en-US');

    function draw() {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (!width || !height) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const left = width < 440 ? 56 : 70;
      const right = width - 18;
      const top = 16;
      const bottom = height - 42;
      const x = (i) => left + (i - 2) / 30 * (right - left);
      const y = (v) => bottom - (log ? Math.log10(v) : v) / ceiling * (bottom - top);
      ctx.font = '12px Consolas, monospace';
      ctx.textBaseline = 'middle';
      ctx.lineWidth = 1;
      for (let tick = 0; tick <= 5; tick++) {
        const value = ceiling * tick / 5;
        const yy = bottom - tick / 5 * (bottom - top);
        ctx.strokeStyle = '#e0dfef';
        ctx.beginPath();
        ctx.moveTo(left, yy);
        ctx.lineTo(right, yy);
        ctx.stroke();
        ctx.fillStyle = '#505d77';
        ctx.textAlign = 'right';
        ctx.fillText(log ? format(10 ** value) : format(value), left - 7, yy);
      }
      for (const i of [2, 8, 14, 20, 26, 32]) {
        ctx.textAlign = 'center';
        ctx.fillStyle = '#505d77';
        ctx.fillText(String(i), x(i), bottom + 16);
      }
      ctx.textAlign = 'right';
      ctx.fillText('n', right, bottom + 32);
      ctx.strokeStyle = '#ada8cf';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(x(n), top);
      ctx.lineTo(x(n), bottom);
      ctx.stroke();
      ctx.setLineDash([]);
      for (const f of chosen) {
        ctx.strokeStyle = f.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 2; i <= 32; i++) {
          if (i === 2) ctx.moveTo(x(i), y(f.count(i)));
          else ctx.lineTo(x(i), y(f.count(i)));
        }
        ctx.stroke();
        ctx.fillStyle = f.color;
        ctx.beginPath();
        ctx.arc(x(n), y(f.count(n)), 3.7, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    memory.chartObserver?.disconnect();
    memory.chartObserver = new ResizeObserver(draw);
    memory.chartObserver.observe(canvas);
    return el('div', { class: 'chart-scroll' }, canvas);
  }

  return { stat, stats, sub, empty, cells, sequence, wire, tree, chart };
})();
