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
    endTimeText: string;
    poolStrategyUsd: number;
    feesUsd: number;
    yieldUsd: number;
    txCostUsd: number;
    differentStrategyUsd: number;
    feesTokenAmounts: number[];
    tokenSymbols: string[];
    txCostEth: number;
    lastWeekAverageDailyRewardsUsd: number;
    depositTimestampsArr: number[];
    depositTokenAmountsArr: Array<Array<number>>;
    currentDepositTokenPricesArr: number[];
    depositTokenSymbolsArr: string[];
    poolIsActive: boolean;
    yieldTokenSymbols: string[];
    yieldTotalTokenAmounts: number[];
    hasYieldReward: boolean;
}

const DifferentStrategy = ({
    strategyName,
    depositsHeadline,
    poolStrategyUsd,
    feesUsd,
    yieldUsd,
    txCostUsd,
    differentStrategyUsd,
    feesTokenAmounts,
    tokenSymbols,
    txCostEth,
    endTimeText,
    lastWeekAverageDailyRewardsUsd,
    depositTimestampsArr,
    depositTokenAmountsArr,
    currentDepositTokenPricesArr,
    depositTokenSymbolsArr,
    poolIsActive,
    yieldTokenSymbols,
    yieldTotalTokenAmounts,
    hasYieldReward,
}: Props) => {
    const [valueOpened, setValueOpened] = useState(false);
    const [diffOpened, setDiffOpened] = useState(false);
    const theme = useTheme();

    const divergenceLoss = poolStrategyUsd - differentStrategyUsd - feesUsd - yieldUsd + txCostUsd;

    const estDaysLeft = getEstDaysLeft(
        poolStrategyUsd - differentStrategyUsd,
        lastWeekAverageDailyRewardsUsd,
    );

    const handleExpandValue = (isOpened: boolean) => {
        setValueOpened(isOpened);
        if (isOpened)
            analytics.logEvent('dashboard_strategy_detail', {
                strategy: strategyName,
                detail: 'value',
            });
    };

    const handleExpandDifference = (isOpened: boolean) => {
        setDiffOpened(isOpened);
        if (isOpened)
            analytics.logEvent('dashboard_strategy_detail', {
                strategy: strategyName,
                detail: 'difference',
            });
    };

    let divergenceLossTExt = 'Price divergence loss';
    if (divergenceLoss > 0) divergenceLossTExt = 'Price divergence gain';

    const gainLossText =
        differentStrategyUsd > poolStrategyUsd
            ? 'You lost comp. to this strategy'
            : 'You gained comp. to this strategy';

    const feesRow = (
        <BoxRow
            firstColumn="Fees earned"
            secondColumn={
                <VerticalCryptoAmounts
                    tokenSymbols={tokenSymbols}
                    tokenAmounts={feesTokenAmounts}
                />
            }
            thirdColumn={<FiatValue value={feesUsd} usePlusSymbol />}
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
                thirdColumn={<FiatValue value={yieldUsd} usePlusSymbol />}
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
            thirdColumn={<FiatValue value={-txCostUsd} usePlusSymbol />}
            columnColors={['medium', 'light', 'dark']}
        />
    );

    const divergenceLossRow = (
        <BoxRow
            firstColumn={divergenceLossTExt}
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
                                secondColumn={<FiatValue value={differentStrategyUsd} />}
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
                                            firstColumn="Strategy value"
                                            secondColumn={
                                                <FiatValue
                                                    value={differentStrategyUsd}
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
                                    thirdColumn={endTimeText}
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
                                        <FiatValue
                                            value={poolStrategyUsd - differentStrategyUsd}
                                            usePlusSymbol
                                            colorized
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
                                                    poolStrategyUsd - differentStrategyUsd > 0
                                                        ? 'Total gain'
                                                        : 'Total loss'
                                                }
                                                secondColumn={
                                                    <FiatValue
                                                        value={
                                                            poolStrategyUsd - differentStrategyUsd
                                                        }
                                                        usePlusSymbol
                                                        useBadgeStyle
                                                        colorized
                                                    />
                                                }
                                            />
                                        </BottomBarRow>
                                        {estDaysLeft > 0 && poolIsActive && (
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
                                                    // columnColors={['medium', 'medium']}
                                                />
                                            </BottomBarRow>
                                        )}
                                    </>
                                }
                            >
                                <RewardsExpensesHeader>
                                    <BoxRow
                                        firstColumn="Gains & losses"
                                        secondColumn="Crypto"
                                        thirdColumn={endTimeText}
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
