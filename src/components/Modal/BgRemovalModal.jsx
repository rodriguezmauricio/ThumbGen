import { useState, useRef } from 'react';
import { removeBackground } from '@imgly/background-removal';
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

  // Create a variant of the image with modified colors to help the model
  const createVariant = (file, filter) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.filter = filter;
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => resolve(blob), 'image/png');
      };
      img.src = URL.createObjectURL(file);
    });
  };

  // Extract alpha channel from a processed blob
  const getAlpha = (blob) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const alpha = new Uint8Array(canvas.width * canvas.height);
        for (let i = 0; i < alpha.length; i++) {
          alpha[i] = data.data[i * 4 + 3];
        }
        resolve({ alpha, width: canvas.width, height: canvas.height });
      };
      img.src = URL.createObjectURL(blob);
    });
  };

  const processRemoval = async () => {
    const file = fileRef.current?.files[0];
    if (!file) return;

    setProcessing(true);
    setProgressWidth('5%');
    setStatusText('Loading AI model...');
    setCanProcess(false);

    try {
      const runRemoval = (input) => removeBackground(input, {
        model: 'isnet_fp16',
        output: { format: 'image/png', quality: 1 },
      });

      // Pass 1: Original image
      setStatusText('Pass 1/3: Processing original...');
      setProgressWidth('10%');
      const result1 = await runRemoval(file);
      const mask1 = await getAlpha(result1);

      // Pass 2: Brightened version (helps with dark subjects)
      setStatusText('Pass 2/3: Processing brightened variant...');
      setProgressWidth('40%');
      const bright = await createVariant(file, 'brightness(2) contrast(1.3)');
      const result2 = await runRemoval(bright);
      const mask2 = await getAlpha(result2);

      // Pass 3: Inverted brightness (helps with light subjects on light bg)
      setStatusText('Pass 3/3: Processing high-contrast variant...');
      setProgressWidth('65%');
      const contrast = await createVariant(file, 'contrast(2) saturate(1.5)');
      const result3 = await runRemoval(contrast);
      const mask3 = await getAlpha(result3);

      setStatusText('Combining masks...');
      setProgressWidth('85%');

      // Combine masks: take the MAX alpha from all passes (union of foregrounds)
      // This ensures that anything detected as foreground in ANY pass is kept
      const finalAlpha = new Uint8Array(mask1.alpha.length);
      for (let i = 0; i < finalAlpha.length; i++) {
        finalAlpha[i] = Math.max(mask1.alpha[i], mask2.alpha[i], mask3.alpha[i]);
      }

      // Apply combined mask to original image
      const origImg = new Image();
      await new Promise((resolve) => {
        origImg.onload = resolve;
        origImg.src = URL.createObjectURL(file);
      });

      const canvas = document.createElement('canvas');
      canvas.width = origImg.width;
      canvas.height = origImg.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(origImg, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Handle size mismatch between mask and original
      if (mask1.width === canvas.width && mask1.height === canvas.height) {
        for (let i = 0; i < finalAlpha.length; i++) {
          imageData.data[i * 4 + 3] = finalAlpha[i];
        }
      } else {
        // Scale mask to fit original dimensions
        const scaleX = mask1.width / canvas.width;
        const scaleY = mask1.height / canvas.height;
        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const srcX = Math.min(Math.floor(x * scaleX), mask1.width - 1);
            const srcY = Math.min(Math.floor(y * scaleY), mask1.height - 1);
            const srcIdx = srcY * mask1.width + srcX;
            const dstIdx = y * canvas.width + x;
            imageData.data[dstIdx * 4 + 3] = finalAlpha[srcIdx];
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);

      const finalBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      blobRef.current = finalBlob;
      setResultSrc(URL.createObjectURL(finalBlob));
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
            <p className="note">First use downloads a ~40MB AI model (cached afterwards). Uses 3-pass processing for best results.</p>
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
