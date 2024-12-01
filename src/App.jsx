import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';

const App = () => {
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [components, setComponents] = useState([]);
  const [loadedComponent, setLoadedComponent] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
    // Add descriptions for your components here
    const descriptions = {
      'AnimatedTradingChart': 'Real-time visualization of trading algorithms with animated data flow',
      // Add more descriptions as you create components
    };
    return descriptions[name] || 'Interactive component visualization';
  };

  const handleComponentSelect = (comp) => {
    setSelectedComponent(comp);
    setIsDropdownOpen(false);
  };

  const closeComponent = () => {
    setSelectedComponent(null);
    setLoadedComponent(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 text-white p-8">
      {/* Header */}
      <header className="max-w-7xl mx-auto text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          Interactive Component Gallery
        </h1>
        <p className="text-xl text-gray-300">
          Explore a collection of interactive React components and visualizations
        </p>
      </header>

      {/* Component Selection Dropdown */}
      <div className="max-w-xs mx-auto mb-12 relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full flex items-center justify-between px-6 py-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition-all duration-300 border border-gray-700"
        >
          <span className="text-gray-300">
            {selectedComponent?.name || 'Select a component'}
          </span>
          <ChevronDown
            className={`transform transition-transform duration-300 ${
              isDropdownOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
        
        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute w-full mt-2 py-2 bg-gray-800 rounded-xl shadow-2xl border border-gray-700 z-50 transform opacity-100 scale-100 transition-all duration-300">
            {components.map(comp => (
              <button
                key={comp.name}
                onClick={() => handleComponentSelect(comp)}
                className="w-full text-left px-6 py-3 hover:bg-gray-700 transition-colors duration-200"
              >
                {comp.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Component Display */}
      {!selectedComponent ? (
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {components.map(comp => (
            <div
              key={comp.name}
              onClick={() => handleComponentSelect(comp)}
              className="bg-gray-800 rounded-xl p-6 cursor-pointer transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl border border-gray-700"
            >
              <h3 className="text-xl font-semibold mb-3">{comp.name}</h3>
              <p className="text-gray-400">{comp.description}</p>
              <div className="mt-4 text-blue-400 text-sm">Click to view →</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-8 z-50">
          <div className="bg-gray-800 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-auto relative">
            <button
              onClick={closeComponent}
              className="absolute top-4 right-4 p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
            <div className="p-8">
              {loadedComponent && (
                <div className="animate-fadeIn">
                  {React.createElement(loadedComponent)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;