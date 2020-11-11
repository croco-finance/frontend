import React, { useEffect, useState } from 'react';
import exampleDataJson from '../config/example-data-json.json';
import { useDispatch, useSelector } from 'react-redux';
import * as actionTypes from '@actionTypes';
import axios from 'axios';
import { setupCache } from 'axios-cache-adapter';
import { constants } from '../config';
import { validationUtils } from '../utils';
import { analytics } from '@config';

// Create `axios-cache-adapter` instance
const cache = setupCache({
    maxAge: 2 * 60 * 60 * 1000, // cache timeout in milliseconds (2 hours)
});

const api = axios.create({
    adapter: cache.adapter,
});

const toNumberAttributes = [
    'dexReturnUsd',
    'endBalanceEth',
    'endBalanceUsd',
    'feesEth',
    'feesUsd',
    'hodlReturnEth',
    'hodlReturnUsd',
    'impLossRel',
    'impLossUsd',
    'netReturnEth',
    'netReturnUsd',
    'txCostEth',
    'txCostUsd',
    'yieldRewardUsd',
    'yieldRewardEth',
    'yieldReward',
    'ethPriceUsdEnd',
];
const toNumberArrayAttributes = [
    'endTokenBalances',
    'startTokenBalances',
    'endTokenPricesUsd',
    'tokenBalanceDiffNoFees',
    'tokenWeights',
];

// if the "end" timestamp of pool is older than this, we will consider an inactive pool
// (user withdrew all funds from that pool)
const INACTIVE_POOL_THRESHOLD_SECONDS = 4 * 3600; //  = 4 hours

const FetchPoolsHook = initialAddress => {
    const [address, setAddress] = useState(initialAddress);
    const [isLoading, setIsLoading] = useState(false);
    const [noPoolsFound, setNoPoolsFound] = useState(false);
    const [isFetchError, setIsFetchError] = useState(false);

    const globalAddress = useSelector(state => state.userAddress);
    const globalAllPools = useSelector(state => state.allPools);

    // use redux actions and state variables
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchData = async (queryAddress: string) => {
            setIsLoading(true);
            setNoPoolsFound(false);
            setIsFetchError(false);
            const query = `${constants.SERVER_STATS_ENDPOINT}${queryAddress.trim().toLowerCase()}/`;

            try {
                // TODO error handling
                const response = await api.get(query, { timeout: 60000 });
                const fetchedData = response.data;
                // const fetchedData = exampleDataJson;

                // console.log('fetchedData', fetchedData);

                if (fetchedData.length === 0) {
                    setNoPoolsFound(true);
                    setIsLoading(false);
                    // make sure to change the redux state address, so that the hook will
                    // run again after providing a different address
                    dispatch({ type: actionTypes.SET_ADDRESS, address: queryAddress.trim() });
                    dispatch({ type: actionTypes.SET_ALL_POOLS, pools: {} });
                    dispatch({ type: actionTypes.SET_ACTIVE_POOL_IDS, activePoolIds: [] });
                    dispatch({
                        type: actionTypes.SET_INACTIVE_POOL_IDS,
                        inactivePoolIds: [],
                    });
                    return;
                }

                let poolsCustomObject = {};
                let exToPoolMap = {};
                let activePoolIds: Array<string> = [];
                let inactivePoolIds: Array<string> = [];
                const currentTimestampSeconds = Date.now() / 1000;

                fetchedData.forEach((pool: any) => {
                    const poolId: string = pool['poolId'];
                    const exchange: string = pool['exchange'];
                    const isActive =
                        currentTimestampSeconds - pool['end'] < INACTIVE_POOL_THRESHOLD_SECONDS;

                    if (!exToPoolMap[exchange]) {
                        exToPoolMap[exchange] = [];
                    }

                    if (isActive) {
                        activePoolIds.push(poolId);
                    } else {
                        inactivePoolIds.push(poolId);
                    }

                    poolsCustomObject[poolId] = { ...pool };
                    exToPoolMap[exchange].push(poolId);
                    poolsCustomObject[poolId]['isActive'] = isActive;

                    toNumberAttributes.forEach(attribute => {
                        poolsCustomObject[poolId][attribute] = parseFloat(
                            poolsCustomObject[poolId][attribute],
                        );
                    });

                    toNumberArrayAttributes.forEach(arrayAttribute => {
                        poolsCustomObject[poolId][arrayAttribute]?.forEach((stringValue, i) => {
                            poolsCustomObject[poolId][arrayAttribute][i] = parseFloat(
                                poolsCustomObject[poolId][arrayAttribute][i],
                            );
                        });
                    });
                });

                // set new (redux) state variables
                dispatch({ type: actionTypes.SET_ALL_POOLS, pools: poolsCustomObject });
                dispatch({ type: actionTypes.SET_SELECTED_POOL_ID, poolId: 'all' });
                dispatch({
                    type: actionTypes.SET_EXCHANGE_TO_POOLS_MAPPING,
                    exchangeToPoolMapping: exToPoolMap,
                });
                dispatch({ type: actionTypes.SET_ACTIVE_POOL_IDS, activePoolIds: activePoolIds });
                dispatch({
                    type: actionTypes.SET_INACTIVE_POOL_IDS,
                    inactivePoolIds: inactivePoolIds,
                });
                dispatch({ type: actionTypes.SET_ADDRESS, address: queryAddress.trim() });

                // save address to browser local storage
                localStorage.setItem('address', queryAddress);

                // fire Google Analytics event
                analytics.Event('ADDRESS INPUT', 'Data fetching hook success', queryAddress);
            } catch (e) {
                console.log('ERROR while fetching data about pools...');
                setIsFetchError(true);
                analytics.Event('ADDRESS INPUT', 'Data fetching hook fail', queryAddress);
            }

            setIsLoading(false);
        };

        // TODO inform user the address is not valid
        /* fetch data only if 
            - is valid eth address
            - address is different from already loaded or no pools were found 
        */
        const allPoolsGlobalCount = Object.keys(globalAllPools).length;
        if (
            validationUtils.isValidEthereumAddress(address.trim()) &&
            (address !== globalAddress || allPoolsGlobalCount === 0)
        ) {
            fetchData(address);
        }
    }, [address]);

    return [{ isLoading, noPoolsFound, isFetchError }, setAddress] as const;
};

export { FetchPoolsHook };
