import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import reducer from './store/reducers';
import { loadState, saveState } from '@utils';

const composedEnhancer = composeWithDevTools(applyMiddleware(thunkMiddleware));

const persistedState = loadState();

// const store = createStore(reducer, persistedState);
const store = createStore(reducer, persistedState, composedEnhancer);

store.subscribe(() => {
    saveState({
        allAddresses: store.getState().allAddresses,
        selectedAddress: store.getState().selectedAddress,
    });
});

// The store now has the ability to accept thunk functions in `dispatch`
export default store;
