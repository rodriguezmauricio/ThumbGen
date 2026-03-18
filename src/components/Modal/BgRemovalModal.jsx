import { useState, useRef } from 'react';
import { removeBackground } from '@imgly/background-removal';
import { useAppState, useDispatch, newId } from '../../store/state';
import { fitImageToCanvas } from '../../utils/export';

export default function BgRemovalModal() {
  const state = useAppState();
  const dispatch = useDispatch();
  const [visible, setVisible] = useState(false);
  const [originalSrc, setOriginalSrc] = useState('');
  const [resultSrc, setResultSrc] = useState('');
  const [processing, setProcessing] = useState(false);
  const [progressWidth, setProgressWidth] = useState('0%');
  const [statusText, setStatusText] = useState('');
  const [canProcess, setCanProcess] = useState(false);
  const [canAdd, setCanAdd] = useState(false);
  const fileRef = useRef(null);
  const blobRef = useRef(null);
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setOriginalSrc(url);
    setResultSrc('');
    setCanProcess(true);
    setCanAdd(false);
    blobRef.current = null;
  };

  const processRemoval = async () => {
    const file = fileRef.current?.files[0];
    if (!file) return;

    setProcessing(true);
    setProgressWidth('10%');
    setStatusText('Loading AI model (first time ~40MB download)...');
    setCanProcess(false);

    try {
      setProgressWidth('30%');
      setStatusText('Processing image...');

      const blob = await removeBackground(file, {
        model: 'isnet',
        output: { format: 'image/png', quality: 1 },
        progress: (key, current, total) => {
          if (total > 0) {
            const pct = 30 + (current / total) * 60;
            setProgressWidth(pct + '%');
          }
          setStatusText(`Processing: ${key}...`);
        }
      });

      blobRef.current = blob;
      const url = URL.createObjectURL(blob);
      setResultSrc(url);
      setCanAdd(true);
      setProgressWidth('100%');
      setStatusText('Done! Background removed.');
    } catch (err) {
      setStatusText('Error: ' + err.message);
      console.error(err);
      setCanProcess(true);
    }
    setProcessing(false);
  };

  const addToCanvas = () => {
    if (!blobRef.current) return;
    const url = URL.createObjectURL(blobRef.current);
    const img = new Image();
    img.onload = () => {
      const layer = {
        type: 'image', img, x: 0, y: 0, w: img.width, h: img.height,
        rotation: 0, opacity: 100,
      };
      fitImageToCanvas(layer, state.width, state.height);
      dispatch({ type: 'ADD_LAYER', payload: layer });
      dispatch({ type: 'PUSH_HISTORY' });
      setVisible(false);
    };
    img.src = url;
  };

  return (
    <>
      {/* Floating button */}
      <button className="floating-btn" title="Remove Background Tool" onClick={() => setVisible(true)}>
        &#9986; Remove BG
      </button>

      {/* Modal */}
      {visible && (
        <div className="modal">
          <div className="modal-content">
            <h2>Remove Background</h2>
            <p>Upload an image to remove its background (runs locally in browser, 100% free).</p>
            <p className="note">First use downloads a ~40MB AI model (cached afterwards).</p>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} />
            <div className="preview-area">
              <div>
                <h4>Original</h4>
                {originalSrc && <img src={originalSrc} className="preview-img" alt="Original" />}
              </div>
              <div>
                <h4>Result</h4>
                {resultSrc && <img src={resultSrc} className="preview-img" alt="Result" />}
              </div>
            </div>
            {(processing || statusText) && (
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: progressWidth }} />
                <span>{statusText}</span>
              </div>
            )}
            <div className="modal-actions">
              <button className="btn-primary" disabled={!canProcess} onClick={processRemoval}>Remove Background</button>
              <button className="btn-primary" disabled={!canAdd} onClick={addToCanvas}>Add to Canvas</button>
              <button className="btn-secondary" onClick={() => setVisible(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
