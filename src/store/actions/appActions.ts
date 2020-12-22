import * as actionTypes from '@actionTypes';
import { AppThemeVariant } from '@types';

export const setTheme = (variant: AppThemeVariant) => ({
    type: actionTypes.SET_THEME,
    variant: variant,
});
