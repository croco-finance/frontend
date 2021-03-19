/* eslint-disable no-await-in-loop */
import * as actionTypes from '@actionTypes';
import { analytics, ethersProvider } from '@config';
import {
    AllPoolsGlobal,
    DailyStats,
    DexToPoolIdMap,
    PoolItem,
    PoolToken,
    Snap,
    SnapStructure,
} from '@types';
import {
    formatUtils,
    getDailyFees,
    getSnaps,
    setUnclaimed,
    statsComputations,
    validationUtils,
} from '@utils';
import store from '../../store';

// Helper functions
const getPooledTokensInfo = (tokens: PoolToken[]) => {
    const tokensCount = tokens.length;
    const pooledTokensInfo = Array(tokensCount);

    tokens.forEach((token, i) => {
        pooledTokensInfo[i] = { ...token.token };
        pooledTokensInfo[i].weight = token.weight;
    });

    return pooledTokensInfo;
};

const getIfPoolHasYieldReward = (snapshots: Snap[]) => {
    for (let i = 0; i < snapshots.length; i++) {
        if (snapshots[i].yieldReward !== null) {
            const claimed = snapshots[i].yieldReward?.claimed;
            const unclaimed = snapshots[i].yieldReward?.unclaimed;

            if ((claimed && claimed > 0) || (unclaimed && unclaimed > 0)) return true;
        }
    }

    return false;
};

const renameSnapKeys = (snaps: SnapStructure, address: string) => {
    const snapsWithNewKeys: SnapStructure | Record<string, never> = {};

    Object.keys(snaps).forEach(poolId => {
        const newKey = `${poolId}_${address}`;
        snapsWithNewKeys[newKey] = snaps[poolId];
    });

    return snapsWithNewKeys;
};

// Action creators
export const setPoolData = (
    pools: AllPoolsGlobal,
    dexToPoolMap: DexToPoolIdMap,
    activePoolIds: string[],
    inactivePoolIds: string[],
) => ({
    type: actionTypes.SET_POOL_DATA,
    pools,
    dexToPoolMap,
    activePoolIds,
    inactivePoolIds,
});

export const resetPoolData = () => dispatch => {
    dispatch(setPoolData({}, { BALANCER: [], UNI_V2: [], SUSHI: [], MATERIA: [] }, [], []));
};

export const fetchSnapsInit = () => ({
    type: actionTypes.FETCH_SNAPS_INIT,
});

export const fetchSnapsFailed = () => ({
    type: actionTypes.FETCH_SNAPS_FAILED,
});

export const fetchDailyInit = () => ({
    type: actionTypes.FETCH_DAILY_INIT,
});

export const fetchDailyFailed = () => ({
    type: actionTypes.FETCH_DAILY_FAILED,
});

export const fetchDailySuccess = (poolId: string, payload: DailyStats | undefined) => ({
    type: actionTypes.FETCH_DAILY_SUCCESS,
    poolId,
    payload,
});

export const fetchSnapsSuccess = (
    pools: AllPoolsGlobal,
    dexToPoolMap: DexToPoolIdMap,
    activePoolIds: string[],
    inactivePoolIds: string[],
) => ({
    type: actionTypes.FETCH_SNAPS_SUCCESS,
    pools,
    dexToPoolMap,
    activePoolIds,
    inactivePoolIds,
});

export const setSelectedPoolId = (poolId: string) => ({
    type: actionTypes.SET_SELECTED_POOL_ID,
    poolId,
});

export const setIsLoading = (isLoading: boolean) => ({
    type: actionTypes.SET_IS_LOADING,
    value: isLoading,
});

export const noPoolsFound = () => ({
    type: actionTypes.NO_POOLS_FOUND,
});

export const changeSelectedPool = (poolId: string) => dispatch => {
    if (poolId === 'all') {
        dispatch(setSelectedPoolId(poolId));
    } else {
        const state = store.getState();

        if (state.app.allPools && state.app.allPools[poolId]) {
            dispatch(setSelectedPoolId(poolId));
        }
    }
};

const getDailyDataForPool = async (poolItem: PoolItem) => {
    const response = await getDailyFees(poolItem.poolId);
    if (response) {
        const { snapshots, exchange, tokenWeights, tokenSymbols } = poolItem;

        const dailyStats = statsComputations.getDailyRewards(
            response,
            snapshots,
            exchange,
            tokenWeights,
            tokenSymbols,
        );

        return dailyStats;
    }

    console.log(`Did not get valid response in fetchDailyFees() for poolId: ${poolItem.poolId}`);

    return null;
};

const getDailyDataObject = async (allPoolsGlobal: AllPoolsGlobal) => {
    const ids = Object.keys(allPoolsGlobal);
    const fetchedDailyData = {};

    // You have to use for loop if you want to use await in a loop.
    // Do not use forEach()
    for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        const poolItem = allPoolsGlobal[id];
        const { isActive } = poolItem;

        if (isActive) {
            const data = await getDailyDataForPool(poolItem);
            if (data) {
                fetchedDailyData[id] = data;
            }
        }
    }

    return fetchedDailyData;
};

