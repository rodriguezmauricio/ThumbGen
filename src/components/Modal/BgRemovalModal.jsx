import { useState, useRef } from 'react';
import { useAppState, useDispatch } from '../../store/state';
import { fitImageToCanvas } from '../../utils/export';

let segmenter = null;

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

  const processRemoval = async () => {
    const file = fileRef.current?.files[0];
    if (!file) return;

    setProcessing(true);
    setProgressWidth('10%');
    setStatusText('Loading AI model (first time ~45MB download)...');
    setCanProcess(false);

    try {
      if (!segmenter) {
        const { AutoModel, AutoProcessor, RawImage, env } = await import('@huggingface/transformers');

        env.allowLocalModels = false;
        env.useBrowserCache = true;

        setProgressWidth('20%');
        setStatusText('Downloading model...');

        const model = await AutoModel.from_pretrained('briaai/RMBG-1.4', {
          quantized: true,
        });
        const processor = await AutoProcessor.from_pretrained('briaai/RMBG-1.4');

        segmenter = { model, processor, RawImage };
      }

      setProgressWidth('40%');
      setStatusText('Processing image...');

      const { model, processor, RawImage } = segmenter;

      // Load image
      const imageUrl = URL.createObjectURL(file);
      const image = await RawImage.fromURL(imageUrl);

      setProgressWidth('50%');

      // Process through model
      const { pixel_values } = await processor(image);
      const { output } = await model({ input: pixel_values });

      setProgressWidth('70%');
      setStatusText('Generating mask...');

      // Get mask and resize to original image dimensions
      const maskData = output[0][0];
      const maskImage = RawImage.fromTensor(maskData);
      const resizedMask = await maskImage.resize(image.width, image.height);

      setProgressWidth('85%');
      setStatusText('Applying mask...');

      // Create output canvas with transparency
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d');

      // Draw original image
      const imgEl = new Image();
      await new Promise((resolve) => {
        imgEl.onload = resolve;
        imgEl.src = imageUrl;
      });
      ctx.drawImage(imgEl, 0, 0);

      // Apply mask as alpha channel
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      for (let i = 0; i < resizedMask.data.length; i++) {
        pixels[i * 4 + 3] = resizedMask.data[i]; // Set alpha from mask
      }
      ctx.putImageData(imageData, 0, 0);

      // Convert to blob
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));

      blobRef.current = blob;
      const resultUrl = URL.createObjectURL(blob);
      setResultSrc(resultUrl);
      setCanAdd(true);
      setProgressWidth('100%');
      setStatusText('Done! Background removed.');
    } catch (err) {
      const msg = err.message || String(err);
      setStatusText('Error: ' + msg);
      console.error('BG Removal Error:', err, err.stack);
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
            <p className="note">First use downloads a ~45MB AI model (cached afterwards).</p>
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
