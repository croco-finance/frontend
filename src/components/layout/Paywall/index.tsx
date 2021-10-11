import { styles, variables } from '@config';
import { useSelector } from '@reducers';
import React, { useState } from 'react';
import styled from 'styled-components';
import RightContentWrapper from '../RightContentWrapper';
import { useDispatch } from 'react-redux';
import { openModal } from '@actions';
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core';
import { Icon, Spinner, Web3Status } from '@components/ui';
import { NetworkContextName } from '../../../config/misc';

const Wrapper = styled.div`
    // padding: 28px 10px;
    // border-radius: 10px;
    // background-color: #f0f4ff;
    // border: 1px solid #e3e7f1;
`;

const H1 = styled.div`
    color: ${({ theme }) => theme.FONT_DARK};
    font-weight: ${variables.FONT_WEIGHT.BOLD};
    font-size: 20px;
`;
const Desc = styled.div`
    color: ${({ theme }) => theme.FONT_MEDIUM};
    font-weight: ${variables.FONT_WEIGHT.DEMI_BOLD};
    margin: 8px 0 4px 0px;
    font-size: 20px;
`;
const Button = styled.button`
    padding: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    background-color: ${props => props.theme.BUTTON_PRIMARY_BG};
    color: white;
    font-weight: ${variables.FONT_WEIGHT.DEMI_BOLD};
    font-size: 20px;
    border: none;
    border-radius: 10px;
    text-decoration: none;
    transition: 0.1s;
    margin: 0 auto;
    margin-top: 24px;

    &:hover {
        background-color: ${props => props.theme.BUTTON_PRIMARY_BG_HOVER};
    }
    @media (max-width: ${variables.SCREEN_SIZE.SM}) {
        font-size: ${variables.FONT_SIZE.NORMAL};
        font-weight: ${variables.FONT_WEIGHT.DEMI_BOLD};
        padding: 5px;
        width: 125px;
        border-radius: 5px;
        margin: 10px auto;
    }
`;

const ConnectedToWrapper = styled.div`
    display: flex;
    align-items: center;
`;

const ConnectedTo = styled.div`
    color: ${({ theme }) => theme.FONT_DARK};
    font-weight: ${variables.FONT_WEIGHT.BOLD};
    font-size: 20px;
`;

const Account = styled.div`
    padding: 8px 10px;
    border-radius: 26px;
    margin-left: 10px;
    background-color: ${({ theme }) => theme.GREEN};
    // color: ${({ theme }) => theme.FONT_MEDIUM};
    color: white;
    font-weight: ${variables.FONT_WEIGHT.DEMI_BOLD};
    font-size: 18px;
`;

const DemiBold = styled.span`
    font-weight: ${variables.FONT_WEIGHT.BOLD};
    // color: ${({ theme }) => theme.FONT_DARK};
    color: #34a13c;
`;

const NotHaveTokenDesc = styled.div`
    text-align: left;
    margin: 20px 0 30px 0;
`;
const Paywall = () => {
    const dispatch = useDispatch();
    const { active, account, connector, error } = useWeb3React();
    const contextNetwork = useWeb3React(NetworkContextName);
    const [paywallState, setPaywallState] = useState<
        'NOT_CONNECTED' | 'CONNECTED_NO_TOKEN' | 'CONNECTED_SUCCESS'
    >();
    const appIsLocked = useSelector(state => state.app.isLocked);

    const openWalletModal = () => {
        dispatch(openModal({ type: 'wallet' }));
    };

    if (!contextNetwork.active && !active) {
        return (
            <Wrapper>
                <H1>Croco is now available only to Croco Membership Token holders.</H1>
                <Desc>Connect your wallet to check if you have Croco token.</Desc>
                <Button onClick={() => openWalletModal()}>Connect Wallet</Button>

                <Web3Status />
            </Wrapper>
        );
    }

    if (account) {
        return (
            <Wrapper>
                <ConnectedToWrapper>
                    <ConnectedTo>Connected to:</ConnectedTo>
                    <Account> {account}</Account>
                </ConnectedToWrapper>
                <NotHaveTokenDesc>
                    <Desc>
                        Looks like you don't have <DemiBold>Croco Membership Token</DemiBold> on
                        connected address.
                    </Desc>
                    <Desc>
                        You need to have <DemiBold>Croco Membership Token</DemiBold> in order to use
                        Croco Finance.
                    </Desc>
                    <Desc>
                        The membership costs <DemiBold>0.01 ETH per month</DemiBold> and you get
                        access to all Croco Finance features.
                    </Desc>
                </NotHaveTokenDesc>

                <Button onClick={() => openWalletModal()}>Get Croco Membership Token</Button>
            </Wrapper>
        );
    }

    return null;
};

export default Paywall;
