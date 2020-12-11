import { analytics } from '@config';
import { formatUtils, statsComputations, validationUtils } from '@utils';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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

const FetchSnapsForBundledAddresses = initialAddress => {
    // const allAddresses: AllAddressesGlobal = useSelector(state => state.allAddresses);
    const [address, setAddress] = useState(initialAddress);
    const [isLoading, setIsLoading] = useState(false);
    const [noPoolsFound, setNoPoolsFound] = useState(false);
    const [isFetchError, setIsFetchError] = useState(false);

    const selectedAddress = useSelector(state => state.selectedAddress);

    // use redux actions and state variables
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchData = async (addresses: string[] | string) => {
            console.log('Running fetch data for: ', addresses);
            setIsLoading(true);
            setNoPoolsFound(false);
            setIsFetchError(false);

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
                    console.log("ERROR: Couldn't fetch data from database.");
                }
            }
            console.log('fetchedSnapshotsAddress', fetchedSnapshotsBundled);

            // check if some pools were found
            if (Object.keys(fetchedSnapshotsBundled).length === 0) {
                setNoPoolsFound(true);
                setIsLoading(false);
                dispatch({ type: actionTypes.SET_ALL_POOLS, pools: {} });
                dispatch({ type: actionTypes.SET_ACTIVE_POOL_IDS, activePoolIds: [] });
                dispatch({
                    type: actionTypes.SET_INACTIVE_POOL_IDS,
                    inactivePoolIds: [],
                });
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

            setIsLoading(false);

            console.log('Data successfully fetched - customPoolsObject', customPoolsObject);
        };

        if (address) {
            if (validationUtils.isValidEthereumAddress(address)) {
                fetchData(address);
            }
        }
    }, [address]);

    return [{ isLoading, noPoolsFound, isFetchError }, setAddress] as const;
};

export default FetchSnapsForBundledAddresses;
