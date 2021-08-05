/* eslint-disable no-else-return */
import { AbstractConnector } from '@web3-react/abstract-connector';
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core';
import { darken } from 'polished';
import React, { useMemo } from 'react';
import { Activity } from 'react-feather';
import styled, { css } from 'styled-components/macro';
import CoinbaseWalletIcon from '../../../data/images/icons/coinbaseWalletIcon.svg';
import FortmaticIcon from '../../../data/images/icons/fortmaticIcon.png';
import PortisIcon from '../../../data/images/icons/portisIcon.png';
import WalletConnectIcon from '../../../data/images/icons/walletConnectIcon.svg';
import { fortmatic, injected, portis, walletconnect, walletlink } from '../../../connectors';
import { NetworkContextName } from '../../../config/misc';
// import { isTransactionRecent, useAllTransactions } from '../../state/transactions/hooks';
// import { TransactionDetails } from '../../state/transactions/reducer';
import { shortenAddress } from '../../../utils/format';
import { useSelector, useDispatch } from 'react-redux';

import Identicon from '../Identicon';
import Spinner from '../Spinner';

import { openModal } from '@actions';

const IconWrapper = styled.div<{ size?: number }>`
    align-items: center;
    justify-content: center;
    & > * {
        height: ${({ size }) => (size ? `${size}px` : '32px')};
        width: ${({ size }) => (size ? `${size}px` : '32px')};
    }
`;

const Web3StatusGeneric = styled.button`
    width: 100%;
    align-items: center;
    padding: 0.5rem;
    border-radius: 12px;
    cursor: pointer;
    user-select: none;
`;
const Web3StatusError = styled(Web3StatusGeneric)`
    color: ${({ theme }) => theme.white};
    font-weight: 500;
`;

const Web3StatusConnect = styled(Web3StatusGeneric)<{ faded?: boolean }>`
    border: none;
    font-weight: 500;
`;

const Web3StatusConnected = styled(Web3StatusGeneric)<{ pending?: boolean }>`
    background-color: ${({ pending, theme }) => (pending ? 'orange' : 'blue')};
    border: 1px solid ${({ pending, theme }) => (pending ? 'orange' : 'blue')};
    color: ${({ pending, theme }) => (pending ? 'red' : 'white')};
    font-weight: 500;
`;

const Text = styled.p`
    flex: 1 1 auto;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin: 0 0.5rem 0 0.25rem;
    font-size: 1rem;
    width: fit-content;
    font-weight: 500;
`;

const NetworkIcon = styled(Activity)`
    margin-left: 0.25rem;
    margin-right: 0.5rem;
    width: 16px;
    height: 16px;
`;

// we want the latest one to come first, so return negative if a is after b
// function newTransactionsFirst(a: TransactionDetails, b: TransactionDetails) {
//     return b.addedTime - a.addedTime;
// }

// eslint-disable-next-line react/prop-types
function StatusIcon({ connector }: { connector: AbstractConnector }) {
    if (connector === injected) {
        return <Identicon />;
    } else if (connector === walletconnect) {
        return (
            <IconWrapper size={16}>
                <img src={WalletConnectIcon} alt="WalletConnect" />
            </IconWrapper>
        );
    } else if (connector === walletlink) {
        return (
            <IconWrapper size={16}>
                <img src={CoinbaseWalletIcon} alt="CoinbaseWallet" />
            </IconWrapper>
        );
    } else if (connector === fortmatic) {
        return (
            <IconWrapper size={16}>
                <img src={FortmaticIcon} alt="Fortmatic" />
            </IconWrapper>
        );
    } else if (connector === portis) {
        return (
            <IconWrapper size={16}>
                <img src={PortisIcon} alt="Portis" />
            </IconWrapper>
        );
    }
    return null;
}

function Web3StatusInner() {
    const dispatch = useDispatch();
    const { account, connector, error } = useWeb3React();

    const ENSName = '';

    // const allTransactions = useAllTransactions();

    // const sortedRecentTransactions = useMemo(() => {
    //     const txs = Object.values(allTransactions);
    //     return txs.filter(isTransactionRecent).sort(newTransactionsFirst);
    // }, [allTransactions]);

    // const pending = sortedRecentTransactions.filter(tx => !tx.receipt).map(tx => tx.hash);
    // const hasPendingTransactions = !!pending.length;
    // const toggleWalletModal = useWalletModalToggle();
    const hasPendingTransactions = false;

    console.log('account', account);
    if (account) {
        return (
            <Web3StatusConnected
                id="web3-status-connected"
                onClick={() => {
                    dispatch(openModal({ type: 'wallet' }));
                }}
                pending={hasPendingTransactions}
            >
                {hasPendingTransactions ? (
                    <>
                        <Text>{pending?.length} Pending</Text> <Spinner />
                    </>
                ) : (
                    <>
                        <Text>{ENSName || shortenAddress(account)}</Text>
                    </>
                )}
                {!hasPendingTransactions && connector && <StatusIcon connector={connector} />}
            </Web3StatusConnected>
        );
    } else if (error) {
        return (
            <Web3StatusError
                onClick={() => {
                    dispatch(openModal({ type: 'wallet' }));
                }}
            >
                <NetworkIcon />
                <Text>{error instanceof UnsupportedChainIdError ? ' Wrong Network' : 'Error'}</Text>
            </Web3StatusError>
        );
    } else {
        return (
            <Web3StatusConnect
                id="connect-wallet"
                onClick={() => {
                    dispatch(openModal({ type: 'wallet' }));
                }}
                faded={!account}
            >
                <Text>Connect to a wallet</Text>
            </Web3StatusConnect>
        );
    }
}

export default function Web3Status() {
    const { active, account } = useWeb3React();
    const contextNetwork = useWeb3React(NetworkContextName);

    if (!contextNetwork.active && !active) {
        return null;
    }
    return (
        <>
            <Web3StatusInner />
        </>
    );
}
