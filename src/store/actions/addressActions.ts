import * as actionTypes from '@actionTypes';
import { AllAddressesGlobal } from '@types';

export const setAddresses = (addresses: AllAddressesGlobal) => ({
    type: actionTypes.SET_ADDRESSES,
    address: addresses,
});

export const setSelectedAddress = (address: string | null) => ({
    type: actionTypes.SET_SELECTED_ADDRESS,
    address,
});
