import {
    FiatValue,
    GrayBox,
    VerticalCryptoAmounts,
    CollapsibleContainer,
    BoxRow,
} from '@components/ui';
import { colors, variables } from '@config';
import { formatUtils } from '@utils';
import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { AllPoolsGlobal } from '@types';

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
    font-size: ${variables.FONT_SIZE.TINY};
    border-bottom: 1px solid ${colors.STROKE_GREY};
`;

const TotalLossRow = styled(GridWrapper)`
    height: 40px;
    align-items: center;
`;

const StrategyHeaderGridWrapper = styled(GridWrapper)`
    grid-template-columns: minmax(100px, auto) minmax(100px, auto);
    padding-right: 10px;
`;

const CollapseWrapper = styled.div``;

const DaysLeftGridWrapper = styled.div`
    background-color: ${colors.BACKGROUND_DARK};
    padding: 15px 50px 15px 15px;
    border-radius: 0 0 10px 10px;
    color: ${colors.FONT_LIGHT};
`;

const getEstDaysLeft = (loss: number, avDailyRewards: number) => {
    if (loss > 0) return 0;
    return Math.round(Math.abs(loss / avDailyRewards));
};

interface Props {
    headline: string;
    endTimeText: string;
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
}

const DifferentStrategy = ({
    headline,
    poolStrategyUsd,
    feesUsd,
    yieldUsd,
    txCostUsd,
    differentStrategyUsd,
    feesTokenAmounts,
    yieldTokenAmount,
    tokenSymbols,
    yieldTokenSymbol,
    txCostEth,
    endTimeText,
    lastIntAvDailyRewardsUsd,
}: Props) => {
    const allPools: AllPoolsGlobal = useSelector(state => state.allPools);
    const selectedPoolId = useSelector(state => state.selectedPoolId);
    let pool = allPools[selectedPoolId];

    // Compute imp loss, fees, hold, ETH hold, token hold fo each snapshot

    // TODO make the following checks and computations cleaner
    if (!allPools || !pool) {
        return (
            <Wrapper>
                <h2>We didn't find any pools associated with this address :( </h2>
            </Wrapper>
        );
    }

    let { intervalStats, exchange } = pool;

    // Temporary check if to show unclaimed UNI yield rewards
    let showUnclaimedUni = false;

    if (exchange === 'UNI_V2' && yieldTokenAmount === 0) {
        intervalStats.forEach(stat => {
            if (stat.staked === true) {
                showUnclaimedUni = true;
            }
        });
    }

    const divergenceLoss = poolStrategyUsd - differentStrategyUsd - feesUsd - yieldUsd + txCostUsd;

    const estDaysLeft = getEstDaysLeft(
        poolStrategyUsd - differentStrategyUsd,
        lastIntAvDailyRewardsUsd,
    );

    let divergenceLossTExt = 'Price divergence loss';
    if (divergenceLoss > 0) divergenceLossTExt = 'Price divergence gain';

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

    const yieldRow = yieldTokenSymbol ? (
        <BoxRow
            firstColumn="Yield reward"
            secondColumn={
                <VerticalCryptoAmounts
                    tokenSymbols={[yieldTokenSymbol]}
                    tokenAmounts={[yieldTokenAmount]}
                />
            }
            thirdColumn={<FiatValue value={yieldUsd} usePlusSymbol />}
            columnColors={['medium', 'light', 'dark']}
        />
    ) : null;

    const txCostRow = (
        <BoxRow
            firstColumn="Transaction expenses"
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

    return (
        <Wrapper>
            <CollapsibleContainer
                headline={
                    <StrategyHeaderGridWrapper>
                        <BoxRow
                            firstColumn={headline}
                            secondColumn={
                                <FiatValue
                                    value={poolStrategyUsd - differentStrategyUsd}
                                    usePlusSymbol
                                    colorized
                                />
                            }
                            columnColors={['light', 'light', 'light']}
                        />
                    </StrategyHeaderGridWrapper>
                }
                collapseBody={
                    <CollapseWrapper>
                        <GrayBox
                            padding={[15, 50, 15, 15]}
                            borderRadius={[0, 0, 0, 0]}
                            bottomBarPadding={[10, 50, 0, 15]}
                            bottomBarBorderRadius={[0, 0, 0, 0]}
                            bottomBar={
                                <TotalLossRow>
                                    <BoxRow
                                        firstColumn="Total value"
                                        secondColumn={<></>}
                                        thirdColumn={
                                            <FiatValue
                                                value={poolStrategyUsd - differentStrategyUsd}
                                                usePlusSymbol
                                                useBadgeStyle
                                                colorized
                                            />
                                        }
                                    />
                                </TotalLossRow>
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

            {estDaysLeft > 0 && (
                <DaysLeftGridWrapper>
                    <StrategyHeaderGridWrapper>
                        <BoxRow
                            firstColumn="Est. days left to compensate loss*"
                            secondColumn={estDaysLeft}
                            columnColors={['light', 'light']}
                        />
                    </StrategyHeaderGridWrapper>
                </DaysLeftGridWrapper>
            )}
        </Wrapper>
    );
};

export default DifferentStrategy;
