/* eslint-disable no-else-return */
import React, { useContext } from 'react';
import { ExternalLink as LinkIcon } from 'react-feather';
import styled, { ThemeContext } from 'styled-components/macro';
import { fortmatic, injected, portis, walletconnect, walletlink } from '../../../connectors';
import CoinbaseWalletIcon from '../../../data/images/icons/coinbaseWalletIcon.svg';
import FortmaticIcon from '../../../data/images/icons/fortmaticIcon.png';
import PortisIcon from '../../../data/images/icons/portisIcon.png';
import WalletConnectIcon from '../../../data/images/icons/walletConnectIcon.svg';
// import Transaction from './Transaction';
import { ReactComponent as Close } from '../../../data/images/icons/x.svg';
import { SUPPORTED_WALLETS } from '../../../config/constants';
import { useActiveWeb3React } from '../../../hooks';
// import { ExternalLink } from '../../theme';
import { shortenAddress } from '../../../utils/format';
import { ExplorerDataType, getExplorerLink } from '../../../utils/getExplorerLink';
import Identicon from '../Identicon';
import Copy from './Copy';

const HeaderRow = styled.div`
    ${({ theme }) => theme.flexRowNoWrap};
    padding: 1rem 1rem;
    font-weight: 500;
    color: ${props => (props.color === 'blue' ? ({ theme }) => theme.primary1 : 'inherit')};
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

const InfoCard = styled.div`
    padding: 1rem;
    border-radius: 20px;
    position: relative;
    display: grid;
    grid-row-gap: 12px;
    margin-bottom: 20px;
`;

const AccountGroupingRow = styled.div`
    ${({ theme }) => theme.flexRowNoWrap};
    justify-content: space-between;
    align-items: center;
    display: flex;
    background-color: green;
    font-weight: 400;
    color: ${({ theme }) => theme.text1};

    div {
        ${({ theme }) => theme.flexRowNoWrap}
        align-items: center;
        background-color: yellow;
    }
`;

const AccountSection = styled.div`
    padding: 0rem 1rem;
`;

const YourAccount = styled.div`
    h5 {
        margin: 0 0 1rem 0;
        font-weight: 400;
    }

    h4 {
        margin: 0;
        font-weight: 500;
    }
`;

const LowerSection = styled.div`
    ${({ theme }) => theme.flexColumnNoWrap}
    padding: 1.5rem;
    flex-grow: 1;
    overflow: auto;
    background-color: ${({ theme }) => theme.bg2};
    border-bottom-left-radius: 20px;
    border-bottom-right-radius: 20px;

    h5 {
        margin: 0;
        font-weight: 400;
        color: ${({ theme }) => theme.text3};
    }
