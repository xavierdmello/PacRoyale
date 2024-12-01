import React, { useEffect, useState } from "react";

interface BoardProps {
  board: number[];
  playerPositions: [number, number][];
}

const Board: React.FC<BoardProps> = ({ board, playerPositions }) => {
  const GRID_SIZE = 23;
  const [pacmanPos, setPacmanPos] = useState({ x: 11, y: 11 });
  console.log({playerPositions})
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      setPacmanPos(prev => {
        let newPos = { ...prev };
        
        switch (e.key) {
          case "ArrowUp":
            newPos.y = Math.max(0, prev.y - 1);
            break;
          case "ArrowDown":
            newPos.y = Math.min(GRID_SIZE - 1, prev.y + 1);
            break;
          case "ArrowLeft":
            newPos.x = Math.max(0, prev.x - 1);
            break;
          case "ArrowRight":
            newPos.x = Math.min(GRID_SIZE - 1, prev.x + 1);
            break;
        }
        return newPos;
      });
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      height: "calc(100vh - 64px)",
      backgroundColor: "#000",
      padding: "8px",
      boxSizing: "border-box",
      overflow: "hidden",
      position: "fixed",
      top: "64px",
      left: 0,
    }}>
      <div style={{
        width: "min(75vh, 75vw)",
        height: "min(75vh, 75vw)",
        display: "flex",
        flexDirection: "column",
      }}>
        {[...Array(GRID_SIZE)].map((_, rowIndex) => (
          <div key={rowIndex} style={{ 
            display: "flex",
            flex: 1,
          }}>
            {[...Array(GRID_SIZE)].map((_, cellIndex) => {
              const cell = board[rowIndex * GRID_SIZE + cellIndex] || 0;
              const isPacman = rowIndex === pacmanPos.y && cellIndex === pacmanPos.x;
              const isPlayer = playerPositions.some(
                ([x, y]) => x === cellIndex && y === rowIndex
              );

              return (
                <div
                  key={`${rowIndex}-${cellIndex}`}
                  style={{
                    flex: 1,
                    aspectRatio: "1/1",
                    backgroundColor: isPlayer
                      ? "red"
                      : cell === 2
                      ? "black"
                      : cell === 0
                      ? "black"
                      : "blue",
                    border: "1px solid #333",
                    position: "relative",
                  }}
                >
                  {cell === 2 && !isPacman && !isPlayer && (
                    <div
                      style={{
                        position: "absolute",
                        width: "15%",
                        height: "15%",
                        backgroundColor: "yellow",
                        borderRadius: "50%",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                      }}
                    />
                  )}
                  {isPacman && (
                    <div
                      style={{
                        position: "absolute",
                        width: "70%",
                        height: "70%",
                        backgroundColor: "yellow",
                        borderRadius: "50%",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Board;
