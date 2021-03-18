import { Exchange, TokenType } from '@types';
import React from 'react';
import styled from 'styled-components';
import { TOKENS } from './tokens';

const SvgWrapper = styled.img<Omit<Props, 'symbol'>>`
    display: inline-block;
    height: ${props => props.size}px;
`;

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
    symbol: TokenType | Exchange;
    size?: number;
}

const TokenLogo = ({ symbol, className, size = 32, ...rest }: Props) => {
    let path = TOKENS.unknown;
    if (TOKENS[symbol.toLowerCase()]) {
        path = TOKENS[symbol.toLowerCase()];
    }

    return (
        <SvgWrapper className={className} size={size} src={path.default} />

        // <SvgWrapper className={className} size={size} {...rest}>
        //     <ReactSVG
        //         src={path.default}
        //         beforeInjection={(svg: any) => {
        //             svg.setAttribute('width', `${size}px`);
        //             svg.setAttribute('height', `${size}px`);
        //         }}
        //         loading={() => <span className="loading" />}
        //     />
        // </SvgWrapper>
    );
};

export default TokenLogo;
