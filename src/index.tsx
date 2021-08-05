import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import './App.css';
import store from './store';
import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core';
import getLibrary from './utils/getLibrary';
import { NetworkContextName } from './config/misc';

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName);

// eslint-disable-next-line no-extra-boolean-cast
if (!!window.ethereum) {
    window.ethereum.autoRefreshOnNetworkChange = false;
}

ReactDOM.render(
    <React.StrictMode>
        <Provider store={store}>
            <BrowserRouter>
                <Web3ReactProvider getLibrary={getLibrary}>
                    <Web3ProviderNetwork getLibrary={getLibrary}>
                        <App />
                    </Web3ProviderNetwork>
                </Web3ReactProvider>
            </BrowserRouter>
        </Provider>
    </React.StrictMode>,
    document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
