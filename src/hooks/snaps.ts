import React, { useEffect, useState } from 'react';
import exampleDataJson from '../config/example-data-snaps.json';
import { useDispatch, useSelector } from 'react-redux';
import * as actionTypes from '../store/actions/actionTypes';
import axios from 'axios';
import { constants } from '../config';
import { validation } from '../utils';
import { Event } from '../config/analytics';
import { getPoolStats } from '../utils/loss-computations';

const toNumberAttributes = [
    'ethPrice',
    'liquidityTokenBalance',
    'liquidityTokenTotalSupply',
    'txCostEth',
];

const toNumberReserveTokenAttributes = ['price', 'reserve', 'weight'];
const toNumberYieldTokenAttributes = ['price', 'amount'];

// if the "end" timestamp of pool is older than this, we will consider an inactive pool
// (user withdrew all funds from that pool)
const INACTIVE_POOL_THRESHOLD_SECONDS = 14400; // 14400 sec = 4 hours

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
            setIsLoading(true);
            setNoPoolsFound(false);
            setIsFetchError(false);
            const query = `${constants.SERVER_SNAPS_ENDPOINT}${queryAddress.trim().toLowerCase()}/`;

            try {
                // TODO error handling
                // const response = await axios.get(query, { timeout: 60000 });
                // const fetchedData = response.data;
                const fetchedData = exampleDataJson;

                console.log('fetchedData', fetchedData);

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

                let poolsCustomObject = {};
                let exToPoolMap = {};
                let activePoolIds: Array<string> = [];
                let inactivePoolIds: Array<string> = [];
                let snapshotsGrouped = {};
                const currentTimestampSeconds = Date.now() / 1000;

                fetchedData.forEach((snapshot: any) => {
                    let snapshotNumbers = { ...snapshot };

                    const poolId: string = snapshot['poolId'];
                    const exchange: string = snapshot['exchange'];

                    // const isActive =
                    //     currentTimestampSeconds - pool['end'] < INACTIVE_POOL_THRESHOLD_SECONDS;

                    // if this poolId is the first in group (no other pool with this id found yet)
                    if (!snapshotsGrouped[poolId]) {
                        snapshotsGrouped[poolId] = [];
                    }

                    if (!exToPoolMap[exchange]) {
                        exToPoolMap[exchange] = [];
                    }

                    // if (isActive) {
                    //     activePoolIds.push(poolId);
                    // } else {
                    //     inactivePoolIds.push(poolId);
                    // }

                    exToPoolMap[exchange].push(poolId);
                    // poolItemNumbers['isActive'] = isActive;

                    // convert strings to numbers
                    toNumberAttributes.forEach(attribute => {
                        snapshotNumbers[attribute] = parseFloat(snapshotNumbers[attribute]);
                    });

                    snapshotNumbers['tokens']?.forEach(token => {
                        toNumberReserveTokenAttributes.forEach(attribute => {
                            token[attribute] = parseFloat(token[attribute]);
                        });
                    });

                    toNumberYieldTokenAttributes.forEach(attribute => {
                        if (snapshotNumbers['yieldReward']) {
                            snapshotNumbers['yieldReward'][attribute] = parseFloat(
                                snapshotNumbers['yieldReward'][attribute],
                            );
                        }
                    });

                    // TODO compute statistics
                    // for each snapshot group compute statistics between individual snapshots

                    // push pool to custom object
                    snapshotsGrouped[poolId].push(snapshotNumbers);
                });

                console.log('snapshotsGrouped', snapshotsGrouped);

                let snapshotStats: Array<any> = [];

                for (const [poolId, snapshotsGroup] of Object.entries(snapshotsGrouped)) {
                    snapshotStats.push(getPoolStats(snapshotsGrouped[poolId]));
                }

                console.log('snapshotStats', snapshotStats);

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
                dispatch({
                    type: actionTypes.SET_POOL_SNAPSHOTS_GROUPED,
                    snapshotsGrouped: snapshotsGrouped,
                });

                // save address to browser local storage
                localStorage.setItem('address', queryAddress);

                // fire Google Analytics event
                Event('ADDRESS INPUT', 'Data fetching hook success', queryAddress);
            } catch (e) {
                console.log('ERROR while fetching data about pools...');
                setIsFetchError(true);
                Event('ADDRESS INPUT', 'Data fetching hook fail', queryAddress);
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
            validation.isValidEthereumAddress(address.trim()) &&
            (address !== globalAddress || allPoolsGlobalCount === 0)
        ) {
            fetchData(address);
        }
    }, [address]);

    return [{ isLoading, noPoolsFound, isFetchError }, setAddress] as const;
};

export { FetchPoolSnapsHook };
