import React, { useEffect, useState } from 'react';
import exampleDataJson from '../config/example-data-snaps.json';
import { useDispatch, useSelector } from 'react-redux';
import * as actionTypes from '../store/actions/actionTypes';
import axios from 'axios';
import { constants, types } from '@config';
import { validationUtils, lossUtils, statsComputations, parseSnapshotToNumberValues } from '@utils';
import { Event } from '../config/analytics';

// if the "end" timestamp of pool is older than this, we will consider an inactive pool
// (user withdrew all funds from that pool)
const INACTIVE_POOL_THRESHOLD_SECONDS = 14400; // 14400 sec = 4 hours

const compare = (a, b) => {
    if (a.timestamp < b.timestamp) {
        return -1;
    }
    if (a.timestamp > b.timestamp) {
        return 1;
    }
    return 0;
};

const getTokensCustomObj = (tokens: Array<types.PooledTokenInfo>) => {
    const tokensCount = tokens.length;
    let tokensCustomObj = Array(tokensCount);

    tokens.forEach((token, i) => {
        tokensCustomObj[i] = { ...token.token };
        tokensCustomObj[i]['weight'] = token.weight;
    });

    return tokensCustomObj;
};

const FetchPoolSnapsHook = initialAddress => {
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
            console.log('Running fetchData()...');
            setIsLoading(true);
            setNoPoolsFound(false);
            setIsFetchError(false);
            const query = `${constants.SERVER_SNAPS_ENDPOINT}${queryAddress.trim().toLowerCase()}/`;
            const queryCumulative = `http://127.0.0.1:5001/api/v1/cumulative/${queryAddress
                .trim()
                .toLowerCase()}/`;

            const queryStats = `${
                constants.SERVER_STATS_ENDPOINT
            }${queryAddress.trim().toLowerCase()}/`;

            // try {
            // // TODO error handling
            // const response = await axios.get(query, { timeout: 60000 });
            // const fetchedData = response.data;

            // const responseCumulative = await axios.get(queryCumulative, { timeout: 60000 });
            // const fetchedDataCumulative = responseCumulative.data;

            // const responseStats = await axios.get(queryStats, { timeout: 60000 });
            // const fetchedDataStats = responseStats.data;

            const fetchedData = exampleDataJson;

            console.log('fetchedData', fetchedData);
            // console.log('fetchedDataCumulative', fetchedDataCumulative);
            // console.log('fetchedDataStats', fetchedDataStats);

            if (fetchedData.length === 0) {
                setNoPoolsFound(true);
                setIsLoading(false);
                dispatch({ type: actionTypes.SET_ADDRESS, address: queryAddress.trim() });
                dispatch({ type: actionTypes.SET_ALL_POOLS, pools: {} });
                dispatch({ type: actionTypes.SET_ACTIVE_POOL_IDS, activePoolIds: [] });
                dispatch({
                    type: actionTypes.SET_INACTIVE_POOL_IDS,
                    inactivePoolIds: [],
                });
                return;
            }

            // sort snapshots by timestamp
            fetchedData.sort(compare);

            let exToPoolMap = {};
            let activePoolIds: Array<string> = [];
            let inactivePoolIds: Array<string> = [];
            let snapshotsGrouped = {};
            const currentTimestampSeconds = Date.now() / 1000;

            fetchedData.forEach((snapshot: any) => {
                snapshot = parseSnapshotToNumberValues(snapshot);

                const poolId: string = snapshot['poolId'];
                const exchange: string = snapshot['exchange'];

                // if this poolId is the first in group (no other pool with this id found yet)
                if (!snapshotsGrouped[poolId]) {
                    snapshotsGrouped[poolId] = {
                        snapshots: [],
                        intervalStats: [],
                        cumulativeStats: {},
                        exchange: exchange,
                        poolId: poolId,
                        userAddr: snapshot['userAddr'],
                        yieldReward: snapshot['yieldReward'],
                        tokens: getTokensCustomObj(snapshot['tokens']),
                    };
                }

                if (!exToPoolMap[exchange]) {
                    exToPoolMap[exchange] = [];
                }

                exToPoolMap[exchange].push(poolId);

                // push numbers snapshot to custom object
                snapshotsGrouped[poolId]['snapshots'].push(snapshot);
            });

            for (const [poolId, snapshotsGroup] of Object.entries(snapshotsGrouped)) {
                // compute interval and cumulative stats
                const {
                    intervalStats,
                    cumulativeStats,
                } = statsComputations.getPoolStatsFromSnapshots(
                    snapshotsGrouped[poolId]['snapshots'],
                );

                snapshotsGrouped[poolId]['intervalStats'] = intervalStats;
                snapshotsGrouped[poolId]['cumulativeStats'] = cumulativeStats;

                // Check if pool is active by comparison of last snapshot's timestamp with current timestamp
                const snapshotsCount = snapshotsGrouped[poolId]['snapshots'].length;
                const lastSnapshotTimestamp =
                    snapshotsGrouped[poolId]['snapshots'][snapshotsCount - 1].timestamp;
                const isActive =
                    currentTimestampSeconds - lastSnapshotTimestamp <
                    INACTIVE_POOL_THRESHOLD_SECONDS;
                snapshotsGrouped[poolId]['isActive'] = isActive;

                if (isActive) {
                    activePoolIds.push(poolId);
                } else {
                    inactivePoolIds.push(poolId);
                }

                // check if has yield rewards
                snapshotsGrouped[poolId]['hasYieldReward'] = cumulativeStats.yieldUsd
                    ? true
                    : false;
            }

            console.log('snapshotsGrouped', snapshotsGrouped);

            // set new (redux) state variables
            dispatch({ type: actionTypes.SET_ALL_POOLS, pools: snapshotsGrouped });
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
            dispatch({
                type: actionTypes.SET_POOL_SNAPSHOTS_GROUPED,
                snapshotsGrouped: snapshotsGrouped,
            });

            // save address to browser local storage
            localStorage.setItem('address', queryAddress);

            // fire Google Analytics event
            Event('ADDRESS INPUT', 'Data fetching hook success', queryAddress);
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

export { FetchPoolSnapsHook };
