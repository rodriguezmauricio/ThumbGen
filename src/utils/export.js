import { renderToContext } from './drawing';

export function exportThumbnail(state, format, quality) {
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = state.width;
  exportCanvas.height = state.height;
  const ectx = exportCanvas.getContext('2d');
  renderToContext(ectx, state.width, state.height, state);

  const mimeType = format === 'png' ? 'image/png' : format === 'jpeg' ? 'image/jpeg' : 'image/webp';
  const link = document.createElement('a');
  link.download = `thumbnail_${state.width}x${state.height}.${format}`;
  link.href = exportCanvas.toDataURL(mimeType, quality);
  link.click();
}

export function saveProject(state) {
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

export function loadProject(file, callback) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const project = JSON.parse(e.target.result);
    callback(project);
  };
  reader.readAsText(file);
}

export function loadImageFile(file, callback) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => callback(img);
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

export function fitImageToCanvas(layer, width, height) {
  const maxW = width * 0.6;
  const maxH = height * 0.6;
  const scale = Math.min(maxW / layer.w, maxH / layer.h, 1);
  layer.w = Math.round(layer.w * scale);
  layer.h = Math.round(layer.h * scale);
  layer.x = Math.round((width - layer.w) / 2);
  layer.y = Math.round((height - layer.h) / 2);
}
