import * as actionTypes from '@actionTypes';
import { AllAddressesGlobal } from '@types';

export const setAddresses = (addresses: AllAddressesGlobal) => {
    return {
        type: actionTypes.SET_ADDRESSES,
        address: addresses,
    };
};

export const setSelectedAddress = (address: string | null) => {
    return {
        type: actionTypes.SET_SELECTED_ADDRESS,
        address: address,
    };
};
