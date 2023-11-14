import React, { useState, useEffect, useRef, MouseEvent } from 'react';
import './App.css';

// Shape 인터페이스: 도형의 속성을 정의합니다 (ID, 순서, 위치, 크기, 타입).
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
    // 상태 관리: 도형 목록, 현재 도형, 모드, 선택된 도형 ID, 드래그 여부, 로그 등을 관리합니다.
    const [shapes, setShapes] = useState<Shape[]>(() => {
        // localStorage에서 도형 데이터 불러오기
        const savedShapes = localStorage.getItem('shapes');
        return savedShapes ? JSON.parse(savedShapes) : [];
    });
    const [currentShape, setCurrentShape] = useState<Shape | null>(null);
    const [mode, setMode] = useState<'rectangle' | 'circle' | 'delete' | 'move' | null>(null);
    const [selectedShapeId, setSelectedShapeId] = useState<number | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const logsEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // shapes 상태가 변경될 때마다 localStorage에 저장
        localStorage.setItem('shapes', JSON.stringify(shapes));
    }, [shapes]);

    useEffect(() => {
        logsEndRef.current?.scrollIntoView({behavior: 'smooth'});
    }, [logs]);

    // 로그 추가 함수: 애플리케이션의 상태 변화를 로그로 기록합니다.
    const addLog = (message: string) => {
        setLogs(prevLogs => [...prevLogs, `Log ${prevLogs.length + 1}: ${message}`]);
    };

    // 그리기 모드 설정 함수: 사각형 또는 원 그리기 모드를 설정합니다.
    const startDrawing = (drawingMode: 'rectangle' | 'circle') => {
        setMode(drawingMode);
        setCurrentShape(null);
        setSelectedShapeId(null); // 선택된 도형 ID 초기화
        addLog(`${drawingMode} 그리기 모드 시작`);
    };

    // 삭제 모드 설정 함수: 도형을 삭제하는 모드를 설정합니다.
    const setDeleteMode = () => {
        setMode('delete');
        setCurrentShape(null);
        setSelectedShapeId(null); // 선택된 도형 ID 초기화
        addLog('선택 지우기 모드 시작');
    };

    // 이동 모드 설정 함수: 도형을 이동하는 모드를 설정합니다.
    const setMoveMode = () => {
        setMode('move');
        setCurrentShape(null);
        addLog('도형 이동 모드 시작');
    };

    // 모든 도형 삭제 함수: 도형 목록을 비웁니다.
    const clearAllShapes = () => {
        setShapes([]);
        addLog('모든 도형 삭제');
    };

    // 특정 타입의 도형 개수를 세는 함수
    const countShapes = (type: 'rectangle' | 'circle') => {
        return shapes.filter(shape => shape.type === type).length;
    };

    // 로컬 스토리지 사용량을 추정하는 함수
    const estimateLocalStorageUsage = () => {
        const total = encodeURIComponent(JSON.stringify(localStorage)).length;
        const maxStorage = 5 * 1024 * 1024; // 대략 5MB
        return `현재 로컬 스토리지 사용량: ${total} bytes, 남은 용량: ${maxStorage - total} bytes`;
    };


    const bringToFront = () => {
        if (selectedShapeId !== null) {
            setShapes(prevShapes => {
                const shape = prevShapes.find(shape => shape.id === selectedShapeId);
                if (shape) {
                    return [...prevShapes.filter(s => s.id !== selectedShapeId), shape];
                }
                return prevShapes;
            });
        }
    };

    const sendToBack = () => {
        if (selectedShapeId !== null) {
            setShapes(prevShapes => {
                const shape = prevShapes.find(shape => shape.id === selectedShapeId);
                if (shape) {
                    return [shape, ...prevShapes.filter(s => s.id !== selectedShapeId)];
                }
                return prevShapes;
            });
        }
    };

    const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (mode === 'move' && selectedShapeId) {
            setShapes(shapes.map(shape =>
                shape.id === selectedShapeId ? {...shape, x, y} : shape
            ));
            setIsDragging(true);
        } else if (mode === 'rectangle' || mode === 'circle') {
            const newShape = {id: Date.now(), order: shapes.length + 1, x, y, width: 0, height: 0, type: mode};
            setCurrentShape(newShape);
            setIsDragging(true);
        }
    };

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!isDragging) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (mode === 'rectangle' || mode === 'circle') {
            if (currentShape) {
                setCurrentShape({...currentShape, width: x - currentShape.x, height: y - currentShape.y});
            }
        } else if (mode === 'move' && selectedShapeId !== null) {
            setShapes(shapes.map(shape =>
                shape.id === selectedShapeId ? {...shape, x, y} : shape
            ));
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        if (currentShape && (mode === 'rectangle' || mode === 'circle')) {
            setShapes([...shapes, currentShape]);
            setCurrentShape(null);
        }
    };

    const handleShapeClick = (shapeId: number, e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        if (mode === 'delete') {
            setShapes(prevShapes => prevShapes.filter(shape => shape.id !== shapeId));
        } else {
            setSelectedShapeId(shapeId);
        }
    };

    return (
        <div className="App">
            <br></br>

            <div className="toolbar">
                <button className="simple-button" onClick={() => startDrawing('rectangle')}>사각형 그리기</button>
                &nbsp;
                <button className="simple-button" onClick={() => startDrawing('circle')}>원 그리기</button>
                &nbsp;
                <button className="simple-button" onClick={clearAllShapes}>모두 지우기</button>
                &nbsp;
                <button className="simple-button" onClick={setDeleteMode}>선택 지우기</button>
                &nbsp;
                <button className="simple-button" onClick={setMoveMode}>도형 이동</button>
                &nbsp;
                <button className="simple-button" onClick={bringToFront}>맨 앞으로 가져오기</button>
                &nbsp;
                <button className="simple-button" onClick={sendToBack}>맨 뒤로 보내기</button>
                &nbsp;
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
                            backgroundColor: shape.type === 'circle' ? 'blue' : 'transparent',
                            border: shape.id === selectedShapeId ? '2px dashed red' : (shape.type === 'circle' ? '2px solid blue' : '2px solid black'),
                            borderRadius: shape.type === 'circle' ? '50%' : '0',
                        }}
                        onClick={(e) => handleShapeClick(shape.id, e)}
                    />
                ))}
                {currentShape && (
                    <div style={{
                        position: 'absolute',
                        left: currentShape.x,
                        top: currentShape.y,
                        width: Math.abs(currentShape.width),
                        height: Math.abs(currentShape.height),
                        backgroundColor: currentShape.type === 'circle' ? 'rgba(0, 0, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                        border: '2px dashed grey',
                        borderRadius: currentShape.type === 'circle' ? '50%' : '0',
                    }}/>
                )}
            </div>
            <div className="shape-info">
                <p>사각형 갯수: {countShapes('rectangle')}</p>
                <p>원 갯수: {countShapes('circle')}</p>
                <p>{estimateLocalStorageUsage()}</p>
            </div>
            <div className="logs">
                {logs.map((log, index) => <div key={index}>{log}</div>)}
                <div ref={logsEndRef}/>
            </div>
        </div>
    );
}

export default App;
