import { AppStateInterface } from '@types';
import { useSelector as _useSelector } from 'react-redux';
import appReducer from './appReducer';
import resizeReducer from './resizeReducer';

type ResizeInterface = {
    size: 'XLARGE' | 'LARGE' | 'NORMAL' | 'UNAVAILABLE' | 'TINY' | 'SMALL';
};
type UseSelectorInterface = {
    app: AppStateInterface;
    modal: any;
    resize: ResizeInterface;
};

export function useSelector<T>(fn: (store: UseSelectorInterface) => T): T {
    return fn(_useSelector(x => x));
}

export default appReducer;
export { resizeReducer };
