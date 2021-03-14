import produce from 'immer';
import * as actionTypes from '@actionTypes';
import { SimulatorStateInterface } from '@types';
import { useDispatch as _useDispatch, useSelector as _useSelector } from 'react-redux';

export const initialState: SimulatorStateInterface = {
    // selected mode
    simulationMode: 'positions',
    // simulation data
    poolId: '',
    tokenSymbols: [],
    tokenWeights: [],
    tokenPricesUsd: [],
    userTokenBalances: [],
    ethPriceUsd: 0,
    yieldTokenSymbol: null,
    investedAmount: 0,
    // pool snap data
    poolSnapFetchError: false,
    poolSnapLoading: false,
    poolSnapError: false,
    poolSnapData: null,
    // simulated coefficient
    simulatedTokenCoefficients: [],
    simulatedEthCoefficient: 1,
    simulatedYieldCoefficient: 1,
    defaultSliderTokenCoefficients: [],
    defaultSliderEthCoefficient: 1,
};

// the argument is previous state. For the forst run it is initial state
const simulatorReducer = (state = initialState, action) => {
    return produce(state, draft => {
        switch (action.type) {
            case actionTypes.SET_NEW_SIMULATION_POOL_DATA: {
                draft.poolId = action.payload.poolId;
                draft.tokenSymbols = action.payload.tokenSymbols;
                draft.tokenWeights = action.payload.tokenWeights;
                draft.yieldTokenSymbol = action.payload.yieldTokenSymbol;
                draft.ethPriceUsd = action.payload.ethPriceUsd;
                draft.tokenPricesUsd = action.payload.tokenPricesUsd;
                draft.userTokenBalances = action.payload.userTokenBalances;
                // simulated coeffs
                draft.simulatedTokenCoefficients = new Array(
                    action.payload.tokenSymbols.length,
                ).fill(1);
                draft.simulatedEthCoefficient = 1;
                draft.simulatedYieldCoefficient = 1;
                draft.defaultSliderTokenCoefficients = new Array(
                    action.payload.tokenSymbols.length,
                ).fill(1);
                draft.defaultSliderEthCoefficient = 1;
                break;
            }

            // NOTE: we do not need 'break' statements because we return in every case
            case actionTypes.FETCH_POOL_SNAP_INIT: {
                draft.poolSnapFetchError = false;
                draft.poolSnapLoading = true;
                break;
            }

            case actionTypes.FETCH_POOL_SNAP_FAILED: {
                draft.poolSnapFetchError = true;
                draft.poolSnapLoading = false;
                break;
            }

            case actionTypes.FETCH_POOL_SNAP_SUCCESS: {
                draft.poolSnapData = action.payload;
                draft.poolSnapLoading = false;
                draft.poolSnapError = false;
                break;
            }

            case actionTypes.CLEAR_POOL_SNAP_DATA: {
                draft.poolSnapData = null;
                break;
            }
            case actionTypes.SET_SIMULATION_MODE: {
                draft.simulationMode = action.mode;
                break;
            }
            case actionTypes.SET_TOKEN_COEFFICIENTS: {
                draft.simulatedTokenCoefficients = action.coefficients;
                break;
            }
            case actionTypes.SET_ETH_COEFFICIENT: {
                draft.simulatedEthCoefficient = action.coefficient;
                break;
            }
            case actionTypes.SET_YIELD_COEFFICIENT: {
                draft.simulatedYieldCoefficient = action.coefficient;
                break;
            }
            case actionTypes.SET_DEFAULT_SLIDER_TOKEN_COEFFICIENTS: {
                draft.defaultSliderTokenCoefficients = action.coefficients;
                break;
            }
            case actionTypes.SET_DEFAULT_SLIDER_ETH_COEFFICIENTS: {
                draft.defaultSliderEthCoefficient = action.coefficient;
                break;
            }

            default:
                return draft;
        }
    });
};

export default simulatorReducer;
