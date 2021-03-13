import * as actionTypes from '@actionTypes';
import { DailyData, PoolToken } from '@types';
import { getLastPoolSnap } from '@utils';

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
        poolId: poolId,
        payload: payload,
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
                dispatch(fetchPoolSnapSuccess(address, parsePoolSnap(fetchedPoolData)));
            } else {
                console.log('Did not find any pool snap');
            }
        } catch (e) {
            dispatch(fetchPoolSnapFailed());
            console.log("ERROR: Couldn't fetch latest pool snap.");
        }
    };
};
