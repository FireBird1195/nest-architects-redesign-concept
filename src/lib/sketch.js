// Build-time "hand-drawn" stroke generator.
// Every straight line is rendered as two slightly different pen passes that
// overshoot their corners, echoing the loose, twig-like linework of the
// studio's existing house mark. Deterministic (seeded) so builds are stable.

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (n) => Math.round(n * 10) / 10;

function stroke(r, x1, y1, x2, y2, o) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const over = Math.min(o.over, len * 0.12);
  const j = () => (r() - 0.5) * 2 * o.jitter;
  const a = r() * over;
  const b = r() * over;
  const sx = x1 - ux * a + j();
  const sy = y1 - uy * a + j();
  const ex = x2 + ux * b + j();
  const ey = y2 + uy * b + j();
  const bow = (r() - 0.5) * 2 * Math.min(o.bow, len * 0.03);
  const mx = (sx + ex) / 2 - uy * bow;
  const my = (sy + ey) / 2 + ux * bow;
  return `M${f(sx)} ${f(sy)}Q${f(mx)} ${f(my)} ${f(ex)} ${f(ey)}`;
}

function ring(r, cx, cy, rad, o) {
  const n = Math.max(14, Math.round(rad * 0.9));
  const start = r() * Math.PI * 2;
  const pts = [];
  for (let i = 0; i <= n + 2; i++) {
    const t = start + (i / n) * Math.PI * 2;
    const rr = rad + (r() - 0.5) * o.jitter * 1.4 + (i / n) * o.jitter * 0.8;
    pts.push([cx + Math.cos(t) * rr, cy + Math.sin(t) * rr]);
  }
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2;
    const my = (pts[i][1] + pts[i + 1][1]) / 2;
    d += `Q${f(pts[i][0])} ${f(pts[i][1])} ${f(mx)} ${f(my)}`;
  }
  return d;
}

/**
 * prims: array of
 *   ['l', x1, y1, x2, y2]        line
 *   ['r', x, y, w, h]            rectangle
 *   ['p', [[x,y], ...]]          polyline
 *   ['c', cx, cy, r]             circle
 *   ['t', x, y, 'label', anchor] annotation text
 * A trailing options object may set { tone: 'teal' | 'ink', single: true }.
 */
export function render(prims, seed = 1, opts = {}) {
  const o = { over: 9, jitter: 1.3, bow: 3, ...opts };
  const r = rng(seed);
  const paths = [];
  const texts = [];
  const seg = (x1, y1, x2, y2, m) => {
    const tone = m.tone;
    paths.push({ d: stroke(r, x1, y1, x2, y2, o), cls: tone === 'teal' ? 'b' : 'a' });
    if (!m.single && r() < 0.62) {
      const second = tone ? tone === 'teal' : r() < 0.45;
      paths.push({
        d: stroke(r, x1, y1, x2, y2, { ...o, jitter: o.jitter * 1.9 }),
        cls: second ? 'b' : 'a',
      });
    }
  };
  for (const p of prims) {
    const last = p[p.length - 1];
    const m = last && typeof last === 'object' && !Array.isArray(last) ? last : {};
    switch (p[0]) {
      case 'l':
        seg(p[1], p[2], p[3], p[4], m);
        break;
      case 'r': {
        const [, x, y, w, h] = p;
        seg(x, y, x + w, y, m);
        seg(x + w, y, x + w, y + h, m);
        seg(x + w, y + h, x, y + h, m);
        seg(x, y + h, x, y, m);
        break;
      }
      case 'p': {
        const pts = p[1];
        for (let i = 0; i < pts.length - 1; i++) seg(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], m);
        break;
      }
      case 'c':
        paths.push({ d: ring(r, p[1], p[2], p[3], o), cls: m.tone === 'teal' ? 'b' : 'a' });
        break;
      case 't':
        texts.push({ x: p[1], y: p[2], s: p[3], anchor: typeof p[4] === 'string' ? p[4] : 'start' });
        break;
    }
  }
  return { paths, texts };
}

