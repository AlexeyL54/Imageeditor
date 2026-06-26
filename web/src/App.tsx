// web/src/App.tsx
import React, { useState, useRef, useCallback } from 'react';
import { useWasm } from './hooks/useWasm';
import './App.css';

function App() {
  const { loadImage, applyFilter, getData } = useWasm();
  
  // Состояния
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [processedData, setProcessedData] = useState<Uint8ClampedArray | null>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Загрузка файла
  const handleFile = useCallback((file: File) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      // Создаем canvas
      const canvas = document.createElement('canvas');
      const size = 600;
      let w = img.width;
      let h = img.height;
      
      if (w > size) {
        const ratio = size / w;
        w = size;
        h = h * ratio;
      }
      if (h > size) {
        const ratio = size / h;
        h = size;
        w = w * ratio;
      }
      
      canvas.width = Math.round(w);
      canvas.height = Math.round(h);
      
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Сохраняем в состояние
      setWidth(canvas.width);
      setHeight(canvas.height);
      setImageData(data);
      setProcessedData(new Uint8ClampedArray(data.data.buffer));
      
      // Загружаем в WASM
      loadImage(data);
      
      URL.revokeObjectURL(url);
    };
    
    img.src = url;
  }, [loadImage]);

  // Применить фильтр
  const handleFilter = useCallback((name: string, param?: number) => {
    if (!imageData) return;
    
    applyFilter(name, param);
    const data = getData();
    if (data) {
      setProcessedData(data);
    }
  }, [imageData, applyFilter, getData]);

  // Рендер на canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
React.useEffect(() => {
  if (!canvasRef.current || !processedData) {
    console.warn('Нет canvas или данных');
    return;
  }
  
  try {
    const ctx = canvasRef.current.getContext('2d')!;
    const dataCopy = new Uint8ClampedArray(processedData);
    const imageData = new ImageData(dataCopy, width, height);
    ctx.putImageData(imageData, 0, 0);
  } catch (error) {
    console.error('Ошибка рендера:', error);
  }
}, [processedData, width, height]);

  return (
    <div className="app">
      <header>
        <h1>Image Processor</h1>
      </header>

      <div className="controls">
        <button onClick={() => fileInputRef.current?.click()}>
          Загрузить
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
          style={{ display: 'none' }}
        />
        
        {imageData && (
          <>
            <button onClick={() => handleFilter('grayscale')}>Ч/Б</button>
            <button onClick={() => handleFilter('invert')}>Негатив</button>
            <button onClick={() => handleFilter('sepia')}>Сепия</button>
            <button onClick={() => {
              const val = prompt('Яркость (-255..255):', '30');
              if (val) handleFilter('brightness', parseInt(val));
            }}>Яркость</button>
            <button onClick={() => {
              setProcessedData(imageData ? new Uint8ClampedArray(imageData.data.buffer) : null);
            }}>Сброс</button>
          </>
        )}
      </div>

      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          style={{ display: processedData ? 'block' : 'none' }}
        />
        {!processedData && (
          <div className="empty">
            <p>Загрузите изображение</p>
          </div>
        )}
      </div>

      {imageData && (
        <div className="info">
          <span>Размер: {width}×{height}</span>
        </div>
      )}
    </div>
  );
}

export default App;
