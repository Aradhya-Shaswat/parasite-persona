import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Image } from 'react-konva';
import { useNavigate } from 'react-router-dom'; 

const PlayPage = () => {
  const navigate = useNavigate();
  const [characterPosition, setCharacterPosition] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [currentImage, setCurrentImage] = useState(0);
  const [isFacingLeft, setIsFacingLeft] = useState(false);
  const [enemyPosition, setEnemyPosition] = useState(null);
  const [enemyCurrentImage, setEnemyCurrentImage] = useState(0);
  const [isEnemySpawned, setIsEnemySpawned] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [screenCleared, setScreenCleared] = useState(false);  
  const [barsSpawned, setBarsSpawned] = useState(false);
  const stageRef = useRef(null);

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

  const shakeAmount = 30; // Increase shake intensity
  const shakeDuration = 2000; // Shake for 2 seconds
  const enemyTouchThreshold = 50; // Distance at which the enemy touches the player

  const backgroundMusic = new Audio('./assets/background-music.mp3'); // Load your background music here
  backgroundMusic.loop = true; // Make the music loop indefinitely

  useEffect(() => {
    // Play the background music when the component mounts
    backgroundMusic.play().catch((err) => console.error('Error playing background music:', err));

    // Cleanup function to stop the music when the component unmounts
    return () => {
      backgroundMusic.pause();
      backgroundMusic.currentTime = 0; // Reset music position
    };
  }, []);

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

        if (distance < enemyTouchThreshold && !barsSpawned) {
          // When the enemy touches the player, spawn the bars, then run the sequence
          setBarsSpawned(true);
          setScreenCleared(true);  // Trigger screen clear effect
          setTimeout(() => {
            setIsShaking(true); // Start shaking the screen
            setTimeout(() => {
              setIsShaking(false); // Stop shaking after duration
            }, shakeDuration);
            navigate('/act1');  // Navigate to ACT1 and pass state
          }, 2000);  // Wait 2 seconds after the touch before shaking
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
  }, [enemyPosition, characterPosition, barsSpawned, navigate]);

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

  // Shaking Effect
  useEffect(() => {
    if (isShaking) {
      const shakeInterval = setInterval(() => {
        const shakeOffset = Math.random() * shakeAmount - shakeAmount / 2;
        stageRef.current?.to({
          x: shakeOffset,
          y: shakeOffset,
          duration: 0.05,
        });
      }, 50);

      setTimeout(() => {
        clearInterval(shakeInterval);
        setIsShaking(false);
      }, shakeDuration);
    }
  }, [isShaking]);

  return (
    <div style={{ margin: 0, padding: 0, width: '100%', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <Stage
        width={stageWidth}
        height={stageHeight}
        style={{ backgroundColor: screenCleared ? 'black' : 'black', filter: screenCleared ? 'contrast(100%) brightness(50%)' : 'none' }} // Add corrupted effect
        ref={stageRef}
      >
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
        </Layer>
      </Stage>
    </div>
  );
};

export default PlayPage;
