import * as actionTypes from '@actionTypes';
import { FiatValue, TokenLogo } from '@components/ui';
import { colors, variables, types } from '@config';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';

const Wrapper = styled.div<{ isSelected: boolean }>`
    position: relative;
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
            props.isSelected ? colors.PASTEL_BLUE_LIGHT : colors.BACKGROUND_DARK};
    }

    @media (max-width: 520px) {
        padding: 4px;
    }
`;

const Item = styled.div`
    display: flex;
    flex: 0 0 33%;
    justify-content: center;
    align-items: center;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};

    @media (max-width: 520px) {
        font-size: ${variables.FONT_SIZE.SMALL};
    }
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
    min-width: 48px;
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const Circle = styled.div`
    display: inline-flex;
    margin-left: 5px;
    margin-right: 5px;
    color: ${colors.FONT_LIGHT};
`;

const ExchangeLogoWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    left: -5px;
    top: -5px;
    width: 20px;
    height: 20px;
    border-radius: 200px;
    border: 1px solid ${colors.BACKGROUND_DARK};
    background-color: white;
    box-shadow: 2px 2px 4px 0px rgba(215, 216, 222, 1);
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

    const { tokens, exchange } = allPools[poolId];

    if (allPools[poolId].cumulativeStats === null) return <p> No stats </p>;
    const { feesUsd, poolValueUsd, yieldUsd } = allPools[poolId].cumulativeStats;

    let isSelected = selectedPoolId === poolId;

    const handleOnClick = (e, poolId) => {
        dispatch({ type: actionTypes.SET_SELECTED_POOL_ID, poolId: poolId });
    };

    return (
        <Wrapper onClick={event => handleOnClick(event, poolId)} isSelected={isSelected}>
            <ExchangeLogoWrapper>
                <TokenLogo symbol={exchange} size={17} />
            </ExchangeLogoWrapper>
            <PoolWrapper>
                {tokens.map((token, i) => {
                    return (
                        <TokenItem key={token.symbol}>
                            <TokenLogo symbol={token.symbol} size={18} />
                            <TokenSymbol>{token.symbol}</TokenSymbol>
                            <Circle>&bull;</Circle>
                            <TokenWeight>{token.weight.toFixed(2)}%</TokenWeight>
                        </TokenItem>
                    );
                })}
            </PoolWrapper>

            <Value>
                <FiatValue value={poolValueUsd}></FiatValue>
            </Value>
            <Gains>
                <FiatValue
                    value={yieldUsd ? feesUsd + yieldUsd : feesUsd}
                    usePlusSymbol
                ></FiatValue>
            </Gains>
        </Wrapper>
    );
};

export default PoolItem;
