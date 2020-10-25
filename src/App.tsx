import React, { useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import Dashboard from './views/dashboard';
import Simulator from './views/simulator';
import LandingPage from './views/landing-page';
import './App.css';
import { PageView, initGA } from './config/analytics';
import { RouteComponentProps, withRouter } from 'react-router';

const App = (props: RouteComponentProps<any>) => {
    useEffect(() => {
        // enable Google Analytics
        initGA();
        PageView();

        // check if there is any address stored in browser local storage
        const addressLocalStorage = localStorage.getItem('address');

        // if there is some valid address, go directly to dashboard so that the user doesn't have to paste his address again
        if (addressLocalStorage) {
            props.history.push({
                pathname: `/dashboard/${addressLocalStorage}`,
            });
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
