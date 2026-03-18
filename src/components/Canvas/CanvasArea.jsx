import Toolbar from './Toolbar';
import { useCanvasRenderer } from '../../hooks/useCanvasRenderer';
import { useAppState } from '../../store/state';

export default function CanvasArea() {
  const state = useAppState();
  const {
    canvasRef,
    wrapperRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
  } = useCanvasRenderer();

  return (
    <>
      <Toolbar />
      <div className="canvas-wrapper" ref={wrapperRef}>
        <canvas
          ref={canvasRef}
          id="mainCanvas"
          width={state.width}
          height={state.height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        />
      </div>
    </>
  );
}
