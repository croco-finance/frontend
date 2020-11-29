import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { FiatValue, GrayBox, VerticalCryptoAmounts, BoxRow } from '@components/ui';
import { colors, variables, types } from '@config';
import { mathUtils, lossUtils, formatUtils, simulatorUtils, graphUtils } from '@utils';
import ILGraph from '../ILGraph';

const Wrapper = styled.div`
    width: 100%;
    max-width: 650px;
    margin: 0 auto;
`;

const GridWrapper = styled.div`
    flex-grow: 1;
    display: grid;
    gap: 28px 10px;
    grid-template-columns: minmax(100px, auto) minmax(110px, auto) minmax(110px, auto) 125px;
    grid-auto-rows: auto;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    align-items: center;
    /* allow x-axis scrolling: useful on small screens when fiat amount is displayed */
    /* overflow-x: auto; */
    word-break: break-all;
    align-items: baseline;
    width: 100%;
    min-width: fit-content;

    @media (max-width: ${variables.SCREEN_SIZE.SM}) {
        font-size: ${variables.FONT_SIZE.SMALL};
        gap: 18px 5px;
        /* grid-template-columns: 140px minmax(90px, auto) minmax(90px, auto); */
    }
`;

const HeaderWrapper = styled.div`
    padding: 0 20px 10px 20px;
    margin-top: 10px;
    font-size: ${variables.FONT_SIZE.SMALL};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    color: ${colors.FONT_LIGHT};
`;

const ImpLossHeader = styled(HeaderWrapper)`
    margin-top: 40px;
`;

const ImpLossGridWrapper = styled(GridWrapper)`
    grid-template-columns: minmax(200px, auto) minmax(110px, auto) 120px;
`;

const PoolValueGridWrapper = styled(GridWrapper)`
    /* grid-auto-rows: 46px; */
    align-items: baseline;
    padding-top: 0;
`;

const PoolValueCryptoFiatWrapper = styled.div`
    display: flex;
    flex-direction: column;
`;

const PoolValueCryptoFiatWrapperBorder = styled(PoolValueCryptoFiatWrapper)`
    border-right: 1px solid ${colors.STROKE_GREY};
    padding-right: 10px;
`;

const StyledFiatValueWrapper = styled(FiatValue)`
    margin-bottom: 8px;
`;

const ColorizedFiatValueWrapper = styled(StyledFiatValueWrapper)`
    font-size: ${variables.FONT_SIZE.SMALL};
`;

const ImpLossRel = styled.div`
    color: ${colors.FONT_LIGHT};
`;

const RightPaddingWrapper = styled.div`
    padding-right: 10px;
`;

const GraphWrapper = styled.div`
    padding: 60px 10px 10px 10px;
    width: 100%;
`;

const GraphTitle = styled.div`
    color: ${colors.FONT_MEDIUM};
    text-align: center;
    padding-bottom: 15px;
    padding-left: 50px;
`;

const DaysLeftGridWrapper = styled(ImpLossGridWrapper)`
    gap: 5px 10px;
    font-size: ${variables.FONT_SIZE.NORMAL};
    color: ${colors.FONT_LIGHT};
`;

const EstDaysLeftWrapper = styled.div`
    display: flex;
    flex-direction: column;
    word-break: break-word;
`;

const SubNoteDaysLeft = styled.div`
    margin-top: 15px;
    font-size: ${variables.FONT_SIZE.SMALL};
    color: ${colors.FONT_LIGHT};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
`;

const XScrollWrapper = styled.div`
    overflow-x: auto;
`;

interface Props {
    simulatedCoeffs: Array<number>;
    sliderDefaultCoeffs: Array<number>;
}

