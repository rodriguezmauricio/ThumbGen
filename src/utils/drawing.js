// All canvas drawing functions ported from app.js

export function roundRect(c, x, y, w, h, r) {
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

export function drawBgImage(c, w, h, bgImage) {
  const img = bgImage.img;
  if (!img) return;
  const fit = bgImage.fit;
  c.save();
  let filterStr = '';
  if (bgImage.blur > 0) filterStr += `blur(${bgImage.blur}px) `;
  if (bgImage.brightness !== 100) filterStr += `brightness(${bgImage.brightness}%)`;
  if (filterStr) c.filter = filterStr.trim();

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
    for (let y2 = 0; y2 < h; y2 += img.height) {
      for (let x2 = 0; x2 < w; x2 += img.width) {
        c.drawImage(img, x2, y2);
      }
    }
  }
  c.restore();

  if (bgImage.overlayOpacity > 0) {
    c.save();
    c.globalAlpha = bgImage.overlayOpacity / 100;
    c.fillStyle = bgImage.overlayColor;
    c.fillRect(0, 0, w, h);
    c.restore();
  }
}

export function drawPattern(c, w, h, p) {
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

export function drawTextLayer(c, layer, sx, sy) {
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

export function drawImageLayer(c, layer, sx, sy) {
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

export function drawShapeLayer(c, layer, sx, sy) {
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

export function drawVignette(c, w, h, amount) {
  const grad = c.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.8);
  grad.addColorStop(0, 'transparent');
  grad.addColorStop(1, `rgba(0,0,0,${amount / 100})`);
  c.fillStyle = grad;
  c.fillRect(0, 0, w, h);
}

export function drawNoise(c, w, h, amount) {
  const imageData = c.getImageData(0, 0, w, h);
  const data = imageData.data;
  const n = amount / 100 * 50;
  for (let i = 0; i < data.length; i += 4) {
    const v = (Math.random() - 0.5) * n;
    data[i] += v;
    data[i + 1] += v;
    data[i + 2] += v;
  }
  c.putImageData(imageData, 0, 0);
}

export function drawBorder(c, w, h, effects) {
  const bw = effects.borderWidth;
  const br = effects.borderRadius;
  c.strokeStyle = effects.borderColor;
  c.lineWidth = bw * 2;
  if (br > 0) {
    roundRect(c, 0, 0, w, h, br);
    c.stroke();
  } else {
    c.strokeRect(0, 0, w, h);
  }
}

export function renderToContext(c, w, h, stateOrTemplate, baseState) {
  const s = stateOrTemplate;
  const isTemplate = !!baseState;
  const refState = baseState || s;
  const scaleX = w / refState.width;
  const scaleY = h / refState.height;

  c.clearRect(0, 0, w, h);
  c.save();

  const br = (isTemplate ? 0 : refState.effects.borderRadius) * Math.min(scaleX, scaleY);
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
    const g = s.gradient || refState.gradient;
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
  } else if (bgType === 'image' && refState.bgImage.img) {
    drawBgImage(c, w, h, refState.bgImage);
  } else if (bgType === 'pattern') {
    const p = s.pattern || refState.pattern;
    c.fillStyle = p.bg;
    c.fillRect(0, 0, w, h);
    drawPattern(c, w, h, p);
  }

  // Layers
  const layers = s.layers || refState.layers;
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
  if (!isTemplate) {
    if (refState.effects.vignette > 0) drawVignette(c, w, h, refState.effects.vignette);
    if (refState.effects.noise > 0) drawNoise(c, w, h, refState.effects.noise);
    if (refState.effects.borderWidth > 0) drawBorder(c, w, h, refState.effects);
  }

  c.restore();
}

export function hitTest(layer, mx, my) {
  if (layer.type === 'text') {
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
