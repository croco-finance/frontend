import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import reducer from './store/reducers';
import './App.css';
import { loadState, saveState } from '@utils';
import thunk from 'redux-thunk';
import store from './store';

// const persistedState = loadState();
// const store = createStore(reducer, composeEnhancers(applyMiddleware(thunk)));
// const store = createStore(reducer, applyMiddleware(thunk));

// const store = createStore(reducer, persistedState);

// const store = createStore(reducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
// );

// store.subscribe(() => {
//     saveState({
//         allAddresses: store.getState().allAddresses,
//         selectedAddress: store.getState().selectedAddress,
//     });
// });

ReactDOM.render(
    <React.StrictMode>
        <Provider store={store}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </Provider>
    </React.StrictMode>,
    document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
