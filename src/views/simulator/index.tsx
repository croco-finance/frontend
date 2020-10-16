import * as H from 'history';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { NavBar, SimulatorContainer } from '../../components/layout';
import { GrayBox, Input, MultipleTokenSelect } from '../../components/ui';
import { animations, colors, variables } from '../../config';
import { PoolItemsExample } from '../../config/example-data';
import { PoolItemInterface } from '../../config/types';
import * as actionTypes from '../../store/actions/actionTypes';
import { getFormattedPercentageValue } from '../../utils';
import CardInfo from './components/CardInfo';
import Overview from './components/LeftContainer/Overview';
import SimulationBox from './components/LeftContainer/SimulationBox';

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
    width: 48%;
    padding: 0px 40px 20px 0;
    /* animation: ${animations.SHOW_UP} 1.5s; */
`;

const RightWrapper = styled.div`
    padding: 40px 0px 20px 40px;
    width: 52%;
    background-color: ${colors.BACKGROUND};
`;

const Section = styled.div`
    display: flex;
    width: 100%;
    margin-top: 40px;
`;

const SectionLabel = styled.div`
    width: 140px;
    font-size: ${variables.FONT_SIZE.NORMAL};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
`;

const ChoosePoolWrapper = styled(Section)`
    display: flex;
    align-items: center;
    width: 100%;
    margin-top: 40px;
`;

const MultipleSelectWrapper = styled.div`
    flex-grow: 1;
`;

const PoolSelectLabel = styled(SectionLabel)``;

const OverviewWrapper = styled.div`
    margin: 35px auto;
    padding: 20px 15px;
`;

const buildPoolOption = (pool: PoolItemInterface) => {
    if (pool) {
        const tokens: any = pool.tokens;
        let value = { poolId: pool.poolId, tokens: new Array(tokens.length) };
        let label = '';

        tokens.forEach((token, i) => {
            let tokenWeight = getFormattedPercentageValue(pool.tokenWeights[i], true);
            label = label + ` ${token.symbol.toUpperCase()} ${tokenWeight},`;
            value.tokens[i] = token.symbol;
        });

        return {
            value: value,
            label: label.slice(0, -1), // remove last char, which is '|',
        };
    }
    return null;
};

const buildPoolOptions = (pools: any) => {
    const poolKeys = Object.keys(pools);
    const poolsCount = poolKeys.length;
    const poolOptions = new Array(poolsCount);

    poolKeys.forEach((poolId, i) => {
        poolOptions[i] = buildPoolOption(pools[poolId]);
    });

    return poolOptions;
};

type PoolOption = ReturnType<typeof buildPoolOption>;

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

const Simulator = (props: RouteComponentProps<any>) => {
    const [address, setAddress] = useState(
        props.match.params.address ? props.match.params.address : '',
    );

    const [urlPoolId, setUrlPoolId] = useState(
        props.match.params.poolId ? props.match.params.poolId : '',
    );

    const [isLoading, setIsLoading] = useState(false);

    const dispatch = useDispatch();
    const allPools = useSelector(state => state.allPools);
    const selectedPoolId = useSelector(state => state.selectedPoolId);

    const poolOptions = buildPoolOptions(allPools);

    useEffect(() => {
        const urlPoolId = props.match.params.poolId ? props.match.params.poolId : '';

        if (urlPoolId in Object.keys(allPools)) {
            dispatch({
                type: actionTypes.SET_SELECTED_POOL_ID,
                poolId: urlPoolId,
            });
        }
    }, []);

    // TODO move this to separate hook
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
    }, [address, urlPoolId]);

    return (
        <SimulatorContainer>
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

                <ChoosePoolWrapper>
                    {/* TODO add Exchange icon (Balancer/Uniswap) */}
                    <PoolSelectLabel>Choose pool:</PoolSelectLabel>
                    <MultipleSelectWrapper>
                        <MultipleTokenSelect
                            options={poolOptions}
                            onChange={(option: PoolOption) => {
                                option &&
                                    dispatch({
                                        type: actionTypes.SET_SELECTED_POOL_ID,
                                        poolId: option.value.poolId,
                                    });
                            }}
                            selected={buildPoolOption(allPools[selectedPoolId])}
                        ></MultipleTokenSelect>
                    </MultipleSelectWrapper>
                </ChoosePoolWrapper>
                <OverviewWrapper>
                    <Overview />
                </OverviewWrapper>

                {allPools[selectedPoolId] && (
                    <GrayBox>
                        <SimulationBox />
                    </GrayBox>
                )}
            </LeftWrapper>
            <RightWrapper>
                <CardInfo />
            </RightWrapper>
        </SimulatorContainer>
    );
};
export default Simulator;
