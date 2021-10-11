import * as actionTypes from '@actionTypes';
import { AppThemeVariant } from '@types';

export const setTheme = (variant: AppThemeVariant) => ({
    type: actionTypes.SET_THEME,
    variant,
});

export const setAppUnlocked = (isLocked: boolean) => ({
    type: actionTypes.SET_APP_LOCKED,
    isLocked,
});
