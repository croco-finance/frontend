import * as actionTypes from '@actionTypes';
import { types } from '@config';

interface InitialStateInterface {
    allPools: { [key: string]: types.PoolItemInterface } | {};
    selectedPoolId: string;
    exchangeToPoolMapping: { [key: string]: Array<string> } | {};
    userAddress: string;
    activePoolIds: Array<string>;
    inactivePoolIds: Array<string>;
    poolSnapshotsGrouped: { [key: string]: any } | {};
}

const initialState: InitialStateInterface = {
    allPools: {},
    selectedPoolId: '',
    exchangeToPoolMapping: {},
    userAddress: '',
    activePoolIds: [],
    inactivePoolIds: [],
    poolSnapshotsGrouped: {},
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

        case actionTypes.SET_ACTIVE_POOL_IDS: {
            return {
                ...state,
                activePoolIds: action.activePoolIds,
            };
        }

        case actionTypes.SET_INACTIVE_POOL_IDS: {
            return {
                ...state,
                inactivePoolIds: action.inactivePoolIds,
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
        case actionTypes.SET_POOL_SNAPSHOTS_GROUPED: {
            // todo make sure you do deep copy
            return {
                ...state,
                // poolGroups: action.poolGroups,
                poolGroups: JSON.parse(JSON.stringify(action.snapshotsGrouped)),
            };
        }
        default:
            return state;
    }
};

export default reducer;
