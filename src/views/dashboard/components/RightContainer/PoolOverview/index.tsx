import { FiatValue, GrayBox, MultipleTokenLogo, VerticalCryptoAmounts } from '@components/ui';
import { colors, types, variables } from '@config';
import { formatUtils, graphUtils } from '@utils';
import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import CardRow from '../CardRow';
import Graph from '../Graph';

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
    padding: 0 20px 12px 20px;
    margin-top: 20px;
    font-size: ${variables.FONT_SIZE.SMALL};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    color: ${colors.FONT_LIGHT};
`;

const RewardsExpensesHeader = styled(GridWrapper)`
    grid-template-rows: repeat(1, 20px);
    margin-bottom: 18px;
    margin-top: 8px;
    padding: 0;
    font-size: ${variables.FONT_SIZE.TINY};
    border-bottom: 1px solid ${colors.STROKE_GREY};
`;

const PoolValueGridWrapper = styled(GridWrapper)`
    padding-top: 4px;
    min-height: 48px;
`;

const StrategyItem = styled(GrayBox)`
    margin-bottom: 6px;
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

const TotalLossRow = styled(GridWrapper)`
    height: 40px;
    align-items: center;
`;

const TotalWrapper = styled.div`
    display: flex;
    flex-direction: column;
`;

const TotalSubNote = styled.div`
    font-size: ${variables.FONT_SIZE.TINY};
    color: ${colors.FONT_LIGHT};
`;

const PoolOverview = () => {
    const allPools: types.AllPoolsGlobal = useSelector(state => state.allPools);
    const selectedPoolId = useSelector(state => state.selectedPoolId);
    let pool = allPools[selectedPoolId];

    // Compute imp loss, fees, hold, ETH hold, token hold fo each snapshot
    // lossUtils.getPoolStats(poolSnapshots);

    // TODO make the following checks and computations cleaner
    if (!allPools || !pool) {
        return (
            <Wrapper>
                <h2>We didn't find any pools associated with this address :( </h2>
            </Wrapper>
        );
    }

    let { tokens, isActive, hasYieldReward, yieldToken } = pool;

    const {
        feesUsd,
        yieldUsd,
        txCostEth,
        txCostUsd,
        rewardsMinusExpensesUsd,
        poolValueUsd,
        tokenBalances,
        feesTokenAmounts,
        yieldTokenAmount,
    } = pool.cumulativeStats;

    const endTimeText = isActive ? 'Value today' : 'Withdrawal time';
    const poolShareValueText = isActive ? 'Your pool share' : 'End pool share';

    const tokenSymbolsArr = formatUtils.getTokenSymbolArr(tokens);

    const feesRow = (
        <CardRow
            firstColumn="Fees earned"
            secondColumn={
                <VerticalCryptoAmounts
                    tokenSymbols={tokenSymbolsArr}
                    tokenAmounts={feesTokenAmounts}
                />
            }
            thirdColumn={<FiatValue value={feesUsd} usePlusSymbol />}
            columnColors={['medium', 'light', 'dark']}
        />
    );

    const yieldRow =
        hasYieldReward && yieldToken ? (
            <CardRow
                firstColumn="Yield reward"
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
        <CardRow
            firstColumn="Transaction expenses"
            secondColumn={
                <VerticalCryptoAmounts tokenSymbols={['ETH']} tokenAmounts={[txCostEth]} />
            }
            thirdColumn={<FiatValue value={-txCostUsd} usePlusSymbol />}
            columnColors={['medium', 'light', 'dark']}
        />
    );

    const totalText = (
        <TotalWrapper>
            Total <TotalSubNote>Rewards - Expenses</TotalSubNote>
        </TotalWrapper>
    );

    return (
        <Wrapper>
            <HeaderWrapper>
                <GridWrapper>
                    <CardRow
                        firstColumn="Pool overview"
                        secondColumn="Crypto "
                        thirdColumn={endTimeText}
                        columnColors={['light', 'light', 'light']}
                    />
                </GridWrapper>
            </HeaderWrapper>
            <GrayBox
                padding={[15, 20, 15, 20]}
                bottomBar={
                    <TotalLossRow>
                        <CardRow
                            firstColumn={totalText}
                            secondColumn={<></>}
                            thirdColumn={
                                <FiatValue
                                    value={rewardsMinusExpensesUsd}
                                    usePlusSymbol
                                    useBadgeStyle
                                    colorized
                                />
                            }
                            color="dark"
                        />
                    </TotalLossRow>
                }
            >
                <PoolValueGridWrapper>
                    <CardRow
                        firstColumn={poolShareValueText}
                        secondColumn={
                            <VerticalCryptoAmounts
                                tokenSymbols={tokenSymbolsArr}
                                tokenAmounts={tokenBalances}
                            />
                        }
                        thirdColumn={<FiatValue value={poolValueUsd} />}
                        columnColors={['medium', 'light', 'dark']}
                    />
                </PoolValueGridWrapper>

                <RewardsExpensesHeader>
                    <CardRow
                        firstColumn="Rewards & Expenses"
                        secondColumn=""
                        thirdColumn=""
                        columnColors={['light', 'light', 'light']}
                    />
                </RewardsExpensesHeader>

                <GridWrapper>
                    {feesRow}
                    {yieldRow}
                    {txCostRow}
                </GridWrapper>
            </GrayBox>
            {/* <HeaderWrapper>
                <CardRow
                    firstColumn="Comparison to other strategies"
                    secondColumn={endTimeText}
                    color="light"
                />
            </HeaderWrapper>
            <StrategyItem padding={15}>
                <StrategyHeaderGridWrapper>
                    <CardRow
                        showThreeCols
                        firstColumn="If you HODL'd deposited tokens"
                        secondColumn={
                            <FiatValue value={netReturnUsd - hodlReturnUsd} usePlusSymbol />
                        }
                        thirdColumn={
                            <CollapseIconWrapper>
                                <Icon icon="arrow_down" size={16} />
                            </CollapseIconWrapper>
                        }
                        color="dark"
                    />
                </StrategyHeaderGridWrapper>
            </StrategyItem> */}
        </Wrapper>
    );
};

export default PoolOverview;
