import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import Overview from './Overview';
import { TabSelectHeader, PoolHeader } from '@components/ui';
import { formatUtils, graphUtils, simulatorUtils, mathUtils } from '@utils';
import { AllPoolsGlobal } from '@types';
import Strategies from './Strategies';
import { getTokenArrayValue } from 'src/utils/math';

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
`;

type TabOptions = 'overview' | 'strategies';

interface Props {
    simulatedPooledTokensCoeffs: Array<number>;
    simulatedEthCoeff: number;
    simulatedYieldCoeff: number;
    sliderDefaultCoeffs: Array<number>;
    sliderDefaultEthCoeff: number;
    onTabChanged: any;
    selectedTab: TabOptions;
}
const RightContainer = ({
    simulatedPooledTokensCoeffs,
    sliderDefaultCoeffs,
    simulatedYieldCoeff,
    simulatedEthCoeff,
    sliderDefaultEthCoeff,
    onTabChanged,
    selectedTab,
}: Props) => {
    const allPools: AllPoolsGlobal = useSelector(state => state.allPools);
    const selectedPoolId = useSelector(state => state.selectedPoolId);
    // const [selectedTab, setSelectedTab] = useState<TabOptions>('overview');

    // TODO make the following checks and computations cleaner
    if (!allPools) {
        return null;
        // <SelectPoolWrapper>Please input your Ethereum address on the left</SelectPoolWrapper>
    }

    // just in case the Pool summary is selected, return the following message
    if (selectedPoolId === 'all' || !selectedPoolId || !allPools[selectedPoolId]) {
        // return <SelectPoolWrapper>Select your pool</SelectPoolWrapper>;
        return null;
    }

    let pool = allPools[selectedPoolId];

    let {
        poolId,
        pooledTokens,
        isActive,
        yieldToken,
        intervalStats,
        exchange,
        tokenWeights,
        deposits,
        depositTimestamps,
        depositTokenAmounts,
        depositEthAmounts,
        tokenSymbols,
    } = pool;

    const {
        yieldUsd,
        txCostEth,
        txCostUsd,
        tokenBalances,
        feesTokenAmounts,
        yieldTotalTokenAmount,
        withdrawalsTokenAmounts,
        poolStrategyUsd,
        ethPriceEnd,
        tokenPricesEnd,
        ethHodlStrategyUsd,
        tokensHodlStrategyUsd,
        feesUsd,
        lastIntAvDailyRewardsUsd,
        tokensHodlStrategyTokenAmounts,
        ethHodlStrategyEth,
        endPoolValueUsd,
        yieldTokenPriceEnd,
        currentTokenBalances,
        feesTokenAmountsExceptLastInt,
    } = pool.cumulativeStats;

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
    let simulatedValues = simulatorUtils.getSimulationStats(
        tokenBalances,
        lastSnapFeesTokenAmounts,
        simulatedPooledTokenPrices,
        tokenWeights,
        exchange,
    );
    let {
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
    const simulatedYieldUsd = yieldTotalTokenAmount * simulatedYieldPrice; //TODO check if yield among pooled tokens
    const simulatedTxCostUsd = txCostEth * simulatedEthPrice;

    // STRATEGIES
    // if pool is not active, do not add "simulatedPoolValueUsd"
    let simulatedCurrentPoolValueUsd = isActive ? simulatedPoolValueUsd : 0;
    let simulatedPoolStrategyUsd =
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
                headline={
                    <PoolHeader
                        tokenSymbolsArr={tokenSymbols}
                        exchange={exchange}
                        poolId={poolId}
                    />
                }
                onSelectTab={tabName => onTabChanged(tabName)}
            />

            {selectedTab === 'overview' && (
                <Overview
                    isActive={isActive}
                    tokenSymbols={tokenSymbols}
                    tokenBalances={tokenBalances}
                    simulatedPooledTokenBalances={simulatedTokenBalances}
                    endPoolValueUsd={endPoolValueUsd}
                    simulatedPoolValueUsd={simulatedPoolValueUsd}
                    simulatedHodlValueUsd={simulatedHodlValueUsd}
                    tokenPricesEnd={tokenPricesEnd}
                    sliderDefaultCoeffs={sliderDefaultCoeffs}
                    lastIntSimulatedFeesUsd={simulatedFeesUsd}
                    lastIntYieldUsd={lastIntYieldUsd}
                    lastSnapTimestampStart={lastSnapTimestampStart}
                    lastSnapTimestampEnd={lastSnapTimestampEnd}
                    impLossUsd={impLossUsd}
                    impLossRel={impLossRel}
                />
            )}

            {selectedTab === 'strategies' && (
                <Strategies
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
                    yieldTotalTokenAmount={yieldTotalTokenAmount}
                    yieldUsd={yieldUsd}
                    yieldTokenSymbol={yieldToken ? yieldToken.symbol : undefined}
                    lastIntAvDailyRewardsUsd={lastIntAvDailyRewardsUsd}
                    depositTimestampsArr={depositTimestamps}
                    depositTokenAmountsArr={depositTokenAmounts}
                    depositEthAmountsArr={depositEthAmounts}
                    withdrawalsTokenAmounts={withdrawalsTokenAmounts}
                    lastIntSimulatedAverageRewards={lastIntSimulatedAverageRewards}
                    lastSnapTimestampEnd={lastSnapTimestampEnd}
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
                    //slider
                    sliderDefaultCoeffs={sliderDefaultCoeffs}
                    sliderDefaultEthCoeff={sliderDefaultEthCoeff}
                />
            )}
        </Wrapper>
    );
};
export default RightContainer;
