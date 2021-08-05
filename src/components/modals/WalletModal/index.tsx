import { Modal } from '@components/layout';
import React, { useState, useEffect } from 'react';
import { constants } from '@config';
import { isMobile } from 'react-device-detect';
import Option from './Option';
import PendingView from './PendingView';
import { injected, portis } from '../../../connectors';
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import MetamaskIcon from '../../../data/images/icons/metamask.png';
import styled from 'styled-components';
import AccountDetails from '../../ui/AccountDetails';
import { usePrevious } from '../../../hooks';
import { useSelector, useDispatch } from 'react-redux';
import { closeModal } from '@actions';

const HeaderRow = styled.div`
    ${({ theme }) => theme.flexRowNoWrap};
    padding: 1rem 1rem;
    font-weight: 500;
    color: ${props => (props.color === 'blue' ? ({ theme }) => theme.primary1 : 'inherit')};
`;

const ContentWrapper = styled.div`
    background-color: ${({ theme }) => theme.bg0};
    padding: 0 1rem 1rem 1rem;
    border-bottom-left-radius: 20px;
    border-bottom-right-radius: 20px;
`;

const UpperSection = styled.div`
    position: relative;

    h5 {
        margin: 0;
        margin-bottom: 0.5rem;
        font-size: 1rem;
        font-weight: 400;
    }

    h5:last-child {
        margin-bottom: 0px;
    }

    h4 {
        margin-top: 0;
        font-weight: 500;
    }
`;

const OptionGrid = styled.div`
    display: grid;
    grid-gap: 10px;
`;

const HoverText = styled.div`
    text-decoration: none;
    color: ${({ theme }) => theme.text1};
    display: flex;
    align-items: center;

    :hover {
        cursor: pointer;
    }
`;

const WALLET_VIEWS = {
    OPTIONS: 'options',
    OPTIONS_SECONDARY: 'options_secondary',
    ACCOUNT: 'account',
    PENDING: 'pending',
};

interface Props {
    onCancel: () => void;
}

