import { useAppState } from '../../../store/state';
import { useLayers } from '../../../hooks/useLayers';
import { shapeTypes } from '../../../utils/constants';

function ShapeLayerItem({ layer, updateLayer, deleteLayer, duplicateLayer, moveLayer }) {
  const update = (key, val) => updateLayer(layer.id, { [key]: val });

  return (
    <div className="layer-item">
      <div className="layer-item-header">
        <span>Shape #{layer.id}</span>
        <div className="layer-controls">
          <button className="btn-sm" onClick={() => moveLayer(layer.id, -1)}>&#9650;</button>
          <button className="btn-sm" onClick={() => moveLayer(layer.id, 1)}>&#9660;</button>
          <button className="btn-sm" onClick={() => duplicateLayer(layer.id)}>&#10697;</button>
          <button className="btn-danger" onClick={() => deleteLayer(layer.id)}>&#10005;</button>
        </div>
      </div>
      <div className="layer-field">
        <label>Shape</label>
        <select value={layer.shape} onChange={e => update('shape', e.target.value)}>
          {shapeTypes.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
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
        <label>Fill</label>
        <input type="color" value={layer.fill || '#ffffff'} onChange={e => update('fill', e.target.value)} />
        <label>Stroke</label>
        <input type="color" value={layer.stroke || '#000000'} onChange={e => update('stroke', e.target.value)} />
        <input type="number" value={layer.strokeW || 0} min="0" max="20" style={{ width: 50 }} onChange={e => update('strokeW', +e.target.value)} />
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

export default function ShapePanel() {
  const state = useAppState();
  const { addShapeLayer, updateLayer, deleteLayer, duplicateLayer, moveLayer } = useLayers();
  const shapeLayers = state.layers.filter(l => l.type === 'shape');

  return (
    <>
      <button className="btn-primary" onClick={addShapeLayer}>+ Add Shape</button>
      {shapeLayers.map(layer => (
        <ShapeLayerItem
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
