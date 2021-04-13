import {
    FiatValue,
    GrayBox,
    VerticalCryptoAmounts,
    CollapsibleContainer,
    BoxRow,
    Icon,
    QuestionTooltip,
} from '@components/ui';
import { analytics, variables } from '@config';
import { formatUtils, mathUtils } from '@utils';
import React, { useState } from 'react';
import styled from 'styled-components';
import DoubleValue from '../DoubleValue';
import { useTheme } from '@hooks';

const Wrapper = styled.div`
    width: 100%;
    max-width: 680px;
    margin: 0 auto;
`;

const GridWrapper = styled.div`
    flex-grow: 1;
    display: grid;
    gap: 28px 10px;
    grid-template-columns: 180px minmax(100px, auto) minmax(100px, auto);
    grid-auto-rows: auto;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    align-items: center;
    /* allow x-axis scrolling: useful on small screens when fiat amount is displayed */
    /* overflow-x: auto; */
    word-break: break-word;
    align-items: baseline;

    @media (max-width: ${variables.SCREEN_SIZE.SM}) {
        font-size: ${variables.FONT_SIZE.SMALL};
        gap: 18px 5px;
        grid-template-columns: 140px minmax(90px, auto) minmax(90px, auto);
    }
`;

const RewardsExpensesHeader = styled(GridWrapper)`
    grid-template-rows: repeat(1, 20px);
    margin-bottom: 18px;
    padding: 0;
    font-size: ${variables.FONT_SIZE.SMALL};
    border-bottom: 1px solid ${props => props.theme.STROKE_GREY};
`;

const BottomBarRow = styled(GridWrapper)`
    grid-template-columns: minmax(100px, auto) minmax(100px, auto);
    height: 40px;
    align-items: center;
`;

const StrategyHeaderGridWrapper = styled(GridWrapper)`
    grid-template-columns: minmax(100px, auto) minmax(100px, auto) 26px;
    align-items: center;
`;

const CollapseWrapper = styled.div``;

const getEstDaysLeft = (loss: number, avDailyRewards: number) => {
    if (loss > 0) return 0;
    return Math.round(Math.abs(loss / avDailyRewards));
};

const ExpandButton = styled.div`
    cursor: pointer;
    border-radius: 20px;
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    &:hover {
        background-color: #dcdce6; // used only here
    }
`;

const ValueDifferenceWrapper = styled.div<{ thickBorder: boolean }>`
    border-top: 1px solid ${props => props.theme.STROKE_GREY};
    border-width: ${props => (props.thickBorder ? '5px' : '1px')};
`;

interface Props {
    strategyName: string;
    depositsHeadline: string;
    poolStrategyUsd: number;
    yieldUsd: number;
    differentStrategyUsd: number;
    tokenSymbols: string[];
    txCostEth: number;
    depositTimestampsArr: number[];
    depositTokenAmountsArr: Array<Array<number>>;
    currentDepositTokenPricesArr: number[];
    depositTokenSymbolsArr: string[];
    poolIsActive: boolean;
    simulatedDifferentStrategyUsd: number;
    simulatedPoolStrategyUsd: number;
    simulatedTxCostUsd: number;
    simulatedFeesUsd: number;
    simulatedFeesTokenAmounts: number[];
    simulatedYieldUsd: number;
    yieldTokenSymbols: string[];
    yieldTotalTokenAmounts: number[];
    hasYieldReward: boolean;
    lastWeekAverageDailyRewardsUsd: number | undefined;
}

