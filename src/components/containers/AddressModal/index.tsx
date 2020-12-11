import React, { useState } from 'react';
import styled from 'styled-components';
import { colors, variables } from '@config';
import { Icon, Input } from '@components/ui';
import { useDispatch, useSelector } from 'react-redux';
import * as actionTypes from '@actionTypes';
import { validationUtils } from '@utils';
import { AllAddressesGlobal } from '@types';
import { formatUtils } from '@utils';
import { fetchSnapshots } from '../../../store/actions/index';

const Wrapper = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    color: ${colors.FONT_DARK};
`;

const NewAddressInputWrapper = styled.div`
    margin-bottom: 20px;
    display: flex;
`;

const AddButton = styled.button`
    background-color: ${colors.BLUE};
    color: ${colors.WHITE};
    border-radius: 5px;
    font-weight: ${variables.FONT_WEIGHT.DEMI_BOLD};
    padding: 8px 10px;
    font-size: ${variables.FONT_SIZE.NORMAL};
    border: none;
    margin-left: 10px;
    cursor: pointer;
    width: 240px;

    &:focus {
        outline: 0;
    }
`;

const InputWrapper = styled.div`
    margin: 5px 0;
    padding: 4px 5px 4px 0;
    display: flex;
    border: 1px solid ${colors.STROKE_GREY};
    border-radius: 5px;
`;

const ButtonsWrapper = styled.div`
    display: flex;
    align-items: center;
`;

const StyledIcon = styled(Icon)`
    margin: 0 10px;
    cursor: pointer;
`;

const BundleButton = styled.button<{ isBundled: boolean }>`
    display: flex;
    align-items: center;
    border: 1px solid ${colors.BLUE};
    color: ${props => (props.isBundled ? colors.WHITE : colors.BLUE)};
    padding: 5px 8px;
    background-color: ${props => (props.isBundled ? colors.BLUE : colors.WHITE)};
    border-radius: 5px;
    margin-left: 20px;
    margin-right: 20px;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    font-size: ${variables.FONT_SIZE.NORMAL};
    cursor: pointer;

    &:focus {
        /* border: 1px solid ${colors.BLUE}; */
        outline: 0;
    }
`;

const WatchedHeadline = styled.div`
    font-weight: ${variables.FONT_WEIGHT.DEMI_BOLD};
    font-size: ${variables.FONT_SIZE.NORMAL};
    text-align: left;
    margin-bottom: 10px;
    margin-top: 20px;
`;

const CheckIcon = styled(Icon)`
    margin-left: 5px;
`;

const AddressModal = () => {
    const dispatch = useDispatch();
    const allAddresses: AllAddressesGlobal = useSelector(state => state.allAddresses);
    const selectedAddress: string = useSelector(state => state.selectedAddress);

    const [address, setAddress] = useState('');
    const [isValidAddress, setIsValidAddress] = useState(false);

    const addNewAddress = address => {
        const addressTrimmed = address.trim().toLowerCase();
        if (validationUtils.isValidEthereumAddress(addressTrimmed)) {
            setIsValidAddress(true);
            dispatch({ type: actionTypes.ADD_NEW_ADDRESS, address: addressTrimmed });
            setAddress('');
        }
    };

    const setBundleAddress = address => {
        dispatch({ type: actionTypes.SET_BUNDLED_ADDRESS, address: address });
    };

    const deleteAddress = address => {
        // if you deleted just selected address
        console.log('deleting address: ', address);
        console.log('state address: ', selectedAddress);

        if (address === selectedAddress) {
            dispatch({ type: actionTypes.SET_ALL_POOLS, pools: {} });
            dispatch({ type: actionTypes.SET_SELECTED_ADDRESS, address: null });
        }

        dispatch({ type: actionTypes.DELETE_ADDRESS, address: address });
    };

    return (
        <Wrapper>
            <NewAddressInputWrapper>
                <Input
                    placeholder="Enter valid Ethereum address"
                    onChange={event => {
                        setAddress(event.target.value);
                    }}
                    useWhiteBackground
                    useDarkBorder
                    value={address}
                />
                <AddButton onClick={() => addNewAddress(address)}>Add to watchlist</AddButton>
            </NewAddressInputWrapper>

            {Object.keys(allAddresses).length > 0 && (
                <>
                    <WatchedHeadline>Watched addresses</WatchedHeadline>
                    {Object.keys(allAddresses).map(address => (
                        <InputWrapper key={address}>
                            <Input value={address} disabled useWhiteBackground noBorder />
                            <ButtonsWrapper>
                                <BundleButton
                                    isBundled={allAddresses[address].bundled}
                                    onClick={() => setBundleAddress(address)}
                                >
                                    {allAddresses[address].bundled ? (
                                        <>
                                            Bundled
                                            <CheckIcon
                                                icon="check"
                                                size={16}
                                                color={colors.WHITE}
                                            />
                                        </>
                                    ) : (
                                        'Bundle'
                                    )}
                                </BundleButton>
                                {/* <StyledIcon icon="edit" size={16} color={colors.FONT_LIGHT} /> */}
                                {/* <StyledIcon icon="copy" size={20} color={colors.FONT_LIGHT} /> */}
                                <StyledIcon
                                    icon="close"
                                    size={20}
                                    color={colors.FONT_LIGHT}
                                    onClick={() => deleteAddress(address)}
                                />
                            </ButtonsWrapper>
                        </InputWrapper>
                    ))}
                </>
            )}
        </Wrapper>
    );
};

export default AddressModal;
