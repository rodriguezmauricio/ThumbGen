import { useAppState, useDispatch } from '../../store/state';

export default function LayerBar() {
  const state = useAppState();
  const dispatch = useDispatch();

  return (
    <div className="layer-bar">
      <h4>Layers</h4>
      <div id="layerList" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {state.layers.map(layer => {
          const typeIcon = layer.type === 'text' ? 'T' : layer.type === 'image' ? '\uD83D\uDDBC' : '\u25C6';
          const name = layer.type === 'text' ? layer.text.slice(0, 15) : `${layer.type} #${layer.id}`;
          const isSelected = state.selectedLayer === layer.id;

          return (
            <div
              key={layer.id}
              className={`layer-chip ${isSelected ? 'selected' : ''}`}
              onClick={() => dispatch({ type: 'SELECT_LAYER', payload: layer.id })}
            >
              <span
                className={`eye ${layer.visible !== false ? 'visible' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch({ type: 'TOGGLE_LAYER_VISIBILITY', payload: layer.id });
                }}
              >
                &#128065;
              </span>
              {' '}{typeIcon} {name}
            </div>
          );
        })}
      </div>
    </div>
  );
}
