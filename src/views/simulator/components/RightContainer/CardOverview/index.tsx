import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { FiatValue, GrayBox, ToggleSwitch, MultipleTokenLogo } from '@components/ui';
import { colors, variables, types } from '@config';
import { mathUtils, lossUtils, getTokenSymbolArr, simulatorUtils } from '@utils';
import CardRow from '../CardRow';

const GRID_GAP = 5;

const Wrapper = styled.div``;

const Headline = styled.div`
    padding: 0 10px;
    /* font-weight: ${variables.FONT_WEIGHT.MEDIUM}; */
    font-size: ${variables.FONT_SIZE.SMALL};
    margin-top: 0;
    display: flex;
    flex-direction: row;
    height: 36px;
    width: 100%;
    justify-self: flex-start;
    align-items: center;
`;

const HeadlineText = styled.div`
    margin-left: 6px;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    color: ${colors.FONT_LIGHT};
`;

const Header = styled.div`
    display: flex;
    width: 100%;
    align-items: center;
    padding: 0 10px 0px 10px;
    align-items: center;
    /* border-bottom: 1px solid ${colors.BACKGROUND_DARK}; */
`;

const ToggleWrapper = styled.div`
    display: flex;
    align-items: center;
`;

const ToggleLabel = styled.div`
    font-size: ${variables.FONT_SIZE.TINY};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    color: ${colors.FONT_LIGHT};
    margin-right: 6px;
    min-width: 100px;
    justify-self: flex-end;
    text-align: right;
`;

const GridWrapper = styled.div`
    flex-grow: 1;
    display: grid;
    grid-gap: ${GRID_GAP}px;

    /* grid-template-columns: 190px minmax(100px, auto) minmax(100px, auto); */
    grid-template-columns: 265px minmax(100px, auto) minmax(100px, auto);

    grid-auto-rows: 40px;
    font-size: ${variables.FONT_SIZE.NORMAL};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    align-items: center;
    overflow-x: auto; /* allow x-axis scrolling: useful on small screens when fiat amount is displayed */
    word-break: break-all;
    padding: 0px 10px;
    font-size: ${variables.FONT_SIZE.NORMAL};
`;

const HeaderWrapper = styled(GridWrapper)`
    grid-template-rows: repeat(1, 40px);
    padding: 0px 25px;
    margin-top: 20px;
    margin-bottom: -5px;
    font-size: ${variables.FONT_SIZE.SMALL};
`;

const HodlHeaderWrapper = styled(HeaderWrapper)`
    /* grid-template-columns: 280px 2px minmax(100px, auto); */
`;

const TotalLossRowWrapper = styled(GridWrapper)`
    grid-template-rows: repeat(1, 50px);
    border-top: 1px solid ${colors.STROKE_GREY};
    margin-top: 3px;
    padding-top: 3px;
`;

const DaysLeftWrapper = styled.div`
    background-color: ${colors.BACKGROUND_DARK};
    padding: 10px;
    font-size: ${variables.FONT_SIZE.SMALL};
    border-radius: 5px;
    margin-top: 10px;
`;

const DaysLeftGridWrapper = styled(GridWrapper)`
    font-size: ${variables.FONT_SIZE.SMALL};
    grid-auto-rows: 37px;
`;

const DaysLeftNote = styled.div`
    border-top: 1px solid ${colors.STROKE_GREY};
    color: ${colors.FONT_MEDIUM};
    padding: 10px;
`;

const SubValue = styled.div`
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    color: ${colors.FONT_MEDIUM};
    font-size: ${variables.FONT_SIZE.SMALL};
    background-color: ${colors.BACKGROUND_DARK};
    padding: 3px;
    border-radius: 3px;
    margin-right: 8px;
    /* border-right: 1px solid ${colors.STROKE_GREY}; */
    padding: 2px 3px;
`;

const ImpLossValueWrapper = styled.div`
    display: flex;
    align-items: center;
`;
const PoolValueGridWrapper = styled(GridWrapper)`
    /* grid-auto-rows: 46px; */
    align-items: baseline;
    padding-top: 0;
    height: 39px;
`;
const DoubleValueWrapper = styled.div``;
const ValueDifference = styled.div`
    font-size: ${variables.FONT_SIZE.SMALL};
`;

