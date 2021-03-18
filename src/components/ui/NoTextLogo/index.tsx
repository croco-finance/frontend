import React from 'react';
import styled from 'styled-components';
import Logo from '../../../data/images/logo_no_text.svg';

const SvgWrapper = styled.img`
    display: inline-block;
    height: ${props => props.height}px;

    div {
        height: ${props => props.height}px;
        line-height: ${props => props.height}px;
    }
`;

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
    height?: number;
}

const PageLogo = ({ height = 32 }: Props) => <SvgWrapper height={height} src={Logo} />;

export default PageLogo;
