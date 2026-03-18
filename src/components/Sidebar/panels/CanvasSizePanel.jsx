import { useState } from 'react';
import { useAppState, useDispatch } from '../../../store/state';
import { sizePresets } from '../../../utils/constants';

export default function CanvasSizePanel() {
  const state = useAppState();
  const dispatch = useDispatch();
  const [customW, setCustomW] = useState('');
  const [customH, setCustomH] = useState('');

  const setSize = (w, h) => {
    dispatch({ type: 'SET_CANVAS_SIZE', payload: { w, h } });
  };

  const applyCustom = () => {
    const w = +customW;
    const h = +customH;
    if (w >= 100 && h >= 100) setSize(w, h);
  };

  return (
    <>
      <div className="preset-sizes">
        {sizePresets.map(p => (
          <button
            key={p.label}
            className={`size-btn ${state.width === p.w && state.height === p.h ? 'active' : ''}`}
            onClick={() => setSize(p.w, p.h)}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="custom-size">
        <label>Custom:</label>
        <input type="number" placeholder="W" min="100" max="4000" value={customW} onChange={e => setCustomW(e.target.value)} />
        <span>x</span>
        <input type="number" placeholder="H" min="100" max="4000" value={customH} onChange={e => setCustomH(e.target.value)} />
        <button className="btn-sm" onClick={applyCustom}>Apply</button>
      </div>
    </>
  );
}
