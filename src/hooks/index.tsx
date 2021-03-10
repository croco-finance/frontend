import { useTheme as useSCTheme } from 'styled-components';
import { useSelector } from '@reducers';
import { useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { bindActionCreators, ActionCreatorsMapObject } from 'redux';

export const useTheme = () => {
    const theme = useSCTheme();
    return theme;
};

export const useLayoutSize = () => {
    const layoutSize = useSelector(state => state.resize.size);
    const isMobileLayout = !['XLARGE', 'LARGE', 'NORMAL'].includes(layoutSize);

    return { isMobileLayout, layoutSize };
};

export const useActions = <M extends ActionCreatorsMapObject<any>>(actions: M) => {
    const dispatch = useDispatch();
    const ref = useRef(actions);
    return useMemo(() => {
        return bindActionCreators(ref.current, dispatch);
    }, [dispatch, ref]);
};
