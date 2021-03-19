import { AppStateInterface, SimulatorStateInterface, ResizeStateInterface } from '@types';
import { useSelector as _useSelector } from 'react-redux';
import appReducer from './appReducer';
import resizeReducer from './resizeReducer';
import simulatorReducer from './simulatorReducer';

type UseSelectorInterface = {
    app: AppStateInterface;
    modal: any;
    resize: ResizeStateInterface;
    simulator: SimulatorStateInterface;
};

export function useSelector<T>(fn: (store: UseSelectorInterface) => T): T {
    return fn(_useSelector(x => x));
}

export default appReducer;
export { resizeReducer, simulatorReducer };
