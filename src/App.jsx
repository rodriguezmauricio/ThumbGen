import { useEffect } from 'react';
import { AppProvider, useDispatch } from './store/state';
import Sidebar from './components/Sidebar/Sidebar';
import CanvasArea from './components/Canvas/CanvasArea';
import LayerBar from './components/LayerBar/LayerBar';
import BgRemovalModal from './components/Modal/BgRemovalModal';
import { useHistory } from './hooks/useHistory';

function AppInner() {
  const dispatch = useDispatch();
  const { pushHistory } = useHistory();

  // Push initial history on mount
  useEffect(() => {
    pushHistory();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="app">
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <CanvasArea />
        <LayerBar />
      </div>
      <BgRemovalModal />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
