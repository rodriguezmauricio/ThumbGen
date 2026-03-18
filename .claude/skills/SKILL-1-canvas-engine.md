---
name: thumbnail-canvas-engine
description: Build HTML Canvas 2D image compositing tools with image upload, filters, gradient masking, text with shadows/glow, decorative shape drawing, and JPG/PNG export. Use when building thumbnail generators, image editors, poster makers, or any canvas-based visual tool that composites uploaded images with text and graphics.
---

# Canvas Image Compositing Engine

Procedural knowledge for building canvas-based image composition tools. Use these patterns whenever generating code for a thumbnail generator, poster maker, or visual editor that renders to `<canvas>`.

## Canvas Setup

Always use a fixed resolution canvas (not CSS-scaled dimensions):

```javascript
const W = 1280, H = 720; // YouTube thumbnail size
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
// CSS scales the preview: canvas { width: 100%; height: auto; }
```

## Image Upload + Drawing

Handle file upload, create an Image object, draw on canvas:

```javascript
let uploadedImg = null;

function loadImage(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const img = new Image();
    img.onload = () => { uploadedImg = img; render(); };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

// In render():
if (uploadedImg) {
  const imgH = H * scale;
  const imgW = (uploadedImg.width / uploadedImg.height) * imgH;
  const ix = W * posX - imgW * 0.5;
  const iy = (H - imgH) + (posY * H * 0.5);
  ctx.drawImage(uploadedImg, ix, iy, imgW, imgH);
}
```

## Edge-Fade Masking (critical for compositing)

Use an offscreen canvas + `destination-in` compositing to fade image edges:

```javascript
const tmp = document.createElement('canvas');
tmp.width = W; tmp.height = H;
const tc = tmp.getContext('2d');

// Draw image with CSS-like filters
tc.filter = 'brightness(0.85) contrast(1.1) saturate(0.6)';
tc.drawImage(img, ix, iy, imgW, imgH);
tc.filter = 'none';

// Apply gradient mask
tc.globalCompositeOperation = 'destination-in';

// Left-to-right fade
let mask = tc.createLinearGradient(ix, 0, ix + imgW, 0);
mask.addColorStop(0, 'transparent');
mask.addColorStop(0.2, 'black');
mask.addColorStop(0.85, 'black');
mask.addColorStop(1, 'rgba(0,0,0,0.2)');
tc.fillStyle = mask;
tc.fillRect(0, 0, W, H);

// Bottom fade
mask = tc.createLinearGradient(0, H - 70, 0, H);
mask.addColorStop(0, 'black');
mask.addColorStop(1, 'transparent');
tc.fillStyle = mask;
tc.fillRect(0, 0, W, H);

// Composite onto main canvas
ctx.drawImage(tmp, 0, 0);
```

## Text Rendering with Shadow/Glow

Two patterns: drop-shadow text (white headlines) and glow text (accent-colored highlights).

```javascript
// Drop shadow text
function drawShadowText(text, x, y, font, color) {
  ctx.font = font;
  ctx.textAlign = 'left';
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

// Glow text (for accent-colored lines)
function drawGlowText(text, x, y, font, color, glowColor) {
  ctx.font = font;
  ctx.textAlign = 'left';
  ctx.shadowColor = glowColor; // e.g. rgba(245,197,24,0.5)
  ctx.shadowBlur = 55;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
}
```

## Radial Gradient Backgrounds

Layer multiple radial gradients for depth:

```javascript
function drawRadialGlow(cx, cy, radius, r, g, b, alpha) {
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  grad.addColorStop(0, `rgba(${r},${g},${b},${alpha})`);
  grad.addColorStop(0.5, `rgba(${r},${g},${b},${alpha * 0.25})`);
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
}
```

## Grain/Noise Texture

Fast pixel scatter for film grain:

```javascript
function drawGrain(count, maxAlpha) {
  for (let i = 0; i < count; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * maxAlpha})`;
    ctx.fillRect(Math.random() * W, Math.random() * H, 1, 1);
  }
}
// Usage: drawGrain(10000, 0.035);
```

## Decorative Shapes

```javascript
// Concentric rings
function drawRings(cx, cy, baseR, count, thickness, color, opacity) {
  for (let i = 0; i < count; i++) {
    const r = baseR - i * (baseR / (count + 1));
    if (r < 5) continue;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${color},${opacity * (1 - i * 0.2)})`;
    ctx.lineWidth = thickness;
    ctx.stroke();
  }
}

// Filled dot
function drawDot(cx, cy, radius, color) {
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

// Outline ring
function drawRing(cx, cy, radius, color, thickness) {
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = thickness;
  ctx.stroke();
}

// Vertical vein/line (rotated)
function drawVein(x, rotation, color, alpha, thickness) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = thickness;
  ctx.translate(x, 0);
  ctx.rotate(rotation);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, H * 1.1);
  ctx.stroke();
  ctx.restore();
}
```

## Export to JPG/PNG

```javascript
function downloadJPG(canvas, filename) {
  const a = document.createElement('a');
  a.download = filename || `thumbnail-${Date.now()}.jpg`;
  a.href = canvas.toDataURL('image/jpeg', 0.95);
  a.click();
}

function downloadPNG(canvas, filename) {
  const a = document.createElement('a');
  a.download = filename || `thumbnail-${Date.now()}.png`;
  a.href = canvas.toDataURL('image/png');
  a.click();
}
```

## Render Loop Pattern

All drawing happens inside one `render()` function called on every input change. Layer order matters — draw back-to-front:

1. Solid background fill
2. Background gradients (marble textures, ambient light)
3. Accent color glow
4. Grain/noise texture
5. Background decorative lines (veins)
6. Decorative elements (behind subject): rings, circles
7. Subject image (with edge-fade mask)
8. Decorative elements (in front of subject): dots, small rings
9. Accent bar / border elements
10. Headline text (bottom layer of text)
11. Pre-label / subtitle text (on top, with background pill if needed)
12. Bottom line / channel branding

**Every** slider, toggle, text input, color picker, and file upload must call `render()`.
