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
  const [progressWidth, setProgressWidth] = useState('0%');
  const [statusText, setStatusText] = useState('');
  const [canProcess, setCanProcess] = useState(false);
  const [canAdd, setCanAdd] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileRef = useRef(null);
  const blobRef = useRef(null);
  const moduleRef = useRef(null);

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
  };

  // Boost image contrast to help the model distinguish foreground from background
  const boostContrast = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        // Draw original
        ctx.drawImage(img, 0, 0);

        // Increase brightness and contrast
        ctx.filter = 'contrast(1.5) brightness(1.2)';
        ctx.drawImage(canvas, 0, 0);
        ctx.filter = 'none';

        canvas.toBlob((blob) => resolve(blob), 'image/png');
      };
      img.src = URL.createObjectURL(file);
    });
  };

  // Extract the alpha mask from the processed image
  const extractMask = (processedBlob) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        resolve({ mask: imageData, width: canvas.width, height: canvas.height });
      };
      img.src = URL.createObjectURL(processedBlob);
    });
  };

  // Apply mask from processed image onto original image
  const applyMaskToOriginal = (originalFile, maskData) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const origData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // If sizes match, apply mask alpha directly
        if (img.width === maskData.width && img.height === maskData.height) {
          for (let i = 0; i < origData.data.length; i += 4) {
            origData.data[i + 3] = maskData.mask.data[i + 3];
          }
        }

        ctx.putImageData(origData, 0, 0);
        canvas.toBlob((blob) => resolve(blob), 'image/png');
      };
      img.src = URL.createObjectURL(originalFile);
    });
  };

  const processRemoval = async () => {
    const file = fileRef.current?.files[0];
    if (!file) return;

    setProcessing(true);
    setProgressWidth('10%');
    setStatusText('Loading AI model...');
    setCanProcess(false);

    try {
      if (!moduleRef.current) {
        const mod = await import('@imgly/background-removal');
        moduleRef.current = mod.removeBackground || mod.default;
      }
      const removeBackground = moduleRef.current;

      setProgressWidth('20%');
      setStatusText('Pre-processing image...');

      // Step 1: Create contrast-boosted version for better model detection
      const boostedFile = await boostContrast(file);

      setProgressWidth('30%');
      setStatusText('Removing background (this may take a moment)...');

      // Step 2: Run BG removal on boosted image to get better mask
      const processedBlob = await removeBackground(boostedFile, {
        model: 'isnet_fp16',
        output: { format: 'image/png', quality: 1 },
        progress: (key, current, total) => {
          if (total > 0) {
            const pct = 30 + (current / total) * 50;
            setProgressWidth(pct + '%');
          }
          setStatusText(`Processing: ${key}...`);
        }
      });

      setProgressWidth('85%');
      setStatusText('Applying mask to original...');

      // Step 3: Extract mask from processed image and apply to original
      const maskData = await extractMask(processedBlob);
      const finalBlob = await applyMaskToOriginal(file, maskData);

      blobRef.current = finalBlob;
      const url = URL.createObjectURL(finalBlob);
      setResultSrc(url);
      setCanAdd(true);
      setProgressWidth('100%');
      setStatusText('Done! Background removed.');
    } catch (err) {
      const msg = err.message || String(err);
      setStatusText('Error: ' + msg);
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
            <p>Upload an image to remove its background (runs locally in browser, 100% free).</p>
            <p className="note">First use downloads a ~40MB AI model (cached afterwards).</p>
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
