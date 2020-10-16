import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { FiatAmount, TokenLogo } from '../../../../../components/ui';
import { variables } from '../../../../../config';
import colors from '../../../../../config/colors';
import * as actionTypes from '../../../../../store/actions/actionTypes';

const Wrapper = styled.div<{ isSelected: boolean }>`
    display: flex;
    align-items: center;
    background-color: inherit;
    border-radius: 5px;
    background-color: ${props => (props.isSelected ? colors.PASTEL_BLUE_LIGHT : colors.BACKGROUND)};

    padding: 10px;
    flex: 0 0 10em 25em;
    min-height: 70px;
    margin-bottom: 10px;
    cursor: pointer;
    transition: 0s;

    &:hover {
        /* background-color: ${props => (props.isSelected ? '#c5e3ff' : colors.BACKGROUND)}; */
        background-color: ${props =>
            props.isSelected ? colors.PASTEL_BLUE_LIGHT : colors.BACKGROUND};
    }
`;

const Item = styled.div`
    display: flex;
    flex: 0 0 33%;
    justify-content: center;
    align-items: center;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
`;

const Value = styled(Item)``;
const Gains = styled(Item)``;

const PoolWrapper = styled(Item)`
    flex-direction: column;
    align-items: start;
    padding-left: 10px;
`;

const TokenItem = styled.div`
    display: flex;
    flex-direction: row;
    padding: 5px 0;
`;

const TokenWeight = styled.div``;

const TokenSymbol = styled.div`
    margin-left: 10px;
    text-transform: uppercase;
`;

const Circle = styled.div`
    display: inline-flex;
    margin-left: 5px;
    margin-right: 5px;
    color: ${colors.FONT_LIGHT};
`;

interface PoolItem {
    symbol: string;
    weight: number;
}

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    poolId: string;
}

const PoolItem = ({ poolId }: Props) => {
    const dispatch = useDispatch();
    const allPools = useSelector(state => state.allPools);
    const selectedPoolId = useSelector(state => state.selectedPoolId);

    const { tokens, tokenWeights, feesUSD, endBalanceUSD } = allPools[poolId];

    let isSelected = selectedPoolId === poolId;

    const handleOnClick = (e, poolId) => {
        dispatch({ type: actionTypes.SET_SELECTED_POOL_ID, poolId: poolId });
    };

    return (
        <Wrapper onClick={event => handleOnClick(event, poolId)} isSelected={isSelected}>
            <PoolWrapper>
                {tokens.map((token, i) => {
                    return (
                        <TokenItem key={token.symbol}>
                            <TokenLogo symbol={token.symbol} size={18} />
                            <TokenSymbol>{token.symbol}</TokenSymbol>
                            <Circle>&bull;</Circle>
                            <TokenWeight>{tokenWeights[i].toFixed(2)}%</TokenWeight>
                        </TokenItem>
                    );
                })}
            </PoolWrapper>

            <Value>
                <FiatAmount value={endBalanceUSD}></FiatAmount>
            </Value>
            <Gains>
                <FiatAmount value={feesUSD} usePlusSymbol></FiatAmount>
            </Gains>
            {/* <Balance>5%</Balance> */}
        </Wrapper>
    );
};

export default PoolItem;
