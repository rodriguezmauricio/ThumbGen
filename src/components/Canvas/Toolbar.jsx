import { useState, useRef } from 'react';
import { useAppState, useDispatch } from '../../store/state';
import { useHistory } from '../../hooks/useHistory';
import { exportThumbnail, saveProject, loadProject, loadImageFile, fitImageToCanvas } from '../../utils/export';

export default function Toolbar() {
  const state = useAppState();
  const dispatch = useDispatch();
  const { undo, redo, pushHistory } = useHistory();
  const [format, setFormat] = useState('png');
  const [quality, setQuality] = useState(0.9);
  const projectFileRef = useRef(null);

  const setZoom = (z) => dispatch({ type: 'SET_ZOOM', payload: z });

  const handleExport = () => exportThumbnail(state, format, quality);
  const handleSave = () => saveProject(state);

  const handleLoadProject = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    loadProject(file, (project) => {
      dispatch({ type: 'SET_CANVAS_SIZE', payload: { w: project.width, h: project.height } });

      let pending = 0;
      const tryFinish = () => {
        pending--;
        if (pending <= 0) {
          dispatch({ type: 'PUSH_HISTORY' });
        }
      };

      if (project.bgImageData) {
        pending++;
        const img = new Image();
        img.onload = () => {
          dispatch({ type: 'SET_BG_IMAGE', payload: { img } });
          tryFinish();
        };
        img.src = project.bgImageData;
      }

      const layers = project.layers.map(l => {
        if (l.imgData) {
          pending++;
          const img = new Image();
          img.onload = () => {
            l.img = img;
            tryFinish();
          };
          img.src = l.imgData;
          delete l.imgData;
        }
        return l;
      });

      dispatch({
        type: 'LOAD_PROJECT',
        payload: {
          ...project,
          layers,
        }
      });

      if (pending === 0) {
        dispatch({ type: 'PUSH_HISTORY' });
      }
    });
    e.target.value = '';
  };

  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <button onClick={undo} title="Undo (Ctrl+Z)">&#8617; Undo</button>
        <button onClick={redo} title="Redo (Ctrl+Y)">&#8618; Redo</button>
        <span className="separator">|</span>
        <button onClick={() => setZoom(state.zoom + 0.1)}>+</button>
        <span id="zoomLevel">{Math.round(state.zoom * 100)}%</span>
        <button onClick={() => setZoom(state.zoom - 0.1)}>-</button>
        <button onClick={() => {
          // fitZoom is handled by the canvas component via resize
          dispatch({ type: 'SET_ZOOM', payload: 1 });
        }}>Fit</button>
      </div>
      <div className="toolbar-right">
        <select value={format} onChange={e => setFormat(e.target.value)}>
          <option value="png">PNG</option>
          <option value="jpeg">JPEG</option>
          <option value="webp">WebP</option>
        </select>
        <select value={quality} onChange={e => setQuality(+e.target.value)}>
          <option value="1">Max Quality</option>
          <option value="0.9">High (90%)</option>
          <option value="0.8">Medium (80%)</option>
          <option value="0.6">Low (60%)</option>
        </select>
        <button className="btn-export" onClick={handleExport}>&#11015; Download</button>
        <button className="btn-sm" onClick={handleSave}>Save Project</button>
        <button className="btn-sm" onClick={() => projectFileRef.current.click()}>Load Project</button>
        <input ref={projectFileRef} type="file" accept=".thumbgen" style={{ display: 'none' }} onChange={handleLoadProject} />
      </div>
    </div>
  );
}
