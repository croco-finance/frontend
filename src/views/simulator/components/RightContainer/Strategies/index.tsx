import { colors, variables, types } from '@config';
import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { graphUtils, formatUtils, mathUtils } from '@utils';
import LiquidityPool from './LiquidityPool';
import DifferentStrategy from './DifferentStrategy';
import { BoxRow, GrayBox, Icon, InfoBox } from '@components/ui';
import { Link } from 'react-router-dom';
import Graph from './Graph';

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 50px;
    width: 100%;
`;

const SubHeadline = styled.h3`
    width: 100%;
    font-size: ${variables.FONT_SIZE.NORMAL};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    display: flex;
    text-align: left;
    color: ${colors.FONT_MEDIUM};
    padding-left: 15px;
    margin-top: 35px;
    margin-bottom: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid ${colors.STROKE_GREY};
`;

const StrategyItemWrapper = styled.div`
    width: 100%;
    margin-bottom: 15px;
`;

const SectionHeader = styled.div<{ marginTop: number }>`
    padding: 0 50px 10px 15px;
    margin-top: ${props => props.marginTop}px;
    width: 100%;
    font-size: ${variables.FONT_SIZE.SMALL};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    color: ${colors.FONT_LIGHT};
    display: flex;
`;

const Left = styled.div`
    flex-grow: 1;
`;

const Right = styled.div`
    /* font-weight: ${variables.FONT_WEIGHT.REGULAR}; */
`;

const Current = styled.span``;
const Simulated = styled.span`
    color: ${colors.FONT_DARK};
`;

const SimulatedBlue = styled.span`
    color: ${colors.BLUE};
`;

const GraphWrapper = styled.div`
    padding: 30px 10px 10px 10px;
    width: 100%;
`;

const GraphTitle = styled.div`
    color: ${colors.FONT_MEDIUM};
    text-align: center;
    padding-bottom: 15px;
    padding-left: 50px;
