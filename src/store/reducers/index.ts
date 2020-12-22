import produce from 'immer';
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
    return produce(state, draft => {
        switch (action.type) {
            // NOTE: we do not need 'break' statements because we return in every case
            case actionTypes.SET_POOL_DATA:
                draft.allPools = action.pools;
                draft.activePoolIds = action.activePoolIds;
                draft.inactivePoolIds = action.inactivePoolIds;
                draft.dexToPoolMap = action.dexToPoolMap;
                break;

            case actionTypes.SET_SELECTED_POOL_ID: {
                draft.selectedPoolId = action.poolId;
                break;
            }

            case actionTypes.ADD_NEW_ADDRESS: {
                draft.allAddresses[action.address] = { bundled: false, ens: action.ens };
                break;
            }
            case actionTypes.DELETE_ADDRESS: {
                delete draft.allAddresses[action.address];
                break;
            }

            case actionTypes.SET_BUNDLED_ADDRESS: {
                const bundled = state.allAddresses[action.address].bundled;
                draft.allAddresses[action.address].bundled = !bundled;
                break;
            }

            case actionTypes.SET_ADDRESSES: {
                draft.allAddresses = action.addresses;
                break;
            }

            case actionTypes.SET_SELECTED_ADDRESS: {
                draft.selectedAddress = action.address;
                break;
            }

            case actionTypes.FETCH_SNAPS_FAILED: {
                draft.error = true;
                draft.noPoolsFound = false;
                draft.loading = false;
                break;
            }

            case actionTypes.FETCH_SNAPS_SUCCESS: {
                draft.allPools = action.pools;
                draft.activePoolIds = action.activePoolIds;
                draft.inactivePoolIds = action.inactivePoolIds;
                draft.dexToPoolMap = action.dexToPoolMap;
                draft.loading = false;
                draft.error = false;
                draft.noPoolsFound = false;
                draft.selectedPoolId = 'all';
                break;
            }

            case actionTypes.SET_IS_LOADING: {
                draft.loading = action.value;
                break;
            }

            case actionTypes.SET_NO_POOLS_FOUND: {
                draft.noPoolsFound = action.value;
                break;
            }

            case actionTypes.NO_POOLS_FOUND: {
                draft.allPools = {};
                draft.activePoolIds = [];
                draft.inactivePoolIds = [];
                draft.dexToPoolMap = {};
                draft.error = false;
                draft.loading = false;
                draft.noPoolsFound = true;
                draft.selectedPoolId = 'all';
                break;
            }

            case actionTypes.FETCH_SNAPS_INIT: {
                draft.error = false;
                draft.loading = true;
                draft.noPoolsFound = true;
                break;
            }

            case actionTypes.SET_THEME: {
                draft.theme = action.variant;
                break;
            }
            default:
                return draft;
        }
    });
};

export function useSelector<T>(fn: (store: AppStateInterface) => T): T {
    return fn(_useSelector(x => x));
}

export default reducer;
