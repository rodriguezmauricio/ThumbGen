import { useAppState, useDispatch } from '../../../store/state';

export default function EffectsPanel() {
  const state = useAppState();
  const dispatch = useDispatch();

  const set = (key, val) => dispatch({ type: 'SET_EFFECTS', payload: { [key]: val } });

  return (
    <>
      <div className="row">
        <label>Vignette</label>
        <input type="range" min="0" max="100" value={state.effects.vignette} onChange={e => set('vignette', +e.target.value)} />
      </div>
      <div className="row">
        <label>Noise/Grain</label>
        <input type="range" min="0" max="100" value={state.effects.noise} onChange={e => set('noise', +e.target.value)} />
      </div>
      <div className="row">
        <label>Border</label>
        <input type="range" min="0" max="30" value={state.effects.borderWidth} onChange={e => set('borderWidth', +e.target.value)} />
        <input type="color" value={state.effects.borderColor} onChange={e => set('borderColor', e.target.value)} />
      </div>
      <div className="row">
        <label>Border Radius</label>
        <input type="range" min="0" max="100" value={state.effects.borderRadius} onChange={e => set('borderRadius', +e.target.value)} />
      </div>
    </>
  );
}
