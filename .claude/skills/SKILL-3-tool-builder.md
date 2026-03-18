---
name: thumbnail-tool-builder
description: Build a sidebar+canvas thumbnail editor tool as a single-file HTML app. Use when creating, modifying, or extending the Stoic YouTube thumbnail generator. Defines the UI layout pattern, control components, state management, live preview rendering, and file export architecture.
---

# Thumbnail Tool Builder

Architecture patterns for building a single-file HTML thumbnail editor with a sidebar of controls and a live canvas preview.

## App Layout

Two-column grid: fixed sidebar (400–420px) + fluid preview area.

```html
<div class="app">
  <div class="sidebar"><!-- controls --></div>
  <div class="preview-area">
    <div class="canvas-wrap">
      <canvas id="c" width="1280" height="720"></canvas>
    </div>
  </div>
</div>
```

```css
.app {
  display: grid;
  grid-template-columns: 420px 1fr;
  min-height: 100vh;
}
.sidebar {
  overflow-y: auto;
  max-height: 100vh;
  padding: 20px 22px;
}
.canvas-wrap {
  width: 100%;
  max-width: 960px;
  aspect-ratio: 16/9;
}
canvas { width: 100%; height: 100%; display: block; }
```

Mobile breakpoint: collapse to single column at 1000px.

## State Management

No framework needed. Use a simple state object + inline `oninput="render()"` on every control. Keep it minimal:

```javascript
const state = { accent: '#f5c518' };
// Everything else reads directly from DOM inputs in render()
```

Read values inside `render()`:

```javascript
function render() {
  const l1 = document.getElementById('line1').value;
  const tScale = +document.getElementById('textSize').value / 100;
  const showBar = document.getElementById('toggleBar').classList.contains('on');
  // ... draw everything
}
```

**Rule:** Every control must call `render()` on change. No exceptions.

## Control Components

### Text Input
```html
<label>Line 1</label>
<input type="text" id="line1" value="THE OBSTACLE" oninput="render()">
```

### Slider with Value Display
```html
<label>Text Size</label>
<div class="slider-group">
  <input type="range" id="textSize" min="60" max="160" value="100"
    oninput="render(); this.nextElementSibling.textContent=this.value+'%'">
  <span class="slider-val">100%</span>
</div>
```

### Toggle Switch
```html
<div class="toggle-row">
  <label>Gold accent bar</label>
  <div class="toggle on" id="toggleBar"
    onclick="this.classList.toggle('on'); render()"></div>
</div>
```

CSS: `.toggle` is 32×18px rounded, `.toggle.on` changes background, `::after` slides.

### Color Swatch Row
```html
<div class="color-row">
  <div class="color-swatch active" data-color="#f5c518"
    style="background:#f5c518" onclick="pickAccent(this)"></div>
  <!-- more swatches -->
  <input type="color" id="customAccent" value="#f5c518"
    oninput="state.accent=this.value; render()">
</div>
```

```javascript
function pickAccent(el) {
  document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
  el.classList.add('active');
  state.accent = el.dataset.color;
  document.getElementById('customAccent').value = state.accent;
  render();
}
```

### Preset Buttons
```html
<div class="presets">
  <button class="preset-btn active" onclick="applyPreset('obstacle',this)">Obstacle</button>
  <!-- more -->
</div>
```

```javascript
function applyPreset(key, el) {
  document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  const p = presets[key];
  document.getElementById('line1').value = p.l1;
  // ... set all fields
  state.accent = p.accent;
  render();
}
```

### Collapsible Design Element Card

For decorative elements (rings, dots) — each in a card that expands to reveal position/size sliders:

```html
<div class="deco-card active" onclick="this.classList.toggle('active')">
  <div class="deco-header">
    <span class="deco-title">Concentric Rings</span>
    <div class="toggle on" id="toggleRings"
      onclick="event.stopPropagation(); this.classList.toggle('on'); render()"></div>
  </div>
  <div class="deco-body" onclick="event.stopPropagation()">
    <!-- X, Y, Size sliders here -->
  </div>
</div>
```

CSS: `.deco-body { display: none; }` / `.deco-card.active .deco-body { display: block; }`

**Key:** `event.stopPropagation()` on inner controls prevents card toggle when adjusting sliders.

## File Upload Zone

```html
<div class="upload-zone" onclick="document.getElementById('fileInput').click()">
  <div class="icon">🗿</div>
  <div class="ulabel">Click to upload</div>
  <div class="filename" id="fileName"></div>
</div>
<input type="file" id="fileInput" accept="image/*" onchange="loadImage(event)" hidden>
```

On upload: read as DataURL → create Image → store in global → call render().

## Sidebar Section Organization

Group controls with labeled dividers:

```
[Presets]           — Quick-start buttons
─────────────────
[Text]              — Pre-label, Lines 1-3, Channel, Font, Size, Y position
─────────────────
[Statue Image]      — Upload, X, Y, Scale
─────────────────
[Colors & Style]    — Accent color, glow, toggles (bar, line, grain, veins)
─────────────────
[Design Elements]   — Collapsible cards for each decorative element
─────────────────
[Download JPG/PNG]  — Export buttons
```

## Export Buttons

```html
<button class="btn-primary" onclick="downloadJPG()">⬇ Download JPG</button>
<button class="btn-secondary" onclick="downloadPNG()">Download PNG</button>
```

## Common Bugs to Avoid

1. **Font not loaded on first render.** Add `document.fonts.ready.then(render)`.
2. **Pre-label hidden behind headlines.** Draw headlines first, then pre-label on top.
3. **No statue Y control.** Always provide X, Y, AND Scale for uploaded images.
4. **Sliders not calling render().** Every `oninput` must include `render()`.
5. **Canvas toDataURL fails with cross-origin images.** Set `img.crossOrigin = 'anonymous'` before setting `.src` for remote images. For local uploads via FileReader, this isn't needed.
6. **Toggle state read incorrectly.** Use `.classList.contains('on')`, not a JS variable.
7. **Decorative element sliders toggle the card.** Always `event.stopPropagation()` on `.deco-body`.

## Iteration Pattern

When user requests changes to the existing thumbnail generator:

1. Read the current HTML file fully before editing.
2. Identify which layer in the render stack is affected.
3. Make the change while preserving the draw order.
4. Test that all controls still call `render()`.
5. Verify export still works (canvas dimensions unchanged).
