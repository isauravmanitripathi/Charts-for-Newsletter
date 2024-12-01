import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, Video, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import GIF from 'gif.js';

const App = () => {
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [components, setComponents] = useState([]);
  const [loadedComponent, setLoadedComponent] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const componentRef = useRef(null);
  const framesRef = useRef([]);

  useEffect(() => {
    const moduleFiles = import.meta.glob('./components/*.jsx');
    const componentNames = Object.keys(moduleFiles).map(path => ({
      name: path.split('/').pop().replace('.jsx', ''),
      path: path,
      description: getComponentDescription(path.split('/').pop().replace('.jsx', ''))
    }));
    setComponents(componentNames);
  }, []);

  useEffect(() => {
    if (selectedComponent) {
      import(/* @vite-ignore */ selectedComponent.path)
        .then(module => {
          setLoadedComponent(() => module.default);
        })
        .catch(err => console.error('Error loading component:', err));
    }
  }, [selectedComponent]);

  const getComponentDescription = (name) => {
    const descriptions = {
      'AnimatedTradingChart': 'Real-time visualization of trading algorithms with animated data flow',
    };
    return descriptions[name] || 'Interactive component visualization';
  };

  const handleComponentSelect = (comp) => {
    setSelectedComponent(comp);
  };

  const saveAsPNG = async () => {
    if (componentRef.current) {
      try {
        const element = componentRef.current;
        const canvas = await html2canvas(element, {
          useCORS: true,
          scale: 2,
          backgroundColor: '#1f2937'
        });
        
        const link = document.createElement('a');
        link.download = `${selectedComponent.name}-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (error) {
        console.error('Error saving PNG:', error);
      }
    }
  };

  const recordAsGIF = async () => {
    if (componentRef.current && !isRecording) {
      setIsRecording(true);
      setProgress(0);
      framesRef.current = [];

      // Record frames for 5 seconds
      const startTime = Date.now();
      const duration = 5000; // 5 seconds

      while (Date.now() - startTime < duration) {
        const canvas = await html2canvas(componentRef.current, {
          useCORS: true,
          scale: 1,
          backgroundColor: '#1f2937'
        });
        framesRef.current.push(canvas);
        setProgress(((Date.now() - startTime) / duration) * 100);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      createGIF();
    }
  };

  const createGIF = () => {
    const gif = new GIF({
      workers: 2,
      quality: 10,
      width: componentRef.current.offsetWidth,
      height: componentRef.current.offsetHeight,
      workerScript: '/gif.worker.js'
    });

    framesRef.current.forEach(frame => {
      gif.addFrame(frame, { delay: 100 });
    });

    gif.on('finished', blob => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${selectedComponent.name}-${Date.now()}.gif`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      setIsRecording(false);
      setProgress(0);
    });

    gif.render();
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 p-6 overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-6">Components</h2>
        <div className="space-y-2">
          {components.map(comp => (
            <button
              key={comp.name}
              onClick={() => handleComponentSelect(comp)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                selectedComponent?.name === comp.name 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              {comp.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {selectedComponent ? (
          <div className="p-8">
            {/* Control buttons */}
            <div className="mb-6 flex items-center gap-4">
              <h2 className="text-2xl font-bold text-white">{selectedComponent.name}</h2>
              <div className="flex gap-2 ml-auto">
                {isRecording && (
                  <div className="px-3 py-2 rounded-lg bg-gray-700 text-white text-sm">
                    Recording: {Math.round(progress)}%
                  </div>
                )}
                <button
                  onClick={saveAsPNG}
                  disabled={isRecording}
                  className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors disabled:opacity-50"
                  title="Save as PNG"
                >
                  <Camera size={20} />
                </button>
                <button
                  onClick={recordAsGIF}
                  disabled={isRecording}
                  className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors disabled:opacity-50"
                  title="Record GIF"
                >
                  {isRecording ? <Loader2 size={20} className="animate-spin" /> : <Video size={20} />}
                </button>
              </div>
            </div>

            {/* Component Display */}
            <div className="bg-gray-800 rounded-xl shadow-xl" ref={componentRef}>
              <div className="p-8">
                {loadedComponent && React.createElement(loadedComponent)}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            <p className="text-xl">Select a component from the sidebar to view</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;