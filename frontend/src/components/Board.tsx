import React, { useEffect, useState, useRef, useCallback } from "react";
import './crt.css';
import SkinOverlay from "../assets/ArcadeSkinOverlay.png";
import chompSoundFile from "../assets/pacman_chomp.wav";
import beginningSoundFile from "../assets/pacman_beginning.wav";

const chompSound = new Audio(chompSoundFile);
chompSound.loop = true;
const beginningSound = new Audio(beginningSoundFile);
import PacmanImage from "../assets/pacman.gif";

interface BoardProps {
  board: number[];
  playerPositions: [number, number][];
  handleMove: (direction: number) => void;
}

const Board: React.FC<BoardProps> = ({ board, playerPositions, handleMove }) => {
  const GRID_SIZE = 23;
  const [previousPositions, setPreviousPositions] = useState<Map<string, [number, number]>>(new Map());
  const [playerDirections, setPlayerDirections] = useState<Map<string, 'right' | 'left' | 'up' | 'down'>>(new Map());
  const lastMoveTime = useRef<number>(0);

  useEffect(() => {
    beginningSound.play().catch((err) => {
      console.warn("Error playing beginning sound:", err);
    });
    
    chompSound.play().catch((err) => {
      console.warn("Error playing chomp sound:", err);
    });

    return () => {
      chompSound.pause();
      chompSound.currentTime = 0;
    };
  }, []);

  const debouncedHandleMove = useCallback((direction: number) => {
    const now = Date.now();
    if (now - lastMoveTime.current >= 350) {
      handleMove(direction);
      lastMoveTime.current = now;
    }
  }, [handleMove]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          debouncedHandleMove(0);
          break;
        case "ArrowDown":
          debouncedHandleMove(1);
          break;
        case "ArrowLeft":
          debouncedHandleMove(2);
          break;
        case "ArrowRight":
          debouncedHandleMove(3);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [debouncedHandleMove]);

  useEffect(() => {
    playerPositions.forEach((pos, playerIndex) => {
      const [x, y] = pos;
      const prevPos = previousPositions.get(playerIndex.toString());
      
      if (prevPos) {
        const [prevX, prevY] = prevPos;
        if (x !== prevX || y !== prevY) {
          let direction: 'right' | 'left' | 'up' | 'down' = 'right';
          
          if (x > prevX) direction = 'right';
          else if (x < prevX) direction = 'left';
          else if (y > prevY) direction = 'down';
          else if (y < prevY) direction = 'up';
          
          setPlayerDirections(prev => new Map(prev).set(playerIndex.toString(), direction));
        }
      }
      
      setPreviousPositions(prev => new Map(prev).set(playerIndex.toString(), [x, y]));
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
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
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
                  {cell === 2 && !isPlayer && (
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
                  {isPlayer && (
                    <img
                      src={PacmanImage}
                      style={{
                        position: "absolute",
                        width: "70%",
                        height: "70%",
                        top: "50%",
                        left: "50%",
                        filter: (() => {
                          const playerIndex = playerPositions.findIndex(
                            ([px, py]) => px === cellIndex && py === rowIndex
                          );
                          switch (playerIndex) {
                            case 0: return 'brightness(0) saturate(100%) invert(88%) sepia(61%) saturate(4000%) hue-rotate(360deg)'; // Bright Yellow (#FFFF00)
                            case 1: return 'brightness(0) saturate(100%) invert(50%) sepia(85%) saturate(1267%) hue-rotate(357deg)'; // Orange-Red (#FF4500)
                            case 2: return 'brightness(0) saturate(100%) invert(23%) sepia(91%) saturate(6453%) hue-rotate(343deg)'; // Hot Pink (#FF1493)
                            case 3: return 'brightness(0) saturate(100%) invert(90%) sepia(95%) saturate(9938%) hue-rotate(122deg)'; // Bright Green (#00FF00)
                            default: return 'brightness(0) saturate(100%) invert(18%) sepia(35%) saturate(3000%) hue-rotate(1960deg)'; // Default yellow
                          }
                        })(),
                        transform: (() => {
                          const playerIndex = playerPositions.findIndex(
                            ([px, py]) => px === cellIndex && py === rowIndex
                          );
                          const direction = playerDirections.get(playerIndex.toString());
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
