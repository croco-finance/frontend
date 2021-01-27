import React from 'react';
import { ReactSVG } from 'react-svg';
import styled from 'styled-components';
import { TOKENS } from './tokens';
import { TokenType } from '@types';

const SvgWrapper = styled.div<Omit<Props, 'symbol'>>`
    display: inline-block;
    height: ${props => props.size}px;

    div {
        height: ${props => props.size}px;
        line-height: ${props => props.size}px;
    }
`;

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
    symbol: TokenType;
    size?: number;
}

const TokenLogo = ({ symbol, className, size = 32, ...rest }: Props) => {
    let path = TOKENS['unknown'];
    if (TOKENS[symbol.toLowerCase()]) {
        path = TOKENS[symbol.toLowerCase()];
    }

    return (
        <SvgWrapper className={className} size={size} {...rest}>
            <ReactSVG
                src={path}
                beforeInjection={(svg: any) => {
                    svg.setAttribute('width', `${size}px`);
                    svg.setAttribute('height', `${size}px`);
                }}
                loading={() => <span className="loading" />}
            />
        </SvgWrapper>
    );
};

export default TokenLogo;
