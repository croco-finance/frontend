import { variables } from '@config';
import nightModeImage from '@data/images/landing-page/landing-page-text-dark.svg';
import dayModeImage from '@data/images/landing-page/landing-page-text.svg';
import { useSelector } from '@reducers';
import React from 'react';
import styled from 'styled-components';

const SvgWrapper = styled.img`
    display: inline-block;
    max-height: ${props => props.height}px;

    div {
        max-height: ${props => props.height}px;
        line-height: ${props => props.height}px;
    }

    @media (max-width: ${variables.SCREEN_SIZE.MD}) {
        max-height: 110px;
    }

    @media (max-width: ${variables.SCREEN_SIZE.SM}) {
        max-height: 75px;
    }
`;

const LandingPageText = () => {
    const themeVariant = useSelector(state => state.app.theme);
    return (
        <SvgWrapper height={160} src={themeVariant === 'light' ? dayModeImage : nightModeImage} />
    );
};

export default LandingPageText;
