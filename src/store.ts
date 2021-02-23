import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import reducer from './store/reducers';
import modalReducer from './reducers/modalReducer';

import { loadState, saveState } from '@utils';

const rootReducer = combineReducers({
    app: reducer,
    modal: modalReducer,
    /* other reducers... */
});

const composedEnhancer = composeWithDevTools(applyMiddleware(thunkMiddleware));

const persistedState = loadState();

// const store = createStore(reducer, persistedState);
const store = createStore(
    rootReducer,
    { app: persistedState, modal: { modalType: undefined, modalProps: undefined } },
    composedEnhancer,
);

// subscribe() is a method that is natively present on state and is called when the state changes
store.subscribe(() => {
    console.log('store.subscribe');
    saveState({
        allAddresses: store.getState().app.allAddresses,
        selectedAddress: store.getState().app.selectedAddress,
        theme: store.getState().app.theme,
    });
});

// The store now has the ability to accept thunk functions in `dispatch`
export default store;