interface Props {
    simulatedCoefficients: Array<number>;
}

const CardOverview = ({ simulatedCoefficients }: Props) => {
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
    const {
        newTokenBalances,
        newPoolValueUsd,
        newFeesUsd,
        newHodlValueUsd,
        impLossRel,
        impLossUsd,
    } = simulatedValues;

    // TODO check if yield token is also part of pool (if yes, change its price accordingly)
    const newRewardsMinusExpensesUsd = newFeesUsd + yieldUsd - txCostUsd;

    return (
        <Wrapper>
            <Header>
                <Headline>
                    <MultipleTokenLogo size={18} tokens={getTokenSymbolArr(tokens)} />
                    <HeadlineText>Liquidity pool</HeadlineText>
                </Headline>
                <ToggleWrapper>
                    {/* <ToggleLabel>Show ETH</ToggleLabel>
                    <ToggleSwitch checked={false} onChange={() => setShowEth(!showEth)} isSmall /> */}
                </ToggleWrapper>
            </Header>
            <HeaderWrapper>
                <CardRow
                    firstColumn="Pool overview"
                    secondColumn="Current"
                    thirdColumn="Simulated"
                    color="light"
                />
            </HeaderWrapper>
            <GrayBox padding={15}>
                <PoolValueGridWrapper>
                    <CardRow
                        firstColumn="Your pool share value"
                        secondColumn={<FiatValue value={poolValueUsd}></FiatValue>}
                        thirdColumn={
                            <DoubleValueWrapper>
                                <FiatValue value={newPoolValueUsd}></FiatValue>
                                <ValueDifference>
                                    <FiatValue
                                        value={newPoolValueUsd - poolValueUsd}
                                        usePlusSymbol
                                        colorized
                                    ></FiatValue>
                                </ValueDifference>
                            </DoubleValueWrapper>
                        }
                        color="dark"
                    />
                </PoolValueGridWrapper>
            </GrayBox>
            <HodlHeaderWrapper>
                <CardRow
                    firstColumn="Your balance compared to HODL strategy"
                    secondColumn="Current"
                    thirdColumn="Simulated"
                    color="light"
                />
            </HodlHeaderWrapper>
            <GrayBox padding={15}>
                <GridWrapper>
                    <CardRow
                        firstColumn="Fees earned"
                        secondColumn={<FiatValue value={feesUsd} usePlusSymbol />}
                        thirdColumn={<FiatValue value={newFeesUsd} usePlusSymbol />}
                        color="dark"
                    />

                    {hasYieldReward ? (
                        <CardRow
                            firstColumn="Yield rewards"
                            secondColumn={<FiatValue value={yieldUsd} usePlusSymbol />}
                            thirdColumn={<FiatValue value={yieldUsd} usePlusSymbol />}
                            color="dark"
                        />
                    ) : null}

                    <CardRow
                        firstColumn="Transactions expenses"
                        secondColumn={<FiatValue value={-txCostUsd} usePlusSymbol />}
                        thirdColumn={<FiatValue value={-txCostUsd} usePlusSymbol />}
                        color="dark"
                    />
                    <CardRow
                        firstColumn="Impermanent loss"
                        secondColumn=""
                        thirdColumn={
                            <ImpLossValueWrapper>
                                {/* <SubValue>
                                    {impLossCompToInitialRel &&
                                        getFormattedPercentageValue(
                                            Math.abs(impLossCompToInitialRel),
                                        )}
                                </SubValue> */}
                                <FiatValue value={-impLossUsd} usePlusSymbol />
                            </ImpLossValueWrapper>
                        }
                        color="dark"
                    />
                </GridWrapper>
                <TotalLossRowWrapper>
                    <CardRow
                        firstColumn="Total"
                        secondColumn={
                            <FiatValue
                                value={rewardsMinusExpensesUsd}
                                usePlusSymbol
                                // colorized
                                // useBadgeStyle
                            ></FiatValue>
                        }
                        thirdColumn={
                            <FiatValue
                                value={newRewardsMinusExpensesUsd}
                                usePlusSymbol
                                useBadgeStyle
                            ></FiatValue>
                        }
                        color="dark"
                    />
                </TotalLossRowWrapper>
            </GrayBox>
        </Wrapper>
    );
};

export default CardOverview;
