import { useRef } from 'react';
import { useAppState } from '../../../store/state';
import { useLayers } from '../../../hooks/useLayers';
import { loadImageFile } from '../../../utils/export';

function ImageLayerItem({ layer, updateLayer, deleteLayer, duplicateLayer, moveLayer }) {
  const update = (key, val) => updateLayer(layer.id, { [key]: val });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    loadImageFile(file, img => {
      updateLayer(layer.id, { img, w: img.width, h: img.height });
    });
  };

  return (
    <div className="layer-item">
      <div className="layer-item-header">
        <span>Image #{layer.id}</span>
        <div className="layer-controls">
          <button className="btn-sm" onClick={() => moveLayer(layer.id, -1)}>&#9650;</button>
          <button className="btn-sm" onClick={() => moveLayer(layer.id, 1)}>&#9660;</button>
          <button className="btn-sm" onClick={() => duplicateLayer(layer.id)}>&#10697;</button>
          <button className="btn-danger" onClick={() => deleteLayer(layer.id)}>&#10005;</button>
        </div>
      </div>
      <div className="layer-field">
        <label>Replace Image</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </div>
      <div className="row">
        <label>X</label>
        <input type="number" value={Math.round(layer.x)} onChange={e => update('x', +e.target.value)} />
        <label>Y</label>
        <input type="number" value={Math.round(layer.y)} onChange={e => update('y', +e.target.value)} />
      </div>
      <div className="row">
        <label>W</label>
        <input type="number" value={Math.round(layer.w)} onChange={e => update('w', +e.target.value)} />
        <label>H</label>
        <input type="number" value={Math.round(layer.h)} onChange={e => update('h', +e.target.value)} />
      </div>
      <div className="row">
        <label>Rotation</label>
        <input type="range" min="-180" max="180" value={layer.rotation || 0} onChange={e => update('rotation', +e.target.value)} />
        <span>{layer.rotation || 0}°</span>
      </div>
      <div className="row">
        <label>Opacity</label>
        <input type="range" min="0" max="100" value={layer.opacity ?? 100} onChange={e => update('opacity', +e.target.value)} />
      </div>
    </div>
  );
}

export default function ImagePanel() {
  const state = useAppState();
  const { addImageLayer, updateLayer, deleteLayer, duplicateLayer, moveLayer } = useLayers();
  const fileRef = useRef(null);
  const imageLayers = state.layers.filter(l => l.type === 'image');

  const handleAdd = () => {
    fileRef.current.click();
  };

  const handleFileChosen = (e) => {
    const file = e.target.files[0];
    if (file) addImageLayer(file);
    e.target.value = '';
  };

  return (
    <>
      <button className="btn-primary" onClick={handleAdd}>+ Add Image</button>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChosen} />
      {imageLayers.map(layer => (
        <ImageLayerItem
          key={layer.id}
          layer={layer}
          updateLayer={updateLayer}
          deleteLayer={deleteLayer}
          duplicateLayer={duplicateLayer}
          moveLayer={moveLayer}
        />
      ))}
    </>
  );
}
