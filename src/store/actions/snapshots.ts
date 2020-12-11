import { analytics } from '@config';
import { formatUtils, statsComputations, validationUtils } from '@utils';
import exampleFirebaseData from '../../config/example-data-firebase';
import * as actionTypes from '@actionTypes';
import { getSnaps } from '@utils';
import { AllPoolsGlobal, PoolToken, DexToPoolIdMap, Exchange, SnapStructure } from '@types';

const getPooledTokensInfo = (tokens: Array<PoolToken>) => {
    const tokensCount = tokens.length;
    let pooledTokensInfo = Array(tokensCount);

    tokens.forEach((token, i) => {
        pooledTokensInfo[i] = { ...token.token };
        pooledTokensInfo[i]['weight'] = token.weight;
    });

    return pooledTokensInfo;
};

// I expect to receive pools as an argument and just return an action I want to dispatch
// This is the action creator I want to dispatch eventually once the async code (fetchSnapshots() goes well)
export const setPools = (pools: AllPoolsGlobal) => {
    return {
        type: actionTypes.SET_ALL_POOLS,
        pools: pools,
    };
};

export const fetchSnapsFailed = () => {
    return {
        type: actionTypes.FETCH_SNAPS_FAILED,
    };
};

export const setIsLoading = (isLoading: boolean) => {
    return {
        type: actionTypes.SET_IS_LOADING,
        value: isLoading,
    };
};

export const fetchSnapshots = (addresses: string[] | string) => {
    // I can use dispatch here thanks to redux thunk
    return async dispatch => {
        console.log('Running fetchSnapshots from REDUX ');
        dispatch(setIsLoading(true));
        if (typeof addresses === 'string') {
            addresses = [addresses];
        }

        let fetchedSnapshotsBundled: SnapStructure | {} = {};

        for (const address of addresses) {
            const queryAddress = address.trim().toLowerCase();

            // initialize variable containing snapshots for all addresses
            let fetchedSnapshotsAddress;

            // try to fetch data for the given address
            try {
                fetchedSnapshotsAddress = await getSnaps(queryAddress);

                // check if data was fetched. If yes, add it to pool
                if (!fetchedSnapshotsAddress) {
                    console.log(`Did not find any pools associated with: ${queryAddress}`);
                } else {
                    fetchedSnapshotsBundled = {
                        ...fetchedSnapshotsBundled,
                        ...fetchedSnapshotsAddress,
                    };
                }
            } catch (e) {
                dispatch(fetchSnapsFailed());
                console.log("ERROR: Couldn't fetch data from database.");
            }
        }
        console.log('fetchedSnapshotsAddress', fetchedSnapshotsBundled);

        // check if some pools were found
        if (Object.keys(fetchedSnapshotsBundled).length === 0) {
            // setNoPoolsFound(true);
            dispatch({ type: actionTypes.SET_ACTIVE_POOL_IDS, activePoolIds: [] });
            dispatch({
                type: actionTypes.SET_INACTIVE_POOL_IDS,
                inactivePoolIds: [],
            });
            dispatch(setPools({}));
            dispatch(setIsLoading(false));
            return;
        }

        // Process fetched snapshots
        // declare Redux variables
        let exToPoolMap: DexToPoolIdMap = { BALANCER: [], UNI_V2: [], SUSHI: [] };
        let activePoolIds: Array<string> = [];
        let inactivePoolIds: Array<string> = [];
        const customPoolsObject: AllPoolsGlobal = {};

        for (const [poolId, snapshotsArr] of Object.entries(fetchedSnapshotsBundled)) {
            const snapshotsCount = snapshotsArr.length;
            const exchange: Exchange = snapshotsArr[0].exchange;

            if (snapshotsCount > 1 && exchange in exToPoolMap) {
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
                    activePoolIds.push(poolId);
                } else {
                    inactivePoolIds.push(poolId);
                }

                // Push PoolId to <Exchange, PoolId> mapping
                const exchange: Exchange = snapshotsArr[0].exchange;
                exToPoolMap[exchange].push(poolId);

                // Create new pool object
                customPoolsObject[poolId] = {
                    exchange: exchange,
                    poolId: poolId,
                    isActive: poolIsActive,
                    timestampEnd: snapshotsArr[snapshotsCount - 1].timestamp, // last sna
                    hasYieldReward: snapshotsArr[0].yieldReward !== null,
                    yieldToken: snapshotsArr[0].yieldReward
                        ? snapshotsArr[0].yieldReward.token
                        : null,
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
                };
            }
        }

        console.log('customPoolsObject', customPoolsObject);

        dispatch({
            type: actionTypes.SET_EXCHANGE_TO_POOLS_MAPPING,
            exchangeToPoolMapping: exToPoolMap,
        });
        dispatch({ type: actionTypes.SET_ACTIVE_POOL_IDS, activePoolIds: activePoolIds });
        dispatch({
            type: actionTypes.SET_INACTIVE_POOL_IDS,
            inactivePoolIds: inactivePoolIds,
        });

        dispatch(setPools(customPoolsObject));
        dispatch(setIsLoading(false));
    };
};
