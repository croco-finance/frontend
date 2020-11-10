import { constants } from '@config';
import React, { useEffect } from 'react';
import ReactGA from 'react-ga';
import { RouteComponentProps, withRouter } from 'react-router';
import { Route, Switch } from 'react-router-dom';
import './App.css';
import Dashboard from './views/dashboard';
import LandingPage from './views/landing-page';
import Simulator from './views/simulator';

// this is still not working properly. I am using GA script in index.html to track basic traffic
ReactGA.initialize(constants.GOOGLE_ANALYTICS_TRACKING_ID);

const App = (props: RouteComponentProps<any>) => {
    useEffect(() => {
        // enable Google Analytics
        ReactGA.pageview(window.location.pathname + window.location.search);

        // check if there is any address stored in browser local storage
        // local storage is not accessible in discreet mode
        try {
            const addressLocalStorage = localStorage.getItem('address');

            // if there is some valid address, go directly to dashboard so that the user doesn't have to paste his address again
            if (addressLocalStorage) {
                props.history.push({
                    pathname: `/dashboard/${addressLocalStorage}`,
                });
            }
        } catch (e) {
            console.log('Error while trying to access local storage');
        }
    }, []);

    return (
        <Switch>
            {/* address is an optional parameter */}
            <Route path="/dashboard/:address?" component={Dashboard} />
            <Route path="/simulator/:address?/:poolId?" component={Simulator} />
            <Route path="/" component={LandingPage} />
        </Switch>
    );
};

export default withRouter(App);
