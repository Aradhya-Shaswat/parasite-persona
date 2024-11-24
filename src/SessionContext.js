import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Image, Rect } from 'react-konva';

const PlayPage = () => {
  const [characterPosition, setCharacterPosition] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [currentImage, setCurrentImage] = useState(0);
  const [isFacingLeft, setIsFacingLeft] = useState(false);
  const [enemyPosition, setEnemyPosition] = useState(null);
  const [enemyCurrentImage, setEnemyCurrentImage] = useState(0);
  const [isEnemySpawned, setIsEnemySpawned] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [health, setHealth] = useState(100);
  const [dopamine, setDopamine] = useState(100);

  const player1 = new window.Image();
  const player2 = new window.Image();
  const enemy1 = new window.Image();
  const enemy2 = new window.Image();

  player1.src = './assets/player1.png'; 
  player2.src = '/assets/player2.png';
  enemy1.src = './assets/enemy1.png'; 
  enemy2.src = './assets/enemy2.png'; 

  const stageWidth = window.innerWidth;
  const stageHeight = window.innerHeight;
  const playerWidth = 150;
  const playerHeight = 150;
  const enemyWidth = 150;
  const enemyHeight = 150;

  const shakeDuration = 1000; // Duration of the screen shake (in ms)
  const shakeAmount = 20; // How much the screen shakes in pixels
  const enemyTouchThreshold = 50; // Distance threshold for touching the player

  const stageRef = useRef(null);

  useEffect(() => {
    if (!isEnemySpawned) {
      const randomDistance = 500;
      const randomAngle = Math.random() * 2 * Math.PI;
      const randomX = characterPosition.x + randomDistance * Math.cos(randomAngle);
      const randomY = characterPosition.y + randomDistance * Math.sin(randomAngle);
  
      setEnemyPosition({ x: randomX, y: randomY });
      setIsEnemySpawned(true);
    }
  }, [isEnemySpawned, characterPosition]);

  useEffect(() => {
    const animationInterval = setInterval(() => {
      setCurrentImage((prev) => (prev === 0 ? 1 : 0)); 
      setEnemyCurrentImage((prev) => (prev === 0 ? 1 : 0)); 
    }, 250); 

    return () => clearInterval(animationInterval);
  }, []);

  useEffect(() => {
    const chaseInterval = setInterval(() => {
      if (enemyPosition) {
        const dx = characterPosition.x - enemyPosition.x;
        const dy = characterPosition.y - enemyPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Detect collision (enemy touches player)
        if (distance < enemyTouchThreshold) {
          // Wait for 2 seconds, then shake the screen and load the bars
          setTimeout(() => {
            setIsShaking(true);  // Trigger the shake effect
            setHealth((prev) => Math.max(prev - 10, 0));  // Decrease health
            setDopamine((prev) => Math.min(prev + 10, 100));  // Increase dopamine
          }, 2000); // Wait 2 seconds before shaking

          return; // Exit the chase logic once the player is touched
        }

        const speed = distance / (Math.random() * 2 + 5);
        const moveX = (dx / distance) * speed;
        const moveY = (dy / distance) * speed;

        setEnemyPosition((prev) => ({
          x: prev.x + moveX,
          y: prev.y + moveY,
        }));
      }
    }, 100);

    return () => clearInterval(chaseInterval);
  }, [enemyPosition, characterPosition]);

  const handleKeyPress = (e) => {
    setCharacterPosition((prev) => {
      let newDirection = { ...prev };

      switch (e.key) {
        case 'ArrowUp':
          newDirection = { ...prev, y: Math.max(0, prev.y - 10) };
          break;
        case 'ArrowDown':
          newDirection = { ...prev, y: Math.min(stageHeight - playerHeight, prev.y + 10) };
          break;
        case 'ArrowLeft':
          newDirection = { ...prev, x: Math.max(0, prev.x - 10) };
          setIsFacingLeft(false);
          break;
        case 'ArrowRight':
          newDirection = { ...prev, x: Math.min(stageWidth - playerWidth, prev.x + 10) };
          setIsFacingLeft(true);
          break;
        default:
          break;
      }

      return newDirection;
    });
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Shake effect logic
  useEffect(() => {
    if (isShaking) {
      const shakeInterval = setInterval(() => {
        const shakeAmountOffset = Math.random() * shakeAmount - shakeAmount / 2;
        stageRef.current?.to({
          x: shakeAmountOffset,
          y: shakeAmountOffset,
          duration: 0.05,
        });
      }, 50);

      setTimeout(() => {
        clearInterval(shakeInterval); // Stop shaking after the duration
        setIsShaking(false);  // Reset the shake state
      }, shakeDuration);
    }
  }, [isShaking]);

  return (
    <div style={{ margin: 0, padding: 0, width: '100%', height: '100vh', overflow: 'hidden' }}>
      <Stage width={stageWidth} height={stageHeight} style={{ backgroundColor: 'black' }} ref={stageRef}>
        <Layer>
          {/* Player Character */}
          <Image
            x={characterPosition.x}
            y={characterPosition.y}
            image={currentImage === 0 ? player1 : player2}
            width={playerWidth}
            height={playerHeight}
            scaleX={isFacingLeft ? -1 : 1}
          />

          {/* Enemy Character */}
          {enemyPosition && (
            <Image
              x={enemyPosition.x}
              y={enemyPosition.y}
              image={enemyCurrentImage === 0 ? enemy1 : enemy2}
              width={enemyWidth}
              height={enemyHeight}
            />
          )}

          {/* Health Bar */}
          <Rect
            x={50}
            y={50}
            width={(health / 100) * 300}
            height={20}
            fill="red"
            shadowBlur={5}
          />
          
          {/* Dopamine Bar */}
          <Rect
            x={50}
            y={80}
            width={(dopamine / 100) * 300}
            height={20}
            fill="green"
            shadowBlur={5}
          />
        </Layer>
      </Stage>
    </div>
  );
};

export default PlayPage;
