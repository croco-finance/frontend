import { analytics } from '@config';
import { formatUtils, statsComputations, validationUtils } from '@utils';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import exampleFirebaseData from '../../config/example-data-firebase';
import * as actionTypes from '@actionTypes';
import { getSnaps } from '@utils';
import { AllPoolsGlobal, PoolToken, DexToPoolIdMap, Exchange } from '@types';

const getPooledTokensInfo = (tokens: Array<PoolToken>) => {
    const tokensCount = tokens.length;
    let pooledTokensInfo = Array(tokensCount);

    tokens.forEach((token, i) => {
        pooledTokensInfo[i] = { ...token.token };
        pooledTokensInfo[i]['weight'] = token.weight;
    });

    return pooledTokensInfo;
};

const FetchSnapsForAddress = initialAddress => {
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
            setIsLoading(true);
            setNoPoolsFound(false);
            setIsFetchError(false);

            // double-check the address is in the right format
            const queryAddress = address.trim().toLowerCase();

            try {
                const fetchedSnapshots = await getSnaps(queryAddress);
                // const fetchedSnapshots = exampleFirebaseData;

                // check if some pools were founds. If not, set the following variables to global redux state
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
                let exToPoolMap: DexToPoolIdMap = { BALANCER: [], UNI_V2: [], SUSHI: [] };
                let activePoolIds: Array<string> = [];
                let inactivePoolIds: Array<string> = [];
                const customPoolsObject: AllPoolsGlobal = {};

                for (const [poolId, snapshotsArr] of Object.entries(fetchedSnapshots)) {
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
                        const poolIsActive =
                            snapshotsArr[snapshotsCount - 1].liquidityTokenBalance > 0;

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
                            userAddr: queryAddress,
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

        /* 
        fetch data only if 
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

export default FetchSnapsForAddress;
