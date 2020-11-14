import React, { useEffect, useState } from 'react';
import exampleDataJson from '../config/example-data-snaps.json';
import { useDispatch, useSelector } from 'react-redux';
import * as actionTypes from '../store/actions/actionTypes';
import { constants, types, analytics } from '@config';
import { validationUtils, statsComputations, getSnaps, getTokenWeightsArr } from '@utils';

// if the "end" timestamp of pool is older than this, we will consider an inactive pool
// (user withdrew all funds from that pool)
const INACTIVE_POOL_THRESHOLD_SECONDS = 14400; // 14400 sec = 4 hours

const getTokensCustomObj = (tokens: Array<types.PoolToken>) => {
    const tokensCount = tokens.length;
    let tokensCustomObj = Array(tokensCount);

    tokens.forEach((token, i) => {
        tokensCustomObj[i] = { ...token.token };
        tokensCustomObj[i]['weight'] = token.weight;
    });

    return tokensCustomObj;
};

const getIfPoolActive = (poolEndTimestamp: number, thresholdSeconds: number) => {
    const currentTimestampSeconds = Date.now() / 1000;
    return currentTimestampSeconds - poolEndTimestamp < thresholdSeconds;
};

const FetchPoolSnapshotsHook = initialAddress => {
    const [address, setAddress] = useState(initialAddress);
    const [isLoading, setIsLoading] = useState(false);
    const [noPoolsFound, setNoPoolsFound] = useState(false);
    const [isFetchError, setIsFetchError] = useState(false);

    const globalAddress = useSelector(state => state.userAddress);
    const globalAllPools = useSelector(state => state.allPools);

    // use redux actions and state variables
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchData = async (address: string) => {
            console.log('Running fetchData()...');
            setIsLoading(true);
            setNoPoolsFound(false);
            setIsFetchError(false);

            const queryAddress = address.trim().toLowerCase();
            const testAddressFirebase = '0x65c084b69b7f21acefe2c68aa25c67efd2e10160';

            // try {
            const fetchedSnapshots = await getSnaps(testAddressFirebase);
            console.log('fetchedSnapshots', fetchedSnapshots);

            // check if some pools were founds
            if (!fetchedSnapshots) {
                setNoPoolsFound(true);
                setIsLoading(false);
                dispatch({ type: actionTypes.SET_ADDRESS, address: queryAddress });
                dispatch({ type: actionTypes.SET_ALL_POOLS, pools: {} });
                dispatch({ type: actionTypes.SET_ACTIVE_POOL_IDS, activePoolIds: [] });
                dispatch({
                    type: actionTypes.SET_INACTIVE_POOL_IDS,
                    inactivePoolIds: [],
                });
                return;
            }

            // declare Redux variables
            let exToPoolMap = {};
            let activePoolIds: Array<string> = [];
            let inactivePoolIds: Array<string> = [];
            const customPoolsObject: types.AllPoolsGlobal = {};

            for (const [poolId, snapshotsArr] of Object.entries(fetchedSnapshots)) {
                const snapshotsCount = snapshotsArr.length;
                if (snapshotsCount > 1) {
                    // compute interval and cumulative stats
                    const {
                        intervalStats,
                        cumulativeStats,
                    } = statsComputations.getPoolStatsFromSnapshots(snapshotsArr);

                    // Check if pool is active by comparison of last snapshot's timestamp with current timestamp
                    const lastSnapshotTimestamp = snapshotsArr[snapshotsCount - 1].timestamp;
                    const poolIsActive = getIfPoolActive(
                        lastSnapshotTimestamp,
                        INACTIVE_POOL_THRESHOLD_SECONDS,
                    );

                    if (poolIsActive) {
                        activePoolIds.push(poolId);
                    } else {
                        inactivePoolIds.push(poolId);
                    }

                    // Push PoolId to <Exchange, PoolId> mapping
                    const exchange = snapshotsArr[0].exchange;
                    if (!exToPoolMap[exchange]) {
                        exToPoolMap[exchange] = [];
                    }
                    exToPoolMap[exchange].push(poolId);

                    // Create new pool object
                    customPoolsObject[poolId] = {
                        exchange: exchange,
                        userAddr: queryAddress,
                        poolId: poolId,
                        isActive: poolIsActive,
                        timestampEnd: lastSnapshotTimestamp,
                        hasYieldReward: snapshotsArr[0].yieldReward !== null,
                        yieldToken: null, // TODO
                        tokens: getTokensCustomObj(snapshotsArr[0].tokens),
                        snapshots: snapshotsArr,
                        intervalStats: intervalStats,
                        cumulativeStats: cumulativeStats,
                        tokenWeights: getTokenWeightsArr(snapshotsArr[0].tokens),
                    };
                }
            }

            console.log('customPoolsObject', customPoolsObject);

            const queryCumulative = `http://127.0.0.1:5001/api/v1/cumulative/${queryAddress
                .trim()
                .toLowerCase()}/`;

            const queryStats = `${
                constants.SERVER_STATS_ENDPOINT
            }${queryAddress.trim().toLowerCase()}/`;

            // // TODO error handling
            // const response = await axios.get(query, { timeout: 60000 });
            // const fetchedData = response.data;

            // const responseCumulative = await axios.get(queryCumulative, { timeout: 60000 });
            // const fetchedDataCumulative = responseCumulative.data;

            // const responseStats = await axios.get(queryStats, { timeout: 60000 });
            // const fetchedDataStats = responseStats.data;

            // console.log('fetchedDataCumulative', fetchedDataCumulative);
            // console.log('fetchedDataStats', fetchedDataStats);

            // set new Redux state variables
            dispatch({ type: actionTypes.SET_ALL_POOLS, pools: customPoolsObject });
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
            // } catch (e) {
            //     console.log('ERROR while fetching data about pools...');
            //     setIsFetchError(true);
            //     Event('ADDRESS INPUT', 'Data fetching hook fail', queryAddress);
            // }

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

export { FetchPoolSnapshotsHook };
