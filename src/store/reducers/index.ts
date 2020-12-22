import * as actionTypes from '@actionTypes';
import { AppStateInterface } from '@types';
import { useDispatch as _useDispatch, useSelector as _useSelector } from 'react-redux';

export const initialState: AppStateInterface = {
    allPools: {},
    selectedPoolId: '',
    allAddresses: {},
    selectedAddress: '',
    dexToPoolMap: { BALANCER: [], UNI_V2: [], SUSHI: [] },
    activePoolIds: [],
    inactivePoolIds: [],
    error: false,
    loading: false,
    noPoolsFound: false,
    theme: 'light',
};

// the argument is previous state. For the forst run it is initial state
const reducer = (state = initialState, action) => {
    switch (action.type) {
        // NOTE: we do not need 'break' statements because we return in every case
        case actionTypes.SET_POOL_DATA: {
            return {
                ...state,
                allPools: action.pools,
                activePoolIds: action.activePoolIds,
                inactivePoolIds: action.inactivePoolIds,
                dexToPoolMap: action.dexToPoolMap,
            };
        }

        case actionTypes.SET_SELECTED_POOL_ID: {
            return {
                ...state,
                selectedPoolId: action.poolId,
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
                    [action.address]: { bundled: false, ens: action.ens },
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
            const { bundled, ens } = state.allAddresses[action.address];
            return {
                ...state,
                allAddresses: {
                    ...state.allAddresses,
                    [action.address]: { bundled: !bundled, ens: ens },
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
                loading: false,
            };
        }

        case actionTypes.FETCH_SNAPS_SUCCESS: {
            return {
                ...state,
                allPools: action.pools,
                activePoolIds: action.activePoolIds,
                inactivePoolIds: action.inactivePoolIds,
                dexToPoolMap: action.dexToPoolMap,
                loading: false,
                error: false,
                noPoolsFound: false,
                selectedPoolId: 'all',
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

        case actionTypes.NO_POOLS_FOUND: {
            return {
                ...state,
                allPools: {},
                activePoolIds: [],
                inactivePoolIds: [],
                dexToPoolMap: [],
                error: false,
                loading: false,
                noPoolsFound: true,
                selectedPoolId: 'all',
            };
        }

        case actionTypes.FETCH_SNAPS_INIT: {
            return {
                ...state,
                error: false,
                loading: true,
                noPoolsFound: false,
            };
        }

        case actionTypes.SET_THEME: {
            return {
                ...state,
                theme: action.variant,
            };
        }
        default:
            return state;
    }
};

export function useSelector<T>(fn: (store: AppStateInterface) => T): T {
    return fn(_useSelector(x => x));
}

export default reducer;
