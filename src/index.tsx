import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import reducer from './store/reducers/dashboard';
import { createBrowserHistory } from 'history';
import ReactGA from 'react-ga';
import { GOOGLE_ANALYTICS_TRACKING_ID } from './config/constants';
import './App.css';

ReactGA.initialize(GOOGLE_ANALYTICS_TRACKING_ID);
const store = createStore(reducer);
const history = createBrowserHistory();

// Initialize google analytics page view tracking
history.listen(location => {
    ReactGA.set({ page: location.pathname }); // Update the user's current page
    ReactGA.pageview(location.pathname); // Record a pageview for the given page
});

ReactDOM.render(
    <React.StrictMode>
        <Provider store={store}>
            <BrowserRouter history={history}>
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
