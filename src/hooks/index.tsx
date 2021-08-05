import { useTheme as useSCTheme } from 'styled-components';
import { useSelector } from '@reducers';
import { useMemo, useRef, useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { bindActionCreators, ActionCreatorsMapObject } from 'redux';
import { AppThemeColors } from '@types';
import copy from 'copy-to-clipboard';
import { Web3ReactContextInterface } from '@web3-react/core/dist/types';
import { NetworkContextName } from '../config/misc';
import { useWeb3React as useWeb3ReactCore } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';

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

export default function useCopyClipboard(timeout = 500): [boolean, (toCopy: string) => void] {
    const [isCopied, setIsCopied] = useState(false);

    const staticCopy = useCallback(text => {
        const didCopy = copy(text);
        setIsCopied(didCopy);
    }, []);

    useEffect(() => {
        if (isCopied) {
            const hide = setTimeout(() => {
                setIsCopied(false);
            }, timeout);

            return () => {
                clearTimeout(hide);
            };
        }
        return undefined;
    }, [isCopied, setIsCopied, timeout]);

    return [isCopied, staticCopy];
}

export function useActiveWeb3React(): Web3ReactContextInterface<Web3Provider> {
    const context = useWeb3ReactCore<Web3Provider>();
    const contextNetwork = useWeb3ReactCore<Web3Provider>(NetworkContextName);
    return context.active ? context : contextNetwork;
}
// modified from https://usehooks.com/usePrevious/
export function usePrevious<T>(value: T) {
    // The ref object is a generic container whose current property is mutable ...
    // ... and can hold any value, similar to an instance property on a class
    const ref = useRef<T>();

    // Store current value in ref
    useEffect(() => {
        ref.current = value;
    }, [value]); // Only re-run if value changes

    // Return previous value (happens before update in useEffect above)
    return ref.current;
}
