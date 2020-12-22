import { Icon, PageLogo, Spinner, TokenLogo, TextBadge, DarkModeSwitch } from '@components/ui';
import { analytics, colors, constants, variables } from '@config';
import Portis from '@portis/web3';
import { validationUtils } from '@utils';
import React, { useState, useEffect } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';
import Web3 from 'web3';
import LandingPageText from './components/LandingPageText';
import { useDispatch } from 'react-redux';
import * as actionTypes from '@actionTypes';
import { portis, web3 } from '@config';
import { useTheme } from '@hooks';
import { useSelector } from '@reducers';

const CONTENT_WIDTH = 1000;

const MainWrapper = styled.div`
    height: 100vh;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 0 20px;
    background-color: ${props => props.theme.BACKGROUND_LIGHT};

    @media (max-width: ${variables.SCREEN_SIZE.SM}) {
        padding: 0 10px;
    }
`;

const DarkModeSwitchWrapper = styled.div`
    position: fixed;
    display: flex;
    align-items: center;
    justify-content: center;
    top: 8px;
    right: 10px;

    @media (max-width: ${CONTENT_WIDTH + 100}px) {
        position: static;
    }
`;

const AnimatedWrapper = styled.div`
    animation: showup 1.8s;
    width: 100%;
    max-width: 740px;

    @keyframes showup {
        0% {
            opacity: 0;
            transform: translateY(8%);
        }

        100% {
            opacity: 1;
            transform: translateY(0%);
        }
    }

    @media (max-width: ${variables.SCREEN_SIZE.SM}) {
        max-width: 600px;
    }
`;
const ContentWrapper = styled.div`
    max-width: ${CONTENT_WIDTH}px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const TopBar = styled.div`
    display: flex;
    width: 100%;
    height: 64px;
    flex-direction: row;
    align-items: center;
`;

const PageLogoWrapper = styled.div`
    display: flex;
    padding-bottom: 4px; // to align with social icons. TODO make the alignment better way
`;

const CommunityIconsWrapper = styled.div`
    display: flex;
    width: 100%;
    justify-content: flex-end;
`;

const IconLinkWrapper = styled.a`
    text-decoration: none;
    cursor: pointer;
    margin: 0 10px;
    display: flex;
    align-items: center;

    &:hover {
        text-decoration: none;
    }
`;
const IllustrationWrapper = styled.h1`
    margin-top: 115px;
    margin-bottom: 60px;

    @media (max-width: 900px) {
        font-size: ${variables.FONT_SIZE.NORMAL};
        margin-top: 90px;
    }
`;

const AddressInputWrapper = styled.div<{ isDark: boolean }>`
    background-color: ${props => props.theme.BG_WHITE};
    margin: 0 30px;
    display: flex;
    justify-content: center;
    border: 1px solid ${props => (props.isDark ? props.theme.STROKE_GREY : props.theme.BACKGROUND)};
    padding: 8px;
    border-radius: 18px;
    box-shadow: rgb(12 22 53 / 11%) 0px 8px 40px;

    @media (max-width: ${variables.SCREEN_SIZE.SM}) {
        padding: 5px;
        border-radius: 6px;
        margin: 0;
    }
`;

const AddressInput = styled.input`
    padding: 18px;
    margin-right: 10px;
    border: none;
    flex-grow: 1;
    font-size: 20px;
    cursor: text;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    color: ${props => props.theme.FONT_DARK};
    letter-spacing: 0.4px;
    background-color: inherit;

    &:focus {
        border: none;
        outline: none;
    }

    &::placeholder {
        color: ${props => props.theme.FONT_LIGHT};
        /* color: #c4c4c8; */
    }
    @media (max-width: ${variables.SCREEN_SIZE.SM}) {
        font-size: ${variables.FONT_SIZE.SMALL};
        padding: 8px;
        margin-right: 5px;
    }
