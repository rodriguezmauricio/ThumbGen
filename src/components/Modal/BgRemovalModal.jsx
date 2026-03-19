import { useState, useRef } from 'react';
import { useAppState, useDispatch } from '../../store/state';
import { fitImageToCanvas } from '../../utils/export';

export default function BgRemovalModal() {
  const state = useAppState();
  const dispatch = useDispatch();
  const [visible, setVisible] = useState(false);
  const [originalSrc, setOriginalSrc] = useState('');
  const [resultSrc, setResultSrc] = useState('');
  const [processing, setProcessing] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [canProcess, setCanProcess] = useState(false);
  const [canAdd, setCanAdd] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileRef = useRef(null);
  const blobRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const url = URL.createObjectURL(file);
    setOriginalSrc(url);
    setResultSrc('');
    setCanProcess(true);
    setCanAdd(false);
    blobRef.current = null;
    setStatusText('');
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  };

  const processRemoval = async () => {
    const file = fileRef.current?.files[0];
    if (!file) return;

    setProcessing(true);
    setStatusText('Removing background...');
    setCanProcess(false);

    try {
      const base64 = await fileToBase64(file);

      const response = await fetch('/api/remove-bg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove background');
      }

      // Convert base64 result to blob
      const res = await fetch(data.result);
      const blob = await res.blob();

      blobRef.current = blob;
      setResultSrc(data.result);
      setCanAdd(true);
      setStatusText('Done! Background removed.');
    } catch (err) {
      setStatusText('Error: ' + err.message);
      console.error('BG Removal Error:', err);
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
      <button className="floating-btn" title="Remove Background Tool" onClick={() => setVisible(true)}>
        &#9986; Remove BG
      </button>

      {visible && (
        <div className="modal">
          <div className="modal-content">
            <h2>Remove Background</h2>
            <p>Upload an image to remove its background. Powered by Remove.bg.</p>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
            <button className="btn-secondary" style={{ marginTop: 8 }} onClick={() => fileRef.current?.click()}>
              Choose Image...
            </button>
            {fileName && <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>{fileName}</span>}
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
            {statusText && (
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: processing ? '60%' : '100%' }} />
                <span>{statusText}</span>
              </div>
            )}
            <div className="modal-actions">
              <button className="btn-primary" disabled={!canProcess || processing} onClick={processRemoval}>
                {processing ? 'Processing...' : 'Remove Background'}
              </button>
              <button className="btn-primary" disabled={!canAdd} onClick={addToCanvas}>Add to Canvas</button>
              <button className="btn-secondary" onClick={() => setVisible(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
