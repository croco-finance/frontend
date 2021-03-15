import React from 'react';
import styled from 'styled-components';
import TokenLogo from '../TokenLogo';
import InlineCircle from '../InlineCircle';
import { TokenType } from '@types';

// if equal to 1, logos are nex to each other.
// if equal to 0, logo are stuck on top of each other
const LOGO_PACING = 1.2;

const TokenWrapper = styled.div<{ wrapperWidth: number; margin: boolean }>`
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-right: ${props => (props.margin ? '10px' : 0)};
    width: ${props => props.wrapperWidth}px;
`;

const Logo = styled(TokenLogo)<{ index: number; zIndex: number; size: number }>`
    position: ${props => (props.index === 0 ? 'static' : 'absolute')};
    background-color: white;
    border-radius: 50%;
    z-index: ${props => props.zIndex};
    left: ${props => `${props.index * props.size * LOGO_PACING}px`};
`;

const ThreeDots = styled.div`
    position: absolute;
    right: 0;
`;

const ExchangeLogoWrapper = styled.div`
    padding-right: 8px;
    border-right: 2px solid ${props => props.theme.STROKE_GREY};
    margin-right: 8px;
    display: flex;
`;

const getWrapperWidth = (tokenCount: number, logoSize: number, threshold: number) => {
    if (tokenCount <= threshold) {
        return tokenCount * logoSize * LOGO_PACING;
    } else {
        return (threshold + 1) * logoSize * LOGO_PACING + 8;
    }
};

interface Props {
    tokens: Array<TokenType>; // ['usdt', 'wbtc', 'eth', 'dai', '...']
    exchangeSymbol?: any;
    onChange?: any;
    margin?: boolean;
    size?: number;
    threshold?: number; // how many icons to show before showing three dots
}

const MultipleTokenLogo = ({
    tokens,
    exchangeSymbol,
    threshold = 3,
    size = 24,
    margin = false,
}: Props) => {
    const tokenCount = tokens.length;
    const wrapperWidth = getWrapperWidth(tokenCount, size, threshold);

    return (
        <>
            {exchangeSymbol && (
                <ExchangeLogoWrapper>
                    <TokenLogo size={size} symbol={exchangeSymbol} />
                </ExchangeLogoWrapper>
            )}
            <TokenWrapper margin={margin} wrapperWidth={wrapperWidth}>
                {tokens.map((token, index) => {
                    if (index < threshold) {
                        return (
                            <Logo
                                key={index}
                                symbol={token}
                                size={size}
                                index={index}
                                zIndex={tokenCount - index}
                            />
                        );
                    } else {
                        return (
                            <ThreeDots key={index}>
                                <InlineCircle size={size} />
                                <InlineCircle size={size} />
                                <InlineCircle size={size} />
                            </ThreeDots>
                        );
                    }
                })}
            </TokenWrapper>
        </>
    );
};

export default MultipleTokenLogo;
