import React, { useEffect, useState } from 'react';
import exampleDataJson from '../config/example-data-json.json';
import { useDispatch } from 'react-redux';
import * as actionTypes from '../store/actions/actionTypes';
import axios from 'axios';
import { constants } from '../config';
import { validation } from '../utils';

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
    'yieldRewardUsd',
    'yieldRewardEth',
    'yieldReward',
    'ethPriceUsdEnd',
];
const toNumberArrayAttributes = [
    'endTokenBalance',
    'endTokenPricesUsd',
    'tokenBalanceDiffNoFees',
    'tokenWeights',
];

const FetchPoolsHook = initialAddress => {
    const [address, setAddress] = useState(initialAddress);
    const [isLoading, setIsLoading] = useState(false);
    const [noPoolsFound, setNoPoolsFound] = useState(false);
    const [isFetchError, setIsFetchError] = useState(false);

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
                const response = await axios.get(query);
                const fetchedData = response.data;
                // const fetchedData = exampleDataJson;

                // console.log('fetchedData', fetchedData);

                if (fetchedData.length === 0) {
                    setNoPoolsFound(true);
                    setIsLoading(false);
                    return;
                }

                let poolsCustomObject = {};
                let exToPoolMap = {};

                fetchedData.forEach((pool: any) => {
                    const poolId = pool['poolId'];
                    const exchange = pool['exchange'];

                    if (!exToPoolMap[exchange]) {
                        exToPoolMap[exchange] = [];
                    }

                    poolsCustomObject[poolId] = { ...pool };
                    exToPoolMap[exchange].push(poolId);

                    toNumberAttributes.forEach(attribute => {
                        poolsCustomObject[poolId][attribute] = parseFloat(
                            poolsCustomObject[poolId][attribute],
                        );
                    });

                    toNumberArrayAttributes.forEach(arrayAttribute => {
                        poolsCustomObject[poolId][arrayAttribute].forEach((stringValue, i) => {
                            poolsCustomObject[poolId][arrayAttribute][i] = parseFloat(
                                poolsCustomObject[poolId][arrayAttribute][i],
                            );
                        });
                    });
                });

                // set new (redux) state variables
                dispatch({ type: actionTypes.SET_ALL_POOLS, pools: poolsCustomObject });
                // dispatch({ type: actionTypes.SET_SELECTED_POOL_ID, poolId: 'all' });
                dispatch({
                    type: actionTypes.SET_EXCHANGE_TO_POOLS_MAPPING,
                    exchangeToPoolMapping: exToPoolMap,
                });
                console.log();
                dispatch({ type: actionTypes.SET_ADDRESS, address: queryAddress.trim() });
            } catch (e) {
                console.log('ERROR while fetching data about pools...');
                setIsFetchError(true);
            }

            setIsLoading(false);
        };

        // TODO inform user the address is not valid
        if (validation.isValidEthereumAddress(address.trim())) {
            fetchData(address);
        }

        // fetchData(address);
    }, [address]);

    return [{ isLoading, noPoolsFound, isFetchError }, setAddress] as const;
};

export { FetchPoolsHook };
