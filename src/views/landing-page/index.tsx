import * as actionTypes from '@actionTypes';
import { Icon, Spinner, Web3Status } from '@components/ui';
import { analytics, colors, firebase, styles, variables, web3 } from '@config';
import { useSelector } from '@reducers';
import { validationUtils } from '@utils';
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';
import Features from './components/Features';
import LandingPageText from './components/LandingPageText';
import { openModal } from '@actions';
import { Paywall } from '@components/layout';

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
    max-width: 880px;
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
    margin-bottom: 50px;

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

const BlueButton = styled.button`
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

type UnlockState = 'LOCKED' | 'UNLOCKED' | 'PENDING';
// props: RouteComponentProps<any>
const LandingPage = (props: RouteComponentProps<any>) => {
    const dispatch = useDispatch();
    const appIsLocked = useSelector(state => state.app.isLocked);
    const [inputAddress, setInputAddress] = useState('');
    const [inputHexAddress, setInputHexAddress] = useState('');
    const [ensName, setEnsName] = useState('');
    const [unlock, setUnclock] = useState<UnlockState>('PENDING');
    const [portisLoading, setPortisLoading] = useState(false);
    const [isValidAddress, setIsValidAddress] = useState(false);
    const [loadingEnsDomain, setLoadingEnsDomain] = useState(false);
    const theme = useSelector(state => state.app.theme);

    const unlockToken = () => {
        // eslint-disable-next-line no-unused-expressions
        console.log('UNLOCK window', window);
        const newWindow: any = window as any;
        console.log('newWindow.unlockProtocol', newWindow.unlockProtocol);
        if (newWindow.unlockProtocol) {
            newWindow.unlockProtocol.loadCheckoutModal(/* optional configuration */);
        }
    };

    const unlockHandler = e => {
        setUnclock(e.detail);
    };

    useEffect(() => {
        window.addEventListener('unlockProtocol', unlockHandler);

        window.addEventListener('unlockProtocol.status', (e: any) => {
            const state = e.detail;
            // the state is a string whose value can either be 'unlocked' or 'locked'...
            // If state is 'unlocked': implement code here which will be triggered when
            // the current visitor has a valid lock key
            // If state is 'locked': implement code here which will be
            // triggered when the current visitor does not have a valid lock key
        });

        // window.addEventListener('unlockProtocol.status', (event: any) => {
        //     // We hide all .unlock-content elements
        //     if (document && document.querySelector) {
        //         document.querySelector('.unlock-content').style.display = 'none';
        //         // We show only the relevant element
        //         document
        //             .querySelectorAll(`.unlock-content.${event.detail.state}`)
        //             .forEach(element => {
        //                 element.style.display = 'block';
        //             });
        //     }
        // });

        window.addEventListener('unlockProtocol.authenticated', (event: any) => {
            // event.detail.addresss includes the address of the current user, when known
        });

        window.addEventListener('unlockProtocol.transactionSent', (event: any) => {
            // event.detail.hash includes the hash of the transaction sent
        });

        return () => window.removeEventListener('unlockProtocol', unlockHandler);
    }, []);

    const openWalletModal = () => {
        dispatch(openModal({ type: 'wallet' }));
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
                        {/* <BlueButton onClick={() => unlockToken()}>Unlock!</BlueButton>
                        <div style={{ color: 'red' }}>unlock state: {unlock}</div>
                        <BlueButton onClick={() => openWalletModal()}>Connect Wallet</BlueButton>
                        <Web3Status /> */}
                        {appIsLocked ? <Paywall /> : null}
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
