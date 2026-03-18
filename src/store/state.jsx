import { createContext, useContext, useReducer, useRef, useCallback } from 'react';

const AppContext = createContext(null);
const DispatchContext = createContext(null);

let layerIdCounter = 0;
export function newId() { return ++layerIdCounter; }

const initialState = {
  width: 1280,
  height: 720,
  zoom: 1,
  bg: { type: 'solid', color: '#1a1a2e' },
  gradient: { color1: '#667eea', color2: '#764ba2', angle: 135, type: 'linear' },
  bgImage: { img: null, fit: 'cover', blur: 0, brightness: 100, overlayColor: '#000000', overlayOpacity: 0 },
  pattern: { type: 'dots', bg: '#1a1a2e', fg: '#ffffff', scale: 20, opacity: 30 },
  layers: [],
  selectedLayer: null,
  effects: { vignette: 0, noise: 0, borderWidth: 0, borderColor: '#ffffff', borderRadius: 0 },
  history: [],
  historyIndex: -1,
  dragging: null,
  dragStart: null,
};

function deepCloneLayers(layers) {
  return layers.map(l => {
    const clone = { ...l };
    // img references are kept as-is (not deep cloned)
    return clone;
  });
}

function createSnapshot(state) {
  return JSON.stringify({
    bg: state.bg,
    gradient: state.gradient,
    pattern: state.pattern,
    effects: state.effects,
    layers: state.layers.map(l => ({ ...l, img: l.img ? '__IMG__' : undefined })),
  });
}

function restoreFromSnapshot(state, snap) {
  const parsed = JSON.parse(snap);
  const imgMap = {};
  state.layers.forEach(l => { if (l.img) imgMap[l.id] = l.img; });
  const layers = parsed.layers.map(l => {
    if (l.img === '__IMG__') l.img = imgMap[l.id] || null;
    return l;
  });
  return {
    ...state,
    bg: parsed.bg,
    gradient: parsed.gradient,
    pattern: parsed.pattern,
    effects: parsed.effects,
    layers,
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, ...action.payload };

    case 'SET_BG':
      return { ...state, bg: { ...state.bg, ...action.payload } };

    case 'SET_GRADIENT':
      return { ...state, gradient: { ...state.gradient, ...action.payload } };

    case 'SET_BG_IMAGE':
      return { ...state, bgImage: { ...state.bgImage, ...action.payload } };

    case 'SET_PATTERN':
      return { ...state, pattern: { ...state.pattern, ...action.payload } };

    case 'SET_EFFECTS':
      return { ...state, effects: { ...state.effects, ...action.payload } };

    case 'SET_CANVAS_SIZE':
      return { ...state, width: action.payload.w, height: action.payload.h };

    case 'SET_ZOOM':
      return { ...state, zoom: Math.max(0.25, Math.min(3, action.payload)) };

    case 'SELECT_LAYER':
      return { ...state, selectedLayer: action.payload };

    case 'ADD_LAYER': {
      const layers = [...state.layers, { ...action.payload, id: newId(), visible: true, locked: false }];
      return { ...state, layers };
    }

    case 'UPDATE_LAYER': {
      const layers = state.layers.map(l =>
        l.id === action.payload.id ? { ...l, ...action.payload.updates } : l
      );
      return { ...state, layers };
    }

    case 'DELETE_LAYER': {
      const layers = state.layers.filter(l => l.id !== action.payload);
      const selectedLayer = state.selectedLayer === action.payload ? null : state.selectedLayer;
      return { ...state, layers, selectedLayer };
    }

    case 'DUPLICATE_LAYER': {
      const source = state.layers.find(l => l.id === action.payload);
      if (!source) return state;
      const clone = { ...source, id: newId(), x: source.x + 20, y: source.y + 20 };
      if (source.img) clone.img = source.img;
      return { ...state, layers: [...state.layers, clone] };
    }

    case 'MOVE_LAYER': {
      const { id, dir } = action.payload;
      const idx = state.layers.findIndex(l => l.id === id);
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= state.layers.length) return state;
      const layers = [...state.layers];
      [layers[idx], layers[newIdx]] = [layers[newIdx], layers[idx]];
      return { ...state, layers };
    }

    case 'SET_LAYERS':
      return { ...state, layers: action.payload };

    case 'TOGGLE_LAYER_VISIBILITY': {
      const layers = state.layers.map(l =>
        l.id === action.payload ? { ...l, visible: l.visible === false ? true : false } : l
      );
      return { ...state, layers };
    }

    case 'SET_DRAGGING':
      return { ...state, dragging: action.payload.dragging, dragStart: action.payload.dragStart };

    case 'PUSH_HISTORY': {
      const snap = createSnapshot(state);
      let history = state.history.slice(0, state.historyIndex + 1);
      history.push(snap);
      let historyIndex = history.length - 1;
      if (history.length > 50) { history.shift(); historyIndex--; }
      return { ...state, history, historyIndex };
    }

    case 'UNDO': {
      if (state.historyIndex <= 0) return state;
      const newIndex = state.historyIndex - 1;
      const restored = restoreFromSnapshot(state, state.history[newIndex]);
      return { ...restored, history: state.history, historyIndex: newIndex };
    }

    case 'REDO': {
      if (state.historyIndex >= state.history.length - 1) return state;
      const newIndex = state.historyIndex + 1;
      const restored = restoreFromSnapshot(state, state.history[newIndex]);
      return { ...restored, history: state.history, historyIndex: newIndex };
    }

    case 'APPLY_TEMPLATE': {
      const t = action.payload;
      let bg = state.bg;
      let gradient = state.gradient;
      if (t.bg.type === 'solid') {
        bg = { ...t.bg };
      } else if (t.bg.type === 'gradient') {
        bg = { type: 'gradient' };
        gradient = { ...t.gradient };
      }
      const layers = t.layers.map(l => ({ ...l, id: newId(), visible: true, locked: false }));
      return { ...state, bg, gradient, layers };
    }

    case 'LOAD_PROJECT': {
      const p = action.payload;
      return {
        ...state,
        width: p.width,
        height: p.height,
        bg: p.bg,
        gradient: p.gradient,
        pattern: p.pattern,
        effects: p.effects,
        layers: p.layers,
      };
    }

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <AppContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </AppContext.Provider>
  );
}

export function useAppState() {
  return useContext(AppContext);
}

export function useDispatch() {
  return useContext(DispatchContext);
}
