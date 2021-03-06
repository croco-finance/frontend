import { PoolHeader, TabSelectHeader } from '@components/ui';
import { useSelector } from '@reducers';
import { PoolItem } from '@types';
import { mathUtils, simulatorUtils } from '@utils';
import React from 'react';
import styled from 'styled-components';
import ImpLossView from './ImpLossView';
import Strategies from './Strategies';

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
`;

type TabOptions = 'il' | 'strategies';

interface Props {
    simulatedPooledTokensCoeffs: Array<number>;
    simulatedEthCoeff: number;
    simulatedYieldCoeff: number;
    sliderDefaultCoeffs: Array<number>;
    sliderDefaultEthCoeff: number;
    onTabChanged: any;
    selectedTab: TabOptions;
    pool: PoolItem | undefined;
}
const RightContainer = ({
    simulatedPooledTokensCoeffs,
    sliderDefaultCoeffs,
    simulatedYieldCoeff,
    simulatedEthCoeff,
    sliderDefaultEthCoeff,
    onTabChanged,
    selectedTab,
    pool,
}: Props) => {
    // simulation pool data
    const {
        simulationMode,
        tokenSymbols,
        tokenWeights,
        poolId,
        yieldTokenSymbol,
        ethPriceUsd,
        tokenPricesUsd,
        userTokenBalances,
        exchange,
        swapFee,
        poolTokenReserves,
        volumeUsd24,
    } = useSelector(state => state.simulator);
    if (!exchange) return null;

    if (simulationMode === 'import') {
        // Get simulated prices of pooled tokens and ETH
        const simulatedPooledTokenPrices = mathUtils.multiplyArraysElementWise(
            tokenPricesUsd,
            simulatedPooledTokensCoeffs,
        );

        // Get simulated values for last interval
        const simulatedValues = simulatorUtils.getSimulationStats(
            userTokenBalances,
            new Array(userTokenBalances.length).fill(0),
            simulatedPooledTokenPrices,
            tokenWeights,
            exchange,
        );
        const {
            simulatedTokenBalances,
            simulatedFeesUsd,
            simulatedPoolValueUsd,
            simulatedHodlValueUsd,
            impLossRel,
            impLossUsd,
        } = simulatedValues;
        return (
            <Wrapper>
                <TabSelectHeader
                    selected=""
                    headline={
                        <PoolHeader
                            tokenSymbolsArr={tokenSymbols}
                            exchange={exchange}
                            poolId={poolId}
                        />
                    }
                    tabIds={[]}
                    tabHeadlines={[]}
                />
                <ImpLossView
                    isActive
                    isImportedPool
                    swapFee={swapFee}
                    poolTokenReserves={poolTokenReserves}
                    volumeUsd24={volumeUsd24}
                    tokenSymbols={tokenSymbols}
                    tokenBalances={userTokenBalances}
                    simulatedPooledTokenBalances={simulatedTokenBalances}
                    endPoolValueUsd={mathUtils.getTokenArrayValue(
                        userTokenBalances,
                        tokenPricesUsd,
                    )}
                    simulatedPoolValueUsd={simulatedPoolValueUsd}
                    simulatedHodlValueUsd={simulatedHodlValueUsd}
                    tokenPricesEnd={tokenPricesUsd}
                    sliderDefaultCoeffs={sliderDefaultCoeffs}
                    lastSnapTimestampEnd={Date.now()}
                    impLossUsd={impLossUsd}
                    impLossRel={impLossRel}
                    lastWeekAverageDailyRewardsUsd={0}
                />
            </Wrapper>
        );
    }

    if (!pool) return null;

    const {
        isActive,
        depositTimestamps,
        depositTokenAmounts,
        depositEthAmounts,
        hasYieldReward,
    } = pool;

    const {
        yieldUsd,
        txCostEth,
        txCostUsd,
        tokenBalances,
        feesTokenAmounts,
        withdrawalsTokenAmounts,
        poolStrategyUsd,
        ethPriceEnd,
        tokenPricesEnd,
        ethHodlStrategyUsd,
        tokensHodlStrategyUsd,
        feesUsd,
        tokensHodlStrategyTokenAmounts,
        ethHodlStrategyEth,
        endPoolValueUsd,
        yieldTokenPriceEnd,
        currentTokenBalances,
        feesTokenAmountsExceptLastInt,
        yieldTokenSymbols,
        yieldTotalTokenAmounts,
    } = pool.cumulativeStats;

    let lastWeekAverageDailyRewardsUsd: number | undefined;
    if (pool.dailyStats) lastWeekAverageDailyRewardsUsd = pool.dailyStats.averageDailyFeesUsd;

    // Get simulated prices of pooled tokens and ETH
    const simulatedPooledTokenPrices = mathUtils.multiplyArraysElementWise(
        tokenPricesEnd,
        simulatedPooledTokensCoeffs,
    );

    const simulatedEthPrice = ethPriceEnd * simulatedEthCoeff;
    const simulatedYieldPrice = yieldTokenPriceEnd ? yieldTokenPriceEnd * simulatedYieldCoeff : 0;

    // Simulated fees USD value for the last interval
    // Useful to get estimated days left to compensate loss
    const lastIntervalStat = pool.intervalStats[pool.intervalStats.length - 1];
    const lastSnapTimestampStart = lastIntervalStat.timestampStart;
    const lastSnapTimestampEnd = lastIntervalStat.timestampEnd;
    const lastSnapFeesTokenAmounts = lastIntervalStat.feesTokenAmounts;

    // Get simulated values for last interval
    const simulatedValues = simulatorUtils.getSimulationStats(
        tokenBalances,
        lastSnapFeesTokenAmounts,
        simulatedPooledTokenPrices,
        tokenWeights,
        exchange,
    );
    const {
        simulatedTokenBalances,
        simulatedFeesUsd,
        simulatedFeesTokenAmounts,
        simulatedPoolValueUsd,
        simulatedHodlValueUsd,
        impLossRel,
        impLossUsd,
    } = simulatedValues;

    // FEES
    // Get USD value of all fees except the last interval
    const feesUsdExceptLast = mathUtils.getTokenArrayValue(
        feesTokenAmountsExceptLastInt,
        simulatedPooledTokenPrices,
    );

    // To get the simulates fees amounts, you have to sum the simulated fees (last interval) with all the previous fees
    const simulatedFeesTokenAmountsAll = mathUtils.sumArraysElementWise(
        feesTokenAmountsExceptLastInt,
        simulatedFeesTokenAmounts,
    );
    const simulatedFeesUsdAll = simulatedFeesUsd + feesUsdExceptLast;

    // Get current usd value of fees and yield obtained in the last interval (not simulated)
    const lastIntYieldUsd = lastIntervalStat.yieldTokenPriceEnd
        ? lastIntervalStat.yieldTotalTokenAmount * lastIntervalStat.yieldTokenPriceEnd
        : 0;

    const simulatedWithdrawalsUsd = mathUtils.getTokenArrayValue(
        withdrawalsTokenAmounts,
        simulatedPooledTokenPrices,
    );

    // YIELD AND TX COST
    // TODO support simulated yield price for multiple tokens
    let simulatedYieldUsd = yieldTotalTokenAmounts[0] * simulatedYieldPrice; // TODO check if yield among pooled tokens
    if (!simulatedYieldUsd) simulatedYieldUsd = 0;

    const simulatedTxCostUsd = txCostEth * simulatedEthPrice;

    // STRATEGIES
    // if pool is not active, do not add "simulatedPoolValueUsd"
    const simulatedCurrentPoolValueUsd = isActive ? simulatedPoolValueUsd : 0;
    const simulatedPoolStrategyUsd =
        simulatedCurrentPoolValueUsd +
        simulatedWithdrawalsUsd +
        simulatedYieldUsd -
        simulatedTxCostUsd;

    const simulatedTokensHodlStrategyUsd = mathUtils.getTokenArrayValue(
        tokensHodlStrategyTokenAmounts,
        simulatedPooledTokenPrices,
    );
    const simulatedEthHodlStrategyUsd = ethHodlStrategyEth * simulatedEthPrice;

    //  last interval simulated rewards
    const lastIntSimulatedAverageRewards = mathUtils.getAverageDailyRewards(
        lastSnapTimestampStart,
        lastSnapTimestampEnd,
        simulatedFeesUsd + lastIntYieldUsd,
    );

    return (
        <Wrapper>
            <TabSelectHeader
                selected={selectedTab}
                headline={
                    <PoolHeader
                        tokenSymbolsArr={tokenSymbols}
                        exchange={exchange}
                        poolId={poolId}
                    />
                }
                onSelectTab={tabName => onTabChanged(tabName)}
                tabHeadlines={
                    simulationMode === 'positions'
                        ? ['Impermanent loss', 'Strategies']
                        : ['Impermanent loss']
                }
                tabIds={simulationMode === 'positions' ? ['il', 'strategies'] : ['il']}
            />

            {selectedTab === 'il' && (
                <ImpLossView
                    isActive={isActive}
                    tokenSymbols={tokenSymbols}
                    tokenBalances={tokenBalances}
                    simulatedPooledTokenBalances={simulatedTokenBalances}
                    endPoolValueUsd={endPoolValueUsd}
                    simulatedPoolValueUsd={simulatedPoolValueUsd}
                    simulatedHodlValueUsd={simulatedHodlValueUsd}
                    tokenPricesEnd={tokenPricesEnd}
                    sliderDefaultCoeffs={sliderDefaultCoeffs}
                    lastSnapTimestampEnd={lastSnapTimestampEnd}
                    impLossUsd={impLossUsd}
                    impLossRel={impLossRel}
                    lastWeekAverageDailyRewardsUsd={lastWeekAverageDailyRewardsUsd}
                />
            )}

            {/* Double check you don't show strategy when imported pool is present */}
            {selectedTab === 'strategies' && simulationMode === 'positions' && (
                <Strategies
                    exchange={exchange}
                    poolStrategyUsd={poolStrategyUsd}
                    currentTokenBalances={currentTokenBalances}
                    currentEthPrice={ethPriceEnd}
                    currentTokenPrices={tokenPricesEnd}
                    tokenSymbols={tokenSymbols}
                    poolIsActive={isActive}
                    feesUsd={feesUsd}
                    feesTokenAmounts={feesTokenAmounts}
                    txCostUsd={txCostUsd}
                    txCostEth={txCostEth}
                    yieldUsd={yieldUsd}
                    depositTimestampsArr={depositTimestamps}
                    depositTokenAmountsArr={depositTokenAmounts}
                    depositEthAmountsArr={depositEthAmounts}
                    withdrawalsTokenAmounts={withdrawalsTokenAmounts}
                    lastWeekAverageDailyRewardsUsd={lastWeekAverageDailyRewardsUsd}
                    lastSnapTimestampEnd={lastSnapTimestampEnd}
                    hasYieldReward={hasYieldReward}
                    yieldTokenSymbols={yieldTokenSymbols}
                    yieldTotalTokenAmounts={yieldTotalTokenAmounts}
                    // simulated values
                    simulatedPooledTokenPrices={simulatedPooledTokenPrices}
                    simulatedEthPrice={simulatedEthPrice}
                    simulatedPooledTokenBalances={simulatedTokenBalances}
                    simulatedPoolValueUsd={simulatedPoolValueUsd}
                    simulatedWithdrawalsUsd={simulatedWithdrawalsUsd}
                    simulatedTxCostUsd={simulatedTxCostUsd}
                    simulatedFeesUsd={simulatedFeesUsdAll}
                    simulatedFeesTokenAmounts={simulatedFeesTokenAmountsAll}
                    simulatedYieldUsd={simulatedYieldUsd}
                    // strategies
                    simulatedPoolStrategyUsd={simulatedPoolStrategyUsd}
                    simulatedTokensHodlStrategyUsd={simulatedTokensHodlStrategyUsd}
                    simulatedEthHodlStrategyUsd={simulatedEthHodlStrategyUsd}
                    tokensHodlStrategyUsd={tokensHodlStrategyUsd}
                    ethHodlStrategyUsd={ethHodlStrategyUsd}
                    tokensHodlStrategyTokenAmounts={tokensHodlStrategyTokenAmounts}
                    ethHodlStrategyEth={ethHodlStrategyEth}
                    // slider
                    sliderDefaultCoeffs={sliderDefaultCoeffs}
                    sliderDefaultEthCoeff={sliderDefaultEthCoeff}
                />
            )}
        </Wrapper>
    );
};
export default RightContainer;