`;

const AccountControl = styled.div`
    display: flex;
    justify-content: space-between;
    min-width: 0;
    width: 100%;

    font-weight: 500;
    font-size: 1.25rem;

    background-color: red;

    a:hover {
        text-decoration: underline;
    }

    p {
        min-width: 0;
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
`;

const AddressLink = styled.a<{ hasENS: boolean; isENS: boolean }>`
    font-size: 0.825rem;
    color: ${({ theme }) => theme.text3};
    margin-left: 1rem;
    font-size: 0.825rem;
    display: flex;
    :hover {
        color: ${({ theme }) => theme.text2};
    }
`;

const CloseIcon = styled.div`
    position: absolute;
    right: 1rem;
    top: 14px;
    &:hover {
        cursor: pointer;
        opacity: 0.6;
    }
`;

const CloseColor = styled(Close)`
    path {
        stroke: ${({ theme }) => theme.text4};
    }
`;

const WalletName = styled.div`
    width: initial;
    font-size: 0.825rem;
    font-weight: 500;
    color: ${({ theme }) => theme.text3};
`;

const IconWrapper = styled.div<{ size?: number }>`
    ${({ theme }) => theme.flexColumnNoWrap};
    align-items: center;
    justify-content: center;
    margin-right: 8px;
    & > img,
    span {
        height: ${({ size }) => (size ? `${size}px` : '32px')};
        width: ${({ size }) => (size ? `${size}px` : '32px')};
    }
`;

// const TransactionListWrapper = styled.div`
//     ${({ theme }) => theme.flexColumnNoWrap};
// `;

const WalletAction = styled.button`
    width: fit-content;
    font-weight: 400;
    margin-left: 8px;
    font-size: 0.825rem;
    padding: 4px 6px;
    :hover {
        cursor: pointer;
        text-decoration: underline;
    }
`;

const MainWalletAction = styled(WalletAction)`
    color: ${({ theme }) => theme.primary1};
`;

// function renderTransactions(transactions: string[]) {
//     return (
//         <TransactionListWrapper>
//             {transactions.map((hash, i) => (
//                 // eslint-disable-next-line react/no-array-index-key
//                 <Transaction key={i} hash={hash} />
//             ))}
//         </TransactionListWrapper>
//     );
// }

interface AccountDetailsProps {
    // toggleWalletModal: () => void;
    // pendingTransactions: string[];
    // confirmedTransactions: string[];
    ENSName?: string;
    openOptions: () => void;
}

export default function AccountDetails({
    // toggleWalletModal,
    // pendingTransactions,
    // confirmedTransactions,
    ENSName,
    openOptions,
}: AccountDetailsProps) {
    const { chainId, account, connector } = useActiveWeb3React();

    function formatConnectorName() {
        const { ethereum } = window;
        const isMetaMask = !!(ethereum && ethereum.isMetaMask);
        const name = Object.keys(SUPPORTED_WALLETS)
            .filter(
                k =>
                    SUPPORTED_WALLETS[k].connector === connector &&
                    (connector !== injected || isMetaMask === (k === 'METAMASK')),
            )
            .map(k => SUPPORTED_WALLETS[k].name)[0];
        return <WalletName>Connected with {name}</WalletName>;
    }

    function getStatusIcon() {
        if (connector === injected) {
            return (
                <IconWrapper size={16}>
                    <Identicon />
                </IconWrapper>
            );
        } else if (connector === walletconnect) {
            return (
                <IconWrapper size={16}>
                    <img src={WalletConnectIcon} alt="WalletConnect logo" />
                </IconWrapper>
            );
        } else if (connector === walletlink) {
            return (
                <IconWrapper size={16}>
                    <img src={CoinbaseWalletIcon} alt="Coinbase Wallet logo" />
                </IconWrapper>
            );
        } else if (connector === fortmatic) {
            return (
                <IconWrapper size={16}>
                    <img src={FortmaticIcon} alt="Fortmatic logo" />
                </IconWrapper>
            );
        } else if (connector === portis) {
            return (
                <>
                    <IconWrapper size={16}>
                        <img src={PortisIcon} alt="Portis logo" />
                        <MainWalletAction
                            onClick={() => {
                                portis.portis.showPortis();
                            }}
                        >
                            Show Portis
                        </MainWalletAction>
                    </IconWrapper>
                </>
            );
        }
        return null;
    }

    // const clearAllTransactionsCallback = useCallback(() => {
    //     if (chainId) dispatch(clearAllTransactions({ chainId }));
    // }, [dispatch, chainId]);

    return (
        <>
            <UpperSection>
                {/* <CloseIcon onClick={toggleWalletModal}>
                    <CloseColor />
                </CloseIcon> */}
                <HeaderRow>Account</HeaderRow>
                <AccountSection>
                    <YourAccount>
                        <InfoCard>
                            <AccountGroupingRow>
                                {formatConnectorName()}
                                <div style={{ backgroundColor: 'pink' }}>
                                    {connector !== injected && connector !== walletlink && (
                                        <WalletAction
                                            style={{
                                                fontSize: '.825rem',
                                                fontWeight: 400,
                                                marginRight: '8px',
                                            }}
                                            onClick={() => {
                                                (connector as any).close();
                                            }}
                                        >
                                            Disconnect
                                        </WalletAction>
                                    )}
                                    <WalletAction
                                        style={{ fontSize: '.825rem', fontWeight: 400 }}
                                        onClick={() => {
                                            openOptions();
                                        }}
                                    >
                                        Change
                                    </WalletAction>
                                </div>
                            </AccountGroupingRow>
                            <AccountGroupingRow id="web3-account-identifier-row">
                                <AccountControl>
                                    {ENSName ? (
                                        <>
                                            <div style={{ backgroundColor: 'pink' }}>
                                                {getStatusIcon()}
                                                <p> {ENSName}</p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div style={{ backgroundColor: 'purple' }}>
                                                {getStatusIcon()}
                                                <p> {account && shortenAddress(account)}</p>
                                            </div>
                                        </>
                                    )}
                                </AccountControl>
                            </AccountGroupingRow>
                            <AccountGroupingRow>
                                {ENSName ? (
                                    <>
                                        <AccountControl>
                                            <div style={{ display: 'flex' }}>
                                                {account && (
                                                    <Copy toCopy={account}>
                                                        <span style={{ marginLeft: '4px' }}>
                                                            Copy Address
                                                        </span>
                                                    </Copy>
                                                )}
                                                {chainId && account && (
                                                    <AddressLink
                                                        hasENS={!!ENSName}
                                                        isENS
                                                        href={getExplorerLink(
                                                            chainId,
                                                            ENSName,
                                                            ExplorerDataType.ADDRESS,
                                                        )}
                                                    >
                                                        <LinkIcon size={16} />
                                                        <span style={{ marginLeft: '4px' }}>
                                                            View on Explorer
                                                        </span>
                                                    </AddressLink>
                                                )}
                                            </div>
                                        </AccountControl>
                                    </>
                                ) : (
                                    <>
                                        <AccountControl>
                                            <div style={{ backgroundColor: 'orange' }}>
                                                {account && (
                                                    <Copy toCopy={account}>
                                                        <span style={{ marginLeft: '4px' }}>
                                                            Copy Address
                                                        </span>
                                                    </Copy>
                                                )}
                                                {chainId && account && (
                                                    <AddressLink
                                                        hasENS={!!ENSName}
                                                        isENS={false}
                                                        href={getExplorerLink(
                                                            chainId,
                                                            account,
                                                            ExplorerDataType.ADDRESS,
                                                        )}
                                                    >
                                                        <LinkIcon size={16} />
                                                        <span style={{ marginLeft: '4px' }}>
                                                            View on Explorer
                                                        </span>
                                                    </AddressLink>
                                                )}
                                            </div>
                                        </AccountControl>
                                    </>
                                )}
                            </AccountGroupingRow>
                        </InfoCard>
                    </YourAccount>
                </AccountSection>
            </UpperSection>
            {/* {!!pendingTransactions.length || !!confirmedTransactions.length ? (
                <LowerSection>
                    <AutoRow mb="1rem" style={{ justifyContent: 'space-between' }}>
                        Recent Transactions
                        <LinkStyledButton onClick={clearAllTransactionsCallback}>
                            (clear all)
                        </LinkStyledButton>
                    </AutoRow>
                    {renderTransactions(pendingTransactions)}
                    {renderTransactions(confirmedTransactions)}
                </LowerSection>
            ) : (
                <LowerSection>Your transactions will appear here...</LowerSection>
            )} */}
        </>
    );
}
