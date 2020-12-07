import * as actionTypes from '@actionTypes';
import { types } from '@config';
interface InitialStateInterface {
    allPools: types.AllPoolsGlobal | {};
    selectedPoolId: string;
    exchangeToPoolMapping: { [key: string]: string[] } | {};
    userAddress: string;
    activePoolIds: string[];
    inactivePoolIds: string[];
    poolSnapshotsGrouped: { [key: string]: any } | {};
    allAddresses: types.AllAddressesGlobal;
    selectedAddress: string | 'BUNDLED';
}

const initialState: InitialStateInterface = {
    allPools: {},
    selectedPoolId: '',
    exchangeToPoolMapping: {},
    userAddress: '',
    activePoolIds: [],
    inactivePoolIds: [],
    poolSnapshotsGrouped: {},
    allAddresses: {},
    selectedAddress: '',
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
        case actionTypes.ADD_NEW_ADDRESS: {
            // const stateCopy = { ...state };
            // const addressesCopy = { ...stateCopy.allAddresses };
            // addressesCopy[action.address] = { bundled: false };
            return {
                ...state,
                allAddresses: {
                    ...state.allAddresses,
                    [action.address]: { bundled: false },
                },
            };
        }
        case actionTypes.DELETE_ADDRESS: {
            const { allAddresses, ...withoutAddress } = state;
            // const addressesCopy = { ...stateCopy.allAddresses };
            const parentKey = 'allAddresses';
            const childKey: string = action.address;

            // Remove the parentKey element from original
            const { [parentKey]: parentValue, ...noChild } = state;

            // Remove the childKey from the parentKey element
            const { [childKey]: removedValue, ...childWithout } = parentValue;

            // Merge back together
            const stateWithoutAddress = { ...noChild, [parentKey]: childWithout };

            return stateWithoutAddress;
        }

        case actionTypes.SET_BUNDLED_ADDRESS: {
            const isBundled = state.allAddresses[action.address].bundled;
            return {
                ...state,
                allAddresses: {
                    ...state.allAddresses,
                    [action.address]: { bundled: !isBundled },
                },
            };
        }

        default:
            return state;
    }
};

export default reducer;

export const ADD_NEW_ADDRESS = 'ADD_NEW_ADDRESS';
export const DELETE_ADDRESS = 'DELETE_ADDRESS';
export const SET_SELECTED_ADDRESS = 'SET_SELECTED_ADDRESS';
