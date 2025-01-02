"use client";
import React, { useRef, useCallback, useEffect, useState } from "react";
import { generateColor } from "@/lib/utils";

const greenSpectrum = [
  "#00FF00",
  "#00EE00",
  "#00CC00",
  "#00AA00",
  "#008800",
  "#006600",
  "#004400",
  "#002200",
];

export default function GameOfLife() {
  const [windowDimensions, setWindowDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [isVisible, setIsVisible] = useState(true);
  const [generation, setGeneration] = useState(0);
  const canvasRef = useRef(null);
  const cellSize = 4;
  const [grid, setGrid] = useState([]);
  const [cells, setCells] = useState({});

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (windowDimensions.width === 0 || windowDimensions.height === 0) return;

    const newGrid = [];
    for (let i = 0; i < windowDimensions.width / cellSize; i++) {
      newGrid[i] = [];
      for (let j = 0; j < windowDimensions.height / cellSize; j++) {
        newGrid[i][j] = Math.random() < 0.09 ? 1 : 0;
      }
    }
    setGrid(newGrid);
  }, [windowDimensions]);

  const countAliveNeighbors = useCallback(
    (x, y) => {
      let count = 0;
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (i === 0 && j === 0) continue;
          const row =
            (x + i + windowDimensions.width / cellSize) %
            (windowDimensions.width / cellSize);
          const col =
            (y + j + windowDimensions.height / cellSize) %
            (windowDimensions.height / cellSize);
          if (grid && grid[row] && grid[row][col]) {
            count += grid[row][col] > 0 ? 1 : 0;
          }
        }
      }
      return count;
    },
    [grid, windowDimensions]
  );

  const updateCell = useCallback(
    (x, y, alive, aliveNeighbors) => {
      const position = `${x}.${y}`;
      const newCells = { ...cells };
      const cellExistsInPosition = cells.hasOwnProperty(position);

      if (!cellExistsInPosition && alive) {
        const newGen = cells[position]?.gen ?? 0;
        const newColor = greenSpectrum[aliveNeighbors];
        newCells[position] = { aliveNeighbors, gen: newGen, color: "red" };
      }

      if (cellExistsInPosition) {
        if (aliveNeighbors === 2 || aliveNeighbors === 3) {
          const newGen = cells[position]?.gen ? cells[position].gen + 1 : 0;
          newCells[position] = {
            aliveNeighbors,
            gen: newGen,
            color: cells[position]?.color,
          };
        } else if (aliveNeighbors === 3) {
          const newGen = cells[position]?.gen ? cells[position].gen + 1 : 0;
          const newColor = greenSpectrum[aliveNeighbors];
          newCells[position] = { aliveNeighbors, gen: newGen, color: "red" };
        }
      }
      setCells(newCells);
    },
    [cells]
  );

  const update = useCallback(() => {
    const newGrid = [];
    for (let i = 0; i < windowDimensions.width / cellSize; i++) {
      newGrid[i] = [];
      for (let j = 0; j < windowDimensions.height / cellSize; j++) {
        const aliveNeighbors = countAliveNeighbors(i, j);
        if (grid && grid[i] && grid[i][j] && grid[i][j] > 0) {
          const alive = aliveNeighbors === 2 || aliveNeighbors === 3 ? 1 : 0;
          newGrid[i][j] = alive;
          updateCell(i, j, alive, aliveNeighbors);
        } else {
          const alive = aliveNeighbors === 3 ? 1 : 0;
          newGrid[i][j] = alive;
          updateCell(i, j, alive, aliveNeighbors);
        }
      }
    }
    setGrid(newGrid);
  }, [grid, cells, windowDimensions, countAliveNeighbors, updateCell]);

  const draw = useCallback(() => {
    if (!canvasRef?.current) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, windowDimensions.width, windowDimensions.height);
    for (let i = 0; i < windowDimensions.width / cellSize; i++) {
      for (let j = 0; j < windowDimensions.height / cellSize; j++) {
        if (grid && grid[i] && grid[i][j]) {
          ctx.fillStyle = generateColor(i, j);
          ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
        }
      }
    }
  }, [grid, cells, windowDimensions]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "image.png";
    link.href = dataURL;
    link.click();
  };

  const animate = useCallback(() => {
    update();
    draw();
  }, [update, draw]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!isVisible) return;
      setGeneration((gen) => gen + 1);
      requestAnimationFrame(animate);
    }, 30);

    return () => clearInterval(intervalId);
  }, [animate, isVisible]);

  return (
    <div style={{ position: "relative" }}>
      {windowDimensions.width > 0 && windowDimensions.height > 0 && (
        <canvas
          width={windowDimensions.width}
          height={windowDimensions.height}
          className="gameOfLife"
          ref={canvasRef}
        />
      )}
      <div
        style={{
          position: "absolute",
          left: 20,
          bottom: 24,
          color: "#fff",
          background: "rgba(64,64,64,0.9)",
          padding: "3px 6px",
          borderRadius: "8px",
          fontSize: "0.9em",
          fontFamily: "Helvetica, sans-serif",
        }}
      >
        Generation {generation}
      </div>
      <div
        onClick={handleDownload}
        style={{
          position: "absolute",
          right: 20,
          bottom: 24,
          color: "#fff",
          background: "rgba(64,64,64,0.9)",
          padding: "3px 6px",
          borderRadius: "8px",
          fontSize: "0.9em",
          fontFamily: "Helvetica, sans-serif",
          zIndex: 999,
          cursor: "pointer",
        }}
      >
        📸
      </div>
    </div>
  );
}
