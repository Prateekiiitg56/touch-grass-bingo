import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.6';
import { CENTER, NEGATIVES, poolFor, seasonFor } from './items.js';

// Open-weight CLIP (OpenAI CLIP ViT-B/32, ONNX export). Runs fully in the browser.
const MODEL = 'Xenova/clip-vit-base-patch32';
const MATCH_TARGET = 0.15; // tapped square accepted when it ranks top-2 with at least this score
const MATCH_ANY = 0.25; // "snap anything" needs a confident top-1

env.allowLocalModels = false;

const $ = (sel) => document.querySelector(sel);
const els = {
  grid: $('#grid'),
  route: $('#route'),
  map: $('#map'),
  colRefs: $('#col-refs'),
  rowRefs: $('#row-refs'),
  codeLabel: $('#code-label'),
  cardBtn: $('#card-btn'),
  setup: $('#setup'),
  kit: $('#kit'),
  code: $('#code'),
  size: $('#size'),
  season: $('#season'),
  hemisphere: $('#hemisphere'),
  deal: $('#deal'),
  kitBtn: $('#kit-btn'),
  kitStatus: $('#kit-status'),
  kitBar: $('#kit-bar'),
  snap: $('#snap'),
  share: $('#share'),
  file: $('#file'),
  meta: $('#meta'),
  dialog: $('#result'),
  resultImg: $('#result-img'),
  resultTitle: $('#result-title'),
  resultBody: $('#result-body'),
};

// ---------- persistence ----------

const store = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage full or blocked: the game still works for this session.
    }
  },
};

const WORDS = ['FERN', 'MOSS', 'OAK', 'WREN', 'PINE', 'BIRCH', 'OTTER', 'FINCH', 'ASPEN', 'CEDAR', 'HERON', 'MAPLE'];
function randomCode() {
  return `${WORDS[Math.floor(Math.random() * WORDS.length)]}-${Math.floor(10 + Math.random() * 90)}`;
}

const prefs = store.get('tg:prefs', { code: randomCode(), size: 3, season: 'auto', hemisphere: 'north' });

// ---------- deterministic card ----------
// Same code + season + size = same card on every phone. Group play needs no server.

function hash(str) {
  let h = 2166136261;
  for (const ch of str) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
}