`;

const DashboardButton = styled(Link)<{ active: boolean }>`
    padding: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    background-color: ${props => props.theme.BUTTON_PRIMARY_BG};
    color: white;
    font-weight: ${variables.FONT_WEIGHT.BOLD};
    font-size: 20px;
    border: none;
    border-radius: 10px;
    text-decoration: none;
    transition: 0.1s;
    width: 130px;
    height: 66px;

    &:hover {
        background-color: ${props => props.theme.BUTTON_PRIMARY_BG_HOVER};
    }

    ${props =>
        !props.active &&
        css`
            cursor: not-allowed;
            background-color: ${props => props.theme.BUTTON_PRIMARY_BG_DISABLED};
            color: ${props => props.theme.BUTTON_PRIMARY_FONT_DISABLED};

            &:hover {
                background-color: ${props => props.theme.BUTTON_PRIMARY_BG_DISABLED};
                color: ${props => props.theme.BUTTON_PRIMARY_FONT_DISABLED};
            }
        `}
    @media (max-width: ${variables.SCREEN_SIZE.SM}) {
        font-size: ${variables.FONT_SIZE.NORMAL};
        font-weight: ${variables.FONT_WEIGHT.DEMI_BOLD};
        padding: 5px;
        width: 85px;
        height: 40px;
        border-radius: 5px;
    }
`;

const PortisButtonWrapper = styled.div`
    display: flex;
    align-items: center;
    color: ${props => props.theme.FONT_MEDIUM};
    margin: 50px auto 10px auto;
    justify-content: center;
`;

const PortisButton = styled.button`
    display: flex;
    align-items: center;
    border: none;
    padding: 6px 8px;
    color: #4b6b9aff;
    outline: none;
    background-color: ${props => props.theme.BUTTON_PORTIS_BG};
    font-weight: ${variables.FONT_WEIGHT.DEMI_BOLD};
    font-size: ${variables.FONT_SIZE.SMALL};
    border-radius: 5px;
    margin-left: 8px;
    cursor: pointer;

    &:hover {
        background-color: ${props => props.theme.BUTTON_PORTIS_BG_HOVER};
    }
`;

const PortisButtonText = styled.div`
    margin-left: 4px;
`;

const SupportedExchangesWrapper = styled.div`
    border-top: 1px solid ${props => props.theme.STROKE_GREY};
    padding-top: 35px;
    margin-top: 46px;
    color: ${props => props.theme.FONT_MEDIUM};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    /* display: flex; */
`;

const ExchangeLogosWrapper = styled.div`
    display: flex;
    justify-content: center;
    margin-top: 30px;
`;

const ExchangeLogoWrapper = styled.div`
    margin: 10px 20px;
    display: flex;
    flex-direction: column;
    position: relative;
`;

const ExchangeName = styled.div`
    margin-top: 10px;
    color: ${props => props.theme.FONT_LIGHT};
    font-weight: ${variables.FONT_WEIGHT.REGULAR};
    /* font-size: ${variables.FONT_SIZE.TINY}; */
`;

const StyledTextBadge = styled(TextBadge)`
    top: -8px;
    right: -8px;