// Small helpers for repeated motifs -----------------------------------------

/** A leafy sprig, like the ones beside the house in the studio's mark. */
export const sprig = (x, y, h = 40, lean = 1) => [
  ['l', x, y, x + 3 * lean, y - h, { tone: 'teal', single: true }],
  ['l', x + 1 * lean, y - h * 0.34, x + 13 * lean, y - h * 0.58, { tone: 'teal', single: true }],
  ['l', x + 2 * lean, y - h * 0.56, x - 10 * lean, y - h * 0.8, { tone: 'teal', single: true }],
  ['l', x + 2.5 * lean, y - h * 0.76, x + 11 * lean, y - h * 0.98, { tone: 'teal', single: true }],
];

const pendant = (x, top, drop, r = 6) => [
  ['l', x, top, x, top + drop, { single: true }],
  ['c', x, top + drop + r, r, { tone: 'teal' }],
];

// One-point perspective room shell on a 400 x 300 plate.
const shell = (ceiling = true) => [
  ['r', 120, 78, 160, 130],
  ['l', 120, 208, 8, 292],
  ['l', 280, 208, 392, 292],
  ...(ceiling
    ? [
        ['l', 120, 78, 8, 8],
        ['l', 280, 78, 392, 8],
      ]
    : []),
];

// Drawings ------------------------------------------------------------------

