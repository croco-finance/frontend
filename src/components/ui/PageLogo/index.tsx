import React from 'react';
import styled from 'styled-components';
import Logo from '../../../data/images/logo.svg';
import LogoNight from '../../../data/images/logo-night.svg';
import { useSelector } from '@reducers';

const SvgWrapper = styled.img`
    display: inline-block;
    height: ${props => props.height}px;

    div {
        height: ${props => props.height}px;
        line-height: ${props => props.height}px;
    }
`;

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
    size?: number;
}

const PageLogo = ({ height = 32 }: Props) => {
    const theme = useSelector(state => state.app.theme);
    return <SvgWrapper height={height} src={theme === 'light' ? Logo : LogoNight} />;
};

export default PageLogo;
