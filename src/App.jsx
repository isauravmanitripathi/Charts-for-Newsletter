import React, { useState, useEffect } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';

const App = () => {
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [components, setComponents] = useState([]);
  const [loadedComponent, setLoadedComponent] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const moduleFiles = import.meta.glob('./components/*.jsx');
    const componentNames = Object.keys(moduleFiles).map(path => ({
      name: path.split('/').pop().replace('.jsx', ''),
      path: path
    }));
    setComponents(componentNames);
  }, []);

  useEffect(() => {
    if (selectedComponent) {
      setIsDropdownOpen(false);
      import(/* @vite-ignore */ selectedComponent.path)
        .then(module => {
          setLoadedComponent(() => module.default);
        })
        .catch(err => console.error('Error loading component:', err));
    }
  }, [selectedComponent]);

  const handleComponentSelect = (comp) => {
    setSelectedComponent(comp);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-6">Components</h2>
          <div className="space-y-2">
            {components.map(comp => (
              <button
                key={comp.name}
                onClick={() => handleComponentSelect(comp)}
                className={`w-full text-left px-4 py-2 rounded-lg transition-all duration-200 ${
                  selectedComponent?.name === comp.name 
                    ? 'bg-blue-600 text-white' 
                    : 'hover:bg-gray-700'
                }`}
              >
                {comp.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`min-h-screen transition-all duration-300 ${
        isSidebarOpen ? 'pl-64' : 'pl-0'
      } lg:pl-64`}>
        <div className="p-8">
          {/* Dropdown for mobile */}
          <div className="relative mb-8 lg:hidden">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <span>{selectedComponent?.name || 'Select a component'}</span>
              <ChevronDown 
                className={`transform transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`} 
              />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-gray-700 rounded-lg shadow-xl z-50 transform opacity-100 scale-100 transition-all duration-200">
                {components.map(comp => (
                  <button
                    key={comp.name}
                    onClick={() => handleComponentSelect(comp)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-600 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {comp.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Component Display */}
          <div className="bg-gray-800 rounded-xl shadow-2xl p-6 transition-all duration-500 ease-out transform">
            {loadedComponent ? (
              <div className="animate-fadeIn">
                {React.createElement(loadedComponent)}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-12">
                <div className="text-xl mb-2">👋 Welcome!</div>
                <p>Select a component from the {isSidebarOpen ? 'sidebar' : 'menu'} to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;