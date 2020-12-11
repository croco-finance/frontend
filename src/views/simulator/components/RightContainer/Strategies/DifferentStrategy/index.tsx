import {
    FiatValue,
    GrayBox,
    VerticalCryptoAmounts,
    CollapsibleContainer,
    BoxRow,
    Icon,
} from '@components/ui';
import { colors, variables } from '@config';
import { formatUtils, mathUtils } from '@utils';
import React, { useState } from 'react';
import styled from 'styled-components';
import DoubleValue from '../DoubleValue';

const Wrapper = styled.div`
    width: 100%;
    max-width: 650px;
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
    word-break: break-all;
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
    border-bottom: 1px solid ${colors.STROKE_GREY};
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
    border-top: 1px solid ${colors.STROKE_GREY};
    border-width: ${props => (props.thickBorder ? '5px' : '1px')};
`;

interface Props {
    depositsHeadline: string;
    poolStrategyUsd: number;
    feesUsd: number;
    yieldUsd: number;
    txCostUsd: number;
    differentStrategyUsd: number;
    feesTokenAmounts: number[];
    yieldTokenAmount: number;
    tokenSymbols: string[];
    yieldTokenSymbol: string | undefined;
    txCostEth: number;
    lastIntAvDailyRewardsUsd: number;
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
    lastIntSimulatedAverageRewards: number;
}

const DifferentStrategy = ({
    depositsHeadline,
    poolStrategyUsd,
    yieldUsd,
    differentStrategyUsd,
    yieldTokenAmount,
    tokenSymbols,
    yieldTokenSymbol,
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
    lastIntSimulatedAverageRewards,
}: Props) => {
    const [valueOpened, setValueOpened] = useState(false);
    const [diffOpened, setDiffOpened] = useState(false);

    const divergenceLoss =
        simulatedPoolStrategyUsd -
        simulatedDifferentStrategyUsd -
        simulatedFeesUsd -
        yieldUsd +
        simulatedTxCostUsd;

    const estDaysLeft = getEstDaysLeft(
        simulatedPoolStrategyUsd - simulatedDifferentStrategyUsd,
        lastIntSimulatedAverageRewards,
    );

    let divergenceLossTExt = 'Price divergence loss';
    if (divergenceLoss > 0) divergenceLossTExt = 'Price divergence gain';

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

    const yieldRow = yieldTokenSymbol ? (
        <BoxRow
            firstColumn="Yield reward"
            secondColumn={
                <VerticalCryptoAmounts
                    tokenSymbols={[yieldTokenSymbol]}
                    tokenAmounts={[yieldTokenAmount]}
                />
            }
            thirdColumn={<FiatValue value={simulatedYieldUsd} usePlusSymbol />}
            columnColors={['medium', 'light', 'dark']}
        />
    ) : null;

    const txCostRow = (
        <BoxRow
            firstColumn="Transaction expenses"
            secondColumn={
                <VerticalCryptoAmounts tokenSymbols={['ETH']} tokenAmounts={[txCostEth]} />
            }
            thirdColumn={<FiatValue value={-simulatedTxCostUsd} usePlusSymbol />}
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
                    setValueOpened(isOpened);
                }}
                header={
                    <GrayBox borderRadius={[10, 10, 0, 0]}>
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
                                            color={colors.FONT_MEDIUM}
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
                                    thirdColumn={'Simulated value'}
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
                        setDiffOpened(isOpened);
                    }}
                    header={
                        <GrayBox borderRadius={diffOpened ? [0, 0, 0, 0] : [0, 0, 10, 10]}>
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
                                                color={colors.FONT_MEDIUM}
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
                                        {estDaysLeft > 0 && poolIsActive && (
                                            <BottomBarRow>
                                                <BoxRow
                                                    firstColumn="Est. days left to compensate loss*"
                                                    secondColumn={estDaysLeft}
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