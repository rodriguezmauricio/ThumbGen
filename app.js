// ============================================================
// ThumbGen - Fully Customizable Thumbnail Generator
// ============================================================

const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');

// ---- State ----
const state = {
  width: 1280,
  height: 720,
  zoom: 1,
  bg: { type: 'solid', color: '#1a1a2e' },
  gradient: { color1: '#667eea', color2: '#764ba2', angle: 135, type: 'linear' },
  bgImage: { img: null, fit: 'cover', blur: 0, brightness: 100, overlayColor: '#000000', overlayOpacity: 0 },
  pattern: { type: 'dots', bg: '#1a1a2e', fg: '#ffffff', scale: 20, opacity: 30 },
  layers: [],       // { id, type: 'text'|'image'|'shape', ...props, visible, locked }
  selectedLayer: null,
  effects: { vignette: 0, noise: 0, borderWidth: 0, borderColor: '#ffffff', borderRadius: 0 },
  history: [],
  historyIndex: -1,
  dragging: null,
  dragStart: null,
  resizing: null,
};

let layerIdCounter = 0;
function newId() { return ++layerIdCounter; }

// ---- Color / Gradient Presets ----
const colorPresets = [
  '#1a1a2e','#16213e','#0f3460','#e94560','#533483','#2c2c54',
  '#000000','#ffffff','#ff6b6b','#feca57','#48dbfb','#1dd1a1',
  '#ff9ff3','#54a0ff','#5f27cd','#01a3a4','#f368e0','#ee5a24',
  '#0abde3','#10ac84','#222f3e','#c8d6e5','#341f97','#ff6348',
];

const gradientPresets = [
  ['#667eea','#764ba2'],['#f093fb','#f5576c'],['#4facfe','#00f2fe'],
  ['#43e97b','#38f9d7'],['#fa709a','#fee140'],['#a18cd1','#fbc2eb'],
  ['#ffecd2','#fcb69f'],['#ff9a9e','#fecfef'],['#667eea','#f093fb'],
  ['#0c3483','#a2b6df'],['#11998e','#38ef7d'],['#fc5c7d','#6a82fb'],
  ['#e74c3c','#000000'],['#1a1a2e','#e94560'],['#0f0c29','#302b63'],
];

// ---- Init ----
function init() {
  renderColorPresets();
  renderGradientPresets();
  renderTemplates();
  setupEventListeners();
  pushHistory();
  render();
}

// ---- Render Color Presets ----
function renderColorPresets() {
  const container = document.getElementById('bgColorPresets');
  container.innerHTML = '';
  colorPresets.forEach(c => {
    const div = document.createElement('div');
    div.className = 'color-swatch';
    div.style.background = c;
    div.onclick = () => { document.getElementById('bgColor').value = c; state.bg.color = c; render(); };
    container.appendChild(div);
  });
}

function renderGradientPresets() {
  const container = document.getElementById('gradientPresets');
  container.innerHTML = '';
  gradientPresets.forEach(([c1, c2]) => {
    const div = document.createElement('div');
    div.className = 'gradient-swatch';
    div.style.background = `linear-gradient(135deg, ${c1}, ${c2})`;
    div.onclick = () => {
      document.getElementById('gradColor1').value = c1;
      document.getElementById('gradColor2').value = c2;
      state.gradient.color1 = c1;
      state.gradient.color2 = c2;
      render();
    };
    container.appendChild(div);
  });
}

// ---- Templates ----
const templates = [
  { name: 'Gaming Bold', bg: { type: 'gradient' }, gradient: { color1: '#e74c3c', color2: '#000000', angle: 135, type: 'linear' },
    layers: [
      { type: 'text', text: 'EPIC WIN', x: 640, y: 300, font: 'Bangers', size: 120, color: '#ffffff', bold: true, italic: false, align: 'center', strokeColor: '#000000', strokeWidth: 4, shadow: true, shadowColor: '#000000', shadowBlur: 10, shadowX: 4, shadowY: 4, rotation: -5, opacity: 100, lineHeight: 1.2 },
      { type: 'shape', shape: 'rect', x: 100, y: 580, w: 1080, h: 80, fill: '#e74c3c', stroke: '', strokeW: 0, rotation: 0, opacity: 80 },
      { type: 'text', text: 'Subscribe for more!', x: 640, y: 620, font: 'Inter', size: 32, color: '#ffffff', bold: false, italic: false, align: 'center', strokeColor: '', strokeWidth: 0, shadow: false, shadowColor: '#000', shadowBlur: 0, shadowX: 0, shadowY: 0, rotation: 0, opacity: 100, lineHeight: 1.2 },
    ]},
  { name: 'Clean Minimal', bg: { type: 'solid', color: '#ffffff' },
    layers: [
      { type: 'text', text: 'Title Here', x: 640, y: 320, font: 'Montserrat', size: 72, color: '#222222', bold: true, italic: false, align: 'center', strokeColor: '', strokeWidth: 0, shadow: false, shadowColor: '#000', shadowBlur: 0, shadowX: 0, shadowY: 0, rotation: 0, opacity: 100, lineHeight: 1.2 },
      { type: 'text', text: 'Subtitle text', x: 640, y: 420, font: 'Inter', size: 28, color: '#888888', bold: false, italic: false, align: 'center', strokeColor: '', strokeWidth: 0, shadow: false, shadowColor: '#000', shadowBlur: 0, shadowX: 0, shadowY: 0, rotation: 0, opacity: 100, lineHeight: 1.2 },
    ]},
  { name: 'Neon Glow', bg: { type: 'solid', color: '#0a0a0a' },
    layers: [
      { type: 'text', text: 'NEON', x: 640, y: 340, font: 'Bebas Neue', size: 140, color: '#00ffff', bold: true, italic: false, align: 'center', strokeColor: '#00ffff', strokeWidth: 2, shadow: true, shadowColor: '#00ffff', shadowBlur: 30, shadowX: 0, shadowY: 0, rotation: 0, opacity: 100, lineHeight: 1.2 },
      { type: 'shape', shape: 'rect', x: 340, y: 430, w: 600, h: 4, fill: '#ff00ff', stroke: '', strokeW: 0, rotation: 0, opacity: 60 },
    ]},
  { name: 'Vlog Style', bg: { type: 'gradient' }, gradient: { color1: '#f093fb', color2: '#f5576c', angle: 135, type: 'linear' },
    layers: [
      { type: 'text', text: 'MY VLOG', x: 640, y: 280, font: 'Poppins', size: 90, color: '#ffffff', bold: true, italic: false, align: 'center', strokeColor: '', strokeWidth: 0, shadow: true, shadowColor: 'rgba(0,0,0,0.3)', shadowBlur: 15, shadowX: 0, shadowY: 5, rotation: 0, opacity: 100, lineHeight: 1.2 },
      { type: 'text', text: 'Episode 1', x: 640, y: 400, font: 'Poppins', size: 36, color: 'rgba(255,255,255,0.8)', bold: false, italic: false, align: 'center', strokeColor: '', strokeWidth: 0, shadow: false, shadowColor: '#000', shadowBlur: 0, shadowX: 0, shadowY: 0, rotation: 0, opacity: 100, lineHeight: 1.2 },
      { type: 'shape', shape: 'circle', x: 590, y: 500, w: 100, h: 100, fill: '#ffffff', stroke: '', strokeW: 0, rotation: 0, opacity: 30 },
    ]},
  { name: 'Tutorial', bg: { type: 'solid', color: '#1a1a2e' },
    layers: [
      { type: 'shape', shape: 'rect', x: 0, y: 0, w: 500, h: 720, fill: '#e94560', stroke: '', strokeW: 0, rotation: 0, opacity: 100 },
      { type: 'text', text: 'HOW TO', x: 250, y: 300, font: 'Oswald', size: 72, color: '#ffffff', bold: true, italic: false, align: 'center', strokeColor: '', strokeWidth: 0, shadow: false, shadowColor: '#000', shadowBlur: 0, shadowX: 0, shadowY: 0, rotation: 0, opacity: 100, lineHeight: 1.2 },
      { type: 'text', text: 'Step by Step Guide', x: 890, y: 360, font: 'Inter', size: 36, color: '#ffffff', bold: false, italic: false, align: 'center', strokeColor: '', strokeWidth: 0, shadow: false, shadowColor: '#000', shadowBlur: 0, shadowX: 0, shadowY: 0, rotation: 0, opacity: 80, lineHeight: 1.2 },
    ]},
  { name: 'Dark Tech', bg: { type: 'gradient' }, gradient: { color1: '#0c3483', color2: '#a2b6df', angle: 180, type: 'linear' },
    layers: [
      { type: 'text', text: 'TECH REVIEW', x: 640, y: 320, font: 'Russo One', size: 80, color: '#ffffff', bold: false, italic: false, align: 'center', strokeColor: '', strokeWidth: 0, shadow: true, shadowColor: 'rgba(0,0,0,0.5)', shadowBlur: 20, shadowX: 0, shadowY: 5, rotation: 0, opacity: 100, lineHeight: 1.2 },
    ]},
];

function renderTemplates() {
  const grid = document.getElementById('templateGrid');
  grid.innerHTML = '';
  templates.forEach((t, i) => {
    const card = document.createElement('div');
    card.className = 'template-card';

    // Mini canvas preview
    const miniCanvas = document.createElement('canvas');
    miniCanvas.className = 'template-preview';
    miniCanvas.width = 256;
    miniCanvas.height = 144;
    const mctx = miniCanvas.getContext('2d');
    renderToContext(mctx, 256, 144, t);

    card.appendChild(miniCanvas);
    card.innerHTML += `<span>${t.name}</span>`;
    card.onclick = () => applyTemplate(t);
    grid.appendChild(card);
  });
}

function applyTemplate(t) {
  state.layers = [];
  if (t.bg.type === 'solid') {
    state.bg = { ...t.bg };
    document.getElementById('bgColor').value = t.bg.color;
    setActiveTab('solid');
  } else if (t.bg.type === 'gradient') {
    state.bg = { type: 'gradient' };
    state.gradient = { ...t.gradient };
    document.getElementById('gradColor1').value = t.gradient.color1;
    document.getElementById('gradColor2').value = t.gradient.color2;
    document.getElementById('gradAngle').value = t.gradient.angle;
    setActiveTab('gradient');
  }
  t.layers.forEach(l => {
    state.layers.push({ ...l, id: newId(), visible: true, locked: false });
  });
  pushHistory();
  render();
  refreshLayerUI();
}

function setActiveTab(type) {
  document.querySelectorAll('.bg-tab').forEach(b => b.classList.toggle('active', b.dataset.type === type));
  document.getElementById('bgSolid').classList.toggle('hidden', type !== 'solid');
  document.getElementById('bgGradient').classList.toggle('hidden', type !== 'gradient');
  document.getElementById('bgImage').classList.toggle('hidden', type !== 'image');
  document.getElementById('bgPattern').classList.toggle('hidden', type !== 'pattern');
}

// ---- Rendering ----
function render() {
  renderToContext(ctx, state.width, state.height);
  updateLayerBar();
}

function renderToContext(c, w, h, template) {
  const s = template || state;
  const scaleX = w / state.width;
  const scaleY = h / state.height;

  c.clearRect(0, 0, w, h);
  c.save();

  // Border radius clip
  const br = (template ? 0 : state.effects.borderRadius) * Math.min(scaleX, scaleY);
  if (br > 0) {
    roundRect(c, 0, 0, w, h, br);
    c.clip();
  }

  // Background
  const bgType = s.bg.type;
  if (bgType === 'solid') {
    c.fillStyle = s.bg.color;
    c.fillRect(0, 0, w, h);
  } else if (bgType === 'gradient') {
    const g = s.gradient || state.gradient;
    let grad;
    if (g.type === 'radial') {
      grad = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) / 2);
    } else {
      const rad = (g.angle * Math.PI) / 180;
      const cx = w / 2, cy = h / 2;
      const len = Math.max(w, h);
      grad = c.createLinearGradient(
        cx - Math.cos(rad) * len / 2, cy - Math.sin(rad) * len / 2,
        cx + Math.cos(rad) * len / 2, cy + Math.sin(rad) * len / 2
      );
    }
    grad.addColorStop(0, g.color1);
    grad.addColorStop(1, g.color2);
    c.fillStyle = grad;
    c.fillRect(0, 0, w, h);
  } else if (bgType === 'image' && state.bgImage.img) {
    drawBgImage(c, w, h);
  } else if (bgType === 'pattern') {
    const p = s.pattern || state.pattern;
    c.fillStyle = p.bg;
    c.fillRect(0, 0, w, h);
    drawPattern(c, w, h, p);
  }

  // Layers
  const layers = s.layers || state.layers;
  layers.forEach(layer => {
    if (layer.visible === false) return;
    c.save();
    c.globalAlpha = (layer.opacity ?? 100) / 100;

    if (layer.type === 'text') {
      drawTextLayer(c, layer, scaleX, scaleY);
    } else if (layer.type === 'image') {
      drawImageLayer(c, layer, scaleX, scaleY);
    } else if (layer.type === 'shape') {
      drawShapeLayer(c, layer, scaleX, scaleY);
    }
    c.restore();
  });

  // Effects
  if (!template) {
    if (state.effects.vignette > 0) drawVignette(c, w, h);
    if (state.effects.noise > 0) drawNoise(c, w, h);
    if (state.effects.borderWidth > 0) drawBorder(c, w, h);
  }

  c.restore();
}

function drawBgImage(c, w, h) {
  const img = state.bgImage.img;
  const fit = state.bgImage.fit;
  c.save();
  if (state.bgImage.blur > 0) c.filter = `blur(${state.bgImage.blur}px)`;
  if (state.bgImage.brightness !== 100) {
    c.filter = (c.filter === 'none' ? '' : c.filter + ' ') + `brightness(${state.bgImage.brightness}%)`;
  }

  if (fit === 'cover') {
    const scale = Math.max(w / img.width, h / img.height);
    const iw = img.width * scale, ih = img.height * scale;
    c.drawImage(img, (w - iw) / 2, (h - ih) / 2, iw, ih);
  } else if (fit === 'contain') {
    const scale = Math.min(w / img.width, h / img.height);
    const iw = img.width * scale, ih = img.height * scale;
    c.drawImage(img, (w - iw) / 2, (h - ih) / 2, iw, ih);
  } else if (fit === 'stretch') {
    c.drawImage(img, 0, 0, w, h);
  } else if (fit === 'tile') {
    for (let y = 0; y < h; y += img.height) {
      for (let x = 0; x < w; x += img.width) {
        c.drawImage(img, x, y);
      }
    }
  }
  c.restore();

  // Overlay
  if (state.bgImage.overlayOpacity > 0) {
    c.save();
    c.globalAlpha = state.bgImage.overlayOpacity / 100;
    c.fillStyle = state.bgImage.overlayColor;
    c.fillRect(0, 0, w, h);
    c.restore();
  }
}

function drawPattern(c, w, h, p) {
  c.save();
  c.globalAlpha = p.opacity / 100;
  c.fillStyle = p.fg;
  c.strokeStyle = p.fg;
  c.lineWidth = 2;
  const s = p.scale;

  switch (p.type) {
    case 'dots':
      for (let y = s; y < h; y += s) for (let x = s; x < w; x += s) {
        c.beginPath(); c.arc(x, y, s / 6, 0, Math.PI * 2); c.fill();
      }
      break;
    case 'lines':
      for (let y = 0; y < h; y += s) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
      break;
    case 'grid':
      for (let y = 0; y < h; y += s) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
      for (let x = 0; x < w; x += s) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
      break;
    case 'diagonal':
      for (let i = -h; i < w + h; i += s) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i + h, h); c.stroke(); }
      break;
    case 'zigzag':
      for (let y = 0; y < h; y += s) {
        c.beginPath();
        for (let x = 0; x < w; x += s) {
          c.lineTo(x, y + ((x / s) % 2 === 0 ? 0 : s / 2));
        }
        c.stroke();
      }
      break;
    case 'circles':
      for (let y = s; y < h; y += s * 2) for (let x = s; x < w; x += s * 2) {
        c.beginPath(); c.arc(x, y, s * 0.8, 0, Math.PI * 2); c.stroke();
      }
      break;
  }
  c.restore();
}

function drawTextLayer(c, layer, sx, sy) {
  const x = layer.x * sx, y = layer.y * sy;
  const size = layer.size * Math.min(sx, sy);
  const weight = layer.bold ? 'bold' : 'normal';
  const style = layer.italic ? 'italic' : 'normal';
  c.font = `${style} ${weight} ${size}px "${layer.font}"`;
  c.textAlign = layer.align || 'center';
  c.textBaseline = 'middle';

  if (layer.rotation) {
    c.translate(x, y);
    c.rotate((layer.rotation * Math.PI) / 180);
    c.translate(-x, -y);
  }

  // Split text into lines
  const lines = layer.text.split('\n');
  const lh = size * (layer.lineHeight || 1.2);
  const totalH = lh * lines.length;
  const startY = y - totalH / 2 + lh / 2;

  lines.forEach((line, i) => {
    const ly = startY + i * lh;

    if (layer.shadow) {
      c.save();
      c.shadowColor = layer.shadowColor || '#000';
      c.shadowBlur = (layer.shadowBlur || 10) * Math.min(sx, sy);
      c.shadowOffsetX = (layer.shadowX || 0) * sx;
      c.shadowOffsetY = (layer.shadowY || 0) * sy;
      c.fillStyle = layer.color;
      c.fillText(line, x, ly);
      c.restore();
    }

    if (layer.strokeWidth > 0 && layer.strokeColor) {
      c.strokeStyle = layer.strokeColor;
      c.lineWidth = layer.strokeWidth * Math.min(sx, sy);
      c.lineJoin = 'round';
      c.strokeText(line, x, ly);
    }

    c.fillStyle = layer.color;
    if (!layer.shadow) c.fillText(line, x, ly);
  });
}

function drawImageLayer(c, layer, sx, sy) {
  if (!layer.img) return;
  const x = layer.x * sx, y = layer.y * sy;
  const w = layer.w * sx, h = layer.h * sy;

  c.save();
  if (layer.rotation) {
    c.translate(x + w / 2, y + h / 2);
    c.rotate((layer.rotation * Math.PI) / 180);
    c.drawImage(layer.img, -w / 2, -h / 2, w, h);
  } else {
    c.drawImage(layer.img, x, y, w, h);
  }
  c.restore();
}

function drawShapeLayer(c, layer, sx, sy) {
  const x = layer.x * sx, y = layer.y * sy;
  const w = layer.w * sx, h = layer.h * sy;

  c.save();
  if (layer.rotation) {
    c.translate(x + w / 2, y + h / 2);
    c.rotate((layer.rotation * Math.PI) / 180);
    c.translate(-(x + w / 2), -(y + h / 2));
  }

  c.beginPath();
  if (layer.shape === 'rect') {
    c.rect(x, y, w, h);
  } else if (layer.shape === 'circle') {
    c.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
  } else if (layer.shape === 'triangle') {
    c.moveTo(x + w / 2, y);
    c.lineTo(x + w, y + h);
    c.lineTo(x, y + h);
    c.closePath();
  } else if (layer.shape === 'star') {
    drawStar(c, x + w / 2, y + h / 2, 5, w / 2, w / 4);
  } else if (layer.shape === 'arrow') {
    const ax = x, ay = y + h * 0.3;
    c.moveTo(ax, ay);
    c.lineTo(ax + w * 0.6, ay);
    c.lineTo(ax + w * 0.6, y);
    c.lineTo(ax + w, y + h / 2);
    c.lineTo(ax + w * 0.6, y + h);
    c.lineTo(ax + w * 0.6, y + h * 0.7);
    c.lineTo(ax, y + h * 0.7);
    c.closePath();
  }

  if (layer.fill) { c.fillStyle = layer.fill; c.fill(); }
  if (layer.stroke && layer.strokeW > 0) {
    c.strokeStyle = layer.stroke;
    c.lineWidth = layer.strokeW * Math.min(sx, sy);
    c.stroke();
  }
  c.restore();
}

function drawStar(c, cx, cy, spikes, outerR, innerR) {
  let rot = Math.PI / 2 * 3;
  const step = Math.PI / spikes;
  c.moveTo(cx, cy - outerR);
  for (let i = 0; i < spikes; i++) {
    c.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR);
    rot += step;
    c.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR);
    rot += step;
  }
  c.lineTo(cx, cy - outerR);
  c.closePath();
}

function drawVignette(c, w, h) {
  const grad = c.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.8);
  grad.addColorStop(0, 'transparent');
  grad.addColorStop(1, `rgba(0,0,0,${state.effects.vignette / 100})`);
  c.fillStyle = grad;
  c.fillRect(0, 0, w, h);
}

function drawNoise(c, w, h) {
  const imageData = c.getImageData(0, 0, w, h);
  const data = imageData.data;
  const amount = state.effects.noise / 100 * 50;
  for (let i = 0; i < data.length; i += 4) {
    const n = (Math.random() - 0.5) * amount;
    data[i] += n;
    data[i + 1] += n;
    data[i + 2] += n;
  }
  c.putImageData(imageData, 0, 0);
}

function drawBorder(c, w, h) {
  const bw = state.effects.borderWidth;
  const br = state.effects.borderRadius;
  c.strokeStyle = state.effects.borderColor;
  c.lineWidth = bw * 2;
  if (br > 0) {
    roundRect(c, 0, 0, w, h, br);
    c.stroke();
  } else {
    c.strokeRect(0, 0, w, h);
  }
}

function roundRect(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.lineTo(x + w - r, y);
  c.quadraticCurveTo(x + w, y, x + w, y + r);
  c.lineTo(x + w, y + h - r);
  c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  c.lineTo(x + r, y + h);
  c.quadraticCurveTo(x, y + h, x, y + h - r);
  c.lineTo(x, y + r);
  c.quadraticCurveTo(x, y, x + r, y);
  c.closePath();
}

// ---- History ----
function pushHistory() {
  const snap = JSON.stringify({
    bg: state.bg,
    gradient: state.gradient,
    pattern: state.pattern,
    effects: state.effects,
    layers: state.layers.map(l => ({ ...l, img: l.img ? '__IMG__' : undefined })),
  });
  state.history = state.history.slice(0, state.historyIndex + 1);
  state.history.push(snap);
  state.historyIndex = state.history.length - 1;
  if (state.history.length > 50) { state.history.shift(); state.historyIndex--; }
}

function undo() {
  if (state.historyIndex > 0) {
    state.historyIndex--;
    restoreHistory();
  }
}

function redo() {
  if (state.historyIndex < state.history.length - 1) {
    state.historyIndex++;
    restoreHistory();
  }
}

function restoreHistory() {
  const snap = JSON.parse(state.history[state.historyIndex]);
  state.bg = snap.bg;
  state.gradient = snap.gradient;
  state.pattern = snap.pattern;
  state.effects = snap.effects;
  // Preserve image references
  const imgMap = {};
  state.layers.forEach(l => { if (l.img) imgMap[l.id] = l.img; });
  state.layers = snap.layers.map(l => {
    if (l.img === '__IMG__') l.img = imgMap[l.id] || null;
    return l;
  });
  render();
  refreshLayerUI();
}

// ---- Zoom ----
function setZoom(z) {
  state.zoom = Math.max(0.25, Math.min(3, z));
  canvas.style.transform = `scale(${state.zoom})`;
  canvas.style.transformOrigin = 'center center';
  document.getElementById('zoomLevel').textContent = Math.round(state.zoom * 100) + '%';
}

function fitZoom() {
  const wrapper = document.getElementById('canvasWrapper');
  const sx = (wrapper.clientWidth - 40) / state.width;
  const sy = (wrapper.clientHeight - 40) / state.height;
  setZoom(Math.min(sx, sy, 1));
}

// ---- Canvas Size ----
function setCanvasSize(w, h) {
  state.width = w;
  state.height = h;
  canvas.width = w;
  canvas.height = h;
  fitZoom();
  render();
}

// ---- Layer UI Generators ----
function refreshLayerUI() {
  refreshTextLayerUI();
  refreshImageLayerUI();
  refreshShapeLayerUI();
}

function refreshTextLayerUI() {
  const container = document.getElementById('textLayers');
  container.innerHTML = '';
  state.layers.filter(l => l.type === 'text').forEach(layer => {
    container.appendChild(createTextLayerUI(layer));
  });
}

function refreshImageLayerUI() {
  const container = document.getElementById('imageLayers');
  container.innerHTML = '';
  state.layers.filter(l => l.type === 'image').forEach(layer => {
    container.appendChild(createImageLayerUI(layer));
  });
}

function refreshShapeLayerUI() {
  const container = document.getElementById('shapeLayers');
  container.innerHTML = '';
  state.layers.filter(l => l.type === 'shape').forEach(layer => {
    container.appendChild(createShapeLayerUI(layer));
  });
}

const fontList = ['Inter','Poppins','Montserrat','Oswald','Roboto','Bebas Neue','Bangers','Permanent Marker','Anton','Russo One'];

function createTextLayerUI(layer) {
  const div = document.createElement('div');
  div.className = 'layer-item';
  div.innerHTML = `
    <div class="layer-item-header">
      <span>Text #${layer.id}</span>
      <div class="layer-controls">
        <button class="btn-sm move-up" title="Move Up">▲</button>
        <button class="btn-sm move-down" title="Move Down">▼</button>
        <button class="btn-sm dup" title="Duplicate">⧉</button>
        <button class="btn-danger del" title="Delete">✕</button>
      </div>
    </div>
    <div class="layer-field"><label>Text</label><textarea rows="2">${layer.text}</textarea></div>
    <div class="row-2">
      <div class="layer-field"><label>Font</label>
        <select class="font-sel">${fontList.map(f => `<option value="${f}" ${layer.font === f ? 'selected' : ''}>${f}</option>`).join('')}</select>
      </div>
      <div class="layer-field"><label>Size</label><input type="number" class="font-size" value="${layer.size}" min="8" max="400"></div>
    </div>
    <div class="row">
      <label>Color</label><input type="color" class="text-color" value="${layer.color}">
      <label style="margin-left:8px"><input type="checkbox" class="text-bold" ${layer.bold ? 'checked' : ''}> B</label>
      <label><input type="checkbox" class="text-italic" ${layer.italic ? 'checked' : ''}> I</label>
    </div>
    <div class="row">
      <label>Align</label>
      <select class="text-align">
        <option value="left" ${layer.align === 'left' ? 'selected' : ''}>Left</option>
        <option value="center" ${layer.align === 'center' ? 'selected' : ''}>Center</option>
        <option value="right" ${layer.align === 'right' ? 'selected' : ''}>Right</option>
      </select>
    </div>
    <div class="row">
      <label>Position X</label><input type="number" class="pos-x" value="${Math.round(layer.x)}">
      <label>Y</label><input type="number" class="pos-y" value="${Math.round(layer.y)}">
    </div>
    <div class="row">
      <label>Rotation</label><input type="range" class="text-rotation" min="-180" max="180" value="${layer.rotation || 0}">
      <span class="rot-val">${layer.rotation || 0}°</span>
    </div>
    <div class="row">
      <label>Opacity</label><input type="range" class="text-opacity" min="0" max="100" value="${layer.opacity ?? 100}">
    </div>
    <div class="row">
      <label>Line Height</label><input type="range" class="text-lh" min="0.5" max="3" step="0.1" value="${layer.lineHeight || 1.2}">
    </div>
    <div class="row">
      <label>Stroke</label><input type="color" class="stroke-color" value="${layer.strokeColor || '#000000'}">
      <input type="number" class="stroke-width" value="${layer.strokeWidth || 0}" min="0" max="20">
    </div>
    <div class="row">
      <label><input type="checkbox" class="shadow-on" ${layer.shadow ? 'checked' : ''}> Shadow</label>
      <input type="color" class="shadow-color" value="${layer.shadowColor || '#000000'}">
    </div>
    <div class="row">
      <label>Blur</label><input type="number" class="shadow-blur" value="${layer.shadowBlur || 0}" min="0" max="100">
      <label>X</label><input type="number" class="shadow-x" value="${layer.shadowX || 0}">
      <label>Y</label><input type="number" class="shadow-y" value="${layer.shadowY || 0}">
    </div>
  `;

  // Wire events
  const q = s => div.querySelector(s);
  const update = (key, val) => { layer[key] = val; render(); };

  q('textarea').oninput = e => update('text', e.target.value);
  q('.font-sel').onchange = e => update('font', e.target.value);
  q('.font-size').onchange = e => update('size', +e.target.value);
  q('.text-color').oninput = e => update('color', e.target.value);
  q('.text-bold').onchange = e => update('bold', e.target.checked);
  q('.text-italic').onchange = e => update('italic', e.target.checked);
  q('.text-align').onchange = e => update('align', e.target.value);
  q('.pos-x').onchange = e => update('x', +e.target.value);
  q('.pos-y').onchange = e => update('y', +e.target.value);
  q('.text-rotation').oninput = e => { update('rotation', +e.target.value); q('.rot-val').textContent = e.target.value + '°'; };
  q('.text-opacity').oninput = e => update('opacity', +e.target.value);
  q('.text-lh').oninput = e => update('lineHeight', +e.target.value);
  q('.stroke-color').oninput = e => update('strokeColor', e.target.value);
  q('.stroke-width').onchange = e => update('strokeWidth', +e.target.value);
  q('.shadow-on').onchange = e => update('shadow', e.target.checked);
  q('.shadow-color').oninput = e => update('shadowColor', e.target.value);
  q('.shadow-blur').onchange = e => update('shadowBlur', +e.target.value);
  q('.shadow-x').onchange = e => update('shadowX', +e.target.value);
  q('.shadow-y').onchange = e => update('shadowY', +e.target.value);

  q('.del').onclick = () => { state.layers = state.layers.filter(l => l.id !== layer.id); pushHistory(); render(); refreshLayerUI(); };
  q('.dup').onclick = () => { duplicateLayer(layer); };
  q('.move-up').onclick = () => moveLayer(layer.id, -1);
  q('.move-down').onclick = () => moveLayer(layer.id, 1);

  return div;
}

function createImageLayerUI(layer) {
  const div = document.createElement('div');
  div.className = 'layer-item';
  div.innerHTML = `
    <div class="layer-item-header">
      <span>Image #${layer.id}</span>
      <div class="layer-controls">
        <button class="btn-sm move-up">▲</button>
        <button class="btn-sm move-down">▼</button>
        <button class="btn-sm dup">⧉</button>
        <button class="btn-danger del">✕</button>
      </div>
    </div>
    <div class="layer-field"><label>Replace Image</label><input type="file" class="img-file" accept="image/*"></div>
    <div class="row">
      <label>X</label><input type="number" class="pos-x" value="${Math.round(layer.x)}">
      <label>Y</label><input type="number" class="pos-y" value="${Math.round(layer.y)}">
    </div>
    <div class="row">
      <label>W</label><input type="number" class="size-w" value="${Math.round(layer.w)}">
      <label>H</label><input type="number" class="size-h" value="${Math.round(layer.h)}">
    </div>
    <div class="row">
      <label>Rotation</label><input type="range" class="img-rotation" min="-180" max="180" value="${layer.rotation || 0}">
      <span class="rot-val">${layer.rotation || 0}°</span>
    </div>
    <div class="row">
      <label>Opacity</label><input type="range" class="img-opacity" min="0" max="100" value="${layer.opacity ?? 100}">
    </div>
  `;

  const q = s => div.querySelector(s);
  const update = (key, val) => { layer[key] = val; render(); };

  q('.pos-x').onchange = e => update('x', +e.target.value);
  q('.pos-y').onchange = e => update('y', +e.target.value);
  q('.size-w').onchange = e => update('w', +e.target.value);
  q('.size-h').onchange = e => update('h', +e.target.value);
  q('.img-rotation').oninput = e => { update('rotation', +e.target.value); q('.rot-val').textContent = e.target.value + '°'; };
  q('.img-opacity').oninput = e => update('opacity', +e.target.value);
  q('.img-file').onchange = e => loadImageFile(e.target.files[0], img => { layer.img = img; layer.w = img.width; layer.h = img.height; fitImageToCanvas(layer); pushHistory(); render(); refreshImageLayerUI(); });
  q('.del').onclick = () => { state.layers = state.layers.filter(l => l.id !== layer.id); pushHistory(); render(); refreshLayerUI(); };
  q('.dup').onclick = () => duplicateLayer(layer);
  q('.move-up').onclick = () => moveLayer(layer.id, -1);
  q('.move-down').onclick = () => moveLayer(layer.id, 1);

  return div;
}

function createShapeLayerUI(layer) {
  const div = document.createElement('div');
  div.className = 'layer-item';
  const shapes = ['rect','circle','triangle','star','arrow'];
  div.innerHTML = `
    <div class="layer-item-header">
      <span>Shape #${layer.id}</span>
      <div class="layer-controls">
        <button class="btn-sm move-up">▲</button>
        <button class="btn-sm move-down">▼</button>
        <button class="btn-sm dup">⧉</button>
        <button class="btn-danger del">✕</button>
      </div>
    </div>
    <div class="layer-field"><label>Shape</label>
      <select class="shape-type">${shapes.map(s => `<option value="${s}" ${layer.shape === s ? 'selected' : ''}>${s}</option>`).join('')}</select>
    </div>
    <div class="row">
      <label>X</label><input type="number" class="pos-x" value="${Math.round(layer.x)}">
      <label>Y</label><input type="number" class="pos-y" value="${Math.round(layer.y)}">
    </div>
    <div class="row">
      <label>W</label><input type="number" class="size-w" value="${Math.round(layer.w)}">
      <label>H</label><input type="number" class="size-h" value="${Math.round(layer.h)}">
    </div>
    <div class="row">
      <label>Fill</label><input type="color" class="shape-fill" value="${layer.fill || '#ffffff'}">
      <label>Stroke</label><input type="color" class="shape-stroke" value="${layer.stroke || '#000000'}">
      <input type="number" class="shape-stroke-w" value="${layer.strokeW || 0}" min="0" max="20" style="width:50px">
    </div>
    <div class="row">
      <label>Rotation</label><input type="range" class="shape-rotation" min="-180" max="180" value="${layer.rotation || 0}">
      <span class="rot-val">${layer.rotation || 0}°</span>
    </div>
    <div class="row">
      <label>Opacity</label><input type="range" class="shape-opacity" min="0" max="100" value="${layer.opacity ?? 100}">
    </div>
  `;

  const q = s => div.querySelector(s);
  const update = (key, val) => { layer[key] = val; render(); };

  q('.shape-type').onchange = e => update('shape', e.target.value);
  q('.pos-x').onchange = e => update('x', +e.target.value);
  q('.pos-y').onchange = e => update('y', +e.target.value);
  q('.size-w').onchange = e => update('w', +e.target.value);
  q('.size-h').onchange = e => update('h', +e.target.value);
  q('.shape-fill').oninput = e => update('fill', e.target.value);
  q('.shape-stroke').oninput = e => update('stroke', e.target.value);
  q('.shape-stroke-w').onchange = e => update('strokeW', +e.target.value);
  q('.shape-rotation').oninput = e => { update('rotation', +e.target.value); q('.rot-val').textContent = e.target.value + '°'; };
  q('.shape-opacity').oninput = e => update('opacity', +e.target.value);
  q('.del').onclick = () => { state.layers = state.layers.filter(l => l.id !== layer.id); pushHistory(); render(); refreshLayerUI(); };
  q('.dup').onclick = () => duplicateLayer(layer);
  q('.move-up').onclick = () => moveLayer(layer.id, -1);
  q('.move-down').onclick = () => moveLayer(layer.id, 1);

  return div;
}

// ---- Layer helpers ----
function moveLayer(id, dir) {
  const idx = state.layers.findIndex(l => l.id === id);
  const newIdx = idx + dir;
  if (newIdx < 0 || newIdx >= state.layers.length) return;
  [state.layers[idx], state.layers[newIdx]] = [state.layers[newIdx], state.layers[idx]];
  pushHistory();
  render();
  refreshLayerUI();
}

function duplicateLayer(layer) {
  const clone = { ...layer, id: newId() };
  if (layer.img) clone.img = layer.img;
  clone.x += 20;
  clone.y += 20;
  state.layers.push(clone);
  pushHistory();
  render();
  refreshLayerUI();
}

function fitImageToCanvas(layer) {
  const maxW = state.width * 0.6;
  const maxH = state.height * 0.6;
  const scale = Math.min(maxW / layer.w, maxH / layer.h, 1);
  layer.w = Math.round(layer.w * scale);
  layer.h = Math.round(layer.h * scale);
  layer.x = Math.round((state.width - layer.w) / 2);
  layer.y = Math.round((state.height - layer.h) / 2);
}

function loadImageFile(file, callback) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => callback(img);
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// ---- Layer Bar ----
function updateLayerBar() {
  const list = document.getElementById('layerList');
  list.innerHTML = '';
  state.layers.forEach(layer => {
    const chip = document.createElement('div');
    chip.className = `layer-chip ${state.selectedLayer === layer.id ? 'selected' : ''}`;
    const typeIcon = layer.type === 'text' ? 'T' : layer.type === 'image' ? '🖼' : '◆';
    const name = layer.type === 'text' ? layer.text.slice(0, 15) : `${layer.type} #${layer.id}`;
    chip.innerHTML = `<span class="eye ${layer.visible !== false ? 'visible' : ''}" data-id="${layer.id}">👁</span> ${typeIcon} ${name}`;
    chip.onclick = () => { state.selectedLayer = layer.id; updateLayerBar(); };
    chip.querySelector('.eye').onclick = (e) => {
      e.stopPropagation();
      layer.visible = layer.visible === false ? true : false;
      render();
    };
    list.appendChild(chip);
  });
}

// ---- Canvas Drag ----
function setupCanvasDrag() {
  canvas.addEventListener('mousedown', e => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = state.width / rect.width;
    const scaleY = state.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    // Find topmost layer hit
    for (let i = state.layers.length - 1; i >= 0; i--) {
      const l = state.layers[i];
      if (l.visible === false || l.locked) continue;
      if (hitTest(l, mx, my)) {
        state.dragging = l;
        state.dragStart = { x: mx - l.x, y: my - l.y };
        state.selectedLayer = l.id;
        updateLayerBar();
        return;
      }
    }
    state.selectedLayer = null;
    updateLayerBar();
  });

  canvas.addEventListener('mousemove', e => {
    if (!state.dragging) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = state.width / rect.width;
    const scaleY = state.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    state.dragging.x = mx - state.dragStart.x;
    state.dragging.y = my - state.dragStart.y;
    render();
    // Update UI inputs if visible
    refreshLayerUI();
  });

  canvas.addEventListener('mouseup', () => {
    if (state.dragging) {
      pushHistory();
      state.dragging = null;
      state.dragStart = null;
    }
  });

  canvas.addEventListener('mouseleave', () => {
    if (state.dragging) {
      pushHistory();
      state.dragging = null;
    }
  });
}

function hitTest(layer, mx, my) {
  if (layer.type === 'text') {
    // Approximate text bounding box
    const size = layer.size;
    const lines = layer.text.split('\n');
    const lh = size * (layer.lineHeight || 1.2);
    const totalH = lh * lines.length;
    const maxW = Math.max(...lines.map(l => l.length)) * size * 0.6;
    let lx = layer.x, ly = layer.y - totalH / 2;
    if (layer.align === 'center') lx -= maxW / 2;
    else if (layer.align === 'right') lx -= maxW;
    return mx >= lx && mx <= lx + maxW && my >= ly && my <= ly + totalH;
  }
  return mx >= layer.x && mx <= layer.x + (layer.w || 100) && my >= layer.y && my <= layer.y + (layer.h || 100);
}

// ---- Event Listeners ----
function setupEventListeners() {
  // Panel toggles
  document.querySelectorAll('.panel-title').forEach(title => {
    title.addEventListener('click', () => {
      const target = document.getElementById(title.dataset.toggle);
      title.classList.toggle('open');
      target.classList.toggle('open');
    });
    // Open first few panels by default
    if (['sizePanel', 'bgPanel', 'textPanel'].includes(title.dataset.toggle)) {
      title.classList.add('open');
      document.getElementById(title.dataset.toggle).classList.add('open');
    }
  });

  // Sidebar toggle
  document.getElementById('toggleSidebar').onclick = () => document.getElementById('sidebar').classList.toggle('collapsed');

  // Canvas size
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      setCanvasSize(+btn.dataset.w, +btn.dataset.h);
    };
  });
  document.getElementById('applyCustomSize').onclick = () => {
    const w = +document.getElementById('customW').value;
    const h = +document.getElementById('customH').value;
    if (w >= 100 && h >= 100) setCanvasSize(w, h);
  };

  // Background tabs
  document.querySelectorAll('.bg-tab').forEach(tab => {
    tab.onclick = () => {
      state.bg.type = tab.dataset.type;
      setActiveTab(tab.dataset.type);
      render();
    };
  });

  // BG solid
  document.getElementById('bgColor').oninput = e => { state.bg.color = e.target.value; state.bg.type = 'solid'; render(); };

  // BG gradient
  document.getElementById('gradColor1').oninput = e => { state.gradient.color1 = e.target.value; render(); };
  document.getElementById('gradColor2').oninput = e => { state.gradient.color2 = e.target.value; render(); };
  document.getElementById('gradAngle').oninput = e => {
    state.gradient.angle = +e.target.value;
    document.getElementById('gradAngleVal').textContent = e.target.value + '°';
    render();
  };
  document.getElementById('gradType').onchange = e => { state.gradient.type = e.target.value; render(); };

  // BG image
  document.getElementById('bgImageFile').onchange = e => {
    loadImageFile(e.target.files[0], img => { state.bgImage.img = img; state.bg.type = 'image'; render(); });
  };
  document.getElementById('bgImageFit').onchange = e => { state.bgImage.fit = e.target.value; render(); };
  document.getElementById('bgBlur').oninput = e => { state.bgImage.blur = +e.target.value; document.getElementById('bgBlurVal').textContent = e.target.value + 'px'; render(); };
  document.getElementById('bgBrightness').oninput = e => { state.bgImage.brightness = +e.target.value; document.getElementById('bgBrightnessVal').textContent = e.target.value + '%'; render(); };
  document.getElementById('bgOverlayColor').oninput = e => { state.bgImage.overlayColor = e.target.value; render(); };
  document.getElementById('bgOverlayOpacity').oninput = e => { state.bgImage.overlayOpacity = +e.target.value; document.getElementById('bgOverlayOpacityVal').textContent = e.target.value + '%'; render(); };

  // Pattern
  document.getElementById('patternType').onchange = e => { state.pattern.type = e.target.value; render(); };
  document.getElementById('patternBg').oninput = e => { state.pattern.bg = e.target.value; render(); };
  document.getElementById('patternFg').oninput = e => { state.pattern.fg = e.target.value; render(); };
  document.getElementById('patternScale').oninput = e => { state.pattern.scale = +e.target.value; render(); };
  document.getElementById('patternOpacity').oninput = e => { state.pattern.opacity = +e.target.value; render(); };

  // Add text
  document.getElementById('addTextBtn').onclick = () => {
    state.layers.push({
      id: newId(), type: 'text', text: 'Your Text', x: state.width / 2, y: state.height / 2,
      font: 'Inter', size: 64, color: '#ffffff', bold: true, italic: false, align: 'center',
      strokeColor: '#000000', strokeWidth: 0, shadow: false, shadowColor: '#000000',
      shadowBlur: 10, shadowX: 4, shadowY: 4, rotation: 0, opacity: 100, lineHeight: 1.2,
      visible: true, locked: false,
    });
    pushHistory();
    render();
    refreshLayerUI();
  };

  // Add image
  document.getElementById('addImageBtn').onclick = () => {
    const input = document.getElementById('hiddenFileInput');
    input.onchange = e => {
      loadImageFile(e.target.files[0], img => {
        const layer = {
          id: newId(), type: 'image', img, x: 0, y: 0, w: img.width, h: img.height,
          rotation: 0, opacity: 100, visible: true, locked: false,
        };
        fitImageToCanvas(layer);
        state.layers.push(layer);
        pushHistory();
        render();
        refreshLayerUI();
      });
      input.value = '';
    };
    input.click();
  };

  // Add shape
  document.getElementById('addShapeBtn').onclick = () => {
    state.layers.push({
      id: newId(), type: 'shape', shape: 'rect',
      x: state.width / 2 - 100, y: state.height / 2 - 75, w: 200, h: 150,
      fill: '#e94560', stroke: '', strokeW: 0, rotation: 0, opacity: 100,
      visible: true, locked: false,
    });
    pushHistory();
    render();
    refreshLayerUI();
  };

  // Effects
  document.getElementById('vignette').oninput = e => { state.effects.vignette = +e.target.value; render(); };
  document.getElementById('noise').oninput = e => { state.effects.noise = +e.target.value; render(); };
  document.getElementById('borderWidth').oninput = e => { state.effects.borderWidth = +e.target.value; render(); };
  document.getElementById('borderColor').oninput = e => { state.effects.borderColor = e.target.value; render(); };
  document.getElementById('borderRadius').oninput = e => { state.effects.borderRadius = +e.target.value; render(); };

  // Zoom
  document.getElementById('zoomIn').onclick = () => setZoom(state.zoom + 0.1);
  document.getElementById('zoomOut').onclick = () => setZoom(state.zoom - 0.1);
  document.getElementById('zoomFit').onclick = fitZoom;

  // Undo/Redo
  document.getElementById('undoBtn').onclick = undo;
  document.getElementById('redoBtn').onclick = redo;
  document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); }
    if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redo(); }
    if (e.key === 'Delete' && state.selectedLayer) {
      state.layers = state.layers.filter(l => l.id !== state.selectedLayer);
      state.selectedLayer = null;
      pushHistory();
      render();
      refreshLayerUI();
    }
  });

  // Export
  document.getElementById('exportBtn').onclick = exportThumbnail;

  // Save/Load project
  document.getElementById('saveProjectBtn').onclick = saveProject;
  document.getElementById('loadProjectBtn').onclick = () => document.getElementById('projectFileInput').click();
  document.getElementById('projectFileInput').onchange = e => loadProject(e.target.files[0]);

  // Background removal
  document.getElementById('openBgRemoval').onclick = () => document.getElementById('bgRemovalModal').classList.remove('hidden');
  document.getElementById('bgRemovalClose').onclick = () => document.getElementById('bgRemovalModal').classList.add('hidden');
  document.getElementById('bgRemovalInput').onchange = handleBgRemovalInput;
  document.getElementById('bgRemovalProcess').onclick = processBackgroundRemoval;
  document.getElementById('bgRemovalAdd').onclick = addBgRemovedToCanvas;

  // Canvas drag
  setupCanvasDrag();

  // Fit zoom on load
  window.addEventListener('resize', fitZoom);
  fitZoom();
}

// ---- Export ----
function exportThumbnail() {
  const format = document.getElementById('exportFormat').value;
  const quality = +document.getElementById('exportQuality').value;

  // Render at full resolution
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = state.width;
  exportCanvas.height = state.height;
  const ectx = exportCanvas.getContext('2d');
  renderToContext(ectx, state.width, state.height);

  const mimeType = format === 'png' ? 'image/png' : format === 'jpeg' ? 'image/jpeg' : 'image/webp';
  const link = document.createElement('a');
  link.download = `thumbnail_${state.width}x${state.height}.${format}`;
  link.href = exportCanvas.toDataURL(mimeType, quality);
  link.click();
}

// ---- Save / Load Project ----
function saveProject() {
  const project = {
    width: state.width,
    height: state.height,
    bg: state.bg,
    gradient: state.gradient,
    pattern: state.pattern,
    effects: state.effects,
    layers: state.layers.map(l => {
      const clone = { ...l };
      if (clone.img) {
        const c = document.createElement('canvas');
        c.width = clone.img.width;
        c.height = clone.img.height;
        c.getContext('2d').drawImage(clone.img, 0, 0);
        clone.imgData = c.toDataURL();
        delete clone.img;
      }
      return clone;
    }),
    bgImageData: null,
  };
  if (state.bgImage.img) {
    const c = document.createElement('canvas');
    c.width = state.bgImage.img.width;
    c.height = state.bgImage.img.height;
    c.getContext('2d').drawImage(state.bgImage.img, 0, 0);
    project.bgImageData = c.toDataURL();
  }

  const blob = new Blob([JSON.stringify(project)], { type: 'application/json' });
  const link = document.createElement('a');
  link.download = 'thumbnail_project.thumbgen';
  link.href = URL.createObjectURL(blob);
  link.click();
}

function loadProject(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const project = JSON.parse(e.target.result);
    setCanvasSize(project.width, project.height);
    state.bg = project.bg;
    state.gradient = project.gradient;
    state.pattern = project.pattern;
    state.effects = project.effects;

    let pending = 0;
    const done = () => { pending--; if (pending <= 0) { pushHistory(); render(); refreshLayerUI(); } };

    if (project.bgImageData) {
      pending++;
      const img = new Image();
      img.onload = () => { state.bgImage.img = img; done(); };
      img.src = project.bgImageData;
    }

    state.layers = project.layers.map(l => {
      if (l.imgData) {
        pending++;
        const img = new Image();
        img.onload = () => { l.img = img; done(); };
        img.src = l.imgData;
        delete l.imgData;
      }
      return l;
    });

    if (pending === 0) { pushHistory(); render(); refreshLayerUI(); }
  };
  reader.readAsText(file);
}

// ---- Background Removal ----
let bgRemovalBlob = null;
let bgRemovalModule = null;

async function handleBgRemovalInput(e) {
  const file = e.target.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  document.getElementById('bgRemovalOriginal').src = url;
  document.getElementById('bgRemovalResult').src = '';
  document.getElementById('bgRemovalProcess').disabled = false;
  document.getElementById('bgRemovalAdd').disabled = true;
  bgRemovalBlob = null;
}

async function processBackgroundRemoval() {
  const fileInput = document.getElementById('bgRemovalInput');
  const file = fileInput.files[0];
  if (!file) return;

  const progressBar = document.getElementById('bgRemovalProgress');
  const progressFill = document.getElementById('bgRemovalProgressFill');
  const statusEl = document.getElementById('bgRemovalStatus');
  const processBtn = document.getElementById('bgRemovalProcess');

  progressBar.classList.remove('hidden');
  progressFill.style.width = '10%';
  statusEl.textContent = 'Loading AI model (first time ~40MB download)...';
  processBtn.disabled = true;

  try {
    if (!bgRemovalModule) {
      bgRemovalModule = await import('https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.4.5/dist/index.js');
    }

    progressFill.style.width = '30%';
    statusEl.textContent = 'Processing image...';

    const blob = await bgRemovalModule.default(file, {
      progress: (key, current, total) => {
        if (total > 0) {
          const pct = 30 + (current / total) * 60;
          progressFill.style.width = pct + '%';
        }
        statusEl.textContent = `Processing: ${key}...`;
      }
    });

    bgRemovalBlob = blob;
    const url = URL.createObjectURL(blob);
    document.getElementById('bgRemovalResult').src = url;
    document.getElementById('bgRemovalAdd').disabled = false;

    progressFill.style.width = '100%';
    statusEl.textContent = 'Done! Background removed.';
  } catch (err) {
    statusEl.textContent = 'Error: ' + err.message;
    console.error(err);
    processBtn.disabled = false;
  }
}

function addBgRemovedToCanvas() {
  if (!bgRemovalBlob) return;
  const url = URL.createObjectURL(bgRemovalBlob);
  const img = new Image();
  img.onload = () => {
    const layer = {
      id: newId(), type: 'image', img, x: 0, y: 0, w: img.width, h: img.height,
      rotation: 0, opacity: 100, visible: true, locked: false,
    };
    fitImageToCanvas(layer);
    state.layers.push(layer);
    pushHistory();
    render();
    refreshLayerUI();
    document.getElementById('bgRemovalModal').classList.add('hidden');
  };
  img.src = url;
}

// ---- Init ----
init();
