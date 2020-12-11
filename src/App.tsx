import { constants } from '@config';
import React, { useEffect } from 'react';
import ReactGA from 'react-ga';
import { RouteComponentProps, withRouter } from 'react-router';
import { Route, Switch } from 'react-router-dom';
import './App.css';
import Dashboard from './views/dashboard';
import LandingPage from './views/landing-page';
import Simulator from './views/simulator';
import { useSelector } from 'react-redux';
import { AllAddressesGlobal } from '@types';

// this is still not working properly. I am using GA script in index.html to track basic traffic
ReactGA.initialize(constants.GOOGLE_ANALYTICS_TRACKING_ID);

const App = (props: RouteComponentProps<any>) => {
    const allAddresses: AllAddressesGlobal = useSelector(state => state.allAddresses);

    useEffect(() => {
        if (typeof allAddresses === 'object' && allAddresses !== null) {
            if (Object.keys(allAddresses).length > 0) {
                props.history.push({
                    pathname: `/dashboard/`,
                });
            }
        }
        // enable Google Analytics
        // ReactGA.pageview(window.location.pathname + window.location.search);
    }, []);

    return (
        <Switch>
            {/* address is an optional parameter */}
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/simulator" component={Simulator} />
            <Route path="/" component={LandingPage} />
        </Switch>
    );
};

export default withRouter(App);