export const drawings = {
  // Hero: the house from the mark, opened up as a section.
  section: {
    box: [800, 620],
    seed: 11,
    opts: { over: 16, jitter: 1.7, bow: 4 },
    prims: [
      ['l', 20, 520, 780, 520],
      ['l', 180, 228, 180, 520],
      ['l', 620, 228, 620, 520],
      ['p', [[150, 250], [400, 86], [650, 250]]],
      ['l', 180, 372, 470, 372],
      ['l', 330, 372, 330, 520],
      ['l', 470, 300, 470, 520],
      // door
      ['r', 372, 432, 52, 88],
      ['c', 414, 478, 3],
      // stair in the double-height lobby
      ['p', [[484, 520], [484, 498], [506, 498], [506, 476], [528, 476], [528, 454], [550, 454], [550, 432], [572, 432], [572, 410], [594, 410], [594, 388], [620, 388]]],
      ['l', 484, 470, 610, 346, { tone: 'teal' }],
      // lobby light
      ['l', 545, 172, 545, 262, { single: true }],
      ['c', 545, 280, 17, { tone: 'teal' }],
      ['l', 533, 300, 529, 316, { single: true }],
      ['l', 545, 302, 545, 320, { single: true }],
      ['l', 557, 300, 561, 316, { single: true }],
      // upper window
      ['r', 214, 270, 84, 62],
      ['l', 256, 270, 256, 332, { single: true }],
      // bed upstairs
      ['r', 352, 342, 96, 30],
      ['l', 352, 342, 352, 314],
      ['l', 352, 316, 380, 316, { single: true }],
      // sofa and table downstairs
      ['p', [[204, 520], [204, 470], [220, 470], [220, 492], [300, 492], [300, 520]]],
      ['l', 240, 492, 240, 520, { single: true }],
      ['l', 270, 492, 270, 520, { single: true }],
      ...pendant(262, 372, 44, 8),
      // terrace pergola and swing
      ['l', 62, 404, 62, 520],
      ['l', 150, 404, 150, 520],
      ['l', 44, 404, 180, 404],
      ['l', 86, 404, 86, 470, { single: true }],
      ['l', 128, 404, 128, 470, { single: true }],
      ['l', 76, 470, 138, 470],
      ['l', 76, 470, 76, 452, { single: true }],
      // tree
      ['l', 706, 520, 702, 404],
      ['c', 704, 352, 54, { tone: 'teal' }],
      ['l', 703, 440, 726, 404, { single: true }],
      ...sprig(38, 520, 46, 1),
      ...sprig(654, 520, 38, -1),
      ...sprig(760, 520, 30, 1),
      // dimension string
      ['l', 180, 560, 620, 560, { single: true }],
      ['l', 180, 552, 180, 568, { single: true }],
      ['l', 470, 552, 470, 568, { single: true }],
      ['l', 620, 552, 620, 568, { single: true }],
      ['t', 325, 584, 'rooms for living', 'middle'],
      ['t', 545, 584, 'a lobby with height', 'middle'],
      ['t', 97, 392, 'a swing outdoors', 'middle'],
    ],
  },

  // Project plates (400 x 300) ---------------------------------------------
  lobby: {
    box: [400, 300],
    seed: 21,
    prims: [
      ...shell(),
      // mirrored ceiling panels
      ['l', 64, 43, 336, 43, { tone: 'teal', single: true }],
      // stair climbing the right wall
      ['p', [[392, 292], [356, 264], [356, 244], [332, 226], [332, 208], [310, 192], [310, 174], [292, 160], [292, 142], [280, 132]]],
      ['l', 372, 228, 284, 100, { tone: 'teal' }],
      // butterflies on drops
      ...[150, 176, 200, 226, 250].flatMap((x, i) => {
        const y = 96 + ((i * 37) % 52);
        return [
          ['l', x, 30 + (i % 2) * 10, x, y, { single: true }],
          ['p', [[x, y + 2], [x - 11, y - 7], [x - 9, y + 9], [x, y + 2], [x + 11, y - 7], [x + 9, y + 9], [x, y + 2]], { tone: 'teal', single: true }],
        ];
      }),
      // artwork on the back wall, console beneath
      ['r', 150, 120, 46, 58],
      ['l', 140, 196, 206, 196],
      ['l', 146, 196, 146, 208, { single: true }],
      ['l', 200, 196, 200, 208, { single: true }],
    ],
  },
  living: {
    box: [400, 300],
    seed: 31,
    prims: [
      ...shell(),
      // floating TV unit on the back wall
      ['r', 138, 122, 72, 40],
      ['l', 132, 178, 216, 178],
      ['l', 132, 184, 216, 184, { single: true }],
      // pivoting partition, mid-room
      ['r', 248, 96, 14, 150],
      ['l', 255, 96, 255, 246, { tone: 'teal', single: true }],
      ['p', [[272, 250], [300, 262], [308, 246]], { tone: 'teal', single: true }],
      ['p', [[238, 252], [212, 262], [206, 247]], { tone: 'teal', single: true }],
      // sofa, foreground
      ['p', [[30, 290], [30, 232], [50, 232], [50, 252], [170, 252], [170, 290]]],
      ['l', 90, 252, 90, 290, { single: true }],
      ['l', 130, 252, 130, 290, { single: true }],
      // low table
      ['r', 196, 262, 54, 14],
      // dining beyond the partition
      ['r', 300, 222, 60, 8],
      ['l', 308, 230, 308, 262, { single: true }],
      ['l', 352, 230, 352, 262, { single: true }],
      ...pendant(330, 20, 120, 9),
    ],
  },
  kitchen: {
    box: [400, 300],
    seed: 41,
    prims: [
      ...shell(),
      // wall units
      ['l', 120, 122, 280, 122],
      ['l', 120, 166, 280, 166],
      ['l', 160, 78, 160, 122, { single: true }],
      ['l', 200, 78, 200, 122, { single: true }],
      ['l', 240, 78, 240, 122, { single: true }],
      ['l', 174, 166, 174, 208, { single: true }],
      ['l', 226, 166, 226, 208, { single: true }],
      // island
      ['p', [[92, 236], [308, 236], [330, 264], [70, 264], [92, 236]]],
      ['l', 70, 264, 70, 296],
      ['l', 330, 264, 330, 296],
      ['c', 250, 249, 9, { tone: 'teal' }],
      // three pendants over the island
      ...pendant(140, 18, 96, 8),
      ...pendant(200, 14, 100, 8),
      ...pendant(260, 18, 96, 8),
      // stools
      ['l', 120, 280, 120, 298, { single: true }],
      ['l', 108, 280, 134, 280, { tone: 'teal' }],
      ['l', 200, 280, 200, 298, { single: true }],
      ['l', 188, 280, 214, 280, { tone: 'teal' }],
    ],
  },
  bedroom: {
    box: [400, 300],
    seed: 51,
    prims: [
      ...shell(),
      // carved headboard
      ['p', [[146, 208], [146, 138], [166, 116], [200, 106], [234, 116], [254, 138], [254, 208]]],
      ['p', [[160, 208], [160, 146], [200, 124], [240, 146], [240, 208]], { tone: 'teal', single: true }],
      // bed
      ['p', [[146, 208], [112, 262], [288, 262], [254, 208]]],
      ['l', 112, 262, 112, 284],
      ['l', 288, 262, 288, 284],
      ['l', 112, 284, 288, 284],
      ['l', 138, 222, 262, 222, { single: true }],
      // vintage mirror by the entrance, left wall
      ['c', 62, 148, 24, { tone: 'teal' }],
      ['c', 62, 148, 18],
      // window and seat for north light, right wall
      ['p', [[310, 96], [366, 62], [366, 218], [310, 196], [310, 96]]],
      ['l', 338, 79, 338, 207, { single: true }],
      ['p', [[302, 214], [372, 250], [372, 272], [302, 232], [302, 214]], { tone: 'teal' }],
    ],
  },
  elders: {
    box: [400, 300],
    seed: 61,
    prims: [
      ...shell(),
      // louvered timber strips over a concrete wall
      ...[132, 144, 156, 168, 180].map((x) => ['l', x, 78, x, 208, { single: true }]),
      // concrete panel joints
      ['l', 192, 122, 280, 122, { tone: 'teal', single: true }],
      ['l', 192, 166, 280, 166, { tone: 'teal', single: true }],
      ['l', 236, 78, 236, 208, { tone: 'teal', single: true }],
      // metal wall piece
      ['c', 226, 140, 15],
      ['l', 212, 140, 240, 140, { single: true }],
      ['l', 226, 126, 226, 154, { single: true }],
      // bed, side on
      ['p', [[150, 208], [118, 258], [300, 258], [268, 208]]],
      ['l', 118, 258, 118, 280],
      ['l', 300, 258, 300, 280],
      ['l', 118, 280, 300, 280],
      // bedside and lamp
      ['r', 318, 232, 34, 34],
      ['l', 335, 232, 335, 206, { single: true }],
      ['p', [[322, 206], [328, 188], [342, 188], [348, 206], [322, 206]], { tone: 'teal' }],
    ],
  },
  terrace: {
    box: [400, 300],
    seed: 71,
    prims: [
      ...shell(false),
      // carved jali screen across the back wall
      ...[146, 172, 198, 224, 250].map((x) => ['l', x, 78, x, 208, { single: true }]),
      ...[104, 130, 156, 182].map((y) => ['l', 120, y, 280, y, { single: true }]),
      ...[133, 159, 185, 211, 237, 263].flatMap((x) => [117, 169].map((y) => ['c', x, y, 6, { tone: 'teal' }])),
      // swing frame and seat
      ['l', 70, 40, 330, 40],
      ['l', 150, 40, 150, 226, { single: true }],
      ['l', 250, 40, 250, 226, { single: true }],
      ['r', 136, 226, 128, 16],
      ['l', 136, 226, 136, 196],
      ['l', 264, 226, 264, 196],
      ['l', 136, 198, 264, 198, { single: true }],
      // pots
      ['p', [[36, 268], [42, 292], [66, 292], [72, 268], [36, 268]]],
      ...sprig(54, 268, 44, 1),
      ['p', [[330, 262], [336, 288], [362, 288], [368, 262], [330, 262]]],
      ...sprig(349, 262, 52, -1),
      // sun
      ['c', 346, 46, 16, { tone: 'teal' }],
    ],
  },

  // Work-index vignettes (200 x 200) ---------------------------------------
  vHouse: {
    box: [200, 200],
    seed: 81,
    opts: { over: 7, jitter: 1.1, bow: 2 },
    prims: [
      ['l', 14, 168, 186, 168],
      ['l', 52, 86, 52, 168],
      ['l', 148, 86, 148, 168],
      ['p', [[40, 94], [100, 40], [160, 94]]],
      ['r', 88, 124, 24, 44],
      ['r', 62, 102, 18, 18],
      ['r', 120, 102, 18, 18],
      ...sprig(28, 168, 30, 1),
      ...sprig(170, 168, 26, -1),
    ],
  },
  vPlan: {
    box: [200, 200],
    seed: 82,
    opts: { over: 7, jitter: 1.1, bow: 2 },
    prims: [
      ['r', 30, 36, 140, 128],
      ['l', 100, 36, 100, 96],
      ['l', 30, 96, 84, 96],
      ['l', 116, 96, 170, 96],
      ['l', 78, 96, 78, 164],
      ['l', 132, 110, 132, 164],
      ['r', 40, 46, 30, 22, { tone: 'teal' }],
      ['r', 128, 46, 30, 22, { tone: 'teal' }],
      ['r', 40, 130, 26, 22, { tone: 'teal' }],
      ['r', 140, 128, 22, 26, { tone: 'teal' }],
      ['c', 104, 132, 11],
    ],
  },
  vShop: {
    box: [200, 200],
    seed: 83,
    opts: { over: 7, jitter: 1.1, bow: 2 },
    prims: [
      ['l', 14, 168, 186, 168],
      ['r', 34, 50, 132, 118],
      ['l', 34, 76, 166, 76],
      ['l', 118, 76, 118, 168],
      ['l', 142, 76, 142, 168, { single: true }],
      // rail with garments in the window
      ['l', 44, 92, 108, 92, { single: true }],
      ...[54, 76, 98].flatMap((x) => [
        ['p', [[x, 92], [x - 9, 104], [x - 7, 146], [x + 7, 146], [x + 9, 104], [x, 92]], { tone: 'teal', single: true }],
      ]),
      ['l', 60, 63, 140, 63, { tone: 'teal' }],
    ],
  },
  vFlat: {
    box: [200, 200],
    seed: 84,
    opts: { over: 7, jitter: 1.1, bow: 2 },
    prims: [
      ['l', 14, 168, 186, 168],
      ['r', 36, 96, 96, 72],
      ['l', 28, 96, 140, 96],
      ['r', 78, 58, 54, 38],
      ['l', 70, 58, 140, 58],
      ['r', 50, 126, 20, 42],
      ['r', 86, 112, 32, 24],
      ['r', 92, 68, 26, 18],
      ['l', 158, 168, 156, 112],
      ['c', 157, 92, 22, { tone: 'teal' }],
    ],
  },
  vVilla: {
    box: [200, 200],
    seed: 85,
    opts: { over: 7, jitter: 1.1, bow: 2 },
    prims: [
      ['l', 14, 168, 186, 168],
      ['r', 30, 70, 70, 98],
      ['r', 100, 104, 70, 64],
      ['l', 22, 70, 108, 70],
      ['l', 100, 104, 178, 104],
      ['r', 44, 84, 42, 30, { tone: 'teal' }],
      ['r', 56, 132, 20, 36],
      ['l', 114, 118, 156, 118, { single: true }],
      ['l', 114, 118, 114, 152, { single: true }],
      ['l', 156, 118, 156, 152, { single: true }],
      ['l', 114, 152, 156, 152, { single: true }],
      ['l', 135, 118, 135, 152, { single: true }],
      ...sprig(180, 168, 30, -1),
    ],
  },
};
