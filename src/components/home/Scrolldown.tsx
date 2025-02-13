import { useState, useEffect, useRef } from 'react';
import React from 'react';

const ScrollDown: React.FC = () => {
    const [isVisible, setIsVisible] = useState(true);
    const lastScrollY = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > 10) {
                // Scrolled past 100 pixels
                setIsVisible(false);
            } else {
                // Within 100 pixels
                setIsVisible(true);
            }

            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className={`absolute bottom-10 w-full text-center text-blackrose text-xs font-Yeseva animate-bounce transition-opacity duration-500 ease-in-out ${
            isVisible ? 'opacity-100' : 'opacity-0'
        }`}>
            <p className="">Scroll down to see more!</p>
            <img src="../images/home/scroll.webp" className="w-6 mx-auto" /> 
        </div>
    );
};

export default ScrollDown;
