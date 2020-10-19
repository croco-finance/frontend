import * as H from 'history';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { DashboardContainer, NavBar } from '../../components/layout';
import { Input, LoadingBox } from '../../components/ui';
import { animations, colors, variables, constants } from '../../config';
import { PoolItemsExample } from '../../config/example-data';
import * as actionTypes from '../../store/actions/actionTypes';
import CardInfo from './components/CardInfo';
import PoolList from './components/LeftContainer/PoolList';
import SummaryList from './components/LeftContainer/SummaryList';
import axios from 'axios';
import exampleDataJson from '../../config/example-data-json.json';
import { validation } from '../../utils';

const ExceptionWrapper = styled.div`
    display: flex;
    height: 260px;
    align-items: center;
    justify-content: center;
    font-weight: ${variables.FONT_WEIGHT.DEMI_BOLD};
    flex-direction: column;
    background-color: ${colors.BACKGROUND};
    margin-top: 24px;
    text-align: center;
    padding: 20px;
    line-height: 26px;
`;

const NoPoolFoundInfo = styled(ExceptionWrapper)`
    color: ${colors.FONT_MEDIUM};
`;

const ErrorTextWrapper = styled(ExceptionWrapper)`
    color: ${colors.RED};

    & > button {
        color: white;
        background-color: black;
        font-weight: ${variables.FONT_WEIGHT.DEMI_BOLD};
        padding: 10px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        margin: 16px auto 0 auto;
        outline: none;
    }
`;

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

const LeftWrapper = styled.div`
    width: 50%;
    padding: 0px 50px 20px 0;
    /* animation: ${animations.SHOW_UP} 1.5s; */
`;

const RightWrapper = styled.div`
    padding: 40px 0px 20px 50px;
    width: 50%;
    background-color: ${colors.BACKGROUND};
`;

const SummaryWrapper = styled.div`
    margin-top: 40px;
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
    const [noPoolsFound, setNoPoolsFound] = useState(false);
    const [isFetchError, setIsFetchError] = useState(false);

    // use redux actions and state variables
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setNoPoolsFound(false);
            setIsFetchError(false);

            try {
                // TODO error handling
                // const response = await axios.get(
                //     `${constants.SERVER_STATS_ENDPOINT}/${address.trim().toLowerCase()}/`,
                // );
                // const fetchedData = response.data;

                const fetchedData = exampleDataJson;

                if (fetchedData.length === 0) {
                    setNoPoolsFound(true);
                    setIsLoading(false);
                    return;
                }

                let poolsCustomObject = {};
                let exToPoolMap = {};

                fetchedData.forEach(pool => {
                    const poolId = pool['poolId'];
                    const exchange = pool['exchange'];

                    if (!exToPoolMap[exchange]) {
                        exToPoolMap[exchange] = [];
                    }

                    poolsCustomObject[poolId] = { ...pool };
                    exToPoolMap[exchange].push(poolId);
                });

                console.log('poolsCustomObject', poolsCustomObject);
                // console.log(JSON.parse(poolsCustomObject))
                console.log(JSON.stringify(poolsCustomObject));

                // set new (redux) state variables
                dispatch({ type: actionTypes.SET_ALL_POOLS, pools: poolsCustomObject });
                dispatch({ type: actionTypes.SET_SELECTED_POOL_ID, poolId: 'all' });
                dispatch({
                    type: actionTypes.SET_EXCHANGE_TO_POOLS_MAPPING,
                    exchangeToPoolMapping: exToPoolMap,
                });
            } catch (e) {
                console.log('ERROR while fetching data about pools...');
                setIsFetchError(true);
            }

            setIsLoading(false);
        };

        // TODO inform user the address is not valid
        // if (validation.isValidEthereumAddress(address.trim())) {
        //     fetchData();
        // }
        fetchData();
    }, [address]);

    let exceptionContent;

    if (isFetchError) {
        exceptionContent = (
            <ErrorTextWrapper>
                An error occurred while fetching data :(
                <button
                    onClick={() => {
                        setAddress(`${address} `); // TODO run fetching procedure again in a cleaner way
                    }}
                >
                    Try again
                </button>
            </ErrorTextWrapper>
        );
    }

    if (isLoading) {
        exceptionContent = <LoadingBox>Getting pool data...</LoadingBox>;
    }

    if (noPoolsFound) {
        // TODO tell the user he cat try simulator in this case, once the simulator work for manual inputs
        exceptionContent = (
            <NoPoolFoundInfo>
                We didn't find any pools associated with this address.
                <br />
                Try different address.
            </NoPoolFoundInfo>
        );
    }

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

                {exceptionContent ? (
                    exceptionContent
                ) : (
                    <>
                        <SummaryWrapper>
                            {/* <Headline>Pools Summary</Headline> */}
                            <SummaryList />
                        </SummaryWrapper>

                        {/* <Headline>Your Pools</Headline> */}
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
