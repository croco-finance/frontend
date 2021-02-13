import { setTheme } from '@actions';
import { THEME, firebase } from '@config';
import { useSelector } from '@reducers';
import { formatUtils } from '@utils';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { Route, Switch } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { fetchSnapshots } from './store/actions/index';
import Dashboard from './views/dashboard';
import LandingPage from './views/landing-page';
import Simulator from './views/simulator';
import './App.css';

const App = (props: RouteComponentProps<any>) => {
    const { theme, selectedAddress, allAddresses } = useSelector(state => state);
    const dispatch = useDispatch();

    useEffect(() => {
        const addressesInit = async () => {
            if (typeof allAddresses === 'object' && allAddresses !== null) {
                if (Object.keys(allAddresses).length > 0) {
                    // If I am on landing page and some addresses in state are saved, go to dashboard
                    if (props.history.location.pathname === '/') {
                        props.history.push({
                            pathname: `/dashboard/`,
                        });
                    }

                    if (selectedAddress) {
                        if (selectedAddress === 'bundled') {
                            dispatch(fetchSnapshots(formatUtils.getBundledAddresses(allAddresses)));
                        } else {
                            dispatch(fetchSnapshots(selectedAddress));
                        }
                    }

                    // iterate through all addresses and save it to firebase
                    for (const [key, value] of Object.entries(allAddresses)) {
                        const firebaseRef = firebase.addresses(key.toLocaleLowerCase());
                        const payload = await firebaseRef.set(true);
                    }
                }
            }

            if (!theme) {
                dispatch(setTheme('light'));
            }
        };

        addressesInit();
    }, []);

    return (
        <ThemeProvider theme={theme === 'light' ? THEME.light : THEME.dark}>
            <Switch>
                <Route path="/dashboard" component={Dashboard} />
                <Route path="/simulator" component={Simulator} />
                <Route path="/" component={LandingPage} />
            </Switch>
        </ThemeProvider>
    );
};

export default withRouter(App);