const WalletModal = (props: Props) => {
    const modalType = useSelector(state => state.modal.modalType);
    const dispatch = useDispatch();

    // important that these are destructed from the account-specific web3-react context
    const { active, account, connector, activate, error } = useWeb3React();

    const [walletView, setWalletView] = useState(WALLET_VIEWS.ACCOUNT);

    const [pendingWallet, setPendingWallet] = useState<AbstractConnector | undefined>();

    const [pendingError, setPendingError] = useState<boolean>();

    const previousAccount = usePrevious(account);

    // always reset to account view
    useEffect(() => {
        if (modalType === 'wallet') {
            setPendingError(false);
            setWalletView(WALLET_VIEWS.ACCOUNT);
        }
    }, [modalType]);

    // eslint-disable-next-line require-await
    const tryActivation = async (connector: AbstractConnector | undefined) => {
        let name = '';
        Object.keys(constants.SUPPORTED_WALLETS).map(key => {
            if (connector === constants.SUPPORTED_WALLETS[key].connector) {
                return (name = constants.SUPPORTED_WALLETS[key].name);
            }
            return true;
        });
        // log selected wallet
        setPendingWallet(connector); // set wallet for pending view
        setWalletView(WALLET_VIEWS.PENDING);

        // if the connector is walletconnect and the user has already tried to connect, manually reset the connector
        if (
            connector instanceof WalletConnectConnector &&
            connector.walletConnectProvider?.wc?.uri
        ) {
            connector.walletConnectProvider = undefined;
        }

        // eslint-disable-next-line no-unused-expressions
        connector &&
            activate(connector, undefined, true)
                .then(() => {
                    // close modal when connected
                    dispatch(closeModal());
                })
                .catch(error => {
                    if (error instanceof UnsupportedChainIdError) {
                        activate(connector); // a little janky...can't use setError because the connector isn't set
                    } else {
                        console.log('error:', error);
                        setPendingError(true);
                    }
                });
    };

    // get wallets user can switch too, depending on device/browser
    const getOptions = () => {
        const isMetamask = window.ethereum && window.ethereum.isMetaMask;
        return Object.keys(constants.SUPPORTED_WALLETS).map(key => {
            const option = constants.SUPPORTED_WALLETS[key];
            // check for mobile options
            if (isMobile) {
                // disable portis on mobile for now
                if (option.connector === portis) {
                    return null;
                }

                if (!window.web3 && !window.ethereum && option.mobile) {
                    return (
                        <Option
                            onClick={() => {
                                // eslint-disable-next-line no-unused-expressions
                                option.connector !== connector &&
                                    !option.href &&
                                    tryActivation(option.connector);
                            }}
                            id={`connect-${key}`}
                            key={key}
                            active={option.connector && option.connector === connector}
                            color={option.color}
                            link={option.href}
                            header={option.name}
                            subheader={null}
                            icon={option.iconURL}
                        />
                    );
                }
                return null;
            }

            // overwrite injected when needed
            if (option.connector === injected) {
                // don't show injected if there's no injected provider
                if (!(window.web3 || window.ethereum)) {
                    if (option.name === 'MetaMask') {
                        return (
                            <Option
                                id={`connect-${key}`}
                                key={key}
                                color="#E8831D"
                                header={<div>Install Metamask</div>}
                                subheader={null}
                                link="https://metamask.io/"
                                icon={MetamaskIcon}
                            />
                        );
                    }
                    return null; // dont want to return install twice
                }
                // don't return metamask if injected provider isn't metamask
                if (option.name === 'MetaMask' && !isMetamask) {
                    return null;
                }
                // likewise for generic
                if (option.name === 'Injected' && isMetamask) {
                    return null;
                }
            }

            // return rest of options
            return (
                !isMobile &&
                !option.mobileOnly && (
                    <Option
                        id={`connect-${key}`}
                        onClick={() => {
                            // eslint-disable-next-line no-unused-expressions
                            option.connector === connector
                                ? setWalletView(WALLET_VIEWS.ACCOUNT)
                                : !option.href && tryActivation(option.connector);
                        }}
                        key={key}
                        active={option.connector === connector}
                        color={option.color}
                        link={option.href}
                        header={option.name}
                        subheader={null} // use option.descriptio to bring back multi-line
                        icon={option.iconURL}
                    />
                )
            );
        });
    };

    function getModalContent() {
        if (error) {
            return (
                <UpperSection>
                    <HeaderRow>
                        {error instanceof UnsupportedChainIdError
                            ? 'Wrong Network'
                            : 'Error connecting'}
                    </HeaderRow>
                    <ContentWrapper>
                        {error instanceof UnsupportedChainIdError ? (
                            <h5>lease connect to the appropriate Ethereum network.</h5>
                        ) : (
                            'Error connecting. Try refreshing the page.'
                        )}
                    </ContentWrapper>
                </UpperSection>
            );
        }
        if (account && walletView === WALLET_VIEWS.ACCOUNT) {
            return (
                <AccountDetails
                    // toggleWalletModal={toggleWalletModal}
                    // pendingTransactions={pendingTransactions}
                    // confirmedTransactions={confirmedTransactions}
                    ENSName=""
                    openOptions={() => setWalletView(WALLET_VIEWS.OPTIONS)}
                />
            );
        }
        return (
            <UpperSection>
                {walletView !== WALLET_VIEWS.ACCOUNT ? (
                    <HeaderRow color="blue">
                        <HoverText
                            onClick={() => {
                                setPendingError(false);
                                setWalletView(WALLET_VIEWS.ACCOUNT);
                            }}
                        >
                            Back
                        </HoverText>
                    </HeaderRow>
                ) : (
                    <HeaderRow>
                        <HoverText>Connect to a wallet</HoverText>
                    </HeaderRow>
                )}

                <ContentWrapper>
                    {walletView === WALLET_VIEWS.PENDING ? (
                        <PendingView
                            connector={pendingWallet}
                            error={pendingError}
                            setPendingError={setPendingError}
                            tryActivation={tryActivation}
                        />
                    ) : (
                        <OptionGrid>{getOptions()}</OptionGrid>
                    )}
                </ContentWrapper>
            </UpperSection>
        );
    }

    return (
        <Modal
            cancelable
            onCancel={() => props.onCancel()}
            heading="Connect wallet"
            showHeaderBorder={false}
            descriptionAlign="left"
        >
            {getModalContent()}
        </Modal>
    );
};

export default WalletModal;
