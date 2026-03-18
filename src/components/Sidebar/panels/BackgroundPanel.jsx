import { useState } from 'react';
import { useAppState, useDispatch } from '../../../store/state';
import { colorPresets, gradientPresets, patternTypes } from '../../../utils/constants';
import { loadImageFile } from '../../../utils/export';

export default function BackgroundPanel() {
  const state = useAppState();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState(state.bg.type);

  const switchTab = (type) => {
    setActiveTab(type);
    dispatch({ type: 'SET_BG', payload: { type } });
  };

  return (
    <>
      <div className="bg-type-tabs">
        {['solid', 'gradient', 'image', 'pattern'].map(t => (
          <button key={t} className={`bg-tab ${activeTab === t ? 'active' : ''}`} onClick={() => switchTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Solid */}
      {activeTab === 'solid' && (
        <div className="bg-options">
          <input
            type="color"
            value={state.bg.color || '#1a1a2e'}
            onChange={e => dispatch({ type: 'SET_BG', payload: { color: e.target.value, type: 'solid' } })}
          />
          <div className="color-presets">
            {colorPresets.map(c => (
              <div
                key={c}
                className="color-swatch"
                style={{ background: c }}
                onClick={() => dispatch({ type: 'SET_BG', payload: { color: c, type: 'solid' } })}
              />
            ))}
          </div>
        </div>
      )}

      {/* Gradient */}
      {activeTab === 'gradient' && (
        <div className="bg-options">
          <div className="row">
            <input type="color" value={state.gradient.color1} onChange={e => dispatch({ type: 'SET_GRADIENT', payload: { color1: e.target.value } })} />
            <input type="color" value={state.gradient.color2} onChange={e => dispatch({ type: 'SET_GRADIENT', payload: { color2: e.target.value } })} />
          </div>
          <div className="row">
            <label>Angle</label>
            <input type="range" min="0" max="360" value={state.gradient.angle}
              onChange={e => dispatch({ type: 'SET_GRADIENT', payload: { angle: +e.target.value } })} />
            <span>{state.gradient.angle}°</span>
          </div>
          <select value={state.gradient.type} onChange={e => dispatch({ type: 'SET_GRADIENT', payload: { type: e.target.value } })}>
            <option value="linear">Linear</option>
            <option value="radial">Radial</option>
          </select>
          <div className="gradient-presets">
            {gradientPresets.map(([c1, c2], i) => (
              <div
                key={i}
                className="gradient-swatch"
                style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
                onClick={() => dispatch({ type: 'SET_GRADIENT', payload: { color1: c1, color2: c2 } })}
              />
            ))}
          </div>
        </div>
      )}

      {/* Image */}
      {activeTab === 'image' && (
        <div className="bg-options">
          <input type="file" accept="image/*" onChange={e => {
            loadImageFile(e.target.files[0], img => {
              dispatch({ type: 'SET_BG_IMAGE', payload: { img } });
              dispatch({ type: 'SET_BG', payload: { type: 'image' } });
            });
          }} />
          <select value={state.bgImage.fit} onChange={e => dispatch({ type: 'SET_BG_IMAGE', payload: { fit: e.target.value } })}>
            <option value="cover">Cover</option>
            <option value="contain">Contain</option>
            <option value="stretch">Stretch</option>
            <option value="tile">Tile</option>
          </select>
          <div className="row">
            <label>Blur</label>
            <input type="range" min="0" max="20" value={state.bgImage.blur}
              onChange={e => dispatch({ type: 'SET_BG_IMAGE', payload: { blur: +e.target.value } })} />
            <span>{state.bgImage.blur}px</span>
          </div>
          <div className="row">
            <label>Brightness</label>
            <input type="range" min="0" max="200" value={state.bgImage.brightness}
              onChange={e => dispatch({ type: 'SET_BG_IMAGE', payload: { brightness: +e.target.value } })} />
            <span>{state.bgImage.brightness}%</span>
          </div>
          <div className="row">
            <label>Overlay Color</label>
            <input type="color" value={state.bgImage.overlayColor}
              onChange={e => dispatch({ type: 'SET_BG_IMAGE', payload: { overlayColor: e.target.value } })} />
          </div>
          <div className="row">
            <label>Overlay Opacity</label>
            <input type="range" min="0" max="100" value={state.bgImage.overlayOpacity}
              onChange={e => dispatch({ type: 'SET_BG_IMAGE', payload: { overlayOpacity: +e.target.value } })} />
            <span>{state.bgImage.overlayOpacity}%</span>
          </div>
        </div>
      )}

      {/* Pattern */}
      {activeTab === 'pattern' && (
        <div className="bg-options">
          <select value={state.pattern.type} onChange={e => dispatch({ type: 'SET_PATTERN', payload: { type: e.target.value } })}>
            {patternTypes.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
          <div className="row">
            <input type="color" value={state.pattern.bg} onChange={e => dispatch({ type: 'SET_PATTERN', payload: { bg: e.target.value } })} />
            <input type="color" value={state.pattern.fg} onChange={e => dispatch({ type: 'SET_PATTERN', payload: { fg: e.target.value } })} />
          </div>
          <div className="row">
            <label>Scale</label>
            <input type="range" min="5" max="80" value={state.pattern.scale}
              onChange={e => dispatch({ type: 'SET_PATTERN', payload: { scale: +e.target.value } })} />
          </div>
          <div className="row">
            <label>Opacity</label>
            <input type="range" min="5" max="100" value={state.pattern.opacity}
              onChange={e => dispatch({ type: 'SET_PATTERN', payload: { opacity: +e.target.value } })} />
          </div>
        </div>
      )}
    </>
  );
}