export const fetchSnapshots = (addresses: string[] | string) => async dispatch => {
    dispatch(fetchSnapsInit());

    // if this is just single address, convert it to an array
    if (typeof addresses === 'string') {
        addresses = [addresses];
    }

    let fetchedSnapshotsBundled: SnapStructure | Record<string, never> = {};

    // eslint-disable-next-line no-restricted-syntax
    for (const address of addresses) {
        const queryAddress = address.trim().toLowerCase();

        // convert address to without 0x format for Firebase Analytics purposes
        const addressWithout0x = validationUtils.isHex(queryAddress)
            ? queryAddress.substring(2)
            : queryAddress;

        // try to fetch data for the given address
        try {
            const fetchedSnapshotsAddress = await getSnaps(queryAddress);

            // check if data was fetched. If yes, add it to pool
            if (!fetchedSnapshotsAddress) {
                console.log(`Did not find any pools associated with: ${queryAddress}`);
            } else {
                // Set unclaimed yield rewards
                try {
                    await setUnclaimed(ethersProvider, address, fetchedSnapshotsAddress);
                } catch (e) {
                    console.log(`Could not fetch unclaimed yield rewards for address: ${address}`);
                    analytics.logEvent('fetch_unclaimed_yield_failed', {
                        address: addressWithout0x,
                    });
                }

                // Two addresses can have assets in the same pool. To create a unique iD for each pool, I combine user's address and pool ID
                fetchedSnapshotsBundled = {
                    ...fetchedSnapshotsBundled,
                    ...renameSnapKeys(fetchedSnapshotsAddress, queryAddress),
                };
            }
        } catch (e) {
            dispatch(fetchSnapsFailed());
            console.log("ERROR: Couldn't fetch data from database.");
            analytics.logEvent('fetch_snaps_failed', { address: addressWithout0x });
        }
    }

    // check if some pools were found
    if (Object.keys(fetchedSnapshotsBundled).length === 0) {
        dispatch(noPoolsFound());
        return;
    }

    // Process fetched snapshots
    // declare Redux variables
    const dexToPoolMap: DexToPoolIdMap = { BALANCER: [], UNI_V2: [], SUSHI: [], MATERIA: [] };
    const activePoolIds: string[] = [];
    const inactivePoolIds: string[] = [];
    const customPoolsObject: AllPoolsGlobal = {};

    Object.keys(fetchedSnapshotsBundled).forEach(id => {
        const poolId = id.split('_')[0];
        const snapshotsArr = fetchedSnapshotsBundled[id];

        const snapshotsCount = snapshotsArr.length;
        const { exchange } = snapshotsArr[0];

        if (snapshotsCount > 1 && exchange in dexToPoolMap) {
            // compute interval and cumulative stats
            const {
                intervalStats,
                cumulativeStats,
                deposits,
                withdrawals,
                depositTimestamps,
                depositTokenAmounts,
                depositEthAmounts,
            } = statsComputations.getPoolStatsFromSnapshots(snapshotsArr);

            // Check if pool is active by checking if user's liquidity token balance in last snapshot is > 0
            const poolIsActive = snapshotsArr[snapshotsCount - 1].liquidityTokenBalance > 0;

            if (poolIsActive) {
                activePoolIds.push(id);
            } else {
                inactivePoolIds.push(id);
            }

            // Push PoolId to <Exchange, PoolId> mapping
            const { exchange } = snapshotsArr[0];
            dexToPoolMap[exchange].push(id);

            // token weights and token symbols
            const tokenWeights = formatUtils.getTokenWeightsArr(snapshotsArr[0].tokens);
            const tokenSymbols = formatUtils.getTokenSymbolArr(
                getPooledTokensInfo(snapshotsArr[0].tokens),
            );

            // Create new pool object
            customPoolsObject[id] = {
                exchange,
                poolId,
                isActive: poolIsActive,
                timestampEnd: snapshotsArr[snapshotsCount - 1].timestamp, // last sna
                hasYieldReward: getIfPoolHasYieldReward(snapshotsArr),
                yieldRewards: statsComputations.getYieldTokensFromSnaps(snapshotsArr),
                pooledTokens: getPooledTokensInfo(snapshotsArr[0].tokens),
                intervalStats,
                cumulativeStats,
                tokenWeights,
                deposits,
                withdrawals,
                depositTimestamps,
                depositTokenAmounts,
                depositEthAmounts,
                tokenSymbols,
                snapshots: snapshotsArr,
                dailyStats: undefined,
            };
        }
    });

    // fetch daily fees for all active pools
    dispatch(fetchDailyInit());
    let dailyStats;
    try {
        dailyStats = await getDailyDataObject(customPoolsObject);
    } catch (e) {
        console.log('Error while fetching daily data for pools');
        dispatch(fetchDailyFailed());
    }

    // assign daily data to Global object
    Object.keys(dailyStats).forEach(id => {
        if (dailyStats[id]) customPoolsObject[id].dailyStats = { ...dailyStats[id] };
    });

    dispatch(fetchSnapsSuccess(customPoolsObject, dexToPoolMap, activePoolIds, inactivePoolIds));
};