function mulberry32(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function currentSeason() {
  return prefs.season === 'auto' ? seasonFor(new Date(), prefs.hemisphere) : prefs.season;
}

function dealCard(code, season, size) {
  const rand = mulberry32(hash(`${code.toUpperCase()}|${season}|${size}`));
  const pool = poolFor(season);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const cells = pool.slice(0, size * size - 1);
  cells.splice(Math.floor((size * size) / 2), 0, CENTER);
  return cells;
}

let card = [];
let cardKey = '';
let progress = { found: {}, startedAt: 0, bingoAt: 0 };

function loadCard() {
  const season = currentSeason();
  cardKey = `tg:card:${prefs.code.toUpperCase()}|${season}|${prefs.size}`;
  card = dealCard(prefs.code, season, prefs.size);
  progress = store.get(cardKey, null) ?? { found: {}, startedAt: Date.now(), bingoAt: 0 };
  store.set(cardKey, progress);
  drawnLines = new Set(completedLines().map((l) => l.join('-')));
  render();
}

// ---------- bingo logic ----------

function lines(size) {
  const out = [];
  for (let r = 0; r < size; r++) out.push([...Array(size)].map((_, c) => r * size + c));
  for (let c = 0; c < size; c++) out.push([...Array(size)].map((_, r) => r * size + c));
  out.push([...Array(size)].map((_, i) => i * size + i));
  out.push([...Array(size)].map((_, i) => i * size + (size - 1 - i)));
  return out;
}

function completedLines() {
  return lines(prefs.size).filter((line) => line.every((i) => progress.found[card[i].id]));
}

// ---------- rendering ----------

function render() {
  els.code.value = prefs.code;
  els.size.value = String(prefs.size);
  els.season.value = prefs.season;
  els.hemisphere.value = prefs.hemisphere;

  const n = prefs.size;
  els.codeLabel.textContent = prefs.code.toUpperCase();
  els.map.style.setProperty('--n', n);
  els.grid.dataset.n = n;
  // Map-style grid references, so a group can call out "got B2".
  els.colRefs.replaceChildren(...[...Array(n)].map((_, c) => Object.assign(document.createElement('span'), { textContent: String.fromCharCode(65 + c) })));
  els.rowRefs.replaceChildren(...[...Array(n)].map((_, r) => Object.assign(document.createElement('span'), { textContent: r + 1 })));

  els.grid.replaceChildren(
    ...card.map((item, i) => {
      const hit = progress.found[item.id];
      const ref = `${String.fromCharCode(65 + (i % n))}${Math.floor(i / n) + 1}`;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cell' + (hit ? ' found' : '') + (item === CENTER ? ' center' : '');
      btn.setAttribute('aria-label', `${ref}, ${item.label}${hit ? ', found' : ', take a photo'}`);
      btn.innerHTML = hit
        ? `<img src="${hit.thumb}" alt=""><span class="label">${item.label}</span>`
        : `<span class="label">${item.label}</span>`;
      btn.addEventListener('click', () => capture(item));
      return btn;
    }),
  );
  drawRoutes(n);

  const count = Object.keys(progress.found).filter((id) => card.some((c) => c.id === id)).length;
  const bingo = completedLines().length;
  const mins = Math.max(1, Math.round(((progress.bingoAt || Date.now()) - progress.startedAt) / 60000));
  const season = currentSeason();
  els.meta.textContent = bingo
    ? `Bingo after ${mins} minute${mins > 1 ? 's' : ''} outside. ${count} of ${card.length} found.`
    : `${season[0].toUpperCase()}${season.slice(1)} card. ${count} of ${card.length} found.`;
  els.share.hidden = count === 0;
}

// Completed lines are drawn as an orange trail-blaze route across the card.
// Only a line completed since the last render animates in.
let drawnLines = new Set();

function drawRoutes(n) {
  const done = completedLines();
  const pad = 0.28;
  els.route.setAttribute('viewBox', `0 0 ${n} ${n}`);
  els.route.replaceChildren(
    ...done.map((line) => {
      const key = line.join('-');
      const [a, b] = [line[0], line[line.length - 1]];
      const p = (i) => [(i % n) + 0.5, Math.floor(i / n) + 0.5];
      let [x1, y1] = p(a), [x2, y2] = p(b);
      const len = Math.hypot(x2 - x1, y2 - y1);
      const [dx, dy] = [((x2 - x1) / len) * pad, ((y2 - y1) / len) * pad];
      const el = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      Object.entries({ x1: x1 - dx, y1: y1 - dy, x2: x2 + dx, y2: y2 + dy }).forEach(([k, v]) => el.setAttribute(k, v));
      if (!drawnLines.has(key)) el.classList.add('new');
      return el;
    }),
  );
  drawnLines = new Set(done.map((l) => l.join('-')));
}

// ---------- model ----------

let classifierPromise = null;
const fileProgress = new Map();

function onProgress(p) {
  if (p.status === 'progress' && p.total) {
    fileProgress.set(p.file, { loaded: p.loaded, total: p.total });
    let loaded = 0, total = 0;
    for (const f of fileProgress.values()) { loaded += f.loaded; total += f.total; }
    const pct = Math.round((loaded / total) * 100);
    els.kitBar.value = pct;
    els.kitStatus.textContent = `Downloading photo checker: ${pct}% of ${(total / 1e6).toFixed(0)} MB`;
  }
}

function getClassifier() {
  if (!classifierPromise) {
    els.kitBar.hidden = false;
    els.kitStatus.textContent = 'Starting photo checker';
    classifierPromise = pipeline('zero-shot-image-classification', MODEL, { dtype: 'q8', progress_callback: onProgress })
      .then((clf) => {
        store.set('tg:kit', true);
        els.kitBar.hidden = true;
        els.kitBtn.hidden = true;
        els.kit.classList.add('ready');
        els.kitStatus.textContent = 'Photo checker saved on this phone. The game now works with no signal.';
        return clf;
      })
      .catch((err) => {
        classifierPromise = null;
        els.kitBar.hidden = true;
        els.kitBtn.hidden = false;
        els.kitStatus.textContent = navigator.onLine
          ? `Photo checker did not load (${err.message}). Check your connection and tap Download again.`
          : 'No signal, and the photo checker is not on this phone yet. Download it next time you have Wi-Fi.';
        throw err;
      });
  }
  return classifierPromise;
}

// ---------- capture + judge ----------

let pendingTarget = null;

function capture(target) {
  if (target && progress.found[target.id]) return;
  pendingTarget = target;
  els.file.value = '';
  els.file.click();
}

async function resize(file, max) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas;
}

function squareThumb(canvas, size) {
  const s = Math.min(canvas.width, canvas.height);
  const out = document.createElement('canvas');
  out.width = out.height = size;
  out.getContext('2d').drawImage(canvas, (canvas.width - s) / 2, (canvas.height - s) / 2, s, s, 0, 0, size, size);
  return out.toDataURL('image/jpeg', 0.72);
}

