import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Camera, Save, Undo, Redo, Grid, Sun, Moon, Square, MinusSquare, Edit3, Type, Layers, ZoomIn, ZoomOut, Trash2, Download, Upload, Settings, Plus, X } from 'lucide-react';

const App = () => {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [activeToolIndex, setActiveToolIndex] = useState(0);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [measurements, setMeasurements] = useState(() => {
    const saved = localStorage.getItem('measurements');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Window 1', width: 100, height: 150 },
      { id: 2, name: 'Door 1', width: 80, height: 200 },
    ];
  });
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showGrid, setShowGrid] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const tools = useMemo(() => [
    { name: 'Rectangle', icon: Square },
    { name: 'Line', icon: MinusSquare },
    { name: 'Freehand', icon: Edit3 },
    { name: 'Text', icon: Type },
    { name: 'Layers', icon: Layers },
  ], []);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    localStorage.setItem('measurements', JSON.stringify(measurements));
  }, [darkMode, measurements]);

  const handleDeleteMeasurement = useCallback((id) => {
    setMeasurements(prevMeasurements => {
      const newMeasurements = prevMeasurements.filter(m => m.id !== id);
      addToHistory(newMeasurements);
      return newMeasurements;
    });
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prevMode => !prevMode);
  }, []);

  const toggleRightPanel = useCallback(() => {
    setShowRightPanel(prevShow => !prevShow);
  }, []);

  const toggleGrid = useCallback(() => {
    setShowGrid(prevShow => !prevShow);
  }, []);

  const handleZoom = useCallback((direction) => {
    setZoomLevel(prevZoom => {
      const newZoom = direction === 'in' ? prevZoom + 10 : prevZoom - 10;
      return Math.max(10, Math.min(newZoom, 200));
    });
  }, []);

  const addToHistory = useCallback((newState) => {
    setHistory(prevHistory => [...prevHistory.slice(0, historyIndex + 1), newState]);
    setHistoryIndex(prevIndex => prevIndex + 1);
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prevIndex => prevIndex - 1);
      setMeasurements(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prevIndex => prevIndex + 1);
      setMeasurements(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  const addNewMeasurement = useCallback(() => {
    const newMeasurement = {
      id: Date.now(),
      name: `Item ${measurements.length + 1}`,
      width: 100,
      height: 100
    };
    setMeasurements(prevMeasurements => {
      const newMeasurements = [...prevMeasurements, newMeasurement];
      addToHistory(newMeasurements);
      return newMeasurements;
    });
  }, [measurements.length]);

  const renderHeaderButton = useCallback((title, icon, onClick = () => {}) => (
    <button title={title} onClick={onClick}>
      {icon}
    </button>
  ), []);

  return (
    <div className={`app ${darkMode ? 'dark' : ''}`}>
      <header className="app-header">
        <div className="logo">
          <h1>MeasurePro</h1>
        </div>
        <div className="header-buttons">
          {renderHeaderButton("New Project", <Camera size={20} />)}
          {renderHeaderButton("Save Project", <Save size={20} />)}
          {renderHeaderButton("Undo", <Undo size={20} />, undo)}
          {renderHeaderButton("Redo", <Redo size={20} />, redo)}
          {renderHeaderButton("Toggle Grid", <Grid size={20} />, toggleGrid)}
          {renderHeaderButton("Zoom In", <ZoomIn size={20} />, () => handleZoom('in'))}
          {renderHeaderButton("Zoom Out", <ZoomOut size={20} />, () => handleZoom('out'))}
          {renderHeaderButton("Import", <Upload size={20} />)}
          {renderHeaderButton("Export", <Download size={20} />)}
          {renderHeaderButton("Settings", <Settings size={20} />)}
          {renderHeaderButton("Toggle Dark Mode", darkMode ? <Sun size={20} /> : <Moon size={20} />, toggleDarkMode)}
        </div>
      </header>
      <div className="app-content">
        <aside className="sidebar">
          {tools.map((tool, index) => (
            <button
              key={tool.name}
              className={`tool-button ${activeToolIndex === index ? 'active' : ''}`}
              onClick={() => setActiveToolIndex(index)}
            >
              <tool.icon size={24} />
              <span>{tool.name}</span>
            </button>
          ))}
        </aside>
        <main className="canvas-area" style={{ transform: `scale(${zoomLevel / 100})` }}>
          <div className={`canvas-placeholder ${showGrid ? 'show-grid' : ''}`}>
            Your drawing canvas goes here
          </div>
        </main>
        {showRightPanel && (
          <aside className="right-panel">
            <h2>Measurements</h2>
            <button className="add-measurement-btn" onClick={addNewMeasurement}>
              <Plus size={16} /> Add Measurement
            </button>
            <ul className="measurement-list">
              {measurements.map(m => (
                <li key={m.id} className="measurement-item">
                  <span>{m.name}</span>
                  <span>{m.width} x {m.height}</span>
                  <button onClick={() => handleDeleteMeasurement(m.id)} className="delete-btn">
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          </aside>
        )}
        <button 
          className="toggle-panel-btn"
          onClick={toggleRightPanel}
        >
          {showRightPanel ? <X size={20} /> : <Layers size={20} />}
        </button>
      </div>
      <style jsx>{`
        .app {
          display: flex;
          flex-direction: column;
          height: 100vh;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #333;
          background-color: #f5f5f5;
        }
        .app.dark {
          color: #f5f5f5;
          background-color: #1e1e1e;
        }
        .app-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 1rem;
          background-color: #2196f3;
          color: white;
        }
        .logo h1 {
          margin: 0;
          font-size: 1.5rem;
        }
        .header-buttons {
          display: flex;
          gap: 0.5rem;
        }
        .header-buttons button {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 4px;
          transition: background-color 0.3s;
        }
        .header-buttons button:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
        .app-content {
          display: flex;
          flex: 1;
          overflow: hidden;
          position: relative;
        }
        .sidebar {
          width: 60px;
          padding: 1rem 0;
          background-color: #ffffff;
          box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: width 0.3s;
        }
        .sidebar:hover {
          width: 200px;
        }
        .app.dark .sidebar {
          background-color: #2d2d2d;
        }
        .tool-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 0.5rem;
          margin-bottom: 0.5rem;
          border: none;
          background: none;
          cursor: pointer;
          color: inherit;
          transition: background-color 0.3s;
        }
        .tool-button:hover {
          background-color: rgba(33, 150, 243, 0.1);
        }
        .tool-button.active {
          background-color: #2196f3;
          color: white;
        }
        .app.dark .tool-button.active {
          background-color: #4a4a4a;
        }
        .tool-button span {
          display: none;
          margin-left: 0.5rem;
        }
        .sidebar:hover .tool-button span {
          display: inline;
        }
        .canvas-area {
          flex: 1;
          padding: 1rem;
          overflow: auto;
        }
        .canvas-placeholder {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
          border: 2px dashed #ccc;
          font-size: 1.2rem;
          color: #888;
        }
        .right-panel {
          width: 250px;
          padding: 1rem;
          background-color: #ffffff;
          box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
          overflow-y: auto;
        }
        .app.dark .right-panel {
          background-color: #2d2d2d;
        }
        .measurement-list {
          list-style-type: none;
          padding: 0;
        }
        .measurement-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          border-bottom: 1px solid #eee;
        }
        .app.dark .measurement-item {
          border-bottom-color: #444;
        }
        .delete-btn {
          background: none;
          border: none;
          color: #ff4081;
          cursor: pointer;
        }
        .toggle-panel-btn {
          position: absolute;
          right: 250px;
          top: 50%;
          transform: translateY(-50%);
          background-color: #2196f3;
          color: white;
          border: none;
          padding: 0.5rem;
          cursor: pointer;
        }
        @media (max-width: 768px) {
          .app-content {
            flex-direction: column;
          }
          .sidebar {
            width: 100%;
            flex-direction: row;
            justify-content: space-around;
          }
          .sidebar:hover {
            width: 100%;
          }
          .tool-button {
            flex-direction: column;
          }
          .tool-button span {
            display: inline;
            font-size: 0.8rem;
          }
          .right-panel {
            width: 100%;
          }
          .toggle-panel-btn {
            display: none;
          }
            
        }
          .canvas-placeholder.show-grid {
          background-image: linear-gradient(to right, #ccc 1px, transparent 1px),
                            linear-gradient(to bottom, #ccc 1px, transparent 1px);
          background-size: 20px 20px;
        }
        .add-measurement-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 0.5rem;
          margin-bottom: 1rem;
          background-color: #2196f3;
          color: white;
          border: none;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        .add-measurement-btn:hover {
          background-color: #1976d2;
        }
        .app.dark .add-measurement-btn {
          background-color: #4a4a4a;
        }
        .app.dark .add-measurement-btn:hover {
          background-color: #5a5a5a;
        }
      `}</style>
    </div>
  );
};

export default App;