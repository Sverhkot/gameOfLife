import { useState, useEffect, useRef } from "react";

function GridGame() {
  const bgColor = "#dddddd";
  const cellColor = "#a7c957";
  const cellH = 16;
  const cellW = 16;
  const rows = 30;
  const cols = 30;
  const canvasRef = useRef(null);
  const canvasWidth = cols*cellW + 1;
  const canvasHeight = rows*cellH + 1;

  const [grid, setGrid] = useState(initializeGrid());
  const [hasStarted, setHasStarted] = useState(false);
  const [stepOfInterval, setStep] = useState(200);
  const [intervalID, setNewIntervalID] = useState()

  function initializeGrid(){
    return Array(rows).fill().map(() => Array(cols).fill(0));
  }

//Creating board

  function drawGridBorders(rows, cols, ctx, cellWidth, cellHeight) {
    ctx.beginPath();
    ctx.strokeStyle = 'black';

    for (let col = 0; col <= cols; col++) {
      const x = col * cellWidth;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
    }

    for (let row = 0; row <= rows; row++) {
      const y = row * cellHeight;
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
    }
  
    ctx.stroke();
  }

  function drawGrid(ctx){
    grid.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        ctx.fillStyle = cell ? cellColor : bgColor;
        const rowOffset = rowIndex*cellH + 1;
        const colOffset = colIndex*cellW + 1;
        ctx.fillRect(colOffset, rowOffset, cellW - 1, cellH - 1 )
      })
    })
  }

  function handleClick(e) {
    const x = e.clientX - e.target.offsetLeft;
    const y = e.clientY - e.target.offsetTop;

    let rowIndex = Math.floor(y / cellH);
    let colIndex = Math.floor(x / cellW );

    if(rowIndex === rows){
      rowIndex = rows - 1;
    }
    if(colIndex === cols){
      colIndex = cols - 1
    }
    
    setGrid((grid) => {
      let newGrid = structuredClone(grid);
      newGrid[rowIndex][colIndex] = 1;
      return newGrid;
    })
  }

//Calculating cell lifecycle

  function calculateCellNeighbours(rowIndex,colIndex, currentGrid){
    const modifier = [-1, 0, 1];
    let neighbours = 0;

    modifier.forEach((rowOffset) => {
      modifier.forEach((colOffset) => {
        const neighbourCol = colIndex + colOffset;
        const neighbourRow = rowIndex + rowOffset;
        
        if (colOffset === 0 && rowOffset === 0) { return }
        if (neighbourCol < 0 || neighbourCol >= cols) { return }
        if (neighbourRow < 0 || neighbourRow >= rows) { return }

        neighbours += currentGrid[neighbourRow][neighbourCol];
      })
    })
    return neighbours;
  }

  function handleCellLifeCycle(neighbours, rowIndex, colIndex, currentGrid) {
    const isAlive = currentGrid[rowIndex][colIndex] === 1;
    return isAlive ? neighbours === 2 || neighbours === 3 : neighbours === 3;
  }
  // Actions

  function getCurrentGrid(grid) {
    const oldGrid = structuredClone(grid);
    const nextGrid = structuredClone(grid);
  
    grid.forEach((row, rowIndex) => {
      row.forEach((_, colIndex) => {
        const neighbours = calculateCellNeighbours(rowIndex, colIndex, oldGrid);
        nextGrid[rowIndex][colIndex] = handleCellLifeCycle(neighbours, rowIndex, colIndex, oldGrid) ? 1 : 0;
      });
    });
    if(oldGrid === nextGrid){
      console.log('nothing changed')
    }
    return nextGrid;
  }

  function handleStepForwardClick(){
    return setGrid((grid) => getCurrentGrid(grid));
  }

  function handleStartCycleClick() {
    setHasStarted(true);
    const id = setInterval(() => {
      setGrid(prevGrid => getCurrentGrid(prevGrid));
    }, stepOfInterval);
    setNewIntervalID(id);
  }

  function handleStopCycleClick() {
    clearInterval(intervalID);
    setHasStarted(false);
    setNewIntervalID(undefined);
  }
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    drawGridBorders(rows, cols, ctx, cellW, cellH)
    drawGrid(ctx)
  }, [grid]);

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column'}}>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        style={{ backgroundColor: bgColor}}
        onClick={(event) => handleClick(event)}
      />
      <button onClick={handleStepForwardClick} style={{ padding: '10px'}}>Step forward</button>
       
      <button 
        disabled={hasStarted}
        onClick={handleStartCycleClick}
        style={{ padding: '10px'}}
      >
        Start
      </button>

      <button 
        disabled={!hasStarted}
        onClick={handleStopCycleClick}
        style={{ padding: '10px'}}
      >
        Stop
      </button>

      <div>
        <input 
          type="range" 
          id='stepOfInterval' 
          name='stepOfInterval' 
          min="200" 
          max="2000" 
          step='200' 
          disabled={hasStarted}
          value={stepOfInterval} 
          onChange={(e) => setStep(Number(e.target.value))}
        />
        <label>Step: {stepOfInterval}</label>
      </div>
    </div>
  );
};

export default GridGame