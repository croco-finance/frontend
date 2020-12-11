import * as actionTypes from '@actionTypes';
import { types } from '@config';
interface InitialStateInterface {
    allPools: types.AllPoolsGlobal;
    selectedPoolId: string;
    allAddresses: types.AllAddressesGlobal;
    selectedAddress: string | 'bundled' | null;
    exchangeToPoolMapping: { [key: string]: string[] } | null;
    activePoolIds: string[];
    inactivePoolIds: string[];
    error: boolean;
    loading: boolean;
    noPoolsFound: boolean;
}

const initialState: InitialStateInterface = {
    allPools: {},
    selectedPoolId: '',
    allAddresses: {},
    selectedAddress: '',
    exchangeToPoolMapping: {},
    activePoolIds: [],
    inactivePoolIds: [],
    error: false,
    loading: false,
    noPoolsFound: false,
};

// the argument is previous state. For the forst run it is initial state
const reducer = (state = initialState, action) => {
    switch (action.type) {
        // NOTE: we do not need 'break' statements because we return in every case
        case actionTypes.SET_ALL_POOLS: {
            return {
                ...state,
                allPools: action.pools,
                error: false,
                noPoolsFound: false,
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

            const parentKey = 'allAddresses';
            const childKey: string = action.address;

            if (childKey) {
                // Remove the parentKey element from original
                const { [parentKey]: parentValue, ...noChild } = state;

                // Remove the childKey from the parentKey element
                const { [childKey]: removedValue, ...childWithout } = parentValue;

                // Merge back together
                const stateWithoutAddress = { ...noChild, [parentKey]: childWithout };

                return stateWithoutAddress;
            }
            return state;
        }

        case actionTypes.SET_BUNDLED_ADDRESS: {
            const isBundled = state.allAddresses[action.address]?.bundled;
            return {
                ...state,
                allAddresses: {
                    ...state.allAddresses,
                    [action.address]: { bundled: !isBundled },
                },
            };
        }

        case actionTypes.SET_ADDRESSES: {
            return {
                ...state,
                allAddresses: { ...action.addresses },
            };
        }

        case actionTypes.SET_SELECTED_ADDRESS: {
            return {
                ...state,
                selectedAddress: action.address,
            };
        }

        case actionTypes.FETCH_SNAPS_FAILED: {
            return {
                ...state,
                error: true,
                noPoolsFound: false,
            };
        }

        case actionTypes.SET_IS_LOADING: {
            return {
                ...state,
                loading: action.value,
            };
        }

        case actionTypes.SET_NO_POOLS_FOUND: {
            return {
                ...state,
                noPoolsFound: action.value,
            };
        }

        default:
            return state;
    }
};

export default reducer;
