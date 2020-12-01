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
    onTabChanged: any;
    selectedTab: TabOptions;
}
const RightContainer = ({
    simulatedPooledTokensCoeffs,
    sliderDefaultCoeffs,
    simulatedYieldCoeff,
    simulatedEthCoeff,
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
    } = pool;

    const {
        yieldUsd,
        txCostEth,
        txCostUsd,
        tokenBalances,
        feesTokenAmounts,
        yieldTokenAmount,
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

    // token symbols arr
    const tokenSymbolsArr = formatUtils.getTokenSymbolArr(pooledTokens);
    // FEES

    // Get USD value of all fees except the last interval
    let feesTokenAmountsExceptLast = new Array(tokenPricesEnd.length).fill(0);
    for (let i = 0; i < intervalStats.length - 1; i++) {
        feesTokenAmountsExceptLast = mathUtils.sumArraysElementWise(
            feesTokenAmountsExceptLast,
            intervalStats[i].feesTokenAmounts,
        );
    }
    const feesUsdExceptLast = mathUtils.getTokenArrayValue(
        feesTokenAmountsExceptLast,
        simulatedPooledTokenPrices,
    );

    // To get the simulates fees amounts, you have to sum the simulated fees (last interval) with all the previous fees
    const simulatedFeesTokenAmountsAll = mathUtils.sumArraysElementWise(
        feesTokenAmountsExceptLast,
        simulatedFeesTokenAmounts,
    );
    const simulatedFeesUsdAll = simulatedFeesUsd + feesUsdExceptLast;

    // Get current usd value of fees and yield obtained in the last interval (not simulated)
    const lastIntYieldUsd = lastIntervalStat.yieldTokenPriceEnd
        ? lastIntervalStat.yieldTokenAmount * lastIntervalStat.yieldTokenPriceEnd
        : 0;

    // DEPOSITS / WITHDRAWALS
    const depositTimestampsArr: number[] = [];
    const depositTokenAmountsArr: Array<Array<number>> = [];
    const depositEthAmountsArr: Array<Array<number>> = [];

    deposits.forEach(deposit => {
        // put withdrawals data into an array so I can render it more easily
        if (deposit.timestamp) {
            depositTimestampsArr.push(deposit.timestamp);
            depositTokenAmountsArr.push(deposit.tokenAmounts);
            depositEthAmountsArr.push([deposit.valueEth]);
        }
    });

    const simulatedWithdrawalsUsd = mathUtils.getTokenArrayValue(
        withdrawalsTokenAmounts,
        simulatedPooledTokenPrices,
    );

    // YIELD AND TX COST
    const simulatedYieldUsd = yieldTokenAmount * simulatedYieldPrice; //TODO check if yield among pooled tokens
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

    return (
        <Wrapper>
            <TabSelectHeader
                headline={
                    <PoolHeader
                        tokenSymbolsArr={tokenSymbolsArr}
                        exchange={exchange}
                        poolId={poolId}
                    />
                }
                onSelectTab={tabName => onTabChanged(tabName)}
            />

            {selectedTab === 'overview' && (
                <Overview
                    tokenSymbols={tokenSymbolsArr}
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
                    tokenSymbols={tokenSymbolsArr}
                    poolIsActive={isActive}
                    feesUsd={feesUsd}
                    feesTokenAmounts={feesTokenAmounts}
                    txCostUsd={txCostUsd}
                    txCostEth={txCostEth}
                    yieldTokenAmount={yieldTokenAmount}
                    yieldUsd={yieldUsd}
                    yieldTokenSymbol={yieldToken ? yieldToken.symbol : undefined}
                    lastIntAvDailyRewardsUsd={lastIntAvDailyRewardsUsd}
                    depositTimestampsArr={depositTimestampsArr}
                    depositTokenAmountsArr={depositTokenAmountsArr}
                    depositEthAmountsArr={depositEthAmountsArr}
                    withdrawalsTokenAmounts={withdrawalsTokenAmounts}
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
                />
            )}
        </Wrapper>
    );
};
export default RightContainer;
