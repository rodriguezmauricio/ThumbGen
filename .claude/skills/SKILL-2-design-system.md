---
name: stoic-design-system
description: Apply the dark cinematic Stoic/Philosophy YouTube thumbnail aesthetic. Use when building or styling a thumbnail generator, poster tool, or any visual asset for a faceless Stoicism YouTube channel. Defines the color palette, typography, layout grid, text hierarchy, decorative elements, and accent color system.
---

# Stoic Design System

The visual language for a faceless Stoicism/Philosophy YouTube channel. Dark, cinematic, dramatic marble statue imagery with warm accent lighting.

For detailed specs, see `references/design-tokens.md`.

## Aesthetic Direction

- **Mood:** Dark, dramatic, contemplative, museum-like
- **Palette:** Near-black backgrounds, warm accent lighting (gold/orange/red)
- **Subject:** Marble statue busts/figures generated with Leonardo AI
- **Text:** Bold impact typography, 3-line headline hierarchy
- **Depth cues:** Radial glows, film grain, decorative rings/dots, gradient veins

## Color Palette

### Backgrounds
| Token | Hex | Usage |
|-------|-----|-------|
| `bg-base` | `#0a0a0a` | Canvas fill |
| `bg-warm` | `#1c1710` | Radial gradient (right side, behind statue) |
| `bg-warm-alt` | `#151210` | Radial gradient (left side, subtle) |

### Accent Colors (user-selectable, one per thumbnail)
| Name | Hex | Mood |
|------|-----|------|
| Gold | `#f5c518` | Wisdom, authority, wealth |
| Warm Gold | `#c9a84c` | Classic, refined |
| Orange | `#e8751a` | Energy, power, transformation |
| Red | `#e63030` | Urgency, pain, warning |
| Silver | `#c0c0c0` | Calm, stoic detachment |
| Blue | `#4a9ef5` | Trust (rare, use sparingly) |

### UI Chrome (sidebar, not the thumbnail itself)
| Token | Hex |
|-------|-----|
| `surface` | `#101014` |
| `surface-2` | `#18181e` |
| `border` | `#252530` |
| `text` | `#e8e4dc` |
| `text-dim` | `#6a6672` |
| `gold-dim` | `#8a7230` |

## Typography

### Thumbnail Text (rendered on canvas)
| Role | Font | Weight | Default Size (at 1280×720) |
|------|------|--------|---------------------------|
| Headline (Lines 1–3) | Bebas Neue | 700 | 148px (scalable) |
| Headline alt | Cinzel, Oswald, or Cormorant Garamond | 700 | 148px |
| Pre-label | Oswald | 700 | 22px |
| Channel name | Oswald | 700 | 18px |

### UI Text (sidebar chrome)
| Role | Font | Size |
|------|------|------|
| Section labels | Cinzel | 9–10px, letter-spacing: 3px |
| Input labels | DM Sans | 10–11px |
| Controls | DM Sans | 12–13px |
| Brand title | Cinzel | 13–14px |

## 3-Line Headline System

Every thumbnail uses a split headline across 3 lines:

```
LINE 1 (white, bold, drop shadow)    → "THE OBSTACLE"
LINE 2 (accent color, glow effect)   → "IS THE"        ← emotional punch
LINE 3 (white, bold, drop shadow)    → "WAY"
```

- Accent line gets `shadowBlur: 55` glow in accent color
- White lines get `shadowBlur: 30` dark drop shadow with 3px offset
- Line spacing: `fontSize × 0.95`
- Max combined words: 5–8

## Pre-label

Small text above headlines showing philosopher name. Must render ON TOP of headline text (draw after headlines). Add a dark semi-transparent pill behind it for readability:

```
ctx.fillStyle = 'rgba(10,10,10,0.6)';
ctx.fillRect(x - 2, y - 16, textWidth + 4, 24);
ctx.fillStyle = accentColor;
ctx.fillText(preLabel, x, y);
```

## Layout Grid (1280×720)

```
┌─────────────────────────────────────┐
│▌ PRE-LABEL                          │
│▌ LINE 1 ████████                    │
│▌ LINE 2 ████████    [STATUE IMAGE]  │
│▌ LINE 3 ████████                    │
│▌                    [decorative     │
│▌                     elements]      │
│─────────────────────────────────────│
│▌ CHANNEL NAME                       │
└─────────────────────────────────────┘
```

- Text left-aligned at x=70
- Gold accent bar: x=0, width=6–7px, full height
- Statue: right 60–80% of frame, bottom-aligned, edge-faded
- Decorative elements: scattered for depth, behind and in front of statue
- Bottom line: gradient from accent→transparent at y = H-50
- Channel name: accent color at 35% opacity, y = H-26

## Decorative Elements Catalog

Each element is toggleable and has X, Y, Size controls.

| Element | Type | Default Position | Layer |
|---------|------|-----------------|-------|
| Concentric Rings | stroke circles (3 nested) | Upper center (42%, 18%) | Behind statue |
| Accent Dot 1 | filled circle | Bottom right (82%, 85%) | In front |
| Accent Dot 2 | filled circle | Off by default | In front |
| Small Ring | thin stroke circle | Right edge (88%, 42%) | In front |
| Gold Accent Bar | gradient rectangle | Left edge, full height | In front |
| Bottom Line | gradient stroke | x=70 to x=W-80 at y=H-50 | In front |
| Gold Veins | rotated thin lines | 38% and 55% x-position | Behind everything |

## Image Treatment

Uploaded statue images get:
- `filter: brightness(0.85) contrast(1.12) saturate(0.55)` — desaturated, moody
- Left edge fade: transparent → opaque over 20% of image width
- Right edge fade: slight transparency at 85%+
- Bottom fade: transparent at bottom 60–70px
- Composited via offscreen canvas + `destination-in`
