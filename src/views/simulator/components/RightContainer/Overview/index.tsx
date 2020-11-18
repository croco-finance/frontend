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

    @media (max-width: ${variables.SCREEN_SIZE.SM}) {
        font-size: ${variables.FONT_SIZE.SMALL};
        gap: 18px 5px;
        grid-template-columns: 140px minmax(90px, auto) minmax(90px, auto);
    }
`;

const HeaderWrapper = styled.div`
    padding: 0 20px 12px 20px;
    margin-top: 20px;
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

interface Props {
    simulatedCoefficients: Array<number>;
    sliderDefaultCoeffs: Array<number>;
}

const CardOverview = ({ simulatedCoefficients, sliderDefaultCoeffs }: Props) => {
    const allPools: types.AllPoolsGlobal = useSelector(state => state.allPools);
    const selectedPoolId = useSelector(state => state.selectedPoolId);

    const pool = allPools[selectedPoolId];

    let { tokens, hasYieldReward, isActive, exchange, tokenWeights } = pool;

    let {
        // TODO make sure you use current token balances, not cumulative values
        tokenBalances,
        feesTokenAmounts,
        feesUsd,
        yieldTokenAmount,
        yieldUsd,
        txCostEth,
        txCostUsd,
        rewardsMinusExpensesUsd,
        timestampEnd,
        tokenPricesEnd,
        poolValueUsd,
    } = pool.cumulativeStats;

    // ----- GET SIMULATION VALUES -----
    // Array of new prices, not coefficients
    const newTokenPrices = mathUtils.multiplyArraysElementWise(
        tokenPricesEnd,
        simulatedCoefficients,
    );

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
        newFeesUsd,
        newHodlValueUsd,
        impLossRel,
        impLossUsd,
    } = simulatedValues;

    if (Math.abs(impLossRel) < 0.00001) impLossRel = 0;

    // TODO check if yield token is also part of pool (if yes, change its price accordingly)
    const newRewardsMinusExpensesUsd = newFeesUsd + yieldUsd - txCostUsd;

    const tokenSymbolsArr = formatUtils.getTokenSymbolArr(tokens);

    const tokenBalancesDiff = mathUtils.subtractArraysElementWise(newTokenBalances, tokenBalances);

    const graphData = graphUtils.getILGraphData(poolValueUsd, newPoolValueUsd, newHodlValueUsd);
    const maxPossibleSimulationValue = graphUtils.getMaxPossiblePoolValue(
        tokenBalances,
        tokenPricesEnd,
        sliderDefaultCoeffs,
        2,
    );
    return (
        <Wrapper>
            <HeaderWrapper>
                <GridWrapper>
                    <BoxRow
                        firstColumn="Pool overview"
                        secondColumn="Today"
                        thirdColumn={<RightPaddingWrapper>Simulated</RightPaddingWrapper>}
                        fourthColumn=""
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
                                <StyledFiatValueWrapper value={poolValueUsd} />
                                <VerticalCryptoAmounts
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
                                    tokenSymbols={tokenSymbolsArr}
                                    tokenAmounts={newTokenBalances}
                                />
                            </PoolValueCryptoFiatWrapperBorder>
                        }
                        // difference values
                        fourthColumn={
                            <PoolValueCryptoFiatWrapper>
                                <ColorizedFiatValueWrapper
                                    value={newPoolValueUsd - poolValueUsd}
                                    usePlusSymbol
                                    colorized
                                />
                                <VerticalCryptoAmounts
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
            <ImpLossHeader>Impermanent loss compared to HODLing tokens</ImpLossHeader>
            <GrayBox
                padding={[15, 20, 15, 20]}
                bottomBar={
                    <ImpLossGridWrapper>
                        <BoxRow
                            columnAlignment={['left', 'right', 'left']}
                            firstColumn="Est. days left to compensate loss*"
                            secondColumn={<RightPaddingWrapper>TODO</RightPaddingWrapper>}
                            thirdColumn={<></>}
                        />
                    </ImpLossGridWrapper>
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
                                {formatUtils.getFormattedPercentageValue(impLossRel, false)}
                            </ImpLossRel>
                        }
                    />
                </ImpLossGridWrapper>
            </GrayBox>
            <GraphWrapper>
                <GraphTitle>Pool / HODL value comparison</GraphTitle>
                <ILGraph data={graphData} maxPossibleValue={maxPossibleSimulationValue} />
            </GraphWrapper>
        </Wrapper>
    );
};

export default CardOverview;