// Score against the whole season pool, not just this card. Otherwise a red leaf
// "wins" as the yellow leaf simply because it is the closest square on the card.
function candidates() {
  return [...poolFor(currentSeason()), CENTER, ...NEGATIVES.map((n) => ({ ...n, negative: true }))];
}

function judge(results, target) {
  const byPrompt = new Map(candidates().map((x) => [x.prompt, x]));
  const top = byPrompt.get(results[0].label);
  const topScore = results[0].score;
  const targetRank = target ? results.findIndex((r) => r.label === target.prompt) : -1;
  const targetScore = targetRank >= 0 ? results[targetRank].score : 0;

  if (target && (top === target || (!top.negative && targetRank === 1 && targetScore >= MATCH_TARGET))) {
    return { kind: 'found', item: target, score: targetScore };
  }
  if (top.negative) return { kind: top.id === 'screen' ? 'screen' : 'nope', guess: top };
  if (!card.includes(top)) return { kind: 'off-card', guess: top };
  if (progress.found[top.id]) return { kind: 'dupe', item: top };
  if (top === target || topScore >= MATCH_ANY) return { kind: 'found', item: top, score: topScore, bonus: !!target };
  return { kind: 'nope', guess: top };
}

const NEGATIVE_TEXT = {
  indoors: 'That looks like indoors. The grass is outside.',
  selfie: 'Nice face. Now point the camera at nature.',
  text: 'That looks like a page of text. Go outside.',
  street: 'That looks like a street. Find something growing.',
};

async function onPhoto() {
  const file = els.file.files?.[0];
  if (!file) return;
  const target = pendingTarget;

  const canvas = await resize(file, 512);
  const thumb = squareThumb(canvas, 400);
  const preview = canvas.toDataURL('image/jpeg', 0.85);
  showResult(preview, 'Checking your photo', 'This happens on your phone. The photo is not uploaded.');

  let results;
  try {
    const clf = await getClassifier();
    const labels = candidates().map((c) => c.prompt);
    results = await clf(canvas.toDataURL('image/jpeg', 0.9), labels, { hypothesis_template: '{}' });
  } catch (err) {
    showResult(preview, 'Could not check that photo', els.kitStatus.textContent || err.message);
    return;
  }

  const verdict = judge(results, target);
  const before = completedLines().length;

  if (verdict.kind === 'found') {
    progress.found[verdict.item.id] = { thumb, at: Date.now() };
    const after = completedLines().length;
    if (after > before && !progress.bingoAt) progress.bingoAt = Date.now();
    store.set(cardKey, progress);
    render();
    const pct = Math.round(verdict.score * 100);
    if (after > before) {
      showResult(preview, 'Bingo', `${verdict.item.label} completes a line. Put the phone away and enjoy where you are.`, true);
    } else {
      showResult(preview, verdict.item.label, verdict.bonus
        ? `That is not ${target.label.toLowerCase()}, but it is ${verdict.item.label.toLowerCase()} (${pct}% match). Marked that square instead.`
        : `Square marked (${pct}% match). Phone back in your pocket.`);
    }
  } else if (verdict.kind === 'screen') {
    showResult(preview, 'That is a screen', 'You cannot touch grass through a monitor. Go outside and try again.');
  } else if (verdict.kind === 'off-card') {
    showResult(preview, verdict.guess.label, 'Good find, but it is not on this card. Keep looking.');
  } else if (verdict.kind === 'dupe') {
    showResult(preview, 'Already found', `You already have ${verdict.item.label.toLowerCase()}. Look for another square.`);
  } else {
    const hint = NEGATIVE_TEXT[verdict.guess.id] ?? `This looks more like ${verdict.guess.label?.toLowerCase() ?? 'something else'}. Get closer, or try a clearer angle.`;
    showResult(preview, target ? `Not ${target.label.toLowerCase()} yet` : 'No match on your card', hint);
  }
}

function showResult(img, title, body, celebrate = false) {
  els.resultImg.src = img;
  els.resultTitle.textContent = title;
  els.resultBody.textContent = body;
  els.dialog.classList.toggle('celebrate', celebrate);
  if (!els.dialog.open) els.dialog.showModal();
}

// ---------- share card ----------

async function loadImage(src) {
  const img = new Image();
  img.src = src;
  await img.decode();
  return img;
}

