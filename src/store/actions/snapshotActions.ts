import * as actionTypes from '@actionTypes';
import { analytics, ethersProvider } from '@config';
import {
    AllPoolsGlobal,
    DailyStats,
    DexToPoolIdMap,
    Exchange,
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
    let pooledTokensInfo = Array(tokensCount);

    tokens.forEach((token, i) => {
        pooledTokensInfo[i] = { ...token.token };
        pooledTokensInfo[i]['weight'] = token.weight;
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
    const snapsWithNewKeys: SnapStructure | {} = {};

    for (const [poolId, value] of Object.entries(snaps)) {
        const newKey = `${poolId}_${address}`;
        snapsWithNewKeys[newKey] = value;
    }

    return snapsWithNewKeys;
};

// Action creators
export const setPoolData = (
    pools: AllPoolsGlobal,
    dexToPoolMap: DexToPoolIdMap,
    activePoolIds: string[],
    inactivePoolIds: string[],
) => {
    return {
        type: actionTypes.SET_POOL_DATA,
        pools: pools,
        dexToPoolMap: dexToPoolMap,
        activePoolIds: activePoolIds,
        inactivePoolIds: inactivePoolIds,
    };
};

export const resetPoolData = () => {
    return dispatch => {
        dispatch(setPoolData({}, { BALANCER: [], UNI_V2: [], SUSHI: [], MATERIA: [] }, [], []));
    };
};

export const fetchSnapsInit = () => {
    return {
        type: actionTypes.FETCH_SNAPS_INIT,
    };
};

export const fetchSnapsFailed = () => {
    return {
        type: actionTypes.FETCH_SNAPS_FAILED,
    };
};

export const fetchDailyInit = () => {
    return {
        type: actionTypes.FETCH_DAILY_INIT,
    };
};

export const fetchDailyFailed = () => {
    return {
        type: actionTypes.FETCH_DAILY_FAILED,
    };
};

export const fetchDailySuccess = (poolId: string, payload: DailyStats | undefined) => {
    return {
        type: actionTypes.FETCH_DAILY_SUCCESS,
        poolId: poolId,
        payload: payload,
    };
};

export const fetchSnapsSuccess = (
    pools: AllPoolsGlobal,
    dexToPoolMap: DexToPoolIdMap,
    activePoolIds: string[],
    inactivePoolIds: string[],
) => {
    return {
        type: actionTypes.FETCH_SNAPS_SUCCESS,
        pools: pools,
        dexToPoolMap: dexToPoolMap,
        activePoolIds: activePoolIds,
        inactivePoolIds: inactivePoolIds,
    };
};

export const setSelectedPoolId = (poolId: string) => {
    return {
        type: actionTypes.SET_SELECTED_POOL_ID,
        poolId: poolId,
    };
};

export const setIsLoading = (isLoading: boolean) => {
    return {
        type: actionTypes.SET_IS_LOADING,
        value: isLoading,
    };
};

export const noPoolsFound = () => {
    return {
        type: actionTypes.NO_POOLS_FOUND,
    };
};

export const changeSelectedPool = (poolId: string) => {
    return dispatch => {
        if (poolId === 'all') {
            dispatch(setSelectedPoolId(poolId));
        } else {
            const state = store.getState();

            if (state.app.allPools && state.app.allPools[poolId]) {
                dispatch(setSelectedPoolId(poolId));
            }
        }
    };
};

export const fetchSnapshots = (addresses: string[] | string) => {
    return async dispatch => {
        dispatch(fetchSnapsInit());

        // if this is just single address, convert it to an array
        if (typeof addresses === 'string') {
            addresses = [addresses];
        }

        let fetchedSnapshotsBundled: SnapStructure | {} = {};

        for (const address of addresses) {
            const queryAddress = address.trim().toLowerCase();

            // convert address to without 0x format for Firebase Analytics purposes
            let addressWithout0x = validationUtils.isHex(queryAddress)
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
                        console.log(
                            `Could not fetch unclaimed yield rewards for address: ${address}`,
                        );
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
        let dexToPoolMap: DexToPoolIdMap = { BALANCER: [], UNI_V2: [], SUSHI: [], MATERIA: [] };
        let activePoolIds: string[] = [];
        let inactivePoolIds: string[] = [];
        const customPoolsObject: AllPoolsGlobal = {};

        for (const [id, snapshotsArr] of Object.entries(fetchedSnapshotsBundled)) {
            const poolId = id.split('_')[0];
            const snapshotsCount = snapshotsArr.length;
            const exchange: Exchange = snapshotsArr[0].exchange;

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
                const exchange: Exchange = snapshotsArr[0].exchange;
                dexToPoolMap[exchange].push(id);

                // Create new pool object
                customPoolsObject[id] = {
                    exchange: exchange,
                    poolId: poolId,
                    isActive: poolIsActive,
                    timestampEnd: snapshotsArr[snapshotsCount - 1].timestamp, // last sna
                    hasYieldReward: getIfPoolHasYieldReward(snapshotsArr),
                    yieldRewards: statsComputations.getYieldTokensFromSnaps(snapshotsArr),
                    pooledTokens: getPooledTokensInfo(snapshotsArr[0].tokens),
                    intervalStats: intervalStats,
                    cumulativeStats: cumulativeStats,
                    tokenWeights: formatUtils.getTokenWeightsArr(snapshotsArr[0].tokens),
                    deposits,
                    withdrawals,
                    depositTimestamps,
                    depositTokenAmounts,
                    depositEthAmounts,
                    tokenSymbols: formatUtils.getTokenSymbolArr(
                        getPooledTokensInfo(snapshotsArr[0].tokens),
                    ),
                    snapshots: snapshotsArr,
                    dailyStats: undefined,
                };
            }
        }

        // fetch daily fees for all active pools
        dispatch(fetchDailyInit());
        try {
            for (const [id, _] of Object.entries(customPoolsObject)) {
                const poolItem = customPoolsObject[id];
                const { poolId, isActive } = poolItem;

                // fetch daily data only for active pools
                if (isActive) {
                    try {
                        const response = await getDailyFees(poolId);
                        if (response) {
                            const dailyStats = statsComputations.getDailyRewards(
                                response,
                                poolItem,
                            );
                            poolItem.dailyStats = dailyStats;
                        } else {
                            // TODO save ID of the pool for which the fetch failed
                            dispatch(fetchDailyFailed());
                            console.log('Did not get valid response in fetchDailyFees()');
                        }
                    } catch (e) {
                        console.log('Failed to fetch daily data for pool ID: ', poolId);
                    }
                }
            }
        } catch (e) {
            console.log('Error while fetching daily data for pools');
            dispatch(fetchDailyFailed());
        }

        dispatch(
            fetchSnapsSuccess(customPoolsObject, dexToPoolMap, activePoolIds, inactivePoolIds),
        );
    };
};
