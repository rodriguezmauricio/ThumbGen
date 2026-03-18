import { useEffect, useRef } from 'react';
import { useAppState, useDispatch } from '../../../store/state';
import { templates } from '../../../utils/templates';
import { renderToContext } from '../../../utils/drawing';

function TemplateCard({ template, baseState, onClick }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    renderToContext(ctx, 256, 144, template, baseState);
  }, [template, baseState]);

  return (
    <div className="template-card" onClick={onClick}>
      <canvas ref={canvasRef} className="template-preview" width={256} height={144} />
      <span>{template.name}</span>
    </div>
  );
}

export default function TemplatePanel() {
  const state = useAppState();
  const dispatch = useDispatch();

  const applyTemplate = (t) => {
    dispatch({ type: 'APPLY_TEMPLATE', payload: t });
    dispatch({ type: 'PUSH_HISTORY' });
  };

  return (
    <div className="template-grid">
      {templates.map((t, i) => (
        <TemplateCard key={i} template={t} baseState={state} onClick={() => applyTemplate(t)} />
      ))}
    </div>
  );
}
