import * as actionTypes from '@actionTypes';
import { DailyData, PoolToken, TokenType, SimulatorStateInterface } from '@types';
import { getLastPoolSnap } from '@utils';
import store from '../../store';

// parse snap - strings to numbers
const parsePoolSnap = (snap): DailyData => {
    const poolTokens: PoolToken[] = [];
    for (const token of snap['tokens']) {
        poolTokens.push({
            priceUsd: parseFloat(token['priceUsd']),
            reserve: parseFloat(token['reserve']),
            weight: parseFloat(token['weight']),
            token: token['token'],
        });
    }

    return {
        block: snap['block'],
        ethPrice: parseFloat(snap['ethPrice']),
        exchange: snap['exchange'],
        liquidityTokenTotalSupply: snap['liquidityTokenTotalSupply'],
        relevantYieldTokenPrices: snap['relevantYieldTokenPrices'],
        timestamp: snap['timestamp'],
        txCostEth: snap.hasOwnProperty('txCostEth') ? parseFloat(snap['txCostEth']) : 0,
        tokens: poolTokens,
    };
};

export const fetchPoolSnapInit = () => {
    return {
        type: actionTypes.FETCH_POOL_SNAP_INIT,
    };
};

export const fetchPoolSnapFailed = () => {
    return {
        type: actionTypes.FETCH_POOL_SNAP_FAILED,
    };
};

export const fetchPoolSnapSuccess = (poolId: string, payload: any) => {
    return {
        type: actionTypes.FETCH_POOL_SNAP_SUCCESS,
        payload: payload,
    };
};

export const clearPoolSnapData = (poolId: string, payload: any) => {
    return {
        type: actionTypes.CLEAR_POOL_SNAP_DATA,
    };
};

export const fetchPoolSnap = (address: string) => {
    return async dispatch => {
        dispatch(fetchPoolSnapInit());

        const queryAddress = address.trim().toLowerCase();

        // try to fetch data for the given address
        try {
            const fetchedPoolData = await getLastPoolSnap(queryAddress);
            if (fetchedPoolData) {
                // parse
                const parsedPoolData = parsePoolSnap(fetchedPoolData);
                dispatch(fetchPoolSnapSuccess(address, parsedPoolData));

                const tokenCounts = parsedPoolData.tokens.length;
                const tokenSymbols: TokenType[] = new Array(tokenCounts);
                const tokenWeights: number[] = new Array(tokenCounts);
                const tokenPricesUsd: number[] = new Array(tokenCounts);

                parsedPoolData.tokens.forEach((token, i) => {
                    tokenWeights[i] = token.weight;
                    tokenPricesUsd[i] = token.priceUsd;
                    tokenSymbols[i] = token.token.symbol as TokenType;
                });

                // set pool data besides user's balances
                dispatch(
                    setNewSimulationPoolData(
                        queryAddress,
                        tokenSymbols,
                        tokenWeights,
                        null,
                        tokenPricesUsd,
                        parsedPoolData.ethPrice,
                        new Array(tokenCounts).fill(0),
                    ),
                );
            } else {
                console.log('Did not find any pool snap');
            }
        } catch (e) {
            dispatch(fetchPoolSnapFailed());
            console.log("ERROR: Couldn't fetch latest pool snap.");
        }
    };
};

// setting simulation values
export const setNewSimulationPoolData = (
    poolId: string,
    tokenSymbols: string[],
    tokenWeights: number[],
    yieldTokenSymbol: string | null,
    tokenPricesUsd: number[],
    ethPriceUsd: number,
    userTokenBalances: number[],
) => {
    return {
        type: actionTypes.SET_NEW_SIMULATION_POOL_DATA,
        payload: {
            poolId,
            tokenSymbols,
            tokenWeights,
            yieldTokenSymbol,
            tokenPricesUsd,
            ethPriceUsd,
            userTokenBalances,
        },
    };
};

export const resetPoolSnapData = () => {
    return dispatch => {
        dispatch(setNewSimulationPoolData('', [], [], null, [], 0, []));
    };
};

export const setSimulationMode = (mode: SimulatorStateInterface['simulationMode']) => {
    return {
        type: actionTypes.SET_SIMULATION_MODE,
        mode: mode,
    };
};

export const SET_TOKEN_COEFFICIENTS = 'SET_TOKEN_COEFFICIENTS';
export const SET_ETH_COEFFICIENT = 'SET_ETH_COEFFICIENT';
export const SET_YIELD_COEFFICIENT = 'SET_YIELD_COEFFICIENT';
export const SET_SLIDER_TOKEN_COEFFICIENTS = 'SET_SLIDER_TOKEN_COEFFICIENTS';
export const SET_SLIDER_ETH_COEFFICIENT = 'SET_SLIDER_ETH_COEFFICIENT';

// update price coefficients
export const setTokenCoefficients = (newValue, index) => {
    const state = store.getState();

    const coefficientsArrCopy = [...state.simulator.simulatedTokenCoefficients];
    coefficientsArrCopy[index] = newValue;

    return {
        type: actionTypes.SET_TOKEN_COEFFICIENTS,
        coefficients: coefficientsArrCopy,
    };
};

export const setEthCoefficient = newValue => {
    return {
        type: actionTypes.SET_ETH_COEFFICIENT,
        coefficient: newValue,
    };
};

export const setYieldCoefficient = newValue => {
    return {
        type: actionTypes.SET_YIELD_COEFFICIENT,
        coefficient: newValue,
    };
};

export const setDefaultSliderTokenCoefficient = (newValue, index) => {
    const state = store.getState();

    const coefficientsArrCopy = [...state.simulator.simulatedTokenCoefficients];
    coefficientsArrCopy[index] = newValue;

    return {
        type: actionTypes.SET_DEFAULT_SLIDER_TOKEN_COEFFICIENTS,
        coefficients: coefficientsArrCopy,
    };
};

export const setDefaultSliderEthCoefficient = newValue => {
    return {
        type: actionTypes.SET_DEFAULT_SLIDER_ETH_COEFFICIENTS,
        coefficient: newValue,
    };
};
