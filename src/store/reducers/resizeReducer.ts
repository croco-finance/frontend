import produce from 'immer';
import { variables } from '@config'; // can't import from index cause it would import all UI components
import * as actionTypes from '@actionTypes';
import { stringUtils } from '@utils';

const sizes = {
    UNAVAILABLE: stringUtils.getNumberFromPxString(variables.SCREEN_SIZE.UNAVAILABLE),
    SMALL: stringUtils.getNumberFromPxString(variables.SCREEN_SIZE.SM),
    MEDIUM: stringUtils.getNumberFromPxString(variables.SCREEN_SIZE.MD),
    LARGE: stringUtils.getNumberFromPxString(variables.SCREEN_SIZE.LG),
    XLARGE: stringUtils.getNumberFromPxString(variables.SCREEN_SIZE.XL),
};

const getSize = (screenWidth: number | null): State['size'] => {
    if (!screenWidth) {
        return 'NORMAL';
    }

    if (screenWidth < sizes.UNAVAILABLE) {
        return 'UNAVAILABLE';
    }

    if (screenWidth <= sizes.SMALL) {
        return 'TINY';
    }

    if (screenWidth <= sizes.MEDIUM) {
        return 'SMALL';
    }

    if (screenWidth <= sizes.LARGE) {
        return 'NORMAL';
    }

    if (screenWidth <= sizes.XLARGE) {
        return 'LARGE';
    }

    if (screenWidth > sizes.XLARGE) {
        return 'XLARGE';
    }

    return 'NORMAL';
};

export interface State {
    size: 'UNAVAILABLE' | 'TINY' | 'SMALL' | 'NORMAL' | 'LARGE' | 'XLARGE';
    screenWidth: number | null;
    screenHeight: number | null;
}

export const initialState: State = {
    size: 'NORMAL',
    screenWidth: null,
    screenHeight: null,
};

const resizeReducer = (state: State = initialState, action): State => {
    return produce(state, draft => {
        switch (action.type) {
            case actionTypes.UPDATE_WINDOW_SIZE:
                draft.size = getSize(action.screenWidth);
                draft.screenWidth = action.screenWidth;
                draft.screenHeight = action.screenHeight;
                break;
            // no default
        }
    });
};

export default resizeReducer;
