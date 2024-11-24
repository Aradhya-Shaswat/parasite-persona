import React, { useState, useEffect } from 'react';
import { Stage, Layer, Image, Text, Rect } from 'react-konva';
import './Act1.css';

const Act1 = () => {
    const [currentImage, setCurrentImage] = useState(0);  // 0: enemy1, 1: player1
    const [characterPosition, setCharacterPosition] = useState({ x: window.innerWidth / 2 - 75, y: window.innerHeight / 2 - 75 });
    const [dialogIndex, setDialogIndex] = useState(0);
    const [isDialogVisible, setIsDialogVisible] = useState(true);  // Dialog is visible at the start
    
    // Health and dopamine state
    const [health, setHealth] = useState(100);  // Health out of 100
    const [dopamine, setDopamine] = useState(0);  // Dopamine out of 100

    const player1 = new window.Image();
    const enemy1 = new window.Image();
    const sprite1 = new window.Image();  // For decreasing dopamine
    const sprite2 = new window.Image();  // For increasing dopamine

    player1.src = './assets/player1.png';
    enemy1.src = './assets/enemy1.png';
    sprite1.src = './assets/sprite1.png';
    sprite2.src = './assets/sprite1.png';

    const stageWidth = window.innerWidth;
    const stageHeight = window.innerHeight;
    const imageWidth = 150;
    const imageHeight = 150;

    const dialogMessages = [
        "Parasite Persona",
        "Parasite has been infected further.",
        "Engage.",
    ];

    const [sprites, setSprites] = useState([]);
    
    useEffect(() => {
        const animationInterval = setInterval(() => {
            setCurrentImage((prev) => (prev === 0 ? 1 : 0));  // Toggle between enemy1 and player1
        }, 500);  // Change every 500ms

        return () => clearInterval(animationInterval);  // Clean up the interval when the component is unmounted
    }, []);

    // Handle key press for player movement
    const handleKeyPress = (e) => {
        setCharacterPosition((prev) => {
            let newDirection = { ...prev };

            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                    newDirection = { ...prev, y: Math.max(0, prev.y - 10) };
                    break;
                case 'ArrowDown':
                case 's':
                    newDirection = { ...prev, y: Math.min(stageHeight - imageHeight, prev.y + 10) };
                    break;
                case 'ArrowLeft':
                case 'a':
                    newDirection = { ...prev, x: Math.max(0, prev.x - 10) };
                    break;
                case 'ArrowRight':
                case 'd':
                    newDirection = { ...prev, x: Math.min(stageWidth - imageWidth, prev.x + 10) };
                    break;
                default:
                    break;
            }

            return newDirection;
        });
    };

    // Show dialog when player presses space or interacts
    const handleDialogNext = () => {
        if (dialogIndex < dialogMessages.length - 1) {
            setDialogIndex(dialogIndex + 1);
        } else {
            setIsDialogVisible(false);  // Close dialog when it's over
            handleEndDialog();  // Trigger the effects after the dialog ends
        }
    };

    // Show dialog when the game starts
    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    // Render Dopamine and Health Bars
    const healthBarWidth = 300;
    const dopamineBarWidth = 300;
    const healthBarHeight = 30;
    const dopamineBarHeight = 30;

    // Function to handle end of the dialog and apply effects based on dopamine level
    const handleEndDialog = () => {
        if (dopamine <= 50) {
            // Shake the screen and change to black and white
            document.body.classList.add('shake-screen');
            setTimeout(() => {
                document.body.classList.add('bw-effect');
            }, 1000);  // Apply black and white effect after the shake
            
            // Spawn sprites randomly after hazy effect starts
            spawnSprites();
        } else {
            // Apply hazy effect
            document.body.classList.add('hazy-effect');
        }
    };

    // Function to spawn the sprites randomly
    const spawnSprites = () => {
        const newSprites = [];

        // Randomly decide to spawn 1 or 2 sprites
        const spriteCount = Math.floor(Math.random() * 2) + 1;  // Will spawn 1 or 2 sprites

        for (let i = 0; i < spriteCount; i++) {
            const randomX = Math.random() * (stageWidth - imageWidth);
            const randomY = Math.random() * (stageHeight - imageHeight);
            const randomSprite = Math.random() < 0.5 ? sprite1 : sprite2;

            newSprites.push({
                image: randomSprite,
                x: randomX,
                y: randomY,
                type: randomSprite === sprite1 ? 'decrease' : 'increase',
            });
        }

        setSprites(newSprites);
    };

    // Check for collision between player and sprite
    const checkCollision = (sprite) => {
        const playerRect = {
            x: characterPosition.x,
            y: characterPosition.y,
            width: imageWidth,
            height: imageHeight,
        };
        const spriteRect = {
            x: sprite.x,
            y: sprite.y,
            width: imageWidth,
            height: imageHeight,
        };

        return (
            playerRect.x < spriteRect.x + spriteRect.width &&
            playerRect.x + playerRect.width > spriteRect.x &&
            playerRect.y < spriteRect.y + spriteRect.height &&
            playerRect.y + playerRect.height > spriteRect.y
        );
    };

    // Handle sprite collision effects
    const handleSpriteCollision = () => {
        const remainingSprites = sprites.filter((sprite) => {
            if (checkCollision(sprite)) {
                if (sprite.type === 'decrease') {
                    setDopamine((prev) => Math.max(0, prev - 10));  // Decrease dopamine by 10
                } else {
                    setDopamine((prev) => Math.min(100, prev + 10));  // Increase dopamine by 10
                }
                return false;  // Remove the sprite after collision
            }
            return true;
        });

        setSprites(remainingSprites);

        // Spawn new sprites if one is taken
        if (remainingSprites.length !== sprites.length) {
            spawnSprites();
        }
    };

    useEffect(() => {
        if (sprites.length > 0) {
            handleSpriteCollision();
        }
    }, [characterPosition, sprites]);  // Trigger the collision check on character position change

    return (
        <div
            style={{
                margin: 0,
                padding: 0,
                width: '100%',
                height: '100vh',
                overflow: 'hidden',
                position: 'relative',
                backgroundColor: 'black',
            }}
        >
            <Stage width={stageWidth} height={stageHeight}>
                <Layer>
                    {/* Player or Enemy */}
                    <Image
                        x={characterPosition.x}
                        y={characterPosition.y}
                        image={currentImage === 0 ? enemy1 : player1}
                        width={imageWidth}
                        height={imageHeight}
                    />

                    {/* Health Bar */}
                    <Rect
                        x={20}
                        y={20}
                        width={(health / 100) * healthBarWidth}
                        height={healthBarHeight}
                        fill="red"
                        shadowBlur={5}
                    />
                    <Text
                        x={20}
                        y={20}
                        text={`Health: ${health}%`}
                        fontSize={18}
                        fontFamily="Arial"
                        fill="white"
                        padding={10}
                    />

                    {/* Dopamine Bar */}
                    <Rect
                        x={20}
                        y={70}
                        width={(dopamine / 100) * dopamineBarWidth}
                        height={dopamineBarHeight}
                        fill="green"
                        shadowBlur={5}
                    />
                    <Text
                        x={20}
                        y={70}
                        text={`Dopamine: ${dopamine}%`}
                        fontSize={18}
                        fontFamily="Arial"
                        fill="white"
                        padding={10}
                    />

                    {/* Render the sprites */}
                    {sprites.map((sprite, index) => (
                        <Image
                            key={index}
                            x={sprite.x}
                            y={sprite.y}
                            image={sprite.image}
                            width={imageWidth}
                            height={imageHeight}
                        />
                    ))}
                </Layer>
            </Stage>

            {/* Undertale-style dialog box */}
            {isDialogVisible && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: '50px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'black',
                        color: 'white',
                        padding: '10px 20px',
                        fontFamily: 'Arial, sans-serif',
                        fontSize: '18px',
                        borderRadius: '10px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    <p>{dialogMessages[dialogIndex]}</p>
                    <button
                        style={{
                            backgroundColor: 'green',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            cursor: 'pointer',
                            borderRadius: '5px',
                        }}
                        onClick={handleDialogNext}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default Act1;
