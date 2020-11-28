import { variables } from '@config';
import React from 'react';
import styled from 'styled-components';
import LandingPage from '../..';
import image from '../../../../data/images/landing-page-text.svg';

const SvgWrapper = styled.img`
    display: inline-block;
    max-height: ${props => props.height}px;

    div {
        max-height: ${props => props.height}px;
        line-height: ${props => props.height}px;
    }

    @media (max-width: ${variables.SCREEN_SIZE.MD}) {
        max-height: 100px;
    }

    @media (max-width: ${variables.SCREEN_SIZE.SM}) {
        max-height: 70px;
    }
`;

const LandingPageText = () => {
    return <SvgWrapper height={150} src={image} />;
};

export default LandingPageText;