const DifferentStrategy = ({
    strategyName,
    depositsHeadline,
    poolStrategyUsd,
    yieldUsd,
    differentStrategyUsd,
    tokenSymbols,
    txCostEth,
    depositTimestampsArr,
    depositTokenAmountsArr,
    currentDepositTokenPricesArr,
    depositTokenSymbolsArr,
    poolIsActive,
    simulatedDifferentStrategyUsd,
    simulatedPoolStrategyUsd,
    simulatedTxCostUsd,
    simulatedFeesUsd,
    simulatedFeesTokenAmounts,
    simulatedYieldUsd,
    yieldTokenSymbols,
    yieldTotalTokenAmounts,
    hasYieldReward,
    lastWeekAverageDailyRewardsUsd,
}: Props) => {
    const [valueOpened, setValueOpened] = useState(false);
    const [diffOpened, setDiffOpened] = useState(false);
    const theme = useTheme();

    const handleExpandValue = (isOpened: boolean) => {
        setValueOpened(isOpened);
        if (isOpened) {
            analytics.logEvent('simulator_strategy_detail', {
                strategy: strategyName,
                detail: 'value',
            });
        }
    };

    const handleExpandDifference = (isOpened: boolean) => {
        setDiffOpened(isOpened);
        if (isOpened) {
            analytics.logEvent('simulator_strategy_detail', {
                strategy: strategyName,
                detail: 'difference',
            });
        }
    };

    const divergenceLoss =
        simulatedPoolStrategyUsd -
        simulatedDifferentStrategyUsd -
        simulatedFeesUsd -
        simulatedYieldUsd +
        simulatedTxCostUsd;

    const estDaysLeft = lastWeekAverageDailyRewardsUsd
        ? getEstDaysLeft(
              simulatedPoolStrategyUsd - simulatedDifferentStrategyUsd,
              lastWeekAverageDailyRewardsUsd,
          )
        : undefined;

    let divergenceLossText = 'Price divergence loss';
    if (divergenceLoss > 0) divergenceLossText = 'Price divergence gain';

    const gainLossText =
        simulatedDifferentStrategyUsd > simulatedPoolStrategyUsd
            ? "You would've lost comp. to this strategy"
            : "You would've gained comp. to this strategy";

    const feesRow = (
        <BoxRow
            firstColumn="Fees earned"
            secondColumn={
                <VerticalCryptoAmounts
                    tokenSymbols={tokenSymbols}
                    tokenAmounts={simulatedFeesTokenAmounts}
                />
            }
            thirdColumn={<FiatValue value={simulatedFeesUsd} usePlusSymbol />}
            columnColors={['medium', 'light', 'dark']}
        />
    );

    const yieldRow =
        hasYieldReward && yieldTokenSymbols && yieldTotalTokenAmounts ? (
            <BoxRow
                firstColumn="Yield reward"
                secondColumn={
                    <VerticalCryptoAmounts
                        tokenSymbols={yieldTokenSymbols}
                        tokenAmounts={yieldTotalTokenAmounts}
                    />
                }
                thirdColumn={<FiatValue value={simulatedYieldUsd} usePlusSymbol />}
                columnColors={['medium', 'light', 'dark']}
            />
        ) : null;

    const txCostRow = (
        <BoxRow
            firstColumn={
                <div style={{ display: '-webkit-inline-box' }}>
                    Transaction expenses
                    <QuestionTooltip content="Amount of ETH you spent for all pool deposit and withdrawal transactions" />
                </div>
            }
            secondColumn={
                <VerticalCryptoAmounts tokenSymbols={['ETH']} tokenAmounts={[txCostEth]} />
            }
            thirdColumn={<FiatValue value={-simulatedTxCostUsd} usePlusSymbol />}
            columnColors={['medium', 'light', 'dark']}
        />
    );

    const divergenceLossRow = (
        <BoxRow
            firstColumn={divergenceLossText}
            secondColumn={<></>}
            thirdColumn={<FiatValue value={divergenceLoss} usePlusSymbol />}
            columnColors={['medium', 'light', 'dark']}
        />
    );

    const depositRows = (
        <>
            {depositTimestampsArr.map((timestamp, i) => (
                <BoxRow
                    key={timestamp}
                    firstColumn={formatUtils.getFormattedDateFromTimestamp(
                        timestamp,
                        'MONTH_DAY_YEAR',
                    )}
                    secondColumn={
                        <VerticalCryptoAmounts
                            tokenSymbols={depositTokenSymbolsArr}
                            tokenAmounts={depositTokenAmountsArr[i]}
                        />
                    }
                    thirdColumn={
                        <FiatValue
                            value={mathUtils.getTokenArrayValue(
                                depositTokenAmountsArr[i],
                                currentDepositTokenPricesArr,
                            )}
                        />
                    }
                    columnColors={['medium', 'light', 'dark']}
                />
            ))}
        </>
    );

    return (
        <Wrapper>
            <CollapsibleContainer
                onChange={isOpened => {
                    handleExpandValue(isOpened);
                }}
                header={
                    <GrayBox borderRadius={[10, 10, 0, 0]} backgroundColor={theme.BACKGROUND}>
                        <StrategyHeaderGridWrapper>
                            <BoxRow
                                firstColumn="You would have"
                                secondColumn={
                                    <DoubleValue
                                        top={<FiatValue value={differentStrategyUsd} />}
                                        bottom={<FiatValue value={simulatedDifferentStrategyUsd} />}
                                    />
                                }
                                thirdColumn={
                                    <ExpandButton>
                                        <Icon
                                            icon={valueOpened ? 'arrow_up' : 'arrow_down'}
                                            size={16}
                                            color={theme.FONT_MEDIUM}
                                        />
                                    </ExpandButton>
                                }
                            />
                        </StrategyHeaderGridWrapper>
                    </GrayBox>
                }
                collapseBody={
                    <CollapseWrapper>
                        <GrayBox
                            padding={[15, 50, 15, 15]}
                            borderRadius={[0, 0, 0, 0]}
                            bottomBarPadding={[10, 50, 10, 15]}
                            bottomBarBorderRadius={[0, 0, 0, 0]}
                            backgroundColor={theme.BACKGROUND}
                            bottomBar={
                                <>
                                    <BottomBarRow>
                                        <BoxRow
                                            firstColumn="Simulated strategy value"
                                            secondColumn={
                                                <FiatValue
                                                    value={simulatedDifferentStrategyUsd}
                                                    useBadgeStyle
                                                />
                                            }
                                        />
                                    </BottomBarRow>
                                </>
                            }
                        >
                            <RewardsExpensesHeader>
                                <BoxRow
                                    firstColumn="Pool deposits"
                                    secondColumn={depositsHeadline}
                                    thirdColumn="Simulated value"
                                    columnColors={['light', 'light', 'light']}
                                />
                            </RewardsExpensesHeader>
                            <GridWrapper>{depositRows}</GridWrapper>
                        </GrayBox>
                    </CollapseWrapper>
                }
            />
            <ValueDifferenceWrapper thickBorder={valueOpened}>
                <CollapsibleContainer
                    onChange={isOpened => {
                        handleExpandDifference(isOpened);
                    }}
                    header={
                        <GrayBox
                            borderRadius={diffOpened ? [0, 0, 0, 0] : [0, 0, 10, 10]}
                            backgroundColor={theme.BACKGROUND}
                        >
                            <StrategyHeaderGridWrapper>
                                <BoxRow
                                    firstColumn={gainLossText}
                                    secondColumn={
                                        <DoubleValue
                                            top={
                                                <FiatValue
                                                    value={poolStrategyUsd - differentStrategyUsd}
                                                    usePlusSymbol
                                                    // colorized
                                                />
                                            }
                                            bottom={
                                                <FiatValue
                                                    value={
                                                        simulatedPoolStrategyUsd -
                                                        simulatedDifferentStrategyUsd
                                                    }
                                                    usePlusSymbol
                                                    colorized
                                                />
                                            }
                                        />
                                    }
                                    thirdColumn={
                                        <ExpandButton>
                                            <Icon
                                                icon={diffOpened ? 'arrow_up' : 'arrow_down'}
                                                size={16}
                                                color={theme.FONT_MEDIUM}
                                            />
                                        </ExpandButton>
                                    }
                                />
                            </StrategyHeaderGridWrapper>
                        </GrayBox>
                    }
                    collapseBody={
                        <CollapseWrapper>
                            <GrayBox
                                padding={[15, 50, 15, 15]}
                                borderRadius={[0, 0, 0, 0]}
                                bottomBarPadding={[10, 50, 10, 15]}
                                bottomBarBorderRadius={[0, 0, 10, 10]}
                                backgroundColor={theme.BACKGROUND}
                                bottomBar={
                                    <>
                                        <BottomBarRow>
                                            <BoxRow
                                                firstColumn={
                                                    simulatedPoolStrategyUsd -
                                                        simulatedDifferentStrategyUsd >
                                                    0
                                                        ? 'Simulated gain'
                                                        : 'Simulated loss'
                                                }
                                                secondColumn={
                                                    <FiatValue
                                                        value={
                                                            simulatedPoolStrategyUsd -
                                                            simulatedDifferentStrategyUsd
                                                        }
                                                        usePlusSymbol
                                                        useBadgeStyle
                                                        colorized
                                                    />
                                                }
                                            />
                                        </BottomBarRow>
                                        {estDaysLeft &&
                                        estDaysLeft > 0 &&
                                        poolIsActive &&
                                        lastWeekAverageDailyRewardsUsd ? (
                                            <BottomBarRow>
                                                <BoxRow
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
                                                    secondColumn={estDaysLeft}
                                                />
                                            </BottomBarRow>
                                        ) : null}
                                    </>
                                }
                            >
                                <RewardsExpensesHeader>
                                    <BoxRow
                                        firstColumn="Gains & losses"
                                        secondColumn="Crypto"
                                        thirdColumn="Simulated value"
                                        columnColors={['light', 'light', 'light']}
                                    />
                                </RewardsExpensesHeader>
                                <GridWrapper>
                                    {feesRow}
                                    {yieldRow}
                                    {txCostRow}
                                    {divergenceLossRow}
                                </GridWrapper>
                            </GrayBox>
                        </CollapseWrapper>
                    }
                />
            </ValueDifferenceWrapper>
        </Wrapper>
    );
};

export default DifferentStrategy;
