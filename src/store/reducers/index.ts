import * as actionTypes from '@actionTypes';
import { types } from '@config';
interface InitialStateInterface {
    allPools: types.AllPoolsGlobal | {};
    selectedPoolId: string;
    exchangeToPoolMapping: { [key: string]: string[] } | null;
    userAddress: string;
    activePoolIds: string[];
    inactivePoolIds: string[];
    poolSnapshotsGrouped: { [key: string]: any } | null;
    allAddresses: types.AllAddressesGlobal;
    selectedAddress: string | 'BUNDLED' | null;
    error: boolean;
    loading: boolean;
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
    error: false,
    loading: false,
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
            console.log('SET_BUNDLED_ADDRESS...', action.addresses);
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
            console.log('SET_ADDRESSES...', action.addresses);
            return {
                ...state,
                allAddresses: { ...action.addresses },
            };
        }

        case actionTypes.SET_SELECTED_ADDRESS: {
            console.log('SET_SELECTED_ADDRESS...', action.address);
            return {
                ...state,
                selectedAddress: action.address,
            };
        }

        case actionTypes.FETCH_SNAPS_FAILED: {
            console.log('SET_SELECTED_ADDRESS...', action.address);
            return {
                ...state,
                error: true,
            };
        }

        case actionTypes.SET_IS_LOADING: {
            console.log('SET_IS_LOADING...', action.value);
            return {
                ...state,
                loading: action.value,
            };
        }

        default:
            return state;
    }
};

export default reducer;
