import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { variables } from '@config';
import { Fade } from 'react-awesome-reveal';
import { rgba } from 'polished';
import IMG from '../../../../../src/data/images/landing-page/feature1.png';

const LIGHT_GREY = '#f5f5f5';

// due to iOS browser bug, it doesn't handle transparent color in gradients well
const transparent = rgba(LIGHT_GREY, 0);

const Feature = styled.section<{ flip?: boolean }>`
    position: relative;
    display: flex;
    flex: 1;
    border-radius: 40px;
    background: ${props => props.theme.BACKGROUND};
    flex-direction: ${props => (props.flip === true ? 'row-reverse' : 'row')};
    overflow: hidden;
    padding: 40px 0;
    text-align: 'left' !important;

    @media only screen and (min-width: ${variables.SCREEN_SIZE.MD}) {
        min-height: 360px;
        padding: 0;
    }
`;

const StyledText = styled.div<{ flip?: boolean }>`
    display: flex;
    flex: 1;
    align-items: center;
    margin: 0 50px;
    z-index: 1;
    position: relative;
    text-align: left;

    &:after {
        position: absolute;
        width: 70%;
        height: 100%;
        content: '';
        top: 0;
        z-index: -1;
    }

    &:before {
        position: absolute;
        width: 100%;
        height: 100%;
        content: '';
        left: 0;
        top: 0;
        z-index: -1;
    }

    ${props =>
        props.flip === false &&
        `
            &:after {
                right: -70%;
                background: linear-gradient(to left, ${transparent} 0%, ${props.theme.BACKGROUND} 100%);
            }

            &:before {
                left: 0;
                background: ${props.theme.BACKGROUND};
                z-index: -1;
            }
        `}

    ${props =>
        props.flip === true &&
        `
            &:after {
                left: -70%;
                background: linear-gradient(to right, ${transparent} 0%, ${props.theme.BACKGROUND} 100%);
            }

            &:before {
                right: 0;
                background: ${props.theme.BACKGROUND};
            }
        `}

    @media only screen and (min-width: ${variables.SCREEN_SIZE.XL}) {
        &:before {
            display: none;
        }
        &:after {
            display: none;
        }
    }

    @media only screen and (min-width: ${variables.SCREEN_SIZE.MD}) {
        max-width: 40%;
        margin-left: 80px;
        white-space: pre-wrap;
    }
`;

const FeatureImage = styled.div<{
    image: string;
    backgroundPosition: string | undefined;
    backgroundSize: string;
    flip: boolean | undefined;
}>`
    position: absolute;
    width: 100%;
    height: 100%;
    display: none;
    background: url(${props => props.image}) no-repeat;
    background-size: ${props => props.backgroundSize};

    @media only screen and (min-width: ${variables.SCREEN_SIZE.MD}) {
        display: block;
        background-position: ${props =>
            props.backgroundPosition !== undefined
                ? props.backgroundPosition
                : `center ${props.flip === true ? 'left' : 'right'} 32px`};
    }
`;

interface Props {
    children: ReactNode;
    flip?: boolean;
    backgroundPosition?: string;
    backgroundSize: string;
    image: string;
}

const Index = ({ children, flip, image, backgroundPosition, backgroundSize }: Props) => {
    return (
        <Feature flip={flip}>
            <StyledText flip={flip}>
                <Fade fraction={0.5} triggerOnce>
                    <div>{children}</div>
                </Fade>
            </StyledText>
            <FeatureImage
                image={image}
                flip={flip}
                backgroundPosition={backgroundPosition}
                backgroundSize={backgroundSize}
            />
        </Feature>
    );
};

export default Index;
