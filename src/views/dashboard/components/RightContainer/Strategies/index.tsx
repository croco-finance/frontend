import { colors, variables, types } from '@config';
import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { graphUtils, formatUtils } from '@utils';
import LiquidityPool from './LiquidityPool';
import DifferentStrategy from './DifferentStrategy';
import { BoxRow, GrayBox } from '@components/ui';

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
`;

const Headline = styled.h3`
    width: 100%;
    font-size: ${variables.FONT_SIZE.H3};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    display: flex;
    text-align: left;
    color: ${colors.FONT_DARK};
    padding-left: 20px;
    margin-top: 30px;
    margin-bottom: 10px;
`;

const SubHeadline = styled.h3`
    width: 100%;
    font-size: ${variables.FONT_SIZE.NORMAL};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    display: flex;
    text-align: left;
    color: ${colors.FONT_DARK};
    padding-left: 20px;
    margin-top: 30px;
    margin-bottom: 10px;
`;

const Description = styled.p`
    width: 100%;
    padding-left: 20px;
    color: ${colors.FONT_MEDIUM};
    margin-top: 0;
    margin-bottom: 30px;
`;

const StrategyItemWrapper = styled.div`
    width: 100%;
    margin-bottom: 15px;
`;

const GridWrapper = styled.div`
    flex-grow: 1;
    display: grid;
    gap: 28px 10px;
    grid-template-columns: 180px minmax(100px, auto) minmax(100px, auto);
    grid-auto-rows: auto;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    align-items: center;
    /* allow x-axis scrolling: useful on small screens when fiat amount is displayed */
    /* overflow-x: auto; */
    word-break: break-all;
    align-items: baseline;

    @media (max-width: ${variables.SCREEN_SIZE.SM}) {
        font-size: ${variables.FONT_SIZE.SMALL};
        gap: 18px 5px;
        grid-template-columns: 140px minmax(90px, auto) minmax(90px, auto);
    }
`;

const HeaderWrapper = styled.div`
    padding: 0 50px 10px 20px;
    margin-top: 10px;
    width: 100%;
    font-size: ${variables.FONT_SIZE.SMALL};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    color: ${colors.FONT_LIGHT};
`;

const StrategyHeaderGridWrapper = styled(GridWrapper)`
    grid-template-columns: minmax(100px, auto) minmax(100px, auto);
`;

const Strategies = () => {
    const allPools: types.AllPoolsGlobal = useSelector(state => state.allPools);
    const selectedPoolId = useSelector(state => state.selectedPoolId);
    const activePoolIds = useSelector(state => state.activePoolIds);
    let pool = allPools[selectedPoolId];

    if (activePoolIds.length <= 0 && selectedPoolId === 'all') {
        return null;
    }

    let { pooledTokens, isActive, hasYieldReward, yieldToken, intervalStats, exchange } = pool;

    const {
        feesUsd,
        yieldUsd,
        txCostEth,
        txCostUsd,
        currentPoolValueUsd,
        tokenBalances,
        feesTokenAmounts,
        yieldTokenAmount,
        depositsUsd,
        withdrawalsUsd,
        depositsTokenAmounts,
        withdrawalsTokenAmounts,
        poolStrategyUsd,
        tokensHodlStrategyTokenAmounts,
        tokensHodlStrategyUsd,
        ethHodlStrategyUsd,
        lastIntAvDailyRewardsUsd,
    } = pool.cumulativeStats;

    const tokenSymbolsArr = formatUtils.getTokenSymbolArr(pooledTokens);

    const endTimeText = isActive ? 'Value today' : 'Withdrawal time value';

    let tokensHodlHeadline = 'Gain compared to HODLing pooled tokens';
    if (tokensHodlStrategyUsd > poolStrategyUsd)
        tokensHodlHeadline = 'Loss compared to HODLing pooled tokens';

    let ethHodlHeadline = 'Gain compared to exchanging pooled tokens for ETH';
    if (ethHodlStrategyUsd > poolStrategyUsd)
        ethHodlHeadline = 'Loss compared to exchanging pooled tokens for ETH';

    return (
        <Wrapper>
            <Headline>Is it worth it to be liquidity provider in this pool?</Headline>
            <Description>
                Here we compare how does your pool perform compared to other commonly applied
                strategies.
            </Description>
            {/* <SubHeadline>Being liqudity provider</SubHeadline> */}

            <StrategyItemWrapper>
                <LiquidityPool />
            </StrategyItemWrapper>

            {/* <SubHeadline>Comparison to other strategies</SubHeadline> */}

            <HeaderWrapper>
                <StrategyHeaderGridWrapper>
                    <BoxRow
                        firstColumn="Strategy"
                        secondColumn="Gain/Loss"
                        columnColors={['light', 'light']}
                    />
                </StrategyHeaderGridWrapper>
            </HeaderWrapper>

            <StrategyItemWrapper>
                <DifferentStrategy
                    headline={tokensHodlHeadline}
                    endTimeText={endTimeText}
                    tokenSymbols={tokenSymbolsArr}
                    poolStrategyUsd={poolStrategyUsd}
                    feesUsd={feesUsd}
                    yieldUsd={yieldUsd}
                    txCostUsd={txCostUsd}
                    differentStrategyUsd={tokensHodlStrategyUsd}
                    feesTokenAmounts={feesTokenAmounts}
                    yieldTokenAmount={yieldTokenAmount}
                    yieldTokenSymbol={yieldToken ? yieldToken.symbol : undefined}
                    txCostEth={txCostEth}
                    lastIntAvDailyRewardsUsd={lastIntAvDailyRewardsUsd}
                />
            </StrategyItemWrapper>

            <StrategyItemWrapper>
                <DifferentStrategy
                    headline={ethHodlHeadline}
                    endTimeText={endTimeText}
                    tokenSymbols={tokenSymbolsArr}
                    poolStrategyUsd={poolStrategyUsd}
                    feesUsd={feesUsd}
                    yieldUsd={yieldUsd}
                    txCostUsd={txCostUsd}
                    differentStrategyUsd={ethHodlStrategyUsd}
                    feesTokenAmounts={feesTokenAmounts}
                    yieldTokenAmount={yieldTokenAmount}
                    yieldTokenSymbol={yieldToken ? yieldToken.symbol : undefined}
                    txCostEth={txCostEth}
                    lastIntAvDailyRewardsUsd={lastIntAvDailyRewardsUsd}
                />
            </StrategyItemWrapper>
        </Wrapper>
    );
};
export default Strategies;
