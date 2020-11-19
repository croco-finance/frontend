import { css } from 'styled-components';
import { colors } from '@config';

export const scrollBarStyles = css`
    ::-webkit-scrollbar {
        background-color: #e0e1e8;
        width: 8px;
        border-radius: 8px;
    }
    /* background of the scrollbar except button or resizer */
    ::-webkit-scrollbar-track {
        background-color: transparent;
    }
    /* scrollbar itself */
    ::-webkit-scrollbar-thumb {
        /* 7F7F7F for mac-like color */
        background-color: #cbd1dc;
        border-radius: 10px;
        border: 1px solid #cbd1dc;
    }

    ::-webkit-scrollbar-thumb:hover {
        /* 7F7F7F for mac-like color */
        background-color: #bfc7d6;
        border: 1px solid #bec8da;
    }

    /* set button(top and bottom of the scrollbar) */
    ::-webkit-scrollbar-button {
        display: none;
    }
`;

// export const scrollBarStyles = css`
//     ::-webkit-scrollbar {
//         background-color: #e0e1e8;
//         width: 10px;
//         border-radius: 0px;
//     }
//     /* background of the scrollbar except button or resizer */
//     ::-webkit-scrollbar-track {
//         background-color: transparent;
//     }
//     /* scrollbar itself */
//     ::-webkit-scrollbar-thumb {
//         /* 7F7F7F for mac-like color */
//         background-color: #bfc7d6;
//         border-radius: 0px;
//         border: 1px solid #bfc7d6;
//     }

//     ::-webkit-scrollbar-thumb:hover {
//         /* 7F7F7F for mac-like color */
//         background-color: #afb9ca;
//         border: 1px solid #afb9ca;
//     }

//     /* set button(top and bottom of the scrollbar) */
//     ::-webkit-scrollbar-button {
//         display: none;
//     }
// `;
