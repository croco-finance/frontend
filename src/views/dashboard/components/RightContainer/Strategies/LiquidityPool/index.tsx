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

const HeaderWrapper = styled.div`
    padding: 0 20px 10px 20px;
    margin-top: 10px;
    font-size: ${variables.FONT_SIZE.SMALL};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    color: ${colors.FONT_LIGHT};
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
`;

const CollapseIconWrapper = styled.div`
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

const CollapseWrapper = styled.div``;

const LiquidityPool = () => {
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

    let { pooledTokens, isActive, hasYieldReward, yieldToken, intervalStats, exchange } = pool;

    const {
        feesUsd,
        yieldUsd,
        txCostEth,
        txCostUsd,
        currentPoolValueUsd,
        tokenBalances,
        feesTokenAmounts,
        yieldTokenAmount,
        depositsUsd,
        withdrawalsUsd,
        depositsTokenAmounts,
        withdrawalsTokenAmounts,
        poolStrategyUsd,
    } = pool.cumulativeStats;

    const endTimeText = isActive ? 'Value today' : 'Withdrawal time';
    const poolShareValueText = isActive ? 'Your pool share' : 'End pool share';

    const tokenSymbolsArr = formatUtils.getTokenSymbolArr(pooledTokens);

    // Temporary check if to show unclaimed UNI yield rewards
    let showUnclaimedUni = false;

    if (exchange === 'UNI_V2' && yieldTokenAmount === 0) {
        intervalStats.forEach(stat => {
            if (stat.staked === true) {
                showUnclaimedUni = true;
            }
        });
    }

    const poolShareRow = (
        <BoxRow
            firstColumn="Current pool share (fees inc.)"
            secondColumn={
                <VerticalCryptoAmounts
                    tokenSymbols={tokenSymbolsArr}
                    tokenAmounts={isActive ? tokenBalances : tokenBalances.fill(0)}
                />
            }
            thirdColumn={<FiatValue value={currentPoolValueUsd} usePlusSymbol />}
            columnColors={['medium', 'light', 'dark']}
        />
    );

    const withdrawalsRow = (
        <BoxRow
            firstColumn="Pool withdrawals"
            secondColumn={
                <VerticalCryptoAmounts
                    tokenSymbols={tokenSymbolsArr}
                    tokenAmounts={withdrawalsTokenAmounts}
                />
            }
            thirdColumn={<FiatValue value={withdrawalsUsd} usePlusSymbol />}
            columnColors={['medium', 'light', 'dark']}
        />
    );

    const yieldRow = yieldToken ? (
        <BoxRow
            firstColumn="Yield rewards"
            secondColumn={
                <VerticalCryptoAmounts
                    tokenSymbols={[yieldToken.symbol]}
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

    return (
        <Wrapper>
            <HeaderWrapper>
                <GridWrapper>
                    <BoxRow
                        firstColumn="Pool overview"
                        secondColumn="Crypto "
                        thirdColumn={endTimeText}
                        columnColors={['light', 'light', 'light']}
                    />
                </GridWrapper>
            </HeaderWrapper>

            <CollapsibleContainer
                headline={
                    <StrategyHeaderGridWrapper>
                        <BoxRow
                            firstColumn="Being liquidity provider"
                            secondColumn={<FiatValue value={poolStrategyUsd} usePlusSymbol />}
                            columnColors={['light', 'light', 'light']}
                        />
                    </StrategyHeaderGridWrapper>
                }
                collapseBody={
                    <CollapseWrapper>
                        <GrayBox
                            padding={[15, 15, 15, 15]}
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
                                    thirdColumn="Value today"
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
