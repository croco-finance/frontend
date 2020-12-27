import { colors, variables, types } from '@config';
import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { graphUtils, formatUtils } from '@utils';
import LiquidityPool from './LiquidityPool';
import DifferentStrategy from './DifferentStrategy';
import { QuestionTooltip, InfoBox } from '@components/ui';
import { Link } from 'react-router-dom';

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 650px;
    margin: 0 auto;
    flex-grow: 1;
    flex-shrink: 0;
`;

const Headline = styled.h3`
    width: 100%;
    font-size: ${variables.FONT_SIZE.H3};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    display: flex;
    text-align: left;
    color: ${props => props.theme.FONT_MEDIUM};
    padding-left: 15px;
    margin-top: 10px;
    margin-bottom: 10px;
`;

const SubHeadline = styled.h3`
    width: 100%;
    font-size: ${variables.FONT_SIZE.NORMAL};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    display: flex;
    text-align: left;
    color: ${props => props.theme.FONT_MEDIUM};
    padding-left: 15px;
    margin-top: 35px;
    margin-bottom: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid ${props => props.theme.STROKE_GREY};
`;

const Description = styled.p`
    width: 100%;
    padding-left: 15px;
    color: ${props => props.theme.FONT_MEDIUM};
    margin-top: 0;
    margin-bottom: 30px;
`;

const StrategyItemWrapper = styled.div`
    width: 100%;
    margin-bottom: 15px;
`;

const SectionHeader = styled.div<{ marginTop: number }>`
    display: flex;
    padding: 0 50px 10px 15px;
    margin-top: ${props => props.marginTop}px;
    width: 100%;
    font-size: ${variables.FONT_SIZE.SMALL};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    color: ${props => props.theme.FONT_LIGHT};
`;

const StyledLink = styled(Link)`
    text-decoration: none;
    color: ${props => props.theme.BLUE};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};

    &:hover {
        text-decoration: underline;
    }
`;

const BalancerBanner = styled.div`
    margin-bottom: 20px;
`;

const B = styled.span`
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    font-style: italic;
`;

const TooltipHeadline = styled.div`
    margin-bottom: 8px;
