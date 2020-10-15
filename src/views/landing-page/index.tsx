import React, { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { colors, variables, animations } from '../../config';

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

const HeadlineHighlight = styled.span`
    color: ${colors.BLUE};
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
    width: 550px;
    font-size: 20px;
    cursor: text;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    color: ${colors.FONT_DARK};

    &:focus {
        border: none;
        outline: none;
    }

    &::placeholder {
        color: ${colors.FONT_MEDIUM};
    }
`;

const DashboardButton = styled(Link)`
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
`;

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    address: string;
}

const LandingPage = ({ address = '' }: Props) => {
    const [selectedAddress, setSelectedAddress] = useState(address);

    return (
        <MainWrapper>
            <ContentWrappper>
                <Headline>
                    Make sure your impermanent loss <br />
                    stays <HeadlineHighlight>im</HeadlineHighlight>permanent
                </Headline>
                <AddressInputWrapper>
                    <AddressInput
                        placeholder="Enter valid Ethereum address"
                        value={selectedAddress}
                        onChange={event => {
                            setSelectedAddress(event.target.value);
                        }}
                    ></AddressInput>
                    <DashboardButton
                        to={{
                            pathname: `/dashboard/${selectedAddress}`,
                            state: {
                                fromNotifications: true,
                            },
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
