import {
    FiatValue,
    GrayBox,
    VerticalCryptoAmounts,
    CollapsibleContainer,
    BoxRow,
    Icon,
} from '@components/ui';
import { colors, variables } from '@config';
import { formatUtils, mathUtils, simulatorUtils } from '@utils';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { AllPoolsGlobal } from '@types';
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
    font-size: ${variables.FONT_SIZE.TINY};
    border-bottom: 1px solid ${colors.STROKE_GREY};
`;

const TotalLossRow = styled(GridWrapper)`
    height: 40px;
    align-items: center;
`;

const StrategyHeaderGridWrapper = styled(GridWrapper)`
    grid-template-columns: minmax(100px, auto) minmax(100px, auto) 26px;
    align-items: center;
`;

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

const PoolShareHeadline = styled.div`
    display: flex;
    flex-direction: column;
`;
const SubNote = styled.div`
    font-size: ${variables.FONT_SIZE.SMALL};
`;

const CollapseWrapper = styled.div``;

interface Props {
    isActive: boolean;
    tokenSymbols: string[];
    pooledTokenBalances: number[];
    simulatedPoolValueUsd: number;
    withdrawalsTokenAmounts: number[];
    simulatedWithdrawalsUsd: number;
    yieldTokenSymbol: string | undefined;
    yieldTotalTokenAmount: number;
    simulatedTxCostUsd: number;
    simulatedPoolStrategyUsd: number;
    poolStrategyUsd: number;
    txCostEth: number;
    simulatedYieldUsd: number;
    lastSnapTimestampEnd: number;
}

const LiquidityPool = ({
    isActive,
    tokenSymbols,
    pooledTokenBalances,
    simulatedPoolValueUsd,
    withdrawalsTokenAmounts,
    simulatedWithdrawalsUsd,
    yieldTokenSymbol,
    yieldTotalTokenAmount,
    simulatedTxCostUsd,
    simulatedPoolStrategyUsd,
    poolStrategyUsd,
    txCostEth,
    simulatedYieldUsd,
    lastSnapTimestampEnd,
}: Props) => {
    const [isOpened, setIsOpened] = useState(false);

    const endTimeText = isActive
        ? 'Value today'
        : `Value on ${formatUtils.getFormattedDateFromTimestamp(
              lastSnapTimestampEnd,
              'MONTH_DAY_YEAR',
          )}`;
    const poolShareRow = (
        <BoxRow
            firstColumn={
                <PoolShareHeadline>
                    Current pool share<SubNote>(fees included)</SubNote>
                </PoolShareHeadline>
            }
            secondColumn={
                <VerticalCryptoAmounts
                    tokenSymbols={tokenSymbols}
                    tokenAmounts={pooledTokenBalances}
                />
            }
            thirdColumn={<FiatValue value={simulatedPoolValueUsd} usePlusSymbol />}
            columnColors={['medium', 'light', 'dark']}
        />
    );

    const withdrawalsRow = (
        <BoxRow
            firstColumn="Pool withdrawals"
            secondColumn={
                <VerticalCryptoAmounts
                    tokenSymbols={tokenSymbols}
                    tokenAmounts={withdrawalsTokenAmounts}
                />
            }
            thirdColumn={<FiatValue value={simulatedWithdrawalsUsd} usePlusSymbol />}
            columnColors={['medium', 'light', 'dark']}
        />
    );

    const yieldRow = yieldTokenSymbol ? (
        <BoxRow
            firstColumn="Yield rewards"
            secondColumn={
                <VerticalCryptoAmounts
                    tokenSymbols={[yieldTokenSymbol]}
                    tokenAmounts={[yieldTotalTokenAmount]}
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

    return (
        <Wrapper>
            <CollapsibleContainer
                onChange={isOpened => {
                    setIsOpened(isOpened);
                }}
                header={
                    <GrayBox
                        backgroundColor={colors.BACKGROUND_BLUE}
                        borderRadius={isOpened ? [10, 10, 0, 0] : [10, 10, 10, 10]}
                    >
                        <StrategyHeaderGridWrapper>
                            <BoxRow
                                firstColumn="Strategy is worth"
                                secondColumn={
                                    <DoubleValue
                                        top={<FiatValue value={poolStrategyUsd} />}
                                        bottom={
                                            <FiatValue
                                                customColor={colors.BLUE}
                                                value={simulatedPoolStrategyUsd}
                                            />
                                        }
                                    />
                                }
                                thirdColumn={
                                    <ExpandButton>
                                        <Icon
                                            icon={isOpened ? 'arrow_up' : 'arrow_down'}
                                            size={16}
                                            color={colors.BLUE}
                                        />
                                    </ExpandButton>
                                }
                                customColor={colors.BLUE}
                            />
                        </StrategyHeaderGridWrapper>
                    </GrayBox>
                }
                collapseBody={
                    <CollapseWrapper>
                        <GrayBox
                            padding={[15, 50, 15, 15]}
                            borderRadius={[0, 0, 0, 0]}
                            bottomBarBorderRadius={[0, 0, 10, 10]}
                            bottomBarPadding={[10, 50, 10, 15]}
                            bottomBar={
                                <TotalLossRow>
                                    <BoxRow
                                        firstColumn="Total value"
                                        secondColumn={<></>}
                                        thirdColumn={
                                            <FiatValue value={poolStrategyUsd} useBadgeStyle />
                                        }
                                    />
                                </TotalLossRow>
                            }
                        >
                            <RewardsExpensesHeader>
                                <BoxRow
                                    firstColumn="Overview"
                                    secondColumn="Crypto"
                                    thirdColumn={endTimeText}
                                    columnColors={['light', 'light', 'light']}
                                />
                            </RewardsExpensesHeader>
                            <GridWrapper>
                                {poolShareRow}
                                {withdrawalsRow}
                                {yieldRow}
                                {txCostRow}
                            </GridWrapper>
                        </GrayBox>
                    </CollapseWrapper>
                }
            />
        </Wrapper>
    );
};

export default LiquidityPool;
