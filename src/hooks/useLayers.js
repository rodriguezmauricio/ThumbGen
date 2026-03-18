import { useCallback } from 'react';
import { useAppState, useDispatch, newId } from '../store/state';
import { loadImageFile, fitImageToCanvas } from '../utils/export';

export function useLayers() {
  const state = useAppState();
  const dispatch = useDispatch();

  const addTextLayer = useCallback(() => {
    dispatch({
      type: 'ADD_LAYER',
      payload: {
        type: 'text', text: 'Your Text', x: state.width / 2, y: state.height / 2,
        font: 'Inter', size: 64, color: '#ffffff', bold: true, italic: false, align: 'center',
        strokeColor: '#000000', strokeWidth: 0, shadow: false, shadowColor: '#000000',
        shadowBlur: 10, shadowX: 4, shadowY: 4, rotation: 0, opacity: 100, lineHeight: 1.2,
      },
    });
    dispatch({ type: 'PUSH_HISTORY' });
  }, [dispatch, state.width, state.height]);

  const addImageLayer = useCallback((file) => {
    loadImageFile(file, (img) => {
      const layer = {
        type: 'image', img, x: 0, y: 0, w: img.width, h: img.height,
        rotation: 0, opacity: 100,
      };
      fitImageToCanvas(layer, state.width, state.height);
      dispatch({ type: 'ADD_LAYER', payload: layer });
      dispatch({ type: 'PUSH_HISTORY' });
    });
  }, [dispatch, state.width, state.height]);

  const addShapeLayer = useCallback(() => {
    dispatch({
      type: 'ADD_LAYER',
      payload: {
        type: 'shape', shape: 'rect',
        x: state.width / 2 - 100, y: state.height / 2 - 75, w: 200, h: 150,
        fill: '#e94560', stroke: '', strokeW: 0, rotation: 0, opacity: 100,
      },
    });
    dispatch({ type: 'PUSH_HISTORY' });
  }, [dispatch, state.width, state.height]);

  const updateLayer = useCallback((id, updates) => {
    dispatch({ type: 'UPDATE_LAYER', payload: { id, updates } });
  }, [dispatch]);

  const deleteLayer = useCallback((id) => {
    dispatch({ type: 'DELETE_LAYER', payload: id });
    dispatch({ type: 'PUSH_HISTORY' });
  }, [dispatch]);

  const duplicateLayer = useCallback((id) => {
    dispatch({ type: 'DUPLICATE_LAYER', payload: id });
    dispatch({ type: 'PUSH_HISTORY' });
  }, [dispatch]);

  const moveLayer = useCallback((id, dir) => {
    dispatch({ type: 'MOVE_LAYER', payload: { id, dir } });
    dispatch({ type: 'PUSH_HISTORY' });
  }, [dispatch]);

  const toggleVisibility = useCallback((id) => {
    dispatch({ type: 'TOGGLE_LAYER_VISIBILITY', payload: id });
  }, [dispatch]);

  return {
    addTextLayer, addImageLayer, addShapeLayer,
    updateLayer, deleteLayer, duplicateLayer, moveLayer, toggleVisibility,
  };
}