async function shareCard() {
  // Same map language as the page: white paper, woodland cells, ink neatline, blaze route.
  await document.fonts.ready;
  const n = prefs.size;
  const W = 1080, pad = 72, gap = 10, top = 250, inset = 14;
  const cell = (W - pad * 2 - inset * 2 - gap * (n - 1)) / n;
  const boardH = n * cell + (n - 1) * gap + inset * 2;
  const H = top + boardH + 170;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d');
  const font = (w, size, stretch = 'normal') => `${stretch} ${w} ${size}px Archivo, system-ui, sans-serif`;
  g.fillStyle = '#ffffff';
  g.fillRect(0, 0, W, H);
  g.fillStyle = '#1a1a1a';
  g.font = font(800, 96, 'extra-condensed');
  g.fillText('Touch grass bingo', pad, 150);
  g.fillStyle = '#5d625a';
  g.font = font(500, 34);
  g.fillText(els.meta.textContent, pad, 205);

  g.strokeStyle = '#1a1a1a';
  g.lineWidth = 4;
  g.strokeRect(pad, top, W - pad * 2, boardH);
  for (let i = 0; i < card.length; i++) {
    const x = pad + inset + (i % n) * (cell + gap);
    const y = top + inset + Math.floor(i / n) * (cell + gap);
    const hit = progress.found[card[i].id];
    if (hit) {
      g.drawImage(await loadImage(hit.thumb), x, y, cell, cell);
    } else {
      g.fillStyle = '#d9e8c4';
      g.fillRect(x, y, cell, cell);
      g.fillStyle = '#2c4a1e';
      g.font = font(700, n === 3 ? 38 : 24, 'semi-condensed');
      const words = card[i].label.split(' ');
      const lineH = n === 3 ? 42 : 27;
      const rows = [];
      for (const w of words) {
        const last = rows[rows.length - 1];
        if (last && g.measureText(`${last} ${w}`).width < cell - 28) rows[rows.length - 1] = `${last} ${w}`;
        else rows.push(w);
      }
      rows.forEach((r, k) => g.fillText(r, x + 14, y + cell - 16 - (rows.length - 1 - k) * lineH));
    }
  }

  const step = cell + gap;
  g.strokeStyle = '#f2600c';
  g.lineWidth = cell * 0.11;
  g.lineCap = 'round';
  for (const line of completedLines()) {
    const p = (i) => [pad + inset + (i % n) * step + cell / 2, top + inset + Math.floor(i / n) * step + cell / 2];
    const [[x1, y1], [x2, y2]] = [p(line[0]), p(line[line.length - 1])];
    g.beginPath();
    g.moveTo(x1, y1);
    g.lineTo(x2, y2);
    g.stroke();
  }

  g.fillStyle = '#5d625a';
  g.font = font(500, 30);
  g.fillText(`Play this card with code ${prefs.code.toUpperCase()}.`, pad, H - 92);
  g.fillText('Checked on the phone by an open-weight model. Nothing uploaded.', pad, H - 50);

  const blob = await new Promise((r) => c.toBlob(r, 'image/png'));
  const file = new File([blob], 'touch-grass-bingo.png', { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Touch Grass Bingo', text: `Play my card: code ${prefs.code.toUpperCase()}` });
      return;
    } catch (err) {
      if (err.name === 'AbortError') return;
    }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = file.name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

// ---------- wiring ----------

els.deal.addEventListener('click', () => {
  prefs.code = (els.code.value.trim() || randomCode()).toUpperCase().slice(0, 16);
  prefs.size = Number(els.size.value);
  prefs.season = els.season.value;
  prefs.hemisphere = els.hemisphere.value;
  store.set('tg:prefs', prefs);
  loadCard();
  els.grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
els.kitBtn.addEventListener('click', () => getClassifier().catch(() => {}));
els.snap.addEventListener('click', () => capture(null));
els.share.addEventListener('click', shareCard);
els.file.addEventListener('change', onPhoto);
$('#result-close').addEventListener('click', () => els.dialog.close());

els.cardBtn.addEventListener('click', () => {
  els.setup.open = true;
  els.setup.scrollIntoView({ behavior: 'smooth', block: 'start' });
  els.code.focus({ preventScroll: true });
});

if (store.get('tg:kit', false)) {
  els.kitBtn.hidden = true;
  getClassifier().catch(() => {});
}

// Group invite link: ?code=FERN-42
const shared = new URLSearchParams(location.search).get('code');
if (shared) prefs.code = shared.toUpperCase().slice(0, 16);
store.set('tg:prefs', prefs);
loadCard();

if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
