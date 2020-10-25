import React, { useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import Dashboard from './views/dashboard';
import Simulator from './views/simulator';
import LandingPage from './views/landing-page';
import './App.css';
import { PageView, initGA } from './config/analytics';

function App() {
    // enable Google Analytics
    useEffect(() => {
        initGA();
        PageView();
    }, []);

    return (
        <Switch>
            {/* address is an optional parameter */}
            <Route path="/dashboard/:address?" component={Dashboard} />
            <Route path="/simulator/:address?/:poolId?" component={Simulator} />
            <Route path="/" component={LandingPage} />
        </Switch>
    );
}

export default App;
