# Design Tokens Reference

## CSS Variables (for sidebar UI)

```css
:root {
  --bg: #08080a;
  --surface: #101014;
  --surface-2: #18181e;
  --border: #252530;
  --gold: #c9a84c;
  --gold-dim: #8a7230;
  --gold-bright: #f5d78e;
  --text: #e8e4dc;
  --text-dim: #6a6672;
}
```

## Google Fonts Import

```css
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cinzel:wght@400;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Oswald:wght@400;700&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');
```

## Content Presets

These are quick-start configurations for common video titles:

```javascript
const presets = {
  obstacle:   { pre:'Marcus Aurelius', l1:'THE OBSTACLE', l2:'IS THE',     l3:'WAY',       accent:'#f5c518' },
  discipline: { pre:'Marcus Aurelius', l1:'SELF',         l2:'DISCIPLINE', l3:'',          accent:'#f5c518' },
  chase:      { pre:'Stoic Wisdom',    l1:'NEVER',        l2:'CHASE',      l3:'ANYONE',    accent:'#e63030' },
  silence:    { pre:'Epictetus',       l1:'THE POWER',    l2:'OF',         l3:'SILENCE',   accent:'#e8751a' },
  control:    { pre:'Seneca',          l1:"DON'T LET",    l2:'ANYTHING',   l3:'AFFECT YOU',accent:'#e63030' },
};
```

## Accent Color Swatch Array

```javascript
const accentSwatches = [
  { hex: '#f5c518', name: 'Gold' },
  { hex: '#e8751a', name: 'Orange' },
  { hex: '#e63030', name: 'Red' },
  { hex: '#c9a84c', name: 'Warm Gold' },
  { hex: '#c0c0c0', name: 'Silver' },
  { hex: '#4a9ef5', name: 'Blue' },
];
```

## Background Layer Stack

Draw order on 1280×720 canvas:

```
1. ctx.fillRect(0,0,W,H) with #0a0a0a
2. Radial gradient at (W*0.8, H*0.5) radius W*0.55, #1c1710→transparent
3. Radial gradient at (W*0.05, H*0.4) radius W*0.4, #151210→transparent
4. Accent glow at (W*0.72, H*0.55) radius W*0.5, accent color at 20% opacity
5. Grain: 9000–12000 pixels at random positions, white at 0–3.5% alpha
6. Veins: 2 rotated lines at 38% and 55% x, accent color at 5–9% alpha
```

## Font Loading Note

Canvas `fillText()` requires fonts to be loaded before rendering. Google Fonts via `@import` in CSS handles this — but the first `render()` call may fire before fonts load. Handle with:

```javascript
document.fonts.ready.then(() => render());
```

Or call `render()` both on page load and after a 500ms delay as a fallback.
