import * as actionTypes from '@actionTypes';
import { DailyData, PoolToken, TokenType, SimulatorStateInterface, Exchange } from '@types';
import { getLastPoolSnap } from '@utils';
import store from '../../store';

// parse snap - strings to numbers
const parsePoolSnap = (snap): DailyData => {
    const poolTokens: PoolToken[] = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const token of snap.tokens) {
        poolTokens.push({
            priceUsd: parseFloat(token.priceUsd),
            reserve: parseFloat(token.reserve),
            weight: parseFloat(token.weight),
            token: token.token,
        });
    }

    return {
        block: snap.block,
        ethPrice: parseFloat(snap.ethPrice),
        exchange: snap.exchange,
        liquidityTokenTotalSupply: snap.liquidityTokenTotalSupply,
        relevantYieldTokenPrices: snap.relevantYieldTokenPrices,
        timestamp: snap.timestamp,
        // eslint-disable-next-line no-prototype-builtins
        txCostEth: snap.hasOwnProperty('txCostEth') ? parseFloat(snap.txCostEth) : 0,
        tokens: poolTokens,
        volumeUsd24: snap.volumeUsd24,
        swapFee: parseFloat(snap.swapFee),
    };
};

export const fetchPoolSnapInit = () => ({
    type: actionTypes.FETCH_POOL_SNAP_INIT,
});

export const fetchPoolSnapFailed = () => ({
    type: actionTypes.FETCH_POOL_SNAP_FAILED,
});

export const fetchPoolSnapSuccess = (poolId: string, payload: any) => ({
    type: actionTypes.FETCH_POOL_SNAP_SUCCESS,
    payload,
});

export const clearPoolSnapData = (poolId: string, payload: any) => ({
    type: actionTypes.CLEAR_POOL_SNAP_DATA,
});

export const setSimulationMode = (mode: SimulatorStateInterface['simulationMode']) => ({
    type: actionTypes.SET_SIMULATION_MODE,
    mode,
});
// setting simulation values
export const setNewSimulationPoolData = (
    poolId: string,
    tokenSymbols: string[],
    tokenWeights: number[],
    yieldTokenSymbol: string | null,
    tokenPricesUsd: number[],
    ethPriceUsd: number,
    userTokenBalances: number[],
    exchange: SimulatorStateInterface['exchange'],
    poolTokenReserves: number[] | null,
    volumeUsd24: number | null,
    swapFee: number | null,
) => ({
    type: actionTypes.SET_NEW_SIMULATION_POOL_DATA,
    payload: {
        poolId,
        tokenSymbols,
        tokenWeights,
        yieldTokenSymbol,
        tokenPricesUsd,
        ethPriceUsd,
        userTokenBalances,
        exchange,
        poolTokenReserves,
        volumeUsd24,
        swapFee,
    },
});

export const resetPoolSnapData = () => dispatch => {
    dispatch(setNewSimulationPoolData('', [], [], null, [], 0, [], null, null, null, null));
};

export const resetSimulationCoefficients = tokensCount => ({
    type: actionTypes.RESET_SIMULATION_COEFFICIENTS,
    tokensCount,
});

export const fetchPoolSnap = (address: string) => async dispatch => {
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
            const poolTokenReserves: number[] = new Array(tokenCounts);

            parsedPoolData.tokens.forEach((token, i) => {
                tokenWeights[i] = token.weight;
                tokenPricesUsd[i] = token.priceUsd;
                tokenSymbols[i] = token.token.symbol as TokenType;
                poolTokenReserves[i] = token.reserve;
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
                    parsedPoolData.exchange,
                    poolTokenReserves,
                    parsedPoolData.volumeUsd24,
                    parsedPoolData.swapFee,
                ),
            );
            // set simulation coefficients
            dispatch(resetSimulationCoefficients(tokenCounts));
        } else {
            dispatch(fetchPoolSnapFailed());
            console.log('Did not find any pool snap');
        }
    } catch (e) {
        dispatch(fetchPoolSnapFailed());
        console.log("ERROR: Couldn't fetch latest pool snap.");
    }
};

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

export const setEthCoefficient = newValue => ({
    type: actionTypes.SET_ETH_COEFFICIENT,
    coefficient: newValue,
});

export const setYieldCoefficient = newValue => ({
    type: actionTypes.SET_YIELD_COEFFICIENT,
    coefficient: newValue,
});

export const setDefaultSliderTokenCoefficient = (newValue, index) => {
    const state = store.getState();

    const coefficientsArrCopy = [...state.simulator.simulatedTokenCoefficients];
    coefficientsArrCopy[index] = newValue;

    return {
        type: actionTypes.SET_DEFAULT_SLIDER_TOKEN_COEFFICIENTS,
        coefficients: coefficientsArrCopy,
    };
};

export const setDefaultSliderEthCoefficient = newValue => ({
    type: actionTypes.SET_DEFAULT_SLIDER_ETH_COEFFICIENTS,
    coefficient: newValue,
});
