import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { colors, variables, constants } from '../../config';
import { isValidEthereumAddress } from '../../utils/validation';
import { Icon, PageLogo } from '../../components/ui';

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

const ContentWrappper = styled.div`
    width: 1100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    animation: showup 1.6s;

    @keyframes showup {
        0% {
            opacity: 0;
            transform: translateY(5%);
        }

        100% {
            opacity: 1;
            transform: translateY(0%);
        }
    }
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
const Headline = styled.h1`
    color: ${colors.FONT_DARK};
    font-weight: ${variables.FONT_WEIGHT.BOLD};
    font-size: 52px;
    margin-top: 190px;
    margin-bottom: 60px;
`;

const AddressInputWrapper = styled.div`
    display: flex;
    justify-content: center;
    /* border: 5px solid ${colors.STROKE_GREY}; */
    border: 10px solid #eff2f9;
    padding: 10px;
    border-radius: 18px;
    box-shadow: rgba(33, 35, 74, 0.11) 0px 8px 40px;
`;

const AddressInput = styled.input`
    padding: 20px;
    margin-right: 10px;
    border: none;
    width: 600px;
    font-size: 20px;
    cursor: text;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    color: ${colors.FONT_DARK};

    &:focus {
        border: none;
        outline: none;
    }

    &::placeholder {
        color: ${colors.FONT_LIGHT};
    }
`;

const DashboardButton = styled(Link)<{ isDisabled: boolean }>`
    padding: 20px;
    display: block;
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
        background-color: ${colors.BLUE};
    }

    ${props =>
        props.isDisabled &&
        css`
            cursor: not-allowed;
            background-color: #e1e6ef;

            &:hover {
                background-color: #e1e6ef;
            }
        `}
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
                        <PageLogo height={16} />
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

                <Headline>
                    Don't get your funds
                    <br />
                    eaten <br />
                    {/* stays <HeadlineHighlight>im</HeadlineHighlight>permanent */}
                </Headline>
                <AddressInputWrapper>
                    <AddressInput
                        type="text"
                        spellCheck={false}
                        placeholder="Enter valid Ethereum address"
                        value={selectedAddress}
                        onChange={event => {
                            setSelectedAddress(event.target.value);
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
            </ContentWrappper>
        </MainWrapper>
    );
};
export default LandingPage;