const CardOverview = ({ simulatedCoeffs, sliderDefaultCoeffs }: Props) => {
    const allPools: types.AllPoolsGlobal = useSelector(state => state.allPools);
    const selectedPoolId = useSelector(state => state.selectedPoolId);
    const pool = allPools[selectedPoolId];

    let { pooledTokens, exchange, tokenWeights, isActive } = pool;

    let {
        // TODO make sure you use current token balances, not cumulative values
        tokenBalances,
        feesTokenAmounts,
        tokenPricesEnd,
        endPoolValueUsd,
    } = pool.cumulativeStats;

    // ----- GET SIMULATION VALUES -----
    // Array of new prices, not coefficients
    const newTokenPrices = mathUtils.multiplyArraysElementWise(tokenPricesEnd, simulatedCoeffs);

    let simulatedValues = simulatorUtils.getSimulationStats(
        tokenBalances,
        feesTokenAmounts,
        newTokenPrices,
        tokenWeights,
        exchange,
    );
    let {
        newTokenBalances,
        newPoolValueUsd,
        newHodlValueUsd,
        impLossRel,
        impLossUsd,
    } = simulatedValues;

    // TODO check if yield token is also part of pool (if yes, change its price accordingly)
    const tokenSymbolsArr = formatUtils.getTokenSymbolArr(pooledTokens);

    const tokenBalancesDiff = mathUtils.subtractArraysElementWise(newTokenBalances, tokenBalances);

    const graphData = graphUtils.getILGraphData(endPoolValueUsd, newPoolValueUsd, newHodlValueUsd);
    const maxPossibleSimulationValue = graphUtils.getMaxPossiblePoolValue(
        tokenBalances,
        tokenPricesEnd,
        sliderDefaultCoeffs,
        2,
    );

    // get estimated days left to compensate loss
    const lastIntervalStat = pool.intervalStats[pool.intervalStats.length - 1];
    const lastSnapTimestampStart = lastIntervalStat.timestampStart;
    const lastSnapTimestampEnd = lastIntervalStat.timestampEnd;
    const lastSnapFeesUsd = lastIntervalStat.feesUsdEndPrice;

    const lastSnapYieldUsd = lastIntervalStat.yieldTokenPriceEnd
        ? lastIntervalStat.yieldTokenAmount * lastIntervalStat.yieldTokenPriceEnd
        : 0;

    const poolValueIncreaseCoeff = newPoolValueUsd / endPoolValueUsd;

    const averageRewardsLastSnapshot = mathUtils.getAverageDailyRewards(
        lastSnapTimestampStart,
        lastSnapTimestampEnd,
        // TODO is this correct way how to compute new fee value after price change?
        lastSnapFeesUsd * poolValueIncreaseCoeff + lastSnapYieldUsd,
    );

    const estDaysLeftStaking = Math.round(Math.abs(impLossUsd / averageRewardsLastSnapshot));

    return (
        <Wrapper>
            <XScrollWrapper>
                <HeaderWrapper>
                    <GridWrapper>
                        <BoxRow
                            firstColumn="Pool overview"
                            secondColumn="Today"
                            thirdColumn={<RightPaddingWrapper>Simulated</RightPaddingWrapper>}
                            fourthColumn="Difference"
                            columnColors={['light', 'light', 'light', 'light']}
                            columnAlignment={['left', 'right', 'right', 'left']}
                        />
                    </GridWrapper>
                </HeaderWrapper>
                <GrayBox padding={[15, 20, 18, 20]}>
                    <PoolValueGridWrapper>
                        <BoxRow
                            columnAlignment={['left', 'right', 'right', 'left']}
                            firstColumn="Your pool size"
                            secondColumn={
                                <PoolValueCryptoFiatWrapper>
                                    <StyledFiatValueWrapper value={endPoolValueUsd} />
                                    <VerticalCryptoAmounts
                                        maxWidth={70}
                                        tokenSymbols={tokenSymbolsArr}
                                        tokenAmounts={tokenBalances}
                                    />
                                </PoolValueCryptoFiatWrapper>
                            }
                            // simulation values
                            thirdColumn={
                                <PoolValueCryptoFiatWrapperBorder>
                                    <StyledFiatValueWrapper value={newPoolValueUsd} />
                                    <VerticalCryptoAmounts
                                        maxWidth={70}
                                        tokenSymbols={tokenSymbolsArr}
                                        tokenAmounts={newTokenBalances}
                                    />
                                </PoolValueCryptoFiatWrapperBorder>
                            }
                            // difference values
                            fourthColumn={
                                <PoolValueCryptoFiatWrapper>
                                    <ColorizedFiatValueWrapper
                                        value={newPoolValueUsd - endPoolValueUsd}
                                        usePlusSymbol
                                        colorized
                                    />
                                    <VerticalCryptoAmounts
                                        maxWidth={40}
                                        tokenSymbols={tokenSymbolsArr}
                                        tokenAmounts={tokenBalancesDiff}
                                        textAlign="left"
                                        usePlusSymbol
                                    />
                                </PoolValueCryptoFiatWrapper>
                            }
                        />
                    </PoolValueGridWrapper>
                </GrayBox>
            </XScrollWrapper>
            <XScrollWrapper>
                <ImpLossHeader>Impermanent loss compared to HODLing pooled tokens</ImpLossHeader>
                <GrayBox
                    padding={[15, 20, 15, 20]}
                    bottomBar={
                        <>
                            <DaysLeftGridWrapper>
                                <BoxRow
                                    columnAlignment={['left', 'right', 'left']}
                                    firstColumn={
                                        <EstDaysLeftWrapper>
                                            <div>Est. days left to compensate loss*</div>
                                        </EstDaysLeftWrapper>
                                    }
                                    secondColumn={
                                        <RightPaddingWrapper>
                                            {estDaysLeftStaking}
                                        </RightPaddingWrapper>
                                    }
                                    thirdColumn={<></>}
                                />
                            </DaysLeftGridWrapper>
                            <SubNoteDaysLeft>
                                *According to your average rewards since{' '}
                                {formatUtils.getFormattedDateFromTimestamp(
                                    lastSnapTimestampStart,
                                    'MONTH_DAY_YEAR',
                                )}
                                <br></br>
                                (date of your last interaction with the pool)
                            </SubNoteDaysLeft>
                        </>
                    }
                >
                    <ImpLossGridWrapper>
                        <BoxRow
                            columnAlignment={['left', 'right', 'left']}
                            firstColumn="Impermanent loss"
                            secondColumn={
                                <PoolValueCryptoFiatWrapperBorder>
                                    <FiatValue value={-impLossUsd} usePlusSymbol />
                                </PoolValueCryptoFiatWrapperBorder>
                            }
                            thirdColumn={
                                <ImpLossRel>
                                    {formatUtils.getFormattedPercentageValue(
                                        Math.abs(impLossRel) < 0.00001 ? 0 : impLossRel,
                                        false,
                                    )}
                                </ImpLossRel>
                            }
                        />
                    </ImpLossGridWrapper>
                </GrayBox>
            </XScrollWrapper>

            <GraphWrapper>
                <GraphTitle>Pool / HODL value comparison</GraphTitle>
                <ILGraph data={graphData} maxPossibleValue={maxPossibleSimulationValue} />
            </GraphWrapper>
        </Wrapper>
    );
};

export default CardOverview;
