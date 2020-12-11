import React, { useState } from 'react';
import styled from 'styled-components';
import { Select, Icon } from '@components/ui';
import { Modal } from '@components/layout';
import { variables, colors } from '@config';
import { useDispatch, useSelector } from 'react-redux';
import { AllAddressesGlobal } from '@types';
import { validationUtils } from '@utils';
import * as actionTypes from '@actionTypes';
import { AddressModal } from '@components/containers';
import { fetchSnapshots } from '../../../store/actions/index';

const Wrapper = styled.div`
    width: 100%;
    max-width: 610px;
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-top: 20px;
    margin-bottom: 30px;
    padding: 0 5px;
    /* padding: 6px;
    border-radius: 8px;
    background-color: ${colors.BACKGROUND_DARK}; */
`;

const ManageAddressesButton = styled.button`
    border: none;
    background-color: ${colors.BACKGROUND_DARK};
    padding: 12px 15px;
    border-radius: 5px;
    margin-left: 10px;
    cursor: pointer;
    /* border: 1px solid ${colors.STROKE_GREY}; */

    &:focus {
        border: none;
        outline: none;
    }

    &:hover {
        background-color: ${colors.STROKE_GREY};
    }
`;

const buildAddressOption = (address: string) => {
    return {
        value: address,
        label: address,
    };
};

const buildAddressOptions = (addresses: AllAddressesGlobal) => {
    if (!addresses) return null;

    const addressesCount = Object.keys(addresses).length;
    let numberOfBundled = 0;
    const options = new Array(addressesCount);

    // get how many bundled addresses there are
    for (const [address, value] of Object.entries(addresses)) {
        // check if the address has bundled tag
        if (value.bundled) numberOfBundled += 1;

        // push address option
        options.push(buildAddressOption(address));
    }

    // add bundled option if more than 1 bundled addresses is present
    if (numberOfBundled > 1) {
        options.push({
            value: 'bundled',
            label: `Bundled Wallets (${numberOfBundled})`,
        });
    }

    return options;
};

const getBundledAddresses = (addresses: AllAddressesGlobal) => {
    const addressesArr = new Array();

    for (const [address, value] of Object.entries(addresses)) {
        if (value.bundled) addressesArr.push(address);
    }

    return addressesArr;
};

interface AddressOption {
    value: string | 'bundled';
    label: string;
}

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
}

const AddressSelect = ({ children }: Props) => {
    const dispatch = useDispatch();
    const allAddresses: AllAddressesGlobal = useSelector(state => state.allAddresses);
    const selectedAddress: string = useSelector(state => state.selectedAddress);

    const [showAddressModal, setShowAddressModal] = useState(false);

    const handleAddressChange = inputAddr => {
        // show in the input whatever user typed in, even if it's not a valid ETH address
        dispatch({ type: actionTypes.SET_SELECTED_ADDRESS, address: inputAddr.trim() });

        if (inputAddr === 'bundled') {
            dispatch(fetchSnapshots(getBundledAddresses(allAddresses)));
        } else if (validationUtils.isValidEthereumAddress(inputAddr)) {
            dispatch(fetchSnapshots(inputAddr));
        }
    };

    return (
        <Wrapper>
            <Select
                options={buildAddressOptions(allAddresses)}
                value={selectedAddress === null ? null : buildAddressOption(selectedAddress)}
                onChange={(option: AddressOption) => {
                    handleAddressChange(option.value);
                }}
                useWhiteBackground
                useDarkBorder
                placeholder="Select Ethereum address..."
                isSearchable={false}
            />

            <ManageAddressesButton
                onClick={() => {
                    setShowAddressModal(true);
                }}
            >
                <Icon icon="settings" size={20} />
            </ManageAddressesButton>

            {showAddressModal && (
                <Modal
                    cancelable
                    onCancel={() => setShowAddressModal(false)}
                    heading={'Manage addresses'}
                >
                    <AddressModal />
                </Modal>
            )}
        </Wrapper>
    );
};

export default AddressSelect;
