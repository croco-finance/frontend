import { Icon, PageLogo, Spinner } from '@components/ui';
import { analytics, colors, constants, variables } from '@config';
import Portis from '@portis/web3';
import { validationUtils } from '@utils';
import React, { useState, useEffect } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';
import Web3 from 'web3';
import LandingPageText from './components/LandingPageText';

const MainWrapper = styled.div`
    height: 100vh;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 0 20px;

    @media (max-width: ${variables.SCREEN_SIZE.SM}) {
        padding: 0 10px;
    }
`;

const AnimatedWrapper = styled.div`
    animation: showup 1.8s;
    width: 100%;
    max-width: 700px;

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
    max-width: 1000px;
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
    margin-top: 125px;
    margin-bottom: 60px;

    @media (max-width: 900px) {
        font-size: ${variables.FONT_SIZE.NORMAL};
        margin-top: 90px;
    }
`;

const AddressInputWrapper = styled.div`
    display: flex;
    justify-content: center;
    border: 1px solid ${colors.BACKGROUND};
    /* border: 7px solid ${colors.FONT_DARK}; */
    padding: 10px;
    /* max-width: 600px; */

    border-radius: 18px;
    box-shadow: rgb(12 22 53 / 11%) 0px 8px 40px;

    @media (max-width: ${variables.SCREEN_SIZE.SM}) {
        padding: 5px;
        border-radius: 6px;
    }
`;

const AddressInput = styled.input`
    padding: 20px;
    margin-right: 10px;
    border: none;
    flex-grow: 1;
    font-size: 20px;
    cursor: text;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    color: ${colors.FONT_DARK};
    letter-spacing: 0.4px;

    &:focus {
        border: none;
        outline: none;
    }

    &::placeholder {
        color: ${colors.FONT_LIGHT};
        /* color: #c4c4c8; */
    }
    @media (max-width: ${variables.SCREEN_SIZE.SM}) {
        font-size: ${variables.FONT_SIZE.SMALL};
        padding: 8px;
        margin-right: 5px;
    }
`;

const DashboardButton = styled(Link)<{ active: boolean }>`
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    background-color: ${colors.BLUE};
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
        background-color: #075cda;
    }

    ${props =>
        !props.active &&
        css`
            cursor: not-allowed;
            background-color: ${colors.BACKGROUND_DARK};

            &:hover {
                background-color: ${colors.BACKGROUND_DARK};
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
    color: ${colors.FONT_MEDIUM};
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
    background-color: #def3ff;
    font-weight: ${variables.FONT_WEIGHT.DEMI_BOLD};
    font-size: ${variables.FONT_SIZE.SMALL};
    border-radius: 5px;
    margin-left: 8px;
    cursor: pointer;

    &:hover {
        background-color: #caecff;
    }
`;

const PortisButtonText = styled.div`
    margin-left: 4px;
`;

const portis = new Portis(constants.PORTIS_DAPP_KEY, 'mainnet');
const web3 = new Web3(portis.provider);

// props: RouteComponentProps<any>
const LandingPage = (props: RouteComponentProps<any>) => {
    const [inputAddress, setInputAddress] = useState('');
    const [linkAddress, setLinkAddress] = useState('');
    const [portisLoading, setPortisLoading] = useState(false);
    const [isValidAddress, setIsValidAddress] = useState(false);
    const [loadingEnsDomain, setLoadingEnsDomain] = useState(false);

    // check if the address user typed in the input is valid Ethereum address
    const linkPath = isValidAddress ? `/dashboard/${linkAddress}` : '';

    const handleAddressChange = async input => {
        setIsValidAddress(false);
        setLoadingEnsDomain(false); // just to double check

        // check for ETH address validity
        if (validationUtils.isValidEthereumAddress(input)) {
            setInputAddress(input);
            setLinkAddress(input);
            setIsValidAddress(true);
            return;
        }

        // check if valid ENS name
        if (input.substring(input.length - 4) === '.eth') {
            try {
                setLoadingEnsDomain(true);
                const ensAddress = await web3.eth.ens.getAddress(input);
                if (ensAddress) {
                    setLoadingEnsDomain(false);
                    setInputAddress(input);
                    setIsValidAddress(true);
                    setLinkAddress(ensAddress);
                    return;
                }
            } catch (e) {
                console.log('Could not get eth address from ENS name');
                setIsValidAddress(false);
            }
        }

        setIsValidAddress(false);
        setLoadingEnsDomain(false);
        setLinkAddress(input);
        setLinkAddress('');
    };

    const handlePortisLogin = async () => {
        setPortisLoading(true);
        try {
            const accounts = await web3.eth.getAccounts();
            setPortisLoading(false);
            // TODO how Portis handles this in case the user have multiple accounts
            props.history.push({
                pathname: `/dashboard/${accounts[0]}`,
            });
        } catch (e) {
            console.log('Error when trying to log in using Portis');
            setPortisLoading(false);
        }
    };

    const handleButtonOnClick = () => {
        // fire custom Google Analytics event
        analytics.Event('ADDRESS INPUT', "Landing Page let's go button pressed", inputAddress);
    };

    // useEffect(() => {
    // TODO run this function only
    //     // check if there is any address stored in browser local storage
    //     // local storage is not accessible in discreet mode
    //     try {
    //         const addressLocalStorage = localStorage.getItem('address');

    //         // if there is some valid address, go directly to dashboard so that the user doesn't have to paste his address again
    //         if (addressLocalStorage) {
    //             props.history.push({
    //                 pathname: `/dashboard/${addressLocalStorage}`,
    //             });
    //         }
    //     } catch (e) {
    //         console.log('Error while trying to access local storage');
    //     }
    // }, []);

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
                    </CommunityIconsWrapper>
                </TopBar>

                <AnimatedWrapper>
                    <IllustrationWrapper>
                        <LandingPageText />
                    </IllustrationWrapper>
                    <AddressInputWrapper>
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
                                pathname: linkPath,
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
                </AnimatedWrapper>
            </ContentWrapper>
        </MainWrapper>
    );
};
export default withRouter(LandingPage);
