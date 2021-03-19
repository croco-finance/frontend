import { useTheme as useSCTheme } from 'styled-components';
import { useSelector } from '@reducers';
import { useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { bindActionCreators, ActionCreatorsMapObject } from 'redux';
import { AppThemeColors } from '@types';

export const useTheme = () => {
    const theme = useSCTheme();
    // probably not the right way how to get the proper type here
    return theme as AppThemeColors;
};

export const useLayoutSize = () => {
    const layoutSize = useSelector(state => state.resize.size);
    const isMobileLayout = !['XLARGE', 'LARGE', 'NORMAL'].includes(layoutSize);

    return { isMobileLayout, layoutSize };
};

export const useActions = <M extends ActionCreatorsMapObject<any>>(actions: M) => {
    const dispatch = useDispatch();
    const ref = useRef(actions);
    return useMemo(() => bindActionCreators(ref.current, dispatch), [dispatch, ref]);
};
