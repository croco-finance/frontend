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

    @media (max-width: 900px) {
        max-height: 80px;
    }
`;

const LandingPageText = () => {
    return <SvgWrapper height={160} src={image} />;
};

export default LandingPageText;
