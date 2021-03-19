import * as actionTypes from '@actionTypes';
import { Icon, Spinner } from '@components/ui';
import { analytics, colors, firebase, styles, variables, web3 } from '@config';
import { useSelector } from '@reducers';
import { validationUtils } from '@utils';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';
import Features from './components/Features';
import LandingPageText from './components/LandingPageText';

const CONTENT_WIDTH = 1200;
const INPUT_HEIGHT = '66px';
const INPUT_HEIGHT_SMALL = '50px';
const INPUT_BORDER_RADIUS = '10px';

const MainWrapper = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    background-color: ${props => props.theme.BG_WHITE};
    padding-bottom: 100px;

    ${styles.scrollBarStyles};

    @media (max-width: ${variables.SCREEN_SIZE.SM}) {
        padding-left: 10px;
        padding-right: 10px;
    }
`;

const AnimatedWrapper = styled.div`
    width: 100%;
    max-width: 740px;
`;
const ContentWrapper = styled.div`
    max-width: ${CONTENT_WIDTH}px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
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
    margin: 0 30px;
    display: flex;
    justify-content: center;

    @media (max-width: ${variables.SCREEN_SIZE.SM}) {
        padding: 5px;
        border-radius: 6px;
        margin: 0;
        flex-direction: column;
    }
`;

const AddressInput = styled.input<{ isDark: boolean }>`
    padding: 18px;
    margin-right: 10px;
    border: none;
    flex-grow: 1;
    font-size: 20px;
    cursor: text;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    color: ${props => props.theme.FONT_DARK};
    letter-spacing: 0.4px;
    border: 1px solid ${props => (props.isDark ? props.theme.STROKE_GREY : '#e7e9ed')};
    padding-left: 20px;
    border-radius: ${INPUT_BORDER_RADIUS};
    height: ${INPUT_HEIGHT};
    background-color: ${props => props.theme.BACKGROUND};

    &:focus {
        /* border: none; */
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
        height: ${INPUT_HEIGHT_SMALL};
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
    border-radius: ${INPUT_BORDER_RADIUS};
    text-decoration: none;
    transition: 0.1s;
    width: 130px;
    height: ${INPUT_HEIGHT};

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
        width: 125px;
        height: ${INPUT_HEIGHT_SMALL};
        border-radius: 5px;
        margin: 10px auto;
    }
`;

const PortisButtonWrapper = styled.div`
    display: flex;
    align-items: center;
    color: ${props => props.theme.FONT_MEDIUM};
    margin: 50px auto 10px auto;
    justify-content: center;

    @media (max-width: ${variables.SCREEN_SIZE.SM}) {
        margin-top: 10px;
    }
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

const Footer = styled.div`
    display: flex;
    align-items: center;
    width: 100%;
    height: 50px;
    justify-content: center;
    background-color: ${props => props.theme.BACKGROUND};
    color: ${props => props.theme.FONT_MEDIUM};
    font-size: ${variables.FONT_SIZE.SMALL};
`;

const FooterText = styled.div`
    margin-right: 6px;
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
    const theme = useSelector(state => state.app.theme);

    const handleAddressChange = async input => {
        setIsValidAddress(false);
        setLoadingEnsDomain(false); // just to double check

        // check for ETH address validity
        if (validationUtils.isValidEthereumAddress(input)) {
            setInputAddress(input);
            setIsValidAddress(true);
            setInputHexAddress(input.toLowerCase());
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
                    setInputHexAddress(ensHexAddress.toLocaleLowerCase());
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
            const initialAddressesObj = {};
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
        if (isValidAddress) {
            // fire custom Google Analytics event
            const initialAddressesObj = {};
            initialAddressesObj[inputHexAddress] = { bundled: false, ens: ensName || '' };

            dispatch({
                type: actionTypes.SET_ADDRESSES,
                addresses: initialAddressesObj,
            });
            dispatch({ type: actionTypes.SET_SELECTED_ADDRESS, address: inputAddress });

            const addressWithout0x = validationUtils.isHex(inputHexAddress)
                ? inputHexAddress.substring(2)
                : inputHexAddress;
            analytics.logEvent('landing_page_go_button', { address: addressWithout0x });

            // save new address to Firebase
            const firebaseRef = firebase.addresses(inputHexAddress);
            firebaseRef.set(true);
        }
    };

    return (
        <>
            <MainWrapper>
                <ContentWrapper>
                    {/* <TopBar>
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
                    </TopBar> */}

                    <AnimatedWrapper>
                        {/* <Fade direction="up" delay={400} triggerOnce> */}
                        <IllustrationWrapper>
                            <LandingPageText />
                        </IllustrationWrapper>
                        <AddressInputWrapper isDark={theme === 'dark'}>
                            <AddressInput
                                isDark={theme === 'dark'}
                                type="text"
                                spellCheck={false}
                                placeholder="Enter ENS domain or valid Ethereum address"
                                value={inputAddress}
                                onChange={event => {
                                    handleAddressChange(event.target.value.trim());
                                    setInputAddress(event.target.value.trim());
                                }}
                            />
                            <DashboardButton
                                onClick={e => {
                                    handleButtonOnClick();
                                }}
                                active={isValidAddress}
                                to={{
                                    pathname: isValidAddress ? '/dashboard' : '',
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
                                    <Spinner size={12} color="#4b6b9a" />
                                ) : (
                                    <Icon icon="portis" size={14} />
                                )}
                                <PortisButtonText>Portis</PortisButtonText>
                            </PortisButton>
                        </PortisButtonWrapper>
                        {/* </Fade> */}
                    </AnimatedWrapper>

                    <Features />
                </ContentWrapper>
            </MainWrapper>

            <Footer>
                <FooterText>Croco Finance @ 2021</FooterText>
                <Icon icon="croco_emoji" size={14} />
            </Footer>
        </>
    );
};
export default withRouter(LandingPage);
