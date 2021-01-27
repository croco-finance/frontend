import { variables } from '@config';
import { useSelector } from '@reducers';
import React from 'react';
import styled from 'styled-components';
import OverviewImage from '../../../../../src/data/images/landing-page/overview.svg';
import OverviewImageDark from '../../../../../src/data/images/landing-page/overview_dark.svg';
import PoolsImage from '../../../../../src/data/images/landing-page/pools.svg';
import PoolsImageDark from '../../../../../src/data/images/landing-page/pools_dark.svg';
import SimulatorImage from '../../../../../src/data/images/landing-page/simulator.svg';
import SimulatorImageDark from '../../../../../src/data/images/landing-page/simulator_dark.svg';
import Feature from '../Feature';

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    font-size: ${variables.FONT_SIZE.NORMAL};
    max-width: 1080px;
`;

const FeaturesWrapper = styled.div`
    margin: 80px 0 0 0;

    & > section {
        padding: 30px 0;
    }
`;

const StyledH1 = styled.h1<{ textAlign: string }>`
    font-size: 22px;
    line-height: 36px;
    font-weight: ${variables.FONT_WEIGHT.DEMI_BOLD};
    color: ${props => props.theme.FONT_DARK};
    padding-left: ${props => (props.textAlign === 'right' ? '20px' : '0')};
    margin-bottom: 10px;
    width: 100%;

    @media only screen and (min-width: ${variables.SCREEN_SIZE.MD}) {
        font-size: 30px;
        line-height: 40px;
        white-space: pre-wrap;
    }

    @media (max-width: ${variables.SCREEN_SIZE.SM}) {
        padding-left: 0;
    }
`;

const StyledP = styled.p<{ textAlign: string }>`
    font-size: 18px;
    line-height: 34px;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    color: ${props => props.theme.FONT_MEDIUM};
    padding-left: ${props => (props.textAlign === 'right' ? '20px' : '0')};

    @media (max-width: ${variables.SCREEN_SIZE.SM}) {
        padding-left: 0;
    }
`;

const Index = () => {
    const theme = useSelector(state => state.theme);
    return (
        <Wrapper>
            <FeaturesWrapper>
                <Feature
                    image={theme === 'light' ? PoolsImage : PoolsImageDark}
                    imageSize={200}
                    imageSizeSmall={150}
                    flip={false}
                >
                    <StyledH1 textAlign="left">Track your liquidity pool positions</StyledH1>
                    <StyledP textAlign="left">
                        See how much you earned on fees and yield farming and how much you paid for
                        transactions.
                    </StyledP>
                </Feature>

                <Feature
                    image={theme === 'light' ? OverviewImage : OverviewImageDark}
                    imageSize={240}
                    imageSizeSmall={170}
                    flip={true}
                >
                    <StyledH1 textAlign="left">Compare strategies</StyledH1>
                    <StyledP textAlign="left">
                        See if you would've performed better if you hold your tokens instead.
                    </StyledP>
                </Feature>

                <Feature
                    image={theme === 'light' ? SimulatorImage : SimulatorImageDark}
                    imageSize={250}
                    imageSizeSmall={170}
                    flip={false}
                >
                    <StyledH1 textAlign="left">Simulator</StyledH1>
                    <StyledP textAlign="left">
                        Try by yourself how changes in token prices affect pool value and divergence
                        loss.
                    </StyledP>
                </Feature>
            </FeaturesWrapper>
        </Wrapper>
    );
};

export default Index;
