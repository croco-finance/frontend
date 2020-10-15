import React from 'react';
import styled from 'styled-components';
import { TokenLogo } from '../../../../../components/ui';
import { variables } from '../../../../../config';

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

const getGridDimensions = (numberOfTokens: number) => {
    if (numberOfTokens <= 4) {
        return { rows: numberOfTokens, columns: 1 };
    } else {
        return { rows: 4, columns: 2 };
    }
};

interface Props {
    balances: { [key: string]: number };
    size?: number;
}

const TokenBalances = ({ balances, size = 20 }: Props) => {
    const numberOfTokens = Object.keys(balances).length;

    const { rows, columns } = getGridDimensions(numberOfTokens);

    return (
        <Wrapper>
            {Object.keys(balances).map((token, index) => {
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
