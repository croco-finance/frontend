import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { colors, variables } from '../../config';
import { isValidEthereumAddress } from '../../utils/validation';

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

const Headline = styled.h1`
    color: ${colors.FONT_DARK};
    font-weight: ${variables.FONT_WEIGHT.BOLD};
    font-size: 48px;
    margin-top: 240px;
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
            background-color: ${colors.FONT_LIGHT};
            color: ${colors.BACKGROUND_DARK};

            &:hover {
                background-color: ${colors.FONT_LIGHT};
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
                <Headline>
                    Don't get your
                    <br />
                    liquidity rewards eaten <br />
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
