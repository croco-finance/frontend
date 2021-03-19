import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import reducer, { resizeReducer, simulatorReducer } from './store/reducers';
import modalReducer from './reducers/modalReducer';

import { loadState, saveState } from '@utils';

const rootReducer = combineReducers({
    app: reducer,
    modal: modalReducer,
    resize: resizeReducer,
    simulator: simulatorReducer,
    /* other reducers... */
});

const composedEnhancer = composeWithDevTools(applyMiddleware(thunkMiddleware));

const persistedState = loadState();

// const store = createStore(reducer, persistedState);
const store = createStore(
    rootReducer,
    { app: persistedState, modal: { modalType: null, modalProps: {} } },
    composedEnhancer,
);

// subscribe() is a method that is natively present on state and is called when the state changes
store.subscribe(() => {
    saveState({
        allAddresses: store.getState().app.allAddresses,
        selectedAddress: store.getState().app.selectedAddress,
        theme: store.getState().app.theme,
    });
});

// The store now has the ability to accept thunk functions in `dispatch`
export default store;
