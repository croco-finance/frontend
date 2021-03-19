import { fetchSnapshots, setSelectedAddress } from '@actions';
import { AddressModal } from '@components/containers';
import { Modal } from '@components/layout';
import { Icon, Select } from '@components/ui';
import { useTheme } from '@hooks';
import { useSelector } from '@reducers';
import { AllAddressesGlobal } from '@types';
import { formatUtils, mathUtils, validationUtils } from '@utils';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';

const Wrapper = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
`;

const ManageAddressesButton = styled.button`
    border: none;
    background-color: ${props => props.theme.BUTTON_TERTIARY_BG};
    padding: 12px 15px;
    border-radius: 5px;
    margin-left: 10px;
    cursor: pointer;

    &:focus {
        border: none;
        outline: none;
    }

    &:hover {
        background-color: ${props => props.theme.BUTTON_TERTIARY_BG_HOVER};
    }
`;

const buildAddressOption = (address: string, ens: string): AddressOption => ({
    value: address,
    label: ens || address,
});

const buildAddressOptions = (addresses: AllAddressesGlobal) => {
    if (!addresses) return null;

    let numberOfBundled = 0;
    const options: AddressOption[] = [];

    // get how many bundled addresses there are
    Object.keys(addresses).forEach(address => {
        // addresses are 0xabc, 0xefg, ... and "bundled".
        if (address !== 'bundled') {
            const { bundled, ens } = addresses[address];

            // check if the address has bundled tag
            if (bundled) numberOfBundled += 1;

            // push address option
            options.push(buildAddressOption(address, ens));
        }
    });

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

interface Props {
    isSelectedNull?: boolean;
}

const AddressSelect = ({ isSelectedNull }: Props) => {
    const dispatch = useDispatch();
    const { allAddresses, selectedAddress } = useSelector(state => state.app);
    const theme = useTheme();

    // save setting before the "Manage addresses" modal is opened
    const bundledAddressesSnapBeforeModalOpened = useRef<string[]>([]);
    const addressSelectedBeforeModalOpened = useRef<string>('');

    const [showAddressModal, setShowAddressModal] = useState(false);

    const handleAddressChange = inputAddr => {
        dispatch(setSelectedAddress(inputAddr));

        if (inputAddr === 'bundled') {
            dispatch(fetchSnapshots(formatUtils.getBundledAddresses(allAddresses)));
        } else if (
            // fetch data for a new address if it's different from just selected
            validationUtils.isValidEthereumAddress(inputAddr) &&
            inputAddr !== selectedAddress
        ) {
            dispatch(fetchSnapshots(inputAddr));
        }
    };

    useEffect(() => {
        if (showAddressModal === false) {
            const addressesCount = Object.keys(allAddresses).length;
            const currentBundled = formatUtils.getBundledAddresses(allAddresses);
            const bundledAddressesCount = currentBundled.length;

            // if the modal was closed right now
            if (selectedAddress === 'bundled' && addressesCount > 1) {
                // check if the user changed bundled addresses while the modal was opened
                const currentBundled = formatUtils.getBundledAddresses(allAddresses);
                const addressesAreEqual = mathUtils.arraysContainEqualElements(
                    bundledAddressesSnapBeforeModalOpened.current,
                    currentBundled,
                );

                if (!addressesAreEqual && bundledAddressesCount > 1) {
                    dispatch(fetchSnapshots(currentBundled));
                }
            }
            // if there is only one address in allAddresses and it's different from previously selected address, select it automatically
            if (
                addressesCount === 1 &&
                (addressSelectedBeforeModalOpened.current !== selectedAddress ||
                    selectedAddress === null)
            ) {
                const addressToSelect = Object.keys(allAddresses)[0];
                dispatch(setSelectedAddress(addressToSelect));
                dispatch(fetchSnapshots(addressToSelect));
            }
        } else {
            // if the modal is going to be opened, take snapshot
            bundledAddressesSnapBeforeModalOpened.current = formatUtils.getBundledAddresses(
                allAddresses,
            );
            addressSelectedBeforeModalOpened.current = selectedAddress;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showAddressModal]);

    const getSelectedAddressValue = (address: string | null) => {
        if (isSelectedNull) return null;
        if (address === 'bundled') {
            return {
                value: 'bundled',
                label: 'Bundled Wallets',
            };
        }
        if (address === '' || address === null) {
            // if null is selected, the placeholder is shown
            return null;
        }

        const ens = allAddresses[address] ? allAddresses[address].ens : '';
        return buildAddressOption(address, ens);
    };

    return (
        <Wrapper>
            <Select
                options={buildAddressOptions(allAddresses)}
                value={getSelectedAddressValue(selectedAddress)} // I want to clean the select when user deletes just selected address
                onChange={(option: AddressOption) => {
                    handleAddressChange(option.value);
                }}
                useWhiteBackground
                useDarkBorder
                placeholder="Select your Ethereum address..."
                isSearchable={false}
            />

            <ManageAddressesButton
                onClick={() => {
                    setShowAddressModal(true);
                }}
            >
                <Icon icon="settings" size={20} color={theme.FONT_DARK} />
            </ManageAddressesButton>

            {showAddressModal && (
                <Modal
                    cancelable
                    onCancel={() => setShowAddressModal(false)}
                    heading="Manage addresses"
                    showHeaderBorder={false}
                >
                    <AddressModal />
                </Modal>
            )}
        </Wrapper>
    );
};

export default AddressSelect;
