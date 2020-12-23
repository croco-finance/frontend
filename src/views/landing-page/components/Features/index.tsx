import { variables } from '@config';
import { useSelector } from '@reducers';
import { join } from 'path';
import React from 'react';
import styled from 'styled-components';
import Feature from '../Feature';
const feature1 = require('../../../../../src/data/images/landing-page/pools.png');
const feature2 = require('../../../../../src/data/images/landing-page/compare-strategies.png');
const feature3 = require('../../../../../src/data/images/landing-page/simulator.png');
const feature1Dark = require('../../../../../src/data/images/landing-page/pools-dark.png');
const feature2Dark = require('../../../../../src/data/images/landing-page/compare-strategies-dark.png');
const feature3Dark = require('../../../../../src/data/images/landing-page/simulator-dark.png');

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    font-size: ${variables.FONT_SIZE.NORMAL};
    max-width: 980px;
`;

const FeaturesWrapper = styled.div`
    margin: 80px 0 0 0;

    & > section {
        margin-bottom: 50px;

        &:last-child {
            margin-bottom: 0;
        }
    }
`;

const StyledH1 = styled.h1<{ textAlign: string }>`
    font-size: 22px;
    line-height: 36px;
    font-weight: ${variables.FONT_WEIGHT.DEMI_BOLD};
    color: ${props => props.theme.FONT_DARK};
    padding-left: ${props => (props.textAlign === 'right' ? '20px' : '0')};
    margin-bottom: 10px;

    @media only screen and (min-width: ${variables.SCREEN_SIZE.MD}) {
        font-size: 34px;
        line-height: 44px;
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

const features = [
    {
        id: 1,
        headline: 'Track your liquidity pool positions',
        text:
            'See how much you earned on fees and yield farming and how much you paid for transactions.',
        textAlign: 'left',
        backgroundPosition: 'center right',
        backgroundSize: '360px auto',
        image: feature1,
        imageDark: feature1Dark,
        soon: false,
    },
    {
        id: 2,
        headline: 'Compare strategies',
        text: "See if you would've performed better if you hodl'd your tokens instead.",
        backgroundPosition: 'center left',
        backgroundSize: '470px auto',
        textAlign: 'right',
        image: feature2,
        imageDark: feature2Dark,
        soon: false,
    },
    {
        id: 3,
        headline: 'Simulator',
        text: 'Try by yourself how changes in token prices affect pool value and divergence loss.',
        backgroundSize: '460px auto',
        backgroundPosition: 'bottom right',
        textAlign: 'left',
        image: feature3,
        imageDark: feature3Dark,
        soon: false,
    },
];

export const resolveStaticPath = (path: string) => {
    const staticPath = join('/static', path);
    if (process.env.assetPrefix) {
        return join(process.env.assetPrefix, staticPath);
    }

    return staticPath;
};

const Index = () => {
    const theme = useSelector(state => state.theme);
    return (
        <Wrapper>
            <FeaturesWrapper>
                {features.map((item, key) => (
                    <Feature
                        image={theme === 'light' ? item.image : item.imageDark}
                        key={item.id}
                        flip={key % 2 === 1}
                        backgroundPosition={
                            item.backgroundPosition !== undefined
                                ? item.backgroundPosition
                                : undefined
                        }
                        backgroundSize={item.backgroundSize}
                    >
                        <StyledH1 textAlign={item.textAlign}>{item.headline}</StyledH1>
                        <StyledP textAlign={item.textAlign}>{item.text}</StyledP>
                    </Feature>
                ))}
            </FeaturesWrapper>
        </Wrapper>
    );
};

export default Index;
