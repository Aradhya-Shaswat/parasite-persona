import React, { useEffect, useState } from 'react';
import './LandingPage.css';
import backgroundMusic from './menu.mp3';

const LandingPage = () => {

    const [audio, setAudio] = useState(null);

    
    useEffect(() => {
        const newAudio = new Audio(backgroundMusic);
        newAudio.loop = true;
        setAudio(newAudio);
    }, []);

    
    const handleUserInteraction = () => {
        if (audio) {
            audio.play().catch((error) => {
                console.error("Audio playback failed:", error);
            });
        }
    };

    const handlePlayClick = () => {
        
        window.location.href = "/play";
    };

    const handleSettingsClick = () => {
        
        window.location.href = "/settings";
    };

    return (
        <div>
        <div className='landing' onClick={handleUserInteraction}>
            <h1 className="title">Parasite Persona</h1>
            <div className="buttons">
                <button className="button" onClick={handlePlayClick}>Play</button>
                <button className="button" onClick={handleSettingsClick}>Settings</button>
            </div>
        </div>
        </div>
    );
};

export default LandingPage;
