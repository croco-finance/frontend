import * as actionTypes from '../actions/actionTypes';
import * as types from '../../config/types';

interface InitialStateInterface {
    allPools: { [key: string]: types.PoolItemInterface } | {};
    selectedPoolId: string;
    exchangeToPoolMapping: { [key: string]: Array<string> } | {};
    userAddress: string;
}

const initialState: InitialStateInterface = {
    allPools: {},
    selectedPoolId: '',
    exchangeToPoolMapping: {},
    userAddress: '',
};

// the argument is previous state. For the forst run it is initial state
const reducer = (state = initialState, action) => {
    switch (action.type) {
        // NOTE: we do not need 'break' statements because we return in every case
        case actionTypes.SET_ALL_POOLS: {
            return {
                ...state,
                allPools: action.pools,
            };
        }

        case actionTypes.SET_SELECTED_POOL_ID: {
            return {
                ...state,
                selectedPoolId: action.poolId,
            };
        }

        case actionTypes.SET_EXCHANGE_TO_POOLS_MAPPING: {
            return {
                ...state,
                exchangeToPoolMapping: action.exchangeToPoolMapping,
            };
        }
        case actionTypes.SET_ADDRESS: {
            return {
                ...state,
                userAddress: action.address,
            };
        }
        default:
            return state;
    }
};

export default reducer;
