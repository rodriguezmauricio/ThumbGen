import { useState } from 'react';
import CanvasSizePanel from './panels/CanvasSizePanel';
import BackgroundPanel from './panels/BackgroundPanel';
import TextPanel from './panels/TextPanel';
import ImagePanel from './panels/ImagePanel';
import ShapePanel from './panels/ShapePanel';
import EffectsPanel from './panels/EffectsPanel';
import TemplatePanel from './panels/TemplatePanel';

function Panel({ title, id, defaultOpen, children }) {
  const [open, setOpen] = useState(defaultOpen || false);

  return (
    <section className="panel">
      <h3
        className={`panel-title ${open ? 'open' : ''}`}
        onClick={() => setOpen(!open)}
      >
        {title}
      </h3>
      <div className={`panel-body ${open ? 'open' : ''}`}>
        {children}
      </div>
    </section>
  );
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h1>ThumbGen</h1>
        <button className="toggle-sidebar" onClick={() => setCollapsed(!collapsed)}>&#9776;</button>
      </div>
      <div className="sidebar-content">
        <Panel title="Canvas Size" id="sizePanel" defaultOpen>
          <CanvasSizePanel />
        </Panel>
        <Panel title="Background" id="bgPanel" defaultOpen>
          <BackgroundPanel />
        </Panel>
        <Panel title="Text" id="textPanel" defaultOpen>
          <TextPanel />
        </Panel>
        <Panel title="Images & Overlays" id="imagePanel">
          <ImagePanel />
        </Panel>
        <Panel title="Shapes & Decorations" id="shapePanel">
          <ShapePanel />
        </Panel>
        <Panel title="Effects & Filters" id="effectsPanel">
          <EffectsPanel />
        </Panel>
        <Panel title="Templates" id="templatePanel">
          <TemplatePanel />
        </Panel>
      </div>
    </aside>
  );
}
