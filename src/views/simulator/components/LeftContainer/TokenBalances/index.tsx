import { TokenLogo } from '@components/ui';
import { variables } from '@config';
import React from 'react';
import styled from 'styled-components';
import { TokenType } from '@types';

const Wrapper = styled.div``;
const ItemWrapper = styled.div`
    display: flex;
    align-items: center;
    padding: 0px 0 16px 20px;
`;

const ValueWrapper = styled.div`
    margin-left: 10px;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    font-size: ${variables.FONT_SIZE.NORMAL};
`;

interface Props {
    balances: { [key in TokenType]: number };
    size?: number;
}

const TokenBalances = ({ balances, size = 20 }: Props) => {
    const tokens = Object.keys(balances) as Array<keyof typeof balances>;
    const numberOfTokens = tokens.length;

    return (
        <Wrapper>
            {tokens.map(token => {
                return (
                    <ItemWrapper>
                        <TokenLogo symbol={token} size={size} />
                        <ValueWrapper>{balances[token]}</ValueWrapper>
                    </ItemWrapper>
                );
            })}
        </Wrapper>
    );
};

export default TokenBalances;
