import { keyframes } from 'styled-components';

export const SPIN = keyframes`
    0% { 
        transform: rotate(0deg); 
    }
    100% { 
        transform: rotate(360deg);
    }
`;

export const SHOW_UP = keyframes`
    0% {
        opacity: 0;
        transform: translateY(5%);

    }

    100% {
        opacity: 1;
        transform: translateY(0%);
    }
`;
