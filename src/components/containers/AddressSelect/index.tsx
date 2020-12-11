import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { Select, Icon } from '@components/ui';
import { Modal } from '@components/layout';
import { colors } from '@config';
import { useDispatch, useSelector } from 'react-redux';
import { AllAddressesGlobal } from '@types';
import { validationUtils, formatUtils, mathUtils } from '@utils';
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
    if (address === 'bundled') {
        return {
            value: 'bundled',
            label: 'Bundled Wallets',
        };
    }
    return {
        value: address,
        label: address,
    };
};

const buildAddressOptions = (addresses: AllAddressesGlobal) => {
    if (!addresses) return null;

    let numberOfBundled = 0;
    const options = new Array();

    // get how many bundled addresses there are
    for (const [address, value] of Object.entries(addresses)) {
        if (address !== 'bundled') {
            // check if the address has bundled tag
            if (value.bundled) numberOfBundled += 1;

            // push address option
            options.push(buildAddressOption(address));
        }
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

interface AddressOption {
    value: string | 'bundled';
    label: string;
}

const AddressSelect = () => {
    const dispatch = useDispatch();
    const allAddresses: AllAddressesGlobal = useSelector(state => state.allAddresses);
    const selectedAddress: string = useSelector(state => state.selectedAddress);

    // save setting before the "Manage addresses" modal is opened
    const bundledAddressesSnapBeforeModalOpened = useRef<string[]>([]);
    const addressSelectedBeforeModalOpened = useRef<string>('');

    const [showAddressModal, setShowAddressModal] = useState(false);

    const handleAddressChange = inputAddr => {
        dispatch({ type: actionTypes.SET_SELECTED_ADDRESS, address: inputAddr.trim() });

        if (inputAddr === 'bundled') {
            dispatch(fetchSnapshots(formatUtils.getBundledAddresses(allAddresses)));
        } else if (validationUtils.isValidEthereumAddress(inputAddr)) {
            dispatch(fetchSnapshots(inputAddr));
        }
    };

    useEffect(() => {
        if (showAddressModal === false) {
            const addressesCount = Object.keys(allAddresses).length;

            // if the modal was closed right now
            if (selectedAddress === 'bundled' && addressesCount > 1) {
                // check if the user changed bundled addresses while the modal was opened
                const addressesAreEqual = mathUtils.arraysContainEqualElements(
                    bundledAddressesSnapBeforeModalOpened.current,
                    formatUtils.getBundledAddresses(allAddresses),
                );

                if (!addressesAreEqual) {
                    dispatch(fetchSnapshots(formatUtils.getBundledAddresses(allAddresses)));
                }
            } else {
                // if there is only one address in allAddresses and it's different from previously selected address, select it automatically
                if (
                    addressesCount === 1 &&
                    (addressSelectedBeforeModalOpened.current !== selectedAddress ||
                        selectedAddress === null)
                ) {
                    const addressToSelect = Object.keys(allAddresses)[0];
                    dispatch({ type: actionTypes.SET_SELECTED_ADDRESS, address: addressToSelect });
                    dispatch(fetchSnapshots(addressToSelect));
                }
            }
        } else {
            // if the modal is going to be opened, take snapshot
            bundledAddressesSnapBeforeModalOpened.current = formatUtils.getBundledAddresses(
                allAddresses,
            );
            addressSelectedBeforeModalOpened.current = selectedAddress;
        }
    }, [showAddressModal]);

    let value = buildAddressOption(selectedAddress);

    return (
        <Wrapper>
            <Select
                options={buildAddressOptions(allAddresses)}
                value={selectedAddress === null ? null : value} // I want to clean the select when user deletes just selected address
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