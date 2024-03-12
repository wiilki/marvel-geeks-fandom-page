import { useRef } from 'react';

export const useAnimation = () => {
    const animateRef = useRef(null);

    const triggerAnimation = () => {
        const element = animateRef.current;
        if (element) {
            element.classList.remove("run-animation");
            void element.offsetWidth;
            element.classList.add("run-animation");
        }
    };

    return { animateRef, triggerAnimation };
};
