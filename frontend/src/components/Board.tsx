import React, { useEffect, useState, useRef, useCallback } from "react";
import "./crt.css";
import SkinOverlay from "../assets/ArcadeSkinOverlay.png";
import chompSoundFile from "../assets/pacman_chomp.wav";
import beginningSoundFile from "../assets/pacman_beginning.wav";
import deathSoundFile from "../assets/pacman_death.wav";

const chompSound = new Audio(chompSoundFile);
chompSound.loop = true;
const beginningSound = new Audio(beginningSoundFile);
const deathSound = new Audio(deathSoundFile);
import PacmanImage from "../assets/pacman.gif";

interface BoardProps {
  board: number[];
  playerPositions: [number, number, boolean, boolean][];
  handleMove: (direction: number) => void;
}

const Board: React.FC<BoardProps> = ({
  board,
  playerPositions,
  handleMove,
}) => {
  const GRID_SIZE = 23;
  const [previousPositions, setPreviousPositions] = useState<
    Map<string, [number, number]>
  >(new Map());
  const [playerDirections, setPlayerDirections] = useState<
    Map<string, "right" | "left" | "up" | "down">
  >(new Map());
  const lastMoveTime = useRef<number>(0);
  const [collectedCoins, setCollectedCoins] = useState<Set<number>>();

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

  const debouncedHandleMove = useCallback(
    (direction: number) => {
      const now = Date.now();
      if (now - lastMoveTime.current >= 350) {
        handleMove(direction);
        lastMoveTime.current = now;
      }
    },
    [handleMove]
  );

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
          let direction: "right" | "left" | "up" | "down" = "right";

          if (x > prevX) direction = "right";
          else if (x < prevX) direction = "left";
          else if (y > prevY) direction = "down";
          else if (y < prevY) direction = "up";

          setPlayerDirections((prev) =>
            new Map(prev).set(playerIndex.toString(), direction)
          );
        }
      }

      setPreviousPositions((prev) =>
        new Map(prev).set(playerIndex.toString(), [x, y])
      );
    });
  }, [playerPositions]);

  useEffect(() => {
    playerPositions.forEach((pos, playerIndex) => {
      const [, , , isDead] = pos;
      const prevPositions = previousPositions.get(playerIndex.toString());
      
      if (prevPositions) {
        const prevIsDead = playerPositions[playerIndex]?.[3] ?? false;
        
        // If player just died (wasn't dead before but is dead now)
        if (!prevIsDead && isDead) {
          deathSound.play().catch((err) => {
            console.warn("Error playing death sound:", err);
          });
        }
      }
    });
  }, [playerPositions, previousPositions]);

  useEffect(() => {
    // Initialize collectedCoins if not already initialized
    if (!collectedCoins) {
      setCollectedCoins(new Set());
    }

    // Check each player's position for coins
    playerPositions.forEach(([x, y]) => {
      const index = y * GRID_SIZE + x;
      if (board[index] === 2) { // 2 represents coins in the game
        setCollectedCoins(prev => {
          const newSet = new Set(prev);
          newSet.add(index);
          return newSet;
        });
      }
    });
  }, [playerPositions, board]);

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
      }}
    >
      <div
        style={{
          width: "min(75vh, 75vw)",
          height: "min(75vh, 75vw)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {[...Array(GRID_SIZE)].map((_, rowIndex) => (
          <div
            key={rowIndex}
            style={{
              display: "flex",
              flex: 1,
            }}
          >
            {[...Array(GRID_SIZE)].map((_, cellIndex) => {
              const cell = board[rowIndex * GRID_SIZE + cellIndex] || 0;
              const isPlayer = playerPositions.some(
                ([px, py, _, isDead]) =>
                  px === cellIndex && py === rowIndex && !isDead
              );

              return (
                <div
                  key={`${rowIndex}-${cellIndex}`}
                  style={{
                    flex: 1,
                    aspectRatio: "1/1",
                    backgroundColor:
                      cell === 2
                        ? "black"
                        : cell === 0
                        ? "black"
                        : cell === 3
                        ? "black"
                        : "blue",
                    border: "1px solid #333",
                    position: "relative",
                  }}
                >
                  {cell === 2 && !isPlayer && !collectedCoins?.has(rowIndex * GRID_SIZE + cellIndex) && (
                    <div
                      style={{
                        position: "absolute",
                        width: "15%",
                        height: "15%",
                        backgroundColor: "white",
                        borderRadius: "50%",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                      }}
                    />
                  )}
                  {cell === 3 && !isPlayer && (
                    <div
                      style={{
                        position: "absolute",
                        width: "35%",
                        height: "35%",
                        backgroundColor: "white",
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
                        width: (() => {
                          const playerIndex = playerPositions.findIndex(
                            ([px, py]) => px === cellIndex && py === rowIndex
                          );
                          const [, , isPoweredUp] =
                            playerPositions[playerIndex];
                          return isPoweredUp ? "140%" : "70%";
                        })(),
                        height: (() => {
                          const playerIndex = playerPositions.findIndex(
                            ([px, py]) => px === cellIndex && py === rowIndex
                          );
                          const [, , isPoweredUp] =
                            playerPositions[playerIndex];
                          return isPoweredUp ? "140%" : "70%";
                        })(),
                        top: "50%",
                        left: "50%",
                        filter: (() => {
                          const playerIndex = playerPositions.findIndex(
                            ([px, py]) => px === cellIndex && py === rowIndex
                          );
                          const [, , isPoweredUp] =
                            playerPositions[playerIndex];
                          const baseColor = (() => {
                            switch (playerIndex) {
                              case 0:
                                return "brightness(0) saturate(100%) invert(88%) sepia(61%) saturate(4000%) hue-rotate(360deg)";
                              case 1:
                                return "brightness(0) saturate(100%) invert(50%) sepia(85%) saturate(1267%) hue-rotate(357deg)";
                              case 2:
                                return "brightness(0) saturate(100%) invert(23%) sepia(91%) saturate(6453%) hue-rotate(343deg)";
                              case 3:
                                return "brightness(0) saturate(100%) invert(90%) sepia(95%) saturate(9938%) hue-rotate(122deg)";
                              default:
                                return "brightness(0) saturate(100%) invert(18%) sepia(35%) saturate(3000%) hue-rotate(1960deg)";
                            }
                          })();
                          return isPoweredUp
                            ? baseColor + " brightness(1.5)"
                            : baseColor;
                        })(),
                        transform: (() => {
                          const playerIndex = playerPositions.findIndex(
                            ([px, py]) => px === cellIndex && py === rowIndex
                          );
                          const direction = playerDirections.get(
                            playerIndex.toString()
                          );
                          return `translate(-50%, -50%) rotate(${
                            direction === "right"
                              ? "0deg"
                              : direction === "down"
                              ? "90deg"
                              : direction === "left"
                              ? "180deg"
                              : direction === "up"
                              ? "270deg"
                              : "0deg"
                          })`;
                        })(),
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
