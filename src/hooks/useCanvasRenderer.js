import { useEffect, useRef, useCallback } from 'react';
import { useAppState, useDispatch } from '../store/state';
import { renderToContext, hitTest } from '../utils/drawing';

export function useCanvasRenderer() {
  const state = useAppState();
  const dispatch = useDispatch();
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const draggingRef = useRef(null);
  const dragStartRef = useRef(null);

  // Render canvas
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    renderToContext(ctx, state.width, state.height, state);
  }, [state]);

  useEffect(() => {
    render();
  }, [render]);

  // Set canvas size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = state.width;
    canvas.height = state.height;
  }, [state.width, state.height]);

  // Zoom
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.style.transform = `scale(${state.zoom})`;
    canvas.style.transformOrigin = 'center center';
  }, [state.zoom]);

  const fitZoom = useCallback(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const sx = (wrapper.clientWidth - 40) / state.width;
    const sy = (wrapper.clientHeight - 40) / state.height;
    dispatch({ type: 'SET_ZOOM', payload: Math.min(sx, sy, 1) });
  }, [state.width, state.height, dispatch]);

  // Fit zoom on mount and resize
  useEffect(() => {
    fitZoom();
    const handleResize = () => fitZoom();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [fitZoom]);

  // Mouse handlers for drag
  const handleMouseDown = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = state.width / rect.width;
    const scaleY = state.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    for (let i = state.layers.length - 1; i >= 0; i--) {
      const l = state.layers[i];
      if (l.visible === false || l.locked) continue;
      if (hitTest(l, mx, my)) {
        draggingRef.current = l;
        dragStartRef.current = { x: mx - l.x, y: my - l.y };
        dispatch({ type: 'SELECT_LAYER', payload: l.id });
        return;
      }
    }
    dispatch({ type: 'SELECT_LAYER', payload: null });
  }, [state.layers, state.width, state.height, dispatch]);

  const handleMouseMove = useCallback((e) => {
    if (!draggingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = state.width / rect.width;
    const scaleY = state.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    const newX = mx - dragStartRef.current.x;
    const newY = my - dragStartRef.current.y;
    dispatch({
      type: 'UPDATE_LAYER',
      payload: { id: draggingRef.current.id, updates: { x: newX, y: newY } }
    });
  }, [state.width, state.height, dispatch]);

  const handleMouseUp = useCallback(() => {
    if (draggingRef.current) {
      dispatch({ type: 'PUSH_HISTORY' });
      draggingRef.current = null;
      dragStartRef.current = null;
    }
  }, [dispatch]);

  const handleMouseLeave = useCallback(() => {
    if (draggingRef.current) {
      dispatch({ type: 'PUSH_HISTORY' });
      draggingRef.current = null;
      dragStartRef.current = null;
    }
  }, [dispatch]);

  return {
    canvasRef,
    wrapperRef,
    fitZoom,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
  };
}
