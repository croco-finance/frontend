import { FiatValue, GrayBox, MultipleTokenLogo } from '@components/ui';
import { colors, types, variables } from '@config';
import { getTokenSymbolArr, graphUtils } from '@utils';
import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import CardRow from '../CardRow';
import Graph from '../Graph';
import VerticalCryptoAmounts from '../VerticalCryptoAmounts';

const GRID_GAP = 5;

const Wrapper = styled.div`
    max-width: 650px;
    margin: 0 auto;
`;

const GridWrapper = styled.div`
    flex-grow: 1;
    display: grid;
    /* grid-gap: ${GRID_GAP}px; */
    gap: 28px 10px;
    grid-template-columns: 190px minmax(100px, auto) minmax(100px, auto);
    grid-auto-rows: auto;
    font-size: ${variables.FONT_SIZE.NORMAL};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    align-items: center;
    overflow-x: auto; /* allow x-axis scrolling: useful on small screens when fiat amount is displayed */
    word-break: break-all;
    padding: 0px 10px;
    font-size: ${variables.FONT_SIZE.NORMAL};

    @media (max-width: 520px) {
        font-size: ${variables.FONT_SIZE.SMALL};
    }
`;

const HeaderWrapper = styled(GridWrapper)`
    grid-template-rows: repeat(1, 40px);
    padding: 0px 25px;
    margin-top: 20px;
    margin-bottom: -5px;
    font-size: ${variables.FONT_SIZE.SMALL};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    /* color: ${colors.FONT_LIGHT}; */
`;

const PoolValueGrayBox = styled(GrayBox)`
    padding: 24px 15px 15px 15px;
    border-bottom-left-radius: 0px;
    border-bottom-right-radius: 0px;
`;

const RewardsExpensesHeaderWrapper = styled.div`
    background-color: ${colors.BACKGROUND};
    margin: 0;
    padding: 0px 25px;
`;

const RewardsExpensesHeader = styled(GridWrapper)`
    grid-template-rows: repeat(1, 30px);
    font-size: ${variables.FONT_SIZE.TINY};

    padding: 0;
    border-bottom: 1px solid ${colors.STROKE_GREY};
`;

const DaysLeftWrapper = styled.div`
    background-color: ${colors.BACKGROUND_DARK};
    padding: 10px;
    font-size: ${variables.FONT_SIZE.SMALL};
    border-radius: 5px;
    margin-top: 10px;
`;

const PoolValueGridWrapper = styled(GridWrapper)`
    grid-template-columns: 190px minmax(100px, auto) minmax(100px, auto);
    align-items: baseline;
    padding-top: 0;
    min-height: 40px;
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

const RewardsExpensesWrapper = styled(GrayBox)`
    /* border-bottom-left-radius: 0px;
    border-bottom-right-radius: 0px; */
    padding-bottom: 24px;
    border-radius: 0;
`;

const TotalLossRowWrapper = styled(GrayBox)`
    background-color: ${colors.BACKGROUND_DARK};
    border-top-left-radius: 0px;
    border-top-right-radius: 0px;
    padding-top: 12px;
    padding-bottom: 12px;
`;

const TotalLossRow = styled(GridWrapper)`
    height: 40px;
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
    const poolShareValueText = isActive ? 'Your pool share value' : 'End pool share value';

    const tokenSymbolsArr = getTokenSymbolArr(tokens);

    let tokenSymbolsString = '';
    tokenSymbolsArr.forEach(symbol => {
        tokenSymbolsString = tokenSymbolsString + ', ' + symbol;
    });
    tokenSymbolsString = tokenSymbolsString.substring(1); //delete first char (comma)

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
            firstColumn="Transactions expenses"
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
            {/* <Header>
                <Headline>
                    <MultipleTokenLogo size={18} tokens={tokenSymbolsArr} />
                    <HeadlineText>{tokenSymbolsString}</HeadlineText>
                </Headline>
            </Header> */}

            <HeaderWrapper>
                <CardRow
                    firstColumn="Pool overview"
                    secondColumn="Crypto "
                    thirdColumn={endTimeText}
                    columnColors={['light', 'light', 'light']}
                />
            </HeaderWrapper>
            <PoolValueGrayBox>
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
            </PoolValueGrayBox>

            <RewardsExpensesHeaderWrapper>
                <RewardsExpensesHeader>
                    <CardRow
                        firstColumn="Rewards & Expenses"
                        secondColumn=""
                        thirdColumn=""
                        columnColors={['light', 'light', 'light']}
                    />
                </RewardsExpensesHeader>
            </RewardsExpensesHeaderWrapper>
            <RewardsExpensesWrapper padding={15}>
                <GridWrapper>
                    {feesRow}
                    {yieldRow}
                    {txCostRow}
                </GridWrapper>
            </RewardsExpensesWrapper>
            <TotalLossRowWrapper>
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
            </TotalLossRowWrapper>

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
