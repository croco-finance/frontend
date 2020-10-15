import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { animations, colors, variables } from '../../config';
import { Input } from '../../components/ui';
import { NavBar, DashboardContainer } from '../../components/layout';
import PoolList from './components/LeftContainer/PoolList';
import SummaryList from './components/LeftContainer/SummaryList';
import CardInfo from './components/CardInfo';
import { Link } from 'react-router-dom';
import * as H from 'history';
import { PoolItemsExample } from '../../config/example-data';
import * as actionTypes from '../../store/actions/actionTypes';

const AddressWrapper = styled.div`
    background-color: ${colors.BACKGROUND};
    width: 100%;
    display: flex;
    align-items: center;
    border-radius: 5px;
    margin-top: 20px;
`;

const AddressLabel = styled.div`
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    padding-left: 5px;
`;

const Headline = styled.h2`
    color: ${colors.FONT_DARK};
    font-weight: ${variables.FONT_WEIGHT.DEMI_BOLD};
    margin-top: 40px;
`;

const LeftWrapper = styled.div`
    width: 52%;
    padding: 0px 50px 20px 0;
    /* animation: ${animations.SHOW_UP} 1.5s; */
`;

const RightWrapper = styled.div`
    padding: 40px 0px 20px 50px;
    width: 48%;
    background-color: ${colors.BACKGROUND};
`;

const CardInfoWrapper = styled.div`
    animation: ${animations.SHOW_UP} 1.5s;
`;

// TODO why and how does this actually work?
interface RouteComponentProps<P> {
    match: match<P>;
    location: H.Location;
    history: H.History;
    staticContext?: any;
}

interface match<P> {
    params: P;
    isExact: boolean;
    path: string;
    url: string;
}

const Dashboard = (props: RouteComponentProps<any>) => {
    const [address, setAddress] = useState(
        props.match.params.address ? props.match.params.address : '',
    );
    const [isLoading, setIsLoading] = useState(false);

    // use redux actions and state variables
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchData = async () => {
            console.log('fetchData()');
            setIsLoading(true);
            /* 
            TODO:
            1. check if is valid Ethereum address
            2. if is valid ETH address, fetch pools
            3. check if there are any pools associated with this address
            4. if there are some pools, call setPools() and render them, 
            otherwise tell the user he does not have any pools and he can try our simulator        
            */

            let allPoolsFetched;
            let exToPoolMappingFetched = {};

            for (const [exchange, pools] of Object.entries(PoolItemsExample)) {
                allPoolsFetched = { ...allPoolsFetched, ...pools };
                exToPoolMappingFetched[exchange] = Object.keys(pools);
            }

            // set new (redux) state variables
            dispatch({ type: actionTypes.SET_ALL_POOLS, pools: allPoolsFetched });
            dispatch({ type: actionTypes.SET_SELECTED_POOL_ID, poolId: 'all' });
            dispatch({
                type: actionTypes.SET_EXCHANGE_TO_POOLS_MAPPING,
                exchangeToPoolMapping: exToPoolMappingFetched,
            });

            setIsLoading(false);
        };

        // TODO check address validity. Don't fetch data when address is not valid.
        // If not valid, inform the user it is not valid
        const isValidEthAddress = true;
        if (isValidEthAddress) fetchData();
    }, [address]);

    return (
        <DashboardContainer>
            <LeftWrapper>
                <NavBar></NavBar>
                <AddressWrapper>
                    <Input
                        textIndent={[70, 0]}
                        innerAddon={<AddressLabel>Address:</AddressLabel>}
                        addonAlign="left"
                        placeholder="Enter valid Ethereum address"
                        value={address}
                        onChange={event => {
                            setAddress(event.target.value);
                        }}
                    />
                </AddressWrapper>

                {isLoading ? (
                    <h1>Loading...</h1>
                ) : (
                    <>
                        <Headline>Pools Summary</Headline>
                        <SummaryList />

                        <Headline>Your Pools</Headline>
                        <PoolList />
                    </>
                )}
            </LeftWrapper>
            <RightWrapper>
                <CardInfoWrapper>
                    <CardInfo address={address} />
                </CardInfoWrapper>
            </RightWrapper>
        </DashboardContainer>
    );
};

export default Dashboard;
