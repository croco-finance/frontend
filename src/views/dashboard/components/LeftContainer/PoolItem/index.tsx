import { changeSelectedPool } from '@actions';
import { FiatValue, TokenLogo } from '@components/ui';
import { variables } from '@config';
import { useSelector } from '@reducers';
import { formatUtils } from '@utils';
import React from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import PoolItemCard from '../PoolItemCard';

const Item = styled.div`
    display: flex;
    flex: 0 0 33%;
    justify-content: center;
    align-items: center;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};

    @media (max-width: ${variables.SCREEN_SIZE.SM}) {
        font-size: ${variables.FONT_SIZE.SMALL};
        flex-shrink: 1; // allow to shrink if necessary
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

const TokenWeight = styled.div<{ isSelected: boolean }>`
    font-weight: ${variables.FONT_WEIGHT.REGULAR};
    color: ${props => (props.isSelected ? props.theme.BLUE : props.theme.FONT_MEDIUM)};
    border-left: 1px solid ${props => props.theme.STROKE_GREY};
    border-color: ${props =>
        props.isSelected ? props.theme.STROKE_BLUE : props.theme.STROKE_GREY};
    padding-left: 10px;
    margin-left: 10px;
    font-size: ${variables.FONT_SIZE.TINY};
    display: flex;
    align-items: center;

    @media (max-width: 1400px) and (min-width: ${variables.SCREEN_SIZE.LG}) {
        display: none;
    }

    @media (max-width: ${variables.SCREEN_SIZE.SM}) {
        display: none;
    }
`;

const TokenSymbol = styled.div`
    margin-left: 10px;
    text-transform: uppercase;
    min-width: 48px;
    max-width: 68px;
    overflow: hidden;
    text-overflow: ellipsis;
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
    border: 1px solid ${props => props.theme.BACKGROUND_DARK};
    /* background-color: white; */
    box-shadow: ${props => props.theme.BOX_SHADOW_ICON};
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
    const { allPools, selectedPoolId, theme } = useSelector(state => state.app);

    if (!allPools[poolId]) return null;

    const { pooledTokens, exchange, isActive } = allPools[poolId];

    if (allPools[poolId].cumulativeStats === null) return <p> No stats </p>;
    const { feesUsd, yieldUsd, txCostUsd, endPoolValueUsd } = allPools[poolId].cumulativeStats;

    let isSelected = selectedPoolId === poolId;

    const handleOnClick = (e, poolId) => {
        dispatch(changeSelectedPool(poolId));
    };

    return (
        <div onClick={event => handleOnClick(event, poolId)}>
            <PoolItemCard isSelected={isSelected}>
                <ExchangeLogoWrapper>
                    <TokenLogo
                        symbol={theme === 'light' ? exchange : `${exchange}dark`}
                        size={17}
                    />
                </ExchangeLogoWrapper>
                <PoolWrapper>
                    {pooledTokens.map((token, i) => {
                        return (
                            <TokenItem key={token.symbol}>
                                <TokenLogo symbol={token.symbol} size={18} />
                                <TokenSymbol>{token.symbol}</TokenSymbol>
                                <TokenWeight isSelected={isSelected}>
                                    {formatUtils.getFormattedPercentageValue(token.weight, true)}
                                </TokenWeight>
                            </TokenItem>
                        );
                    })}
                </PoolWrapper>

                <Value>{isActive ? <FiatValue value={endPoolValueUsd}></FiatValue> : ''}</Value>
                <Gains>
                    <FiatValue
                        value={feesUsd + yieldUsd}
                        usePlusSymbol
                        // colorized={!isSelected}
                    ></FiatValue>
                </Gains>
            </PoolItemCard>
        </div>
    );
};

export default PoolItem;