`;

const Strategies = () => {
    const allPools: types.AllPoolsGlobal = useSelector(state => state.allPools);
    const selectedPoolId = useSelector(state => state.selectedPoolId);
    const activePoolIds = useSelector(state => state.activePoolIds);
    let pool = allPools[selectedPoolId];

    if (activePoolIds.length <= 0 && selectedPoolId === 'all') {
        return null;
    }

    let {
        pooledTokens,
        isActive,
        yieldToken,
        intervalStats,
        depositTimestamps,
        depositTokenAmounts,
        depositEthAmounts,
        hasYieldReward,
    } = pool;

    const {
        feesUsd,
        yieldUsd,
        txCostEth,
        txCostUsd,
        ethPriceEnd,
        feesTokenAmounts,
        yieldTotalTokenAmount,
        poolStrategyUsd,
        tokensHodlStrategyTokenAmounts,
        ethHodlStrategyUsd,
        lastIntAvDailyRewardsUsd,
        tokenPricesEnd,
        tokensHodlStrategyUsd,
        yieldTokenSymbols,
        yieldTotalTokenAmounts,
    } = pool.cumulativeStats;

    const tokenSymbolsArr = formatUtils.getTokenSymbolArr(pooledTokens);

    const endTimeText = isActive
        ? 'Value today'
        : `Value on ${formatUtils.getFormattedDateFromTimestamp(
              intervalStats[intervalStats.length - 1].timestampEnd,
              'MONTH_DAY_YEAR',
          )}`;

    let exchange;
    if (allPools && allPools[selectedPoolId]) {
        exchange = allPools[selectedPoolId].exchange;
    }

    return (
        <Wrapper>
            <Headline>
                {isActive ? 'Is' : 'Was'} it worth it to be liquidity provider in this pool?
            </Headline>
            <Description>
                We compared your pool's performance to other popular strategies. These values are
                computed for current token prices. Try{' '}
                <StyledLink
                    to={{
                        pathname: `/simulator/`,
                    }}
                >
                    simulator
                </StyledLink>{' '}
                to see estimates for different prices.
            </Description>

            <SectionHeader marginTop={0}>
                Being liquidity provider
                <QuestionTooltip
                    content={
                        <span>
                            <TooltipHeadline>
                                You decided to be a liquidity provider. We value this strategy as
                                follows:{' '}
                            </TooltipHeadline>
                            <B>
                                value = what you have in the pool + what you withdrew from the pool
                                + yield - tx.costs
                            </B>{' '}
                        </span>
                    }
                />
            </SectionHeader>
            <StrategyItemWrapper>
                <LiquidityPool />
            </StrategyItemWrapper>

            <SubHeadline>Comparison to other strategies</SubHeadline>

            {exchange === 'BALANCER' ? (
                <BalancerBanner>
                    <InfoBox>
                        We show you only a rough estimate of the fees you gained on Balancer. We are
                        working on better Balancer integration.
                    </InfoBox>
                </BalancerBanner>
            ) : null}

            <SectionHeader marginTop={25}>
                If you HODL'd pooled tokens
                <QuestionTooltip
                    content={
                        <span>
                            <TooltipHeadline>
                                This is how much money you would have if you haven't deposited{' '}
                                anything to the pool and you held deposited tokens instead.
                            </TooltipHeadline>
                        </span>
                    }
                />
            </SectionHeader>

            <StrategyItemWrapper>
                <DifferentStrategy
                    strategyName="tokens_hodl"
                    depositsHeadline={'Crypto'}
                    endTimeText={endTimeText}
                    tokenSymbols={tokenSymbolsArr}
                    poolStrategyUsd={poolStrategyUsd}
                    feesUsd={feesUsd}
                    yieldUsd={yieldUsd}
                    txCostUsd={txCostUsd}
                    differentStrategyUsd={tokensHodlStrategyUsd}
                    feesTokenAmounts={feesTokenAmounts}
                    yieldTotalTokenAmount={yieldTotalTokenAmount}
                    yieldTokenSymbol={yieldToken ? yieldToken.symbol : undefined}
                    txCostEth={txCostEth}
                    lastIntAvDailyRewardsUsd={lastIntAvDailyRewardsUsd}
                    depositTimestampsArr={depositTimestamps}
                    depositTokenAmountsArr={depositTokenAmounts}
                    currentDepositTokenPricesArr={tokenPricesEnd}
                    depositTokenSymbolsArr={tokenSymbolsArr}
                    poolIsActive={isActive}
                    yieldTokenSymbols={yieldTokenSymbols}
                    yieldTotalTokenAmounts={yieldTotalTokenAmounts}
                    hasYieldReward={hasYieldReward}
                />
            </StrategyItemWrapper>

            <SectionHeader marginTop={30}>
                If you exchanged all pooled tokens for ETH and HODL'd
                <QuestionTooltip
                    content={
                        <span>
                            <TooltipHeadline>
                                This is how much money you would have if you haven't deposited{' '}
                                anything to the pool and you exchanged all deposited tokens for ETH
                                instead.
                            </TooltipHeadline>
                        </span>
                    }
                />
            </SectionHeader>

            <StrategyItemWrapper>
                <DifferentStrategy
                    strategyName="eth_hodl"
                    depositsHeadline={'ETH value'}
                    endTimeText={endTimeText}
                    tokenSymbols={tokenSymbolsArr}
                    poolStrategyUsd={poolStrategyUsd}
                    feesUsd={feesUsd}
                    yieldUsd={yieldUsd}
                    txCostUsd={txCostUsd}
                    differentStrategyUsd={ethHodlStrategyUsd}
                    feesTokenAmounts={feesTokenAmounts}
                    yieldTotalTokenAmount={yieldTotalTokenAmount}
                    yieldTokenSymbol={yieldToken ? yieldToken.symbol : undefined}
                    txCostEth={txCostEth}
                    lastIntAvDailyRewardsUsd={lastIntAvDailyRewardsUsd}
                    depositTimestampsArr={depositTimestamps}
                    depositTokenAmountsArr={depositEthAmounts}
                    currentDepositTokenPricesArr={[ethPriceEnd]}
                    depositTokenSymbolsArr={['ETH']}
                    poolIsActive={isActive}
                    yieldTokenSymbols={yieldTokenSymbols}
                    yieldTotalTokenAmounts={yieldTotalTokenAmounts}
                    hasYieldReward={hasYieldReward}
                />
            </StrategyItemWrapper>
        </Wrapper>
    );
};
export default Strategies;
