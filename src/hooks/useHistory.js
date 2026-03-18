import { useCallback, useEffect } from 'react';
import { useAppState, useDispatch } from '../store/state';

export function useHistory() {
  const state = useAppState();
  const dispatch = useDispatch();

  const pushHistory = useCallback(() => {
    dispatch({ type: 'PUSH_HISTORY' });
  }, [dispatch]);

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, [dispatch]);

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, [dispatch]);

  useEffect(() => {
    const handleKeydown = (e) => {
      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); }
      if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redo(); }
      if (e.key === 'Delete' && state.selectedLayer) {
        dispatch({ type: 'DELETE_LAYER', payload: state.selectedLayer });
        pushHistory();
      }
    };
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [undo, redo, state.selectedLayer, dispatch, pushHistory]);

  return { pushHistory, undo, redo };
}
