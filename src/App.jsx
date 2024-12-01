import React, { useState, useEffect } from 'react';

const App = () => {
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [components, setComponents] = useState([]);
  const [loadedComponent, setLoadedComponent] = useState(null);

  useEffect(() => {
    // Get all component modules from the components directory
    const moduleFiles = import.meta.glob('./components/*.jsx');
    const componentNames = Object.keys(moduleFiles).map(path => {
      // Extract component name from path (e.g., './components/AnimatedTradingChart.jsx' -> 'AnimatedTradingChart')
      return {
        name: path.split('/').pop().replace('.jsx', ''),
        path: path
      };
    });
    setComponents(componentNames);
  }, []);

  useEffect(() => {
    if (selectedComponent) {
      // Dynamically import the selected component
      import(/* @vite-ignore */ selectedComponent.path)
        .then(module => {
          setLoadedComponent(() => module.default);
        })
        .catch(err => console.error('Error loading component:', err));
    }
  }, [selectedComponent]);

  const handleComponentChange = (event) => {
    const selected = components.find(comp => comp.name === event.target.value);
    setSelectedComponent(selected);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <label htmlFor="component-select" className="text-lg font-medium text-gray-700">
            Select Component:
          </label>
          <select
            id="component-select"
            onChange={handleComponentChange}
            value={selectedComponent?.name || ''}
            className="block w-64 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Choose a component...</option>
            {components.map(comp => (
              <option key={comp.name} value={comp.name}>
                {comp.name}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          {loadedComponent ? (
            React.createElement(loadedComponent)
          ) : (
            <div className="text-center text-gray-500 py-12">
              Please select a component from the dropdown
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;