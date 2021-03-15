import { resetPoolData } from '@actions';
import * as actionTypes from '@actionTypes';
import { Icon, Input, Spinner } from '@components/ui';
import { colors, firebase, variables, web3 } from '@config';
import { useTheme } from '@hooks';
import { useSelector } from '@reducers';
import { validationUtils } from '@utils';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';

const Wrapper = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    color: ${props => props.theme.FONT_DARK};
`;

const NewAddressInputWrapper = styled.div`
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    min-height: 74px;
`;

const AddButton = styled.button<{ disabled: boolean }>`
    background-color: ${props =>
        props.disabled ? props.theme.BUTTON_PRIMARY_BG_DISABLED : props.theme.BUTTON_PRIMARY_BG};
    color: ${props => (props.disabled ? props.theme.BUTTON_PRIMARY_FONT_DISABLED : colors.WHITE)};
    border-radius: 5px;
    font-weight: ${variables.FONT_WEIGHT.DEMI_BOLD};
    padding: 8px 10px;
    font-size: ${variables.FONT_SIZE.NORMAL};
    border: none;
    margin-left: 10px;
    cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
    width: 240px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:focus {
        outline: 0;
    }
`;

const InputWrapper = styled.div`
    margin: 5px 0;
    padding: 4px 10px 4px 0;
    display: flex;
    border: 1px solid ${props => props.theme.STROKE_GREY};
    border-radius: 5px;
    flex-direction: column;
`;

const MainRowWrapper = styled.div`
    display: flex;
`;

const EnsName = styled.div`
    color: ${props => props.theme.FONT_MEDIUM};
    text-align: left;
    padding-left: 20px;
    padding-bottom: 10px;
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
    border: 1px solid;
    border-color: ${props => props.theme.BUTTON_PRIMARY_BG};
    color: ${props => (props.isBundled ? colors.WHITE : props.theme.BLUE)};
    padding: 5px 8px;
    background-color: ${props =>
        props.isBundled ? props.theme.BUTTON_PRIMARY_BG : props.theme.BG_WHITE};
    border-radius: 5px;
    margin-left: 20px;
    margin-right: 20px;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    font-size: ${variables.FONT_SIZE.NORMAL};
    cursor: pointer;
    /* transition: 2.3s; */
    &:focus {
        /* border: 1px solid ${colors.BLUE}; */
        outline: 0;
    }

    /* &:hover {
        border-width: 2px;
    } */
`;

const WatchedHeadline = styled.div`
    font-weight: ${variables.FONT_WEIGHT.DEMI_BOLD};
    font-size: ${variables.FONT_SIZE.NORMAL};
    text-align: left;
    margin-bottom: 10px;
    margin-top: 20px;
    padding-left: 10px;
`;

const CheckIcon = styled(Icon)`
    margin-left: 5px;
`;

const MainInputWrapper = styled.div`
    display: flex;
    /* flex-direction: column; */
    flex-grow: 1;
`;

const AddressModal = () => {
    const dispatch = useDispatch();
    const { allAddresses, selectedAddress } = useSelector(state => state.app);

    const [ensName, setEnsName] = useState('');
    const [loadingEnsDomain, setLoadingEnsDomain] = useState(false);
    const [inputHexAddress, setInputHexAddress] = useState('');
    const [address, setAddress] = useState('');
    const [isValidAddress, setIsValidAddress] = useState(false);

    const theme = useTheme();

    const addNewAddress = async () => {
        const hexAddressProcessed = inputHexAddress.trim().toLowerCase();

        dispatch({ type: actionTypes.ADD_NEW_ADDRESS, address: hexAddressProcessed, ens: ensName });

        // save new address to Firebase
        const firebaseRef = firebase.addresses(hexAddressProcessed);
        const payload = await firebaseRef.set(true);

        // clear the input
        setAddress('');
    };

    const setBundleAddress = address => {
        dispatch({ type: actionTypes.SET_BUNDLED_ADDRESS, address: address });
    };

    const deleteAddress = address => {
        // if you deleted just selected address
        if (address === selectedAddress) {
            dispatch(resetPoolData());
            dispatch({ type: actionTypes.SET_SELECTED_ADDRESS, address: null });
        }

        dispatch({ type: actionTypes.DELETE_ADDRESS, address: address });
    };

    const handleAddressChange = async input => {
        setIsValidAddress(false);
        setLoadingEnsDomain(false); // just to double check

        // check for ETH address validity
        if (validationUtils.isValidEthereumAddress(input)) {
            setAddress(input);
            setIsValidAddress(true);
            setInputHexAddress(input);
            return;
        }

        // check if valid ENS name
        if (input.substring(input.length - 4) === '.eth') {
            try {
                setLoadingEnsDomain(true);
                const ensHexAddress = await web3.eth.ens.getAddress(input);
                if (ensHexAddress) {
                    setAddress(input);
                    setEnsName(input);
                    setInputHexAddress(ensHexAddress.toLocaleLowerCase());
                    setIsValidAddress(true);
                    setLoadingEnsDomain(false);
                    return;
                }
            } catch (e) {
                console.log('Could not get eth address from ENS name');
                setIsValidAddress(false);
            }
        }

        setIsValidAddress(false);
        setLoadingEnsDomain(false);
    };

    return (
        <Wrapper>
            <NewAddressInputWrapper>
                <MainInputWrapper>
                    <Input
                        placeholder="Enter ENS domain or valid Ethereum address"
                        onChange={event => {
                            handleAddressChange(event.target.value.trim());
                            setAddress(event.target.value.trim());
                        }}
                        useWhiteBackground
                        useDarkBorder
                        value={address}
                    />
                    <AddButton
                        onClick={() => {
                            addNewAddress();
                        }}
                        disabled={!isValidAddress}
                    >
                        {loadingEnsDomain ? (
                            <Spinner size={14} color={colors.FONT_MEDIUM} />
                        ) : (
                            'Add to watch list'
                        )}
                    </AddButton>
                </MainInputWrapper>
            </NewAddressInputWrapper>

            {Object.keys(allAddresses).length > 0 && (
                <>
                    <WatchedHeadline>Watched addresses</WatchedHeadline>
                    {Object.keys(allAddresses).map(address => {
                        // just double check the address is valid
                        if (address) {
                            return (
                                <InputWrapper key={address}>
                                    <MainRowWrapper>
                                        <Input
                                            value={address}
                                            disabled
                                            useWhiteBackground
                                            noBorder
                                        />
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
                                                color={theme.FONT_LIGHT}
                                                hoverColor={colors.RED}
                                                onClick={() => deleteAddress(address)}
                                            />
                                        </ButtonsWrapper>
                                    </MainRowWrapper>

                                    {allAddresses[address].ens && (
                                        <EnsName>{allAddresses[address].ens}</EnsName>
                                    )}
                                </InputWrapper>
                            );
                        } else return null;
                    })}
                </>
            )}
        </Wrapper>
    );
};

export default AddressModal;