`;

interface Props {
    poolStrategyUsd: number;
    currentTokenBalances: number[];
    currentEthPrice: number;
    currentTokenPrices: number[];
    feesUsd: number;
    yieldUsd: number;
    txCostUsd: number;
    feesTokenAmounts: number[];
    tokenSymbols: string[];
    txCostEth: number;
    lastIntAvDailyRewardsUsd: number;
    depositTimestampsArr: number[];
    depositTokenAmountsArr: Array<Array<number>>;
    poolIsActive: boolean;
    depositEthAmountsArr: any;
    lastSnapTimestampEnd: number;
    simulatedPooledTokenPrices: any;
    simulatedEthPrice: any;
    simulatedTokensHodlStrategyUsd: number;
    simulatedEthHodlStrategyUsd: number;
    tokensHodlStrategyUsd: number;
    ethHodlStrategyUsd: number;
    simulatedPoolStrategyUsd: number;
    simulatedPooledTokenBalances: number[];
    simulatedPoolValueUsd: number;
    withdrawalsTokenAmounts: number[];
    simulatedWithdrawalsUsd: number;
    simulatedTxCostUsd: number;
    simulatedFeesUsd: number;
    simulatedFeesTokenAmounts: number[];
    simulatedYieldUsd: number;
    tokensHodlStrategyTokenAmounts: number[];
    ethHodlStrategyEth: number;
    lastIntSimulatedAverageRewards: number;
    yieldTokenSymbols: string[];
    yieldTotalTokenAmounts: number[];
    hasYieldReward: boolean;
    // slider
    sliderDefaultCoeffs: number[];
    sliderDefaultEthCoeff: number;
}

const Strategies = ({
    poolIsActive,
    currentTokenBalances,
    currentEthPrice,
    currentTokenPrices,
    poolStrategyUsd,
    tokensHodlStrategyUsd,
    ethHodlStrategyUsd,
    feesUsd,
    yieldUsd,
    txCostUsd,
    feesTokenAmounts,
    tokenSymbols,
    txCostEth,
    lastIntAvDailyRewardsUsd,
    lastSnapTimestampEnd,
    depositTimestampsArr,
    depositTokenAmountsArr,
    depositEthAmountsArr,
    withdrawalsTokenAmounts,
    simulatedPooledTokenPrices,
    simulatedEthPrice,
    simulatedTokensHodlStrategyUsd,
    simulatedEthHodlStrategyUsd,
    simulatedPoolStrategyUsd,
    simulatedPooledTokenBalances,
    simulatedPoolValueUsd,
    simulatedWithdrawalsUsd,
    simulatedTxCostUsd,
    simulatedFeesUsd,
    simulatedFeesTokenAmounts,
    simulatedYieldUsd,
    tokensHodlStrategyTokenAmounts,
    ethHodlStrategyEth,
    sliderDefaultCoeffs,
    sliderDefaultEthCoeff,
    lastIntSimulatedAverageRewards,
    yieldTokenSymbols,
    yieldTotalTokenAmounts,
    hasYieldReward,
}: Props) => {
    const graphData = graphUtils.getStrategiesGraphData(
        poolStrategyUsd,
        tokensHodlStrategyUsd,
        ethHodlStrategyUsd,
        simulatedPoolStrategyUsd,
        simulatedTokensHodlStrategyUsd,
        simulatedEthHodlStrategyUsd,
    );

    const maxPossibleGraphValue = graphUtils.getStrategiesMaxPossiblePoolValues(
        currentTokenPrices,
        currentEthPrice,
        sliderDefaultCoeffs,
        sliderDefaultEthCoeff,
        currentTokenBalances,
        withdrawalsTokenAmounts,
        yieldUsd,
        txCostEth,
        tokensHodlStrategyTokenAmounts,
        ethHodlStrategyEth,
    );

    // const maxPossibleSimulationValue
    return (
        <Wrapper>
            {/* <Headline>Is it worth it to be liquidity provider in this pool?</Headline> */}
            {/* <Description>
                We compared your pool's performance to other popular strategies.
            </Description> */}

            {/* <SectionHeader marginTop={0}>Being liquidity provider</SectionHeader> */}
            <SectionHeader marginTop={0}>
                <Left>Being liquidity provider</Left>
                <Right>
                    <Current>Current</Current> | <SimulatedBlue>Simulated</SimulatedBlue>
                </Right>
            </SectionHeader>
            <StrategyItemWrapper>
                <LiquidityPool
                    isActive={poolIsActive}
                    tokenSymbols={tokenSymbols}
                    pooledTokenBalances={
                        poolIsActive
                            ? simulatedPooledTokenBalances
                            : new Array(simulatedPooledTokenBalances.length).fill(0)
                    }
                    simulatedPoolValueUsd={poolIsActive ? simulatedPoolValueUsd : 0}
                    withdrawalsTokenAmounts={withdrawalsTokenAmounts}
                    simulatedWithdrawalsUsd={simulatedWithdrawalsUsd}
                    simulatedTxCostUsd={simulatedTxCostUsd}
                    simulatedPoolStrategyUsd={simulatedPoolStrategyUsd}
                    poolStrategyUsd={poolStrategyUsd}
                    txCostEth={txCostEth}
                    simulatedYieldUsd={simulatedYieldUsd}
                    lastSnapTimestampEnd={lastSnapTimestampEnd}
                    hasYieldReward={hasYieldReward}
                    yieldTokenSymbols={yieldTokenSymbols}
                    yieldTotalTokenAmounts={yieldTotalTokenAmounts}
                />
            </StrategyItemWrapper>

            <SubHeadline>Comparison to other strategies</SubHeadline>

            <SectionHeader marginTop={25}>
                <Left>If you HODL'd pooled tokens</Left>
                <Right>
                    <Current>Current</Current> | <Simulated>Simulated</Simulated>
                </Right>
            </SectionHeader>

            <StrategyItemWrapper>
                <DifferentStrategy
                    depositsHeadline={'Tokens'}
                    tokenSymbols={tokenSymbols}
                    poolStrategyUsd={poolStrategyUsd}
                    feesUsd={feesUsd}
                    yieldUsd={yieldUsd}
                    txCostUsd={txCostUsd}
                    differentStrategyUsd={tokensHodlStrategyUsd}
                    simulatedDifferentStrategyUsd={simulatedTokensHodlStrategyUsd}
                    feesTokenAmounts={feesTokenAmounts}
                    txCostEth={txCostEth}
                    lastIntAvDailyRewardsUsd={lastIntAvDailyRewardsUsd}
                    depositTimestampsArr={depositTimestampsArr}
                    depositTokenAmountsArr={depositTokenAmountsArr}
                    currentDepositTokenPricesArr={simulatedPooledTokenPrices}
                    depositTokenSymbolsArr={tokenSymbols}
                    poolIsActive={poolIsActive}
                    simulatedPoolStrategyUsd={simulatedPoolStrategyUsd}
                    simulatedTxCostUsd={simulatedTxCostUsd}
                    simulatedFeesUsd={simulatedFeesUsd}
                    simulatedFeesTokenAmounts={simulatedFeesTokenAmounts}
                    simulatedYieldUsd={simulatedYieldUsd}
                    lastIntSimulatedAverageRewards={lastIntSimulatedAverageRewards}
                    hasYieldReward={hasYieldReward}
                    yieldTokenSymbols={yieldTokenSymbols}
                    yieldTotalTokenAmounts={yieldTotalTokenAmounts}
                />
            </StrategyItemWrapper>

            {/* <SectionHeader marginTop={30}>
                If you exchanged all pooled tokens for ETH and HODL'd
            </SectionHeader> */}
            <SectionHeader marginTop={25}>
                <Left> If you exchanged all pooled tokens for ETH and HODL'd</Left>
                {/* <Right>
                    <Current>Current</Current> | <Simulated>Simulated</Simulated>
                </Right> */}
            </SectionHeader>

            <StrategyItemWrapper>
                <DifferentStrategy
                    depositsHeadline={'ETH value'}
                    tokenSymbols={tokenSymbols}
                    poolStrategyUsd={poolStrategyUsd}
                    feesUsd={feesUsd}
                    yieldUsd={yieldUsd}
                    txCostUsd={txCostUsd}
                    differentStrategyUsd={ethHodlStrategyUsd}
                    simulatedDifferentStrategyUsd={simulatedEthHodlStrategyUsd}
                    feesTokenAmounts={feesTokenAmounts}
                    txCostEth={txCostEth}
                    lastIntAvDailyRewardsUsd={lastIntAvDailyRewardsUsd}
                    depositTimestampsArr={depositTimestampsArr}
                    depositTokenAmountsArr={depositEthAmountsArr}
                    currentDepositTokenPricesArr={[simulatedEthPrice]}
                    depositTokenSymbolsArr={['ETH']}
                    poolIsActive={poolIsActive}
                    simulatedPoolStrategyUsd={simulatedPoolStrategyUsd}
                    simulatedTxCostUsd={simulatedTxCostUsd}
                    simulatedFeesUsd={simulatedFeesUsd}
                    simulatedFeesTokenAmounts={simulatedFeesTokenAmounts}
                    simulatedYieldUsd={simulatedYieldUsd}
                    lastIntSimulatedAverageRewards={lastIntSimulatedAverageRewards}
                    hasYieldReward={hasYieldReward}
                    yieldTokenSymbols={yieldTokenSymbols}
                    yieldTotalTokenAmounts={yieldTotalTokenAmounts}
                />
            </StrategyItemWrapper>
            {/* <SubHeadline>Strategy values</SubHeadline> */}
            <GraphWrapper>
                <GraphTitle>Value of different strategies</GraphTitle>
                <Graph data={graphData} maxPossibleValue={maxPossibleGraphValue} />
            </GraphWrapper>
        </Wrapper>
    );
};
export default Strategies;
