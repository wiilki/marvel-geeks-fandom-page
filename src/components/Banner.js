import { useState, useEffect } from 'react';
import '../styles/banner.css';
import { useAnimation } from '../hooks/useAnimation';
import { useNavigate } from 'react-router-dom';

const Banner = () => {
    const { animateRef, triggerAnimation } = useAnimation();
    const navigate = useNavigate();
    const [showStartButton, setShowStartButton] = useState(false);

    // Simulate the end of other animations before showing the Start button
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowStartButton(true); 
        }, 4800);

        return () => clearTimeout(timer);
    }, []);

    const navigateToSearch = () => {
        navigate('/search');
    };

    return (
        <>
            <div className="animation-wrapper run-animation" ref={animateRef} onClick={triggerAnimation}>
                <div className="main-logo">
                    <span className="marvel">marvel</span>
                    <span className="studios">g e e k s</span>
                </div>
                <button className={`start-button ${showStartButton ? 'show-start-button' : ''}`} onClick={navigateToSearch}>START</button>

            </div>

            <div className="animated-images"></div>
        </>
    );
};

export default Banner;
