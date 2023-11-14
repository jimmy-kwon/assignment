import React, { useState, MouseEvent } from 'react';
import './App.css';

interface Shape {
  id: number;
  order: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'rectangle' | 'circle';
}

function App() {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [currentShape, setCurrentShape] = useState<Shape | null>(null);
  const [mode, setMode] = useState<'rectangle' | 'circle' | 'delete' | 'move' | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const startDrawing = (drawingMode: 'rectangle' | 'circle') => {
    setMode(drawingMode);
    setCurrentShape(null);
  };

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (mode === 'rectangle') {
      const newShape = { id: Date.now(), order: shapes.length + 1, x, y, width: 0, height: 0, type: mode };
      setCurrentShape(newShape);
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging || mode !== 'rectangle') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentShape) {
      setCurrentShape({...currentShape, width: x - currentShape.x, height: y - currentShape.y});
    }
  };

  const handleMouseUp = () => {
    if (isDragging && currentShape && mode === 'rectangle') {
      setShapes([...shapes, currentShape]);
      setCurrentShape(null);
    }
    setIsDragging(false);
  };

  return (
      <div className="App">
        <div className="toolbar">
          <button className="simple-button" onClick={() => startDrawing('rectangle')}>사각형 그리기</button>
        </div>
        <div
            className="drawing-area"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
          {shapes.map((shape, index) => (
              <div
                  key={index}
                  style={{
                    position: 'absolute',
                    left: shape.x,
                    top: shape.y,
                    width: Math.abs(shape.width),
                    height: Math.abs(shape.height),
                    border: '2px solid black',
                  }}
              />
          ))}
          {currentShape && (
              <div style={{
                position: 'absolute',
                left: currentShape.x,
                top: currentShape.y,
                width: Math.abs(currentShape.width),
                height: Math.abs(currentShape.height),
                backgroundColor: 'rgba(0,0,0,0.1)',
                border: '2px dashed grey',
              }}/>
          )}
        </div>
      </div>
  );
}

export default App;
