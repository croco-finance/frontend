import { FiatValue, GrayBox, VerticalCryptoAmounts } from '@components/ui';
import { colors, variables } from '@config';
import { statsComputations } from '@utils';
import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import CardRow from '../CardRow';

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
    margin-top: 8px;
    padding: 0;
    font-size: ${variables.FONT_SIZE.TINY};
    border-bottom: 1px solid ${colors.STROKE_GREY};
`;

const PoolValueGridWrapper = styled(GridWrapper)`
    padding-top: 4px;
    min-height: 48px;
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

const PoolsSummary = () => {
    const allPools = useSelector(state => state.allPools);
    const activePoolIds = useSelector(state => state.activePoolIds);
    const inactivePoolIds = useSelector(state => state.inactivePoolIds);

    if (!allPools) {
        return (
            <Wrapper>
                <h2>We didn't find any pools associated with this address :( </h2>
            </Wrapper>
        );
    }

    let activePoolsSummaryObject: any = statsComputations.getPoolsSummaryObject(
        allPools,
        activePoolIds,
    );

    const {
        valueLockedUsd,
        pooledTokenSymbols,
        pooledTokenAmounts,
        yieldTokenSymbols,
        yieldTokenAmounts,
        yieldUsd,
        txCostEth,
        txCostUsd,
        feesTokenSymbols,
        feesTokenAmounts,
        feesUsd,
    } = activePoolsSummaryObject;

    const feesRow = (
        <CardRow
            firstColumn="Fees earned"
            secondColumn={
                <VerticalCryptoAmounts
                    tokenSymbols={feesTokenSymbols}
                    tokenAmounts={feesTokenAmounts}
                />
            }
            thirdColumn={<FiatValue value={feesUsd} usePlusSymbol />}
            columnColors={['medium', 'light', 'dark']}
        />
    );

    const yieldRow = (
        <CardRow
            firstColumn="Yield reward"
            secondColumn={
                <VerticalCryptoAmounts
                    tokenSymbols={yieldTokenSymbols}
                    tokenAmounts={yieldTokenAmounts}
                />
            }
            thirdColumn={<FiatValue value={yieldUsd} usePlusSymbol />}
            columnColors={['medium', 'light', 'dark']}
        />
    );

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
                        firstColumn="Overview"
                        secondColumn="Crypto "
                        thirdColumn="Value today"
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
                                    value={feesUsd + yieldUsd - txCostUsd}
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
                        firstColumn="Value locked in pools"
                        secondColumn={
                            <VerticalCryptoAmounts
                                tokenSymbols={pooledTokenSymbols}
                                tokenAmounts={pooledTokenAmounts}
                            />
                        }
                        thirdColumn={<FiatValue value={valueLockedUsd} />}
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
        </Wrapper>
    );
};

export default PoolsSummary;
