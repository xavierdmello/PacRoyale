import React, { useEffect, useState, useRef } from "react";
import './crt.css';
import SkinOverlay from "../assets/ArcadeSkinOverlay.png";
import PacmanImage from "../assets/pacman.gif";

interface BoardProps {
  board: number[];
  playerPositions: [number, number][];
}

const PLAYER_COLORS = [
  '#FF0000', // Red
  '#00FF00', // Green
  '#00FFFF', // Cyan
  '#FF00FF', // Magenta
];

const Board: React.FC<BoardProps> = ({ board, playerPositions }) => {
  const GRID_SIZE = 23;
  const [pacmanPos, setPacmanPos] = useState({ x: 11, y: 11 });
  const [pacmanDirection, setPacmanDirection] = useState<'right' | 'left' | 'up' | 'down'>('right');
  const [previousPositions, setPreviousPositions] = useState<Map<string, [number, number]>>(new Map());
  const [playerDirections, setPlayerDirections] = useState<Map<string, 'right' | 'left' | 'up' | 'down'>>(new Map());

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      setPacmanPos(prev => {
        let newPos = { ...prev };
        
        switch (e.key) {
          case "ArrowUp":
            setPacmanDirection('up');
            newPos.y = Math.max(0, prev.y - 1);
            break;
          case "ArrowDown":
            setPacmanDirection('down');
            newPos.y = Math.min(GRID_SIZE - 1, prev.y + 1);
            break;
          case "ArrowLeft":
            setPacmanDirection('left');
            newPos.x = Math.max(0, prev.x - 1);
            break;
          case "ArrowRight":
            setPacmanDirection('right');
            newPos.x = Math.min(GRID_SIZE - 1, prev.x + 1);
            break;
        }
        return newPos;
      });
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  useEffect(() => {
    playerPositions.forEach((pos, playerIndex) => {
      const [x, y] = pos;
      const prevPos = previousPositions.get(playerIndex);
      
      if (prevPos) {
        const [prevX, prevY] = prevPos;
        if (x !== prevX || y !== prevY) {
          let direction: 'right' | 'left' | 'up' | 'down' = 'right';
          
          if (x > prevX) direction = 'right';
          else if (x < prevX) direction = 'left';
          else if (y > prevY) direction = 'down';
          else if (y < prevY) direction = 'up';
          
          console.log(`Player ${playerIndex} moved from (${prevX},${prevY}) to (${x},${y}), direction: ${direction}`);
          setPlayerDirections(prev => new Map(prev).set(playerIndex, direction));
        }
      }
      
      setPreviousPositions(prev => new Map(prev).set(playerIndex, [x, y]));
    });
  }, [playerPositions]);

  return (
    <div 
      className="crt"
      style={{ 
        display: "flex", 
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "calc(100vh - 64px)",
        padding: "8px",
        boxSizing: "border-box",
        overflow: "hidden",
        position: "fixed",
        top: "64px",
        left: 0,
        animation: "textShadow 1.6s infinite",
        backgroundColor: "#000",
        backgroundImage: `url(${SkinOverlay})`,
        backgroundSize: "cover", // Ensures the image covers the entire div
        backgroundPosition: "center", // Centers the image
        backgroundRepeat: "no-repeat", // Prevents tiling
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
                    backgroundColor: cell === 2 ? "black" : cell === 0 ? "black" : "blue",
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
                    <img
                      src={PacmanImage}
                      style={{
                        position: "absolute",
                        width: "70%",
                        height: "70%",
                        top: "50%",
                        left: "50%",
                        transform: `translate(-50%, -50%) rotate(${
                          pacmanDirection === 'right' ? '0deg' :
                          pacmanDirection === 'down' ? '90deg' :
                          pacmanDirection === 'left' ? '180deg' :
                          pacmanDirection === 'up' ? '270deg' : '0deg'
                        })`,
                      }}
                      alt="Pacman"
                    />
                  )}
                  {isPlayer && (
                    <img
                      src={PacmanImage}
                      style={{
                        position: "absolute",
                        width: "70%",
                        height: "70%",
                        top: "50%",
                        left: "50%",
                        filter: `hue-rotate(${(() => {
                          const playerIndex = playerPositions.findIndex(
                            ([px, py]) => px === cellIndex && py === rowIndex
                          );
                          return playerIndex >= 0 ? `${(playerIndex * 90) % 360}deg` : '0deg';
                        })()})`,
                        transform: (() => {
                          const playerIndex = playerPositions.findIndex(
                            ([px, py]) => px === cellIndex && py === rowIndex
                          );
                          const direction = playerDirections.get(playerIndex);
                          console.log(`Rendering player ${playerIndex} at (${cellIndex},${rowIndex}) with direction ${direction}`);
                          
                          return `translate(-50%, -50%) rotate(${
                            direction === 'right' ? '0deg' :
                            direction === 'down' ? '90deg' :
                            direction === 'left' ? '180deg' :
                            direction === 'up' ? '270deg' : '0deg'
                          })`;
                        })()
                      }}
                      alt="Player"
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
