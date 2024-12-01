import React from "react";

interface BoardProps {
  board: number[];
}

const Board: React.FC<BoardProps> = ({ board }) => {
  const GRID_SIZE = 23;

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {[...Array(GRID_SIZE)].map((_, rowIndex) => (
        <div key={rowIndex} style={{ display: "flex" }}>
          {[...Array(GRID_SIZE)].map((_, cellIndex) => {
            const cell = board[rowIndex * GRID_SIZE + cellIndex] || 0;

            return (
              <div
                key={`${rowIndex}-${cellIndex}`}
                style={{
                  width: "32px",
                  height: "32px",
                  backgroundColor: cell === 2
                    ? "black"
                    : cell === 0
                    ? "black"
                    : "blue",
                  border: "1px solid #333",
                  position: cell === 2 ? "relative" : "static",
                }}
              >
                {cell === 2 && (
                  <div
                    style={{
                      position: "absolute",
                      width: "4px",
                      height: "4px",
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
  );
};

export default Board;
