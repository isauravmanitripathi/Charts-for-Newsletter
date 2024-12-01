import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import html2canvas from 'html2canvas';
import GIF from 'gif.js';

const AnimatedTradingChart = () => {
  const [data, setData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const chartRef = useRef(null);
  const framesRef = useRef([]);
  const gifRef = useRef(null);

  // Generate initial data points
  useEffect(() => {
    const initialData = Array.from({ length: 30 }, (_, i) => ({
      time: i,
      price: 100 + Math.random() * 20 - 10,
      movingAverage: 100,
      signal: 100,
    }));
    setData(initialData);
  }, []);

  // Animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prevData => {
        const lastPrice = prevData[prevData.length - 1].price;
        const newPrice = lastPrice + (Math.random() * 4 - 2);
        
        const movingAverage = prevData
          .slice(-10)
          .reduce((sum, point) => sum + point.price, 0) / 10;
        
        const signal = movingAverage + (Math.sin(currentIndex / 5) * 3);

        return [
          ...prevData.slice(1),
          {
            time: prevData[prevData.length - 1].time + 1,
            price: newPrice,
            movingAverage,
            signal,
          }
        ];
      });

      setCurrentIndex(prev => prev + 1);
    }, 100);

    return () => clearInterval(interval);
  }, [currentIndex]);

  // Record frames
  useEffect(() => {
    if (isRecording && chartRef.current) {
      const captureFrame = async () => {
        try {
          const canvas = await html2canvas(chartRef.current, {
            useCORS: true,
            logging: false
          });
          framesRef.current.push(canvas);
        } catch (error) {
          console.error('Frame capture error:', error);
        }
      };
      captureFrame();
    }
  }, [data, isRecording]);

  const startRecording = async () => {
    framesRef.current = [];
    setIsRecording(true);
    setProgress(0);
    
    // Record for 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000));
    setIsRecording(false);
    createGif();
  };

  const createGif = () => {
    try {
      // Initialize new GIF
      gifRef.current = new GIF({
        workers: 4,
        quality: 10,
        width: 800,
        height: 400,
        workerScript: '/gif.worker.js'  // Make sure this path matches your public directory
      });

      let framesProcessed = 0;
      const totalFrames = framesRef.current.length;

      // Add each frame to the GIF
      framesRef.current.forEach(canvas => {
        gifRef.current.addFrame(canvas, { delay: 100, copy: true });
        framesProcessed++;
        setProgress((framesProcessed / totalFrames) * 100);
      });

      // Handle GIF completion
      gifRef.current.on('finished', blob => {
        // Create download link
        const url = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `trading-chart-${Date.now()}.gif`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
        
        // Reset states
        setProgress(0);
        framesRef.current = [];
        gifRef.current = null;
      });

      // Start rendering
      gifRef.current.render();
    } catch (error) {
      console.error('GIF creation error:', error);
      setIsRecording(false);
      setProgress(0);
    }
  };

  return (
    <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Live Trading Algorithm Visualization</h2>
        <div className="flex items-center gap-4">
          {progress > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-32 bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
            </div>
          )}
          <button
            onClick={startRecording}
            disabled={isRecording}
            className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
              isRecording 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white font-medium`}
          >
            {isRecording ? 'Recording...' : 'Record GIF'}
          </button>
        </div>
      </div>
      <div className="p-4" ref={chartRef}>
        <LineChart width={800} height={400} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis domain={['auto', 'auto']} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#8884d8"
            dot={false}
            name="Price"
          />
          <Line
            type="monotone"
            dataKey="movingAverage"
            stroke="#82ca9d"
            dot={false}
            name="Moving Average"
          />
          <Line
            type="monotone"
            dataKey="signal"
            stroke="#ff7300"
            dot={false}
            name="Trading Signal"
          />
        </LineChart>
      </div>
    </div>
  );
};

export default AnimatedTradingChart;