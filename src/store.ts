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

// subscribe() is a method that is natively present on state and is called when the state changes
store.subscribe(() => {
    saveState({
        allAddresses: store.getState().allAddresses,
        selectedAddress: store.getState().selectedAddress,
        theme: store.getState().theme,
    });
});

// The store now has the ability to accept thunk functions in `dispatch`
export default store;
