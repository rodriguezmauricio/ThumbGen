import { useAppState } from '../../../store/state';
import { useLayers } from '../../../hooks/useLayers';
import { fontList } from '../../../utils/constants';

function TextLayerItem({ layer, updateLayer, deleteLayer, duplicateLayer, moveLayer }) {
  const update = (key, val) => updateLayer(layer.id, { [key]: val });

  return (
    <div className="layer-item">
      <div className="layer-item-header">
        <span>Text #{layer.id}</span>
        <div className="layer-controls">
          <button className="btn-sm" title="Move Up" onClick={() => moveLayer(layer.id, -1)}>&#9650;</button>
          <button className="btn-sm" title="Move Down" onClick={() => moveLayer(layer.id, 1)}>&#9660;</button>
          <button className="btn-sm" title="Duplicate" onClick={() => duplicateLayer(layer.id)}>&#10697;</button>
          <button className="btn-danger" title="Delete" onClick={() => deleteLayer(layer.id)}>&#10005;</button>
        </div>
      </div>
      <div className="layer-field">
        <label>Text</label>
        <textarea rows="2" value={layer.text} onChange={e => update('text', e.target.value)} />
      </div>
      <div className="row-2">
        <div className="layer-field">
          <label>Font</label>
          <select value={layer.font} onChange={e => update('font', e.target.value)}>
            {fontList.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div className="layer-field">
          <label>Size</label>
          <input type="number" value={layer.size} min="8" max="400" onChange={e => update('size', +e.target.value)} />
        </div>
      </div>
      <div className="row">
        <label>Color</label>
        <input type="color" value={layer.color} onChange={e => update('color', e.target.value)} />
        <label style={{ marginLeft: 8 }}>
          <input type="checkbox" checked={layer.bold} onChange={e => update('bold', e.target.checked)} /> B
        </label>
        <label>
          <input type="checkbox" checked={layer.italic} onChange={e => update('italic', e.target.checked)} /> I
        </label>
      </div>
      <div className="row">
        <label>Align</label>
        <select value={layer.align} onChange={e => update('align', e.target.value)}>
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
      <div className="row">
        <label>Position X</label>
        <input type="number" value={Math.round(layer.x)} onChange={e => update('x', +e.target.value)} />
        <label>Y</label>
        <input type="number" value={Math.round(layer.y)} onChange={e => update('y', +e.target.value)} />
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
      <div className="row">
        <label>Line Height</label>
        <input type="range" min="0.5" max="3" step="0.1" value={layer.lineHeight || 1.2} onChange={e => update('lineHeight', +e.target.value)} />
      </div>
      <div className="row">
        <label>Stroke</label>
        <input type="color" value={layer.strokeColor || '#000000'} onChange={e => update('strokeColor', e.target.value)} />
        <input type="number" value={layer.strokeWidth || 0} min="0" max="20" onChange={e => update('strokeWidth', +e.target.value)} />
      </div>
      <div className="row">
        <label>
          <input type="checkbox" checked={layer.shadow || false} onChange={e => update('shadow', e.target.checked)} /> Shadow
        </label>
        <input type="color" value={layer.shadowColor || '#000000'} onChange={e => update('shadowColor', e.target.value)} />
      </div>
      <div className="row">
        <label>Blur</label>
        <input type="number" value={layer.shadowBlur || 0} min="0" max="100" onChange={e => update('shadowBlur', +e.target.value)} />
        <label>X</label>
        <input type="number" value={layer.shadowX || 0} onChange={e => update('shadowX', +e.target.value)} />
        <label>Y</label>
        <input type="number" value={layer.shadowY || 0} onChange={e => update('shadowY', +e.target.value)} />
      </div>
    </div>
  );
}

export default function TextPanel() {
  const state = useAppState();
  const { addTextLayer, updateLayer, deleteLayer, duplicateLayer, moveLayer } = useLayers();
  const textLayers = state.layers.filter(l => l.type === 'text');

  return (
    <>
      <button className="btn-primary" onClick={addTextLayer}>+ Add Text Layer</button>
      {textLayers.map(layer => (
        <TextLayerItem
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
