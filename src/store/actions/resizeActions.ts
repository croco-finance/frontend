import * as actionTypes from '@actionTypes';

export interface ResizeAction {
    type: typeof actionTypes.UPDATE_WINDOW_SIZE;
    screenWidth: number | null;
    screenHeight: number | null;
}

export const updateWindowSize = (screenWidth: number, screenHeight: number): ResizeAction => ({
    type: actionTypes.UPDATE_WINDOW_SIZE,
    screenWidth,
    screenHeight,
});
