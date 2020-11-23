import { FiatValue, GrayBox, VerticalCryptoAmounts, Icon } from '@components/ui';
import { colors, variables } from '@config';
import { formatUtils } from '@utils';
import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import CardRow from '../CardRow';
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

const UnclaimedTokenWarning = styled.div`
    margin-top: 10px;
    padding: 10px;
    border-radius: 10px;
    font-weight: ${variables.FONT_WEIGHT.REGULAR};
    background-color: #f7f4ff;
    border: 1px solid #baa6f9;
    color: #673df1;
    display: flex;
`;

const WarningText = styled.div`
    margin-left: 5px;
`;

const UniYieldLink = styled.a`
    text-decoration: none;
    color: #673df1;
    font-weight: ${variables.FONT_WEIGHT.DEMI_BOLD};

    &:hover {
        text-decoration: underline;
    }
`;

const PoolOverview = () => {
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
        poolValueUsd,
        tokenBalances,
        feesTokenAmounts,
        yieldTokenAmount,
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

            {showUnclaimedUni && (
                <UnclaimedTokenWarning>
                    <Icon icon="info" color={'#673df1'} size={18} />
                    <WarningText>
                        It looks like you might have some unclaimed yield rewards. Check it on{' '}
                        <UniYieldLink href="https://app.uniswap.org/#/uni" target="__blank">
                            Uniswap
                        </UniYieldLink>
                        .
                    </WarningText>
                </UnclaimedTokenWarning>
            )}
        </Wrapper>
    );
};

export default PoolOverview;
