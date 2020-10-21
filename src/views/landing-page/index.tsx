import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { colors, variables, constants } from '../../config';
import { isValidEthereumAddress } from '../../utils/validation';
import { Icon, PageLogo } from '../../components/ui';
import LandingPageText from './components/LandingPageText';

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
    cursor: pointer;
    background-color: ${colors.BLUE};
    color: white;
    font-weight: ${variables.FONT_WEIGHT.BOLD};
    font-size: 20px;
    border: none;
    border-radius: 10px;
    text-decoration: none;
    transition: 0.1s;

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

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    address: string;
}

const LandingPage = ({ address = '' }: Props) => {
    const [selectedAddress, setSelectedAddress] = useState(address);

    // check if the address user typed in the input is valid Ethereum address
    const isValidAddress = isValidEthereumAddress(selectedAddress);
    const linkPath = isValidAddress ? `/dashboard/${selectedAddress}` : '';

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
                            placeholder="Enter valid Ethereum address"
                            value={selectedAddress}
                            onChange={event => {
                                setSelectedAddress(event.target.value.trim());
                            }}
                        ></AddressInput>
                        <DashboardButton
                            isDisabled={!isValidAddress}
                            to={{
                                pathname: linkPath,
                            }}
                        >
                            Let's Go!
                        </DashboardButton>
                    </AddressInputWrapper>
                </AnimatedWrapper>
            </ContentWrappper>
        </MainWrapper>
    );
};
export default LandingPage;