`;

// props: RouteComponentProps<any>
const LandingPage = (props: RouteComponentProps<any>) => {
    const dispatch = useDispatch();
    const [inputAddress, setInputAddress] = useState('');
    const [inputHexAddress, setInputHexAddress] = useState('');
    const [ensName, setEnsName] = useState('');
    const [portisLoading, setPortisLoading] = useState(false);
    const [isValidAddress, setIsValidAddress] = useState(false);
    const [loadingEnsDomain, setLoadingEnsDomain] = useState(false);
    const theme = useSelector(state => state.theme);

    const handleAddressChange = async input => {
        setIsValidAddress(false);
        setLoadingEnsDomain(false); // just to double check

        // check for ETH address validity
        if (validationUtils.isValidEthereumAddress(input)) {
            setInputAddress(input);
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
                    setLoadingEnsDomain(false);
                    setInputAddress(input);
                    setIsValidAddress(true);
                    setEnsName(input);
                    setInputHexAddress(ensHexAddress);
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

    const handlePortisLogin = async () => {
        setPortisLoading(true);
        try {
            const accounts = await web3.eth.getAccounts();
            setPortisLoading(false);
            let initialAddressesObj = {};
            initialAddressesObj[accounts[0]] = { bundled: false, ens: '' };

            dispatch({
                type: actionTypes.SET_ADDRESSES,
                addresses: initialAddressesObj,
            });

            dispatch({ type: actionTypes.SET_SELECTED_ADDRESS, address: accounts[0] });
            props.history.push({
                pathname: `/dashboard`,
            });
        } catch (e) {
            console.log('Error when trying to log in using Portis');
            setPortisLoading(false);
        }
    };

    const handleButtonOnClick = () => {
        // fire custom Google Analytics event
        let initialAddressesObj = {};
        initialAddressesObj[inputHexAddress] = { bundled: false, ens: ensName ? ensName : '' };

        dispatch({
            type: actionTypes.SET_ADDRESSES,
            addresses: initialAddressesObj,
        });
        dispatch({ type: actionTypes.SET_SELECTED_ADDRESS, address: inputAddress });
        analytics.Event('ADDRESS INPUT', "Landing Page let's go button pressed", inputAddress);
    };

    return (
        <MainWrapper>
            <ContentWrapper>
                <TopBar>
                    <PageLogoWrapper>
                        <PageLogo height={20} />
                    </PageLogoWrapper>
                    <CommunityIconsWrapper>
                        <IconLinkWrapper
                            rel="noreferrer"
                            target="_blank"
                            href={constants.DISCORD_LINK}
                        >
                            <Icon icon="discord" size={20} />
                        </IconLinkWrapper>
                        <IconLinkWrapper
                            rel="noreferrer"
                            target="_blank"
                            href={constants.TELEGRAM_LINK}
                        >
                            <Icon icon="telegram" size={20} />
                        </IconLinkWrapper>
                        <IconLinkWrapper
                            rel="noreferrer"
                            target="_blank"
                            href={constants.TWITTER_LINK}
                        >
                            <Icon icon="twitter" size={20} />
                        </IconLinkWrapper>
                        <DarkModeSwitchWrapper>
                            <DarkModeSwitch />
                        </DarkModeSwitchWrapper>
                    </CommunityIconsWrapper>
                </TopBar>

                <AnimatedWrapper>
                    <IllustrationWrapper>
                        <LandingPageText />
                    </IllustrationWrapper>
                    <AddressInputWrapper isDark={theme === 'dark'}>
                        <AddressInput
                            type="text"
                            spellCheck={false}
                            placeholder="Enter ENS domain or valid Ethereum address"
                            value={inputAddress}
                            onChange={event => {
                                handleAddressChange(event.target.value.trim());
                                setInputAddress(event.target.value.trim());
                            }}
                        ></AddressInput>
                        <DashboardButton
                            onClick={e => {
                                handleButtonOnClick();
                            }}
                            active={isValidAddress}
                            to={{
                                pathname: '/dashboard',
                            }}
                        >
                            {loadingEnsDomain ? (
                                <Spinner size={14} color={colors.FONT_MEDIUM} />
                            ) : (
                                "Let's Go!"
                            )}
                        </DashboardButton>
                    </AddressInputWrapper>
                    <PortisButtonWrapper>
                        Or log in using
                        <PortisButton onClick={handlePortisLogin}>
                            {portisLoading ? (
                                <Spinner size={12} color={'#4b6b9a'} />
                            ) : (
                                <Icon icon="portis" size={14} />
                            )}
                            <PortisButtonText>Portis</PortisButtonText>
                        </PortisButton>
                    </PortisButtonWrapper>
                    <SupportedExchangesWrapper>
                        <div>We support</div>
                        <ExchangeLogosWrapper>
                            <ExchangeLogoWrapper>
                                <TokenLogo
                                    symbol={theme === 'light' ? 'uniswap' : 'uni_v2dark'}
                                    size={38}
                                />
                                <ExchangeName>Uniswap</ExchangeName>
                            </ExchangeLogoWrapper>
                            <ExchangeLogoWrapper>
                                <TokenLogo
                                    symbol={theme === 'light' ? 'balancer' : 'balancerdark'}
                                    size={38}
                                />
                                <ExchangeName>Balancer</ExchangeName>
                            </ExchangeLogoWrapper>
                            <ExchangeLogoWrapper>
                                {/* <StyledTextBadge>SOON</StyledTextBadge> */}
                                <TokenLogo
                                    symbol={theme === 'light' ? 'sushiswap' : 'sushidark'}
                                    size={38}
                                />
                                <ExchangeName>SushiSwap</ExchangeName>
                            </ExchangeLogoWrapper>
                        </ExchangeLogosWrapper>
                    </SupportedExchangesWrapper>
                </AnimatedWrapper>
            </ContentWrapper>
        </MainWrapper>
    );
};
export default withRouter(LandingPage);
