import { BoxRow, FiatValue, GrayBox, QuestionTooltip, VerticalCryptoAmounts } from '@components/ui';
import { variables } from '@config';
import { useTheme } from '@hooks';
import { formatUtils, graphUtils, mathUtils } from '@utils';
import React from 'react';
import styled from 'styled-components';
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
    color: ${props => props.theme.FONT_LIGHT};
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
    border-right: 1px solid ${props => props.theme.STROKE_GREY};
    padding-right: 10px;
`;

const StyledFiatValueWrapper = styled(FiatValue)`
    margin-bottom: 8px;
`;

const ColorizedFiatValueWrapper = styled(StyledFiatValueWrapper)`
    font-size: ${variables.FONT_SIZE.SMALL};
`;

const ImpLossRel = styled.div`
    color: ${props => props.theme.FONT_LIGHT};
`;

const RightPaddingWrapper = styled.div`
    padding-right: 10px;
`;

const GraphWrapper = styled.div`
    padding: 60px 10px 10px 10px;
    width: 100%;
`;

const GraphTitle = styled.div`
    color: ${props => props.theme.FONT_MEDIUM};
    text-align: center;
    padding-bottom: 15px;
    padding-left: 50px;
`;

const DaysLeftGridWrapper = styled(ImpLossGridWrapper)`
    gap: 5px 10px;
    font-size: ${variables.FONT_SIZE.NORMAL};
    color: ${props => props.theme.FONT_LIGHT};
`;

const XScrollWrapper = styled.div`
    overflow-x: auto;
`;

interface Props {
    tokenSymbols: string[];
    simulatedPooledTokenBalances: number[];
    tokenBalances: number[];
    endPoolValueUsd: number;
    simulatedPoolValueUsd: number;
    simulatedHodlValueUsd: number;
    tokenPricesEnd: number[];
    sliderDefaultCoeffs: Array<number>;
    lastIntSimulatedFeesUsd: number;
    lastIntYieldUsd: number;
    lastSnapTimestampStart: number;
    lastSnapTimestampEnd: number;
    impLossUsd: number;
    impLossRel: number;
    isActive: boolean;
    lastWeekAverageDailyRewardsUsd: number | undefined;
}

const Overview = ({
    tokenSymbols,
    simulatedPooledTokenBalances,
    tokenBalances,
    endPoolValueUsd,
    simulatedPoolValueUsd,
    simulatedHodlValueUsd,
    tokenPricesEnd,
    sliderDefaultCoeffs,
    lastIntSimulatedFeesUsd,
    lastIntYieldUsd,
    lastSnapTimestampStart,
    lastSnapTimestampEnd,
    impLossUsd,
    impLossRel,
    isActive,
    lastWeekAverageDailyRewardsUsd,
}: Props) => {
    const theme: any = useTheme();

    const tokenBalancesDiff = mathUtils.subtractArraysElementWise(
        simulatedPooledTokenBalances,
        tokenBalances,
    );

    const graphData = graphUtils.getILGraphData(
        endPoolValueUsd,
        simulatedPoolValueUsd,
        simulatedHodlValueUsd,
        isActive,
    );
    const maxPossibleSimulationValue = graphUtils.getMaxPossiblePoolValue(
        tokenBalances,
        tokenPricesEnd,
        sliderDefaultCoeffs,
        2,
    );

    const estDaysLeftStaking = lastWeekAverageDailyRewardsUsd
        ? Math.round(Math.abs(impLossUsd / lastWeekAverageDailyRewardsUsd))
        : NaN;

    return (
        <Wrapper>
            <XScrollWrapper>
                <HeaderWrapper>
                    <GridWrapper>
                        <BoxRow
                            firstColumn="Pool overview"
                            secondColumn={
                                isActive
                                    ? 'Today'
                                    : formatUtils.getFormattedDateFromTimestamp(
                                          lastSnapTimestampEnd,
                                          'MONTH_DAY_YEAR',
                                      )
                            }
                            thirdColumn={<RightPaddingWrapper>Simulated</RightPaddingWrapper>}
                            fourthColumn="Difference"
                            columnColors={['light', 'light', 'light', 'light']}
                            columnAlignment={['left', 'right', 'right', 'left']}
                        />
                    </GridWrapper>
                </HeaderWrapper>
                <GrayBox padding={[15, 20, 18, 20]} backgroundColor={theme.BACKGROUND}>
                    <PoolValueGridWrapper>
                        <BoxRow
                            columnAlignment={['left', 'right', 'right', 'left']}
                            firstColumn="Your pool size"
                            secondColumn={
                                <PoolValueCryptoFiatWrapper>
                                    <StyledFiatValueWrapper value={endPoolValueUsd} />
                                    <VerticalCryptoAmounts
                                        maxWidth={70}
                                        tokenSymbols={tokenSymbols}
                                        tokenAmounts={tokenBalances}
                                    />
                                </PoolValueCryptoFiatWrapper>
                            }
                            // simulation values
                            thirdColumn={
                                <PoolValueCryptoFiatWrapperBorder>
                                    <StyledFiatValueWrapper value={simulatedPoolValueUsd} />
                                    <VerticalCryptoAmounts
                                        maxWidth={70}
                                        tokenSymbols={tokenSymbols}
                                        tokenAmounts={simulatedPooledTokenBalances}
                                    />
                                </PoolValueCryptoFiatWrapperBorder>
                            }
                            // difference values
                            fourthColumn={
                                <PoolValueCryptoFiatWrapper>
                                    <ColorizedFiatValueWrapper
                                        value={simulatedPoolValueUsd - endPoolValueUsd}
                                        usePlusSymbol
                                        colorized
                                    />
                                    <VerticalCryptoAmounts
                                        maxWidth={40}
                                        tokenSymbols={tokenSymbols}
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
                    borderRadius={isActive ? [10, 10, 0, 0] : [10, 10, 10, 10]}
                    bottomBarBorderRadius={[0, 0, 10, 10]}
                    backgroundColor={theme.BACKGROUND}
                    bottomBar={
                        isActive &&
                        !isNaN(estDaysLeftStaking) &&
                        estDaysLeftStaking !== Infinity &&
                        lastWeekAverageDailyRewardsUsd ? (
                            <>
                                <DaysLeftGridWrapper>
                                    <BoxRow
                                        columnAlignment={['left', 'right', 'left']}
                                        firstColumn={
                                            <>
                                                Est. days left to compensate loss
                                                <QuestionTooltip
                                                    content={`Based on your average fee rewards during the last week (${formatUtils.getFormattedUsdValue(
                                                        lastWeekAverageDailyRewardsUsd,
                                                    )}/day)`}
                                                />
                                            </>
                                        }
                                        secondColumn={
                                            <RightPaddingWrapper>
                                                {estDaysLeftStaking}
                                            </RightPaddingWrapper>
                                        }
                                        thirdColumn={<></>}
                                    />
                                </DaysLeftGridWrapper>
                            </>
                        ) : null
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
                <GraphTitle>Pool vs HODL value comparison</GraphTitle>
                <ILGraph
                    data={graphData}
                    theme={theme}
                    maxPossibleValue={maxPossibleSimulationValue}
                />
            </GraphWrapper>
        </Wrapper>
    );
};

export default Overview;
