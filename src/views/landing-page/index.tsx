import * as H from 'history';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { colors, variables, constants } from '../../config';
import { isValidEthereumAddress } from '../../utils/validation';
import { Icon, PageLogo, Spinner } from '../../components/ui';
import LandingPageText from './components/LandingPageText';
import Portis from '@portis/web3';
import Web3 from 'web3';
import { PORTIS_DAPP_KEY } from '../../config/constants';

const MainWrapper = styled.div`
    height: 100vh;
    width: 100%;
    display: flex;
    flex-direction: column;
    /* justify-content: center; */
    align-items: center;
    /* max-width: 800px; */
    text-align: center;
`;

const AnimatedWrapper = styled.div`
    animation: showup 1.8s;

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
`;
const ContentWrappper = styled.div`
    max-width: 1100px;
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
`;

const CommunityIconsWrapper = styled.div`
    display: flex;
    width: 100%;
    justify-content: flex-end;
`;

const IconLinkWrappper = styled.a`
    text-decoration: none;
    cursor: pointer;
    margin: 0 10px;

    &:hover {
        text-decoration: none;
    }
`;
const IllustrationWrapper = styled.h1`
    margin-top: 130px;
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
    letter-spacing: 0.5px;

    &:focus {
        border: none;
        outline: none;
    }

    &::placeholder {
        color: ${colors.FONT_LIGHT};
        /* color: #c4c4c8; */
    }
    @media (max-width: 900px) {
        font-size: ${variables.FONT_SIZE.NORMAL};
    }
`;

const DashboardButton = styled(Link)<{ isDisabled: boolean }>`
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
    min-width: 130px;
    min-height: 66px;

    &:hover {
        background-color: #075cda;
    }

    ${props =>
        props.isDisabled &&
        css`
            cursor: not-allowed;
            background-color: ${colors.BACKGROUND_DARK};

            &:hover {
                background-color: ${colors.BACKGROUND_DARK};
            }
        `}
    @media (max-width: 900px) {
        font-size: ${variables.FONT_SIZE.NORMAL};
        padding: 10px;
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

const portis = new Portis(PORTIS_DAPP_KEY, 'mainnet');
const web3 = new Web3(portis.provider);

interface RouteComponentProps<P> {
    match: match<P>;
    location: H.Location;
    history: H.History;
    staticContext?: any;
}

interface match<P> {
    params: P;
    isExact: boolean;
    path: string;
    url: string;
}

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
        if (isValidEthereumAddress(input)) {
            setInputAddress(input);
            setLinkAddress(input);
            setIsValidAddress(true);
            return;
        }

        // check if valid ENS name
        if (input.includes('.eth')) {
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

    return (
        <MainWrapper>
            <ContentWrappper>
                <TopBar>
                    <PageLogoWrapper>
                        <PageLogo height={20} />
                    </PageLogoWrapper>
                    <CommunityIconsWrapper>
                        <IconLinkWrappper
                            rel="noreferrer"
                            target="_blank"
                            href={constants.GITHUB_LINK}
                        >
                            <Icon icon="github" size={20} />
                        </IconLinkWrappper>
                        <IconLinkWrappper
                            rel="noreferrer"
                            target="_blank"
                            href={constants.TELEGRAM_LINK}
                        >
                            <Icon icon="telegram" size={20} />
                        </IconLinkWrappper>
                        <IconLinkWrappper
                            rel="noreferrer"
                            target="_blank"
                            href={constants.TWITTER_LINK}
                        >
                            <Icon icon="twitter" size={20} />
                        </IconLinkWrappper>
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
                            isDisabled={!isValidAddress}
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
                        Or login using
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
            </ContentWrappper>
        </MainWrapper>
    );
};
export default LandingPage;
