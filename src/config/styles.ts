import { css } from 'styled-components';

export const scrollBarStyles = css`
    ::-webkit-scrollbar {
        background-color: ${props => props.theme.SCROLLBAR_BACKGROUND};
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
        background-color: ${props => props.theme.SCROLLBAR_THUMB};
        border-radius: 10px;
        border: 1px solid ${props => props.theme.SCROLLBAR_THUMB};
    }

    ::-webkit-scrollbar-thumb:hover {
        /* 7F7F7F for mac-like color */
        background-color: ${props => props.theme.SCROLLBAR_THUMB_HOVER};
        border: 1px solid ${props => props.theme.SCROLLBAR_THUMB_HOVER_BORDER};
    }

    /* set button(top and bottom of the scrollbar) */
    ::-webkit-scrollbar-button {
        display: none;
    }
`;

export const tinyScrollBarStyles = css`
    ::-webkit-scrollbar {
        width: 14px;
        height: 28px;
        background-color: ${props => props.theme.SCROLLBAR_BACKGROUND};
        border-left: 5px solid ${props => props.theme.BACKGROUND};
        border-right: 5px solid ${props => props.theme.BACKGROUND};
    }
    ::-webkit-scrollbar-thumb {
        height: 6px;
        border-left: 5px solid rgba(0, 0, 0, 0);
        border-right: 5px solid rgba(0, 0, 0, 0);
        background-clip: padding-box;
        -webkit-border-radius: 7px;
        background-color: ${props => props.theme.SCROLLBAR_THUMB_HOVER_BORDER};
    }
    ::-webkit-scrollbar-button {
        width: 0;
        height: 0;
        display: none;
    }
    ::-webkit-scrollbar-corner {
        background-color: transparent;
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
