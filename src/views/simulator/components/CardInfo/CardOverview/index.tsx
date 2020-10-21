import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { FiatValue, GrayBox, ToggleSwitch, MultipleTokenLogo } from '../../../../../components/ui';
import { colors, variables } from '../../../../../config';
import { math, loss } from '../../../../../utils';
import CardRow from '../CardRow';
import { getTokenSymbolArr } from '../../../../../utils';

const GRID_GAP = 5;

const Wrapper = styled.div``;

const Headline = styled.div`
    padding: 0 10px;
    /* font-weight: ${variables.FONT_WEIGHT.MEDIUM}; */
    font-size: ${variables.FONT_SIZE.SMALL};
    margin-top: 0;
    display: flex;
    flex-direction: row;
    height: 44px;
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
    padding: 0 10px 10px 10px;
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

    grid-template-columns: 190px minmax(100px, auto) minmax(100px, auto);
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
    const [showEth, setShowEth] = useState(false);

    const allPools = useSelector(state => state.allPools);
    const selectedPoolId = useSelector(state => state.selectedPoolId);

    const pool = allPools[selectedPoolId];

    const {
        tokens,
        endTokenBalance,
        tokenBalanceDiffNoFees,
        tokenWeights,
        endTokenPricesUsd,
        endBalanceUsd,
        netReturnUsd,
        feesUsd,
        txCostEth,
        txCostUsd,
        impLossUsd,
        dexReturnUsd,
        start,
        end,
        exchange,
        yieldRewardUsd,
    } = pool;

    const averageFeeGains = math.getDailyAverageFeeGains(start, end, feesUsd);
    const daysLeftStaking = Math.abs(Math.ceil(dexReturnUsd / averageFeeGains));

    // ----- GET SIMULATION VALUES -----
    // Array of new prices, not coefficients
    const newTokenPrices = math.multiplyArraysElementWise(endTokenPricesUsd, simulatedCoefficients);

    let simulatedValues;
    if (exchange === 'UNI_V2' || exchange === 'UNI_V1') {
        simulatedValues = loss.getUniswapSimulationStats(
            endTokenBalance,
            newTokenPrices,
            tokenBalanceDiffNoFees,
        );
    } else if (exchange === 'BALANCER') {
        simulatedValues = loss.getBalancerSimulationStats(
            endTokenBalance,
            newTokenPrices,
            tokenBalanceDiffNoFees,
            tokenWeights,
        );
    }
    const {
        simulatedPoolValue,
        impLossCompToInitialUsd,
        impLossCompToInitialRel,
        newBalances,
    } = simulatedValues;

    const poolValueChangeRatio = simulatedPoolValue / endBalanceUsd;

    const simulatedFeesUsd = poolValueChangeRatio * feesUsd;

    // TODO check if yield token is also part of pool (if yes, change its price accordingly)
    const simulatedTotalHodlComparison =
        simulatedFeesUsd + yieldRewardUsd + impLossCompToInitialUsd - txCostUsd;

    const averageFeeGainsSim = math.getDailyAverageFeeGains(start, end, simulatedFeesUsd);
    const daysLeftStakingSim = Math.abs(
        Math.ceil(simulatedTotalHodlComparison / averageFeeGainsSim),
    );

    let showDaysLeftStaking = true;

    if (simulatedTotalHodlComparison >= 0 && dexReturnUsd >= 0) {
        showDaysLeftStaking = false;
    } else if (!simulatedTotalHodlComparison && dexReturnUsd >= 0) {
        showDaysLeftStaking = false;
    } else if (simulatedTotalHodlComparison >= 0 && !dexReturnUsd) {
        showDaysLeftStaking = false;
    }

    const tokenSymbols = getTokenSymbolArr(tokens);

    return (
        <Wrapper>
            <Header>
                <Headline>
                    <MultipleTokenLogo size={18} tokens={tokenSymbols} />
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
                        secondColumn={<FiatValue value={endBalanceUsd}></FiatValue>}
                        thirdColumn={
                            <DoubleValueWrapper>
                                <FiatValue value={simulatedPoolValue}></FiatValue>
                                <ValueDifference>
                                    <FiatValue
                                        value={simulatedPoolValue - endBalanceUsd}
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

            <HeaderWrapper>
                <CardRow
                    firstColumn="Gains compared to HODL"
                    secondColumn="Current"
                    thirdColumn="Simulated"
                    color="light"
                />
            </HeaderWrapper>
            <GrayBox padding={15}>
                <GridWrapper>
                    <CardRow
                        firstColumn="Total fee gains"
                        secondColumn={<FiatValue value={feesUsd} usePlusSymbol />}
                        thirdColumn={<FiatValue value={simulatedFeesUsd} usePlusSymbol />}
                        color="dark"
                    />

                    {yieldRewardUsd ? (
                        <CardRow
                            firstColumn="Yield farming gains"
                            secondColumn={<FiatValue value={yieldRewardUsd} usePlusSymbol />}
                            thirdColumn={<FiatValue value={yieldRewardUsd} usePlusSymbol />}
                            color="dark"
                        />
                    ) : null}

                    <CardRow
                        firstColumn="Deposit tx. cost"
                        secondColumn={<FiatValue value={-txCostUsd} usePlusSymbol />}
                        thirdColumn={<FiatValue value={-txCostUsd} usePlusSymbol />}
                        color="dark"
                    />
                    <CardRow
                        firstColumn="Impermanent loss"
                        secondColumn={
                            <ImpLossValueWrapper>
                                {/* <SubValue>
                                    {getFormattedPercentageValue(Math.abs(impLossRel))}
                                </SubValue> */}
                                <FiatValue value={-impLossUsd} usePlusSymbol />
                            </ImpLossValueWrapper>
                        }
                        thirdColumn={
                            <ImpLossValueWrapper>
                                {/* <SubValue>
                                    {impLossCompToInitialRel &&
                                        getFormattedPercentageValue(
                                            Math.abs(impLossCompToInitialRel),
                                        )}
                                </SubValue> */}
                                <FiatValue value={impLossCompToInitialUsd} usePlusSymbol />
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
                                value={dexReturnUsd}
                                usePlusSymbol
                                // colorized
                                // useBadgeStyle
                            ></FiatValue>
                        }
                        thirdColumn={
                            <FiatValue
                                value={simulatedTotalHodlComparison}
                                usePlusSymbol
                                colorized
                                useBadgeStyle
                            ></FiatValue>
                        }
                        color="dark"
                    />
                </TotalLossRowWrapper>
                <DaysLeftWrapper>
                    <DaysLeftGridWrapper>
                        <CardRow
                            firstColumn="Average daily fee gains*"
                            secondColumn={
                                <FiatValue value={averageFeeGains} usePlusSymbol></FiatValue>
                            }
                            thirdColumn={
                                <FiatValue value={averageFeeGainsSim} usePlusSymbol></FiatValue>
                            }
                            color="dark"
                        />
                        {showDaysLeftStaking ? (
                            <CardRow
                                firstColumn="Days left to compensate loss*"
                                secondColumn={dexReturnUsd < 0 ? daysLeftStaking : null}
                                thirdColumn={
                                    simulatedTotalHodlComparison < 0 ? daysLeftStakingSim : null
                                }
                                color="dark"
                            />
                        ) : null}
                    </DaysLeftGridWrapper>

                    {showDaysLeftStaking ? (
                        <DaysLeftNote>
                            <b>*</b> According to your average trading fee gains
                        </DaysLeftNote>
                    ) : null}
                </DaysLeftWrapper>
            </GrayBox>
        </Wrapper>
    );
};

export default CardOverview;
