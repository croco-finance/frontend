import { BoxRow, FiatValue, GrayBox, VerticalCryptoAmounts } from '@components/ui';
import { variables } from '@config';
import { useTheme } from '@hooks';
import { AllPoolsGlobal } from '@types';
import { formatUtils } from '@utils';
import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import 'tippy.js/dist/tippy.css'; // optional

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
    color: ${props => props.theme.FONT_LIGHT};
`;

const RewardsExpensesHeader = styled(GridWrapper)`
    grid-template-rows: repeat(1, 20px);
    margin-bottom: 18px;
    margin-top: 8px;
    padding: 0;
    font-size: ${variables.FONT_SIZE.TINY};
    border-bottom: 1px solid ${props => props.theme.STROKE_GREY};
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
    color: ${props => props.theme.FONT_LIGHT};
`;

const PoolOverview = () => {
    const allPools: AllPoolsGlobal = useSelector(state => state.allPools);
    const selectedPoolId = useSelector(state => state.selectedPoolId);
    let pool = allPools[selectedPoolId];
    const theme: any = useTheme();

    // Compute imp loss, fees, hold, ETH hold, token hold fo each snapshot

    // TODO make the following checks and computations cleaner
    if (!allPools || !pool) {
        return (
            <Wrapper>
                <h2>We didn't find any pools associated with this address :( </h2>
            </Wrapper>
        );
    }

    let { pooledTokens, isActive, hasYieldReward, intervalStats } = pool;

    const {
        feesUsd,
        yieldUsd,
        txCostEth,
        txCostUsd,
        endPoolValueUsd,
        tokenBalances,
        feesTokenAmounts,
        yieldTotalTokenAmounts,
        yieldTokenSymbols,
    } = pool.cumulativeStats;

    const endTimeText = isActive
        ? 'Value today'
        : `Value on ${formatUtils.getFormattedDateFromTimestamp(
              intervalStats[intervalStats.length - 1].timestampEnd,
              'MONTH_DAY_YEAR',
          )}`;
    const poolShareValueText = isActive ? 'Your pool share' : 'End pool share';

    const tokenSymbolsArr = formatUtils.getTokenSymbolArr(pooledTokens);

    const feesRow = (
        <BoxRow
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
                    <BoxRow
                        firstColumn="Pool overview"
                        secondColumn="Crypto "
                        thirdColumn={endTimeText}
                        columnColors={['light', 'light', 'light']}
                    />
                </GridWrapper>
            </HeaderWrapper>
            <GrayBox
                padding={[15, 20, 15, 20]}
                borderRadius={[10, 10, 0, 0]}
                bottomBarBorderRadius={[0, 0, 10, 10]}
                bottomBarPadding={[10, 20, 10, 20]}
                backgroundColor={theme.BACKGROUND}
                bottomBar={
                    <TotalLossRow>
                        <BoxRow
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
                            columnColors={['medium', 'dark', 'dark']}
                        />
                    </TotalLossRow>
                }
            >
                <PoolValueGridWrapper>
                    <BoxRow
                        firstColumn={poolShareValueText}
                        secondColumn={
                            <VerticalCryptoAmounts
                                tokenSymbols={tokenSymbolsArr}
                                tokenAmounts={tokenBalances}
                            />
                        }
                        thirdColumn={<FiatValue value={endPoolValueUsd} />}
                        columnColors={['medium', 'light', 'dark']}
                    />
                </PoolValueGridWrapper>

                <RewardsExpensesHeader>
                    <BoxRow
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

export default PoolOverview;
