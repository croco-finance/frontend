import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import {
    FiatValue,
    CryptoValue,
    GrayBox,
    ToggleSwitch,
    MultipleTokenLogo,
    CryptoFiatValue,
    Icon,
} from '@components/ui';
import { colors, variables, types } from '@config';
import { mathUtils, lossUtils, getTokenSymbolArr } from '@utils';
import CardRow from '../CardRow';
import Graph from '../Graph';

const GRID_GAP = 5;

const Wrapper = styled.div``;

const Headline = styled.div`
    padding: 0 10px;
    /* font-weight: ${variables.FONT_WEIGHT.MEDIUM}; */
    font-size: ${variables.FONT_SIZE.SMALL};
    margin-top: 0;
    display: flex;
    flex-direction: row;
    height: 44px;
    width: 100%;
    justify-self: flex-start;
    align-items: center;
`;

const HeadlineText = styled.div`
    margin-left: 6px;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    color: ${colors.FONT_LIGHT};
`;

const Header = styled.div`
    display: flex;
    width: 100%;
    align-items: center;
    padding: 0 10px 10px 10px;
    align-items: center;
    /* border-bottom: 1px solid ${colors.BACKGROUND_DARK}; */
`;

const ToggleWrapper = styled.div`
    display: flex;
    align-items: center;
`;

const ToggleLabel = styled.div`
    font-size: ${variables.FONT_SIZE.TINY};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    color: ${colors.FONT_LIGHT};
    margin-right: 6px;
    min-width: 100px;
    justify-self: flex-end;
    text-align: right;
`;

const GridWrapper = styled.div`
    flex-grow: 1;
    display: grid;
    grid-gap: ${GRID_GAP}px;

    grid-template-columns: 190px minmax(100px, auto);
    grid-auto-rows: 40px;
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
    grid-template-columns: 190px minmax(100px, auto) minmax(140px, auto);
    grid-template-rows: repeat(1, 40px);
    padding: 0px 25px;
    margin-top: 20px;
    margin-bottom: -5px;
    font-size: ${variables.FONT_SIZE.SMALL};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    color: ${colors.FONT_LIGHT};
`;

const HodlHeaderWrapper = styled(HeaderWrapper)`
    grid-template-columns: 280px 2px minmax(100px, auto);
`;

const TotalLossRowWrapper = styled(GridWrapper)`
    /* grid-template-rows: repeat(1, 50px); */
    border-top: 1px solid ${colors.STROKE_GREY};
    margin-top: 3px;
    padding-top: 6px;
`;

const DaysLeftWrapper = styled.div`
    background-color: ${colors.BACKGROUND_DARK};
    padding: 10px;
    font-size: ${variables.FONT_SIZE.SMALL};
    border-radius: 5px;
    margin-top: 10px;
`;

const DaysLeftGridWrapper = styled(GridWrapper)`
    grid-template-columns: 190px minmax(100px, auto);
    font-size: ${variables.FONT_SIZE.SMALL};
    grid-auto-rows: 37px;
`;

const DaysLeftNote = styled.div`
    border-top: 1px solid ${colors.STROKE_GREY};
    color: ${colors.FONT_MEDIUM};
    padding: 10px;
`;

const SubValue = styled.div`
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    color: ${colors.FONT_MEDIUM};
    font-size: ${variables.FONT_SIZE.SMALL};
    background-color: ${colors.BACKGROUND_DARK};
    padding: 3px;
    border-radius: 3px;
    margin-right: 8px;
    /* border-right: 1px solid ${colors.STROKE_GREY}; */
    padding: 2px 3px;
`;

const ImpLossValueWrapper = styled.div`
    display: flex;
    align-items: center;
`;
const PoolValueGridWrapper = styled(GridWrapper)`
    grid-template-columns: 190px minmax(100px, auto) minmax(100px, auto);
    align-items: baseline;
    padding-top: 0;
    min-height: 40px;
`;

const GraphWrapper = styled.div`
    padding: 40px 10px 0 10px;
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

const CardOverview = () => {
    const [showEth, setShowEth] = useState(false);

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

    let { tokens, isActive, hasYieldReward } = pool;

    const {
        feesUsd,
        yieldUsd,
        txCostEth,
        txCostUsd,
        rewardsMinusExpensesUsd,
        poolValueUsd,
    } = pool.cumulativeStats;

    // const startBalanceEth = endBalanceEth - netReturnEth;

    const start = 100000;
    const end = 120000;
    const dexReturnUsd = 10000;
    const impLossUsd = 10;
    const netReturnUsd = 10000;
    const hodlReturnUsd = 8000;

    const averageRewardsUsd = yieldUsd
        ? mathUtils.getDailyAverageFeeGains(start, end, feesUsd + yieldUsd)
        : 999;
    const daysLeftStaking = Math.abs(Math.floor(dexReturnUsd / averageRewardsUsd));

    // if (!txCostEth) {
    //     txCostEth = 0;
    // }
    // const dexReturnEth = feesEth + yieldRewardEth - txCostEth - impLossEth;

    const tokenSymbolsArr = getTokenSymbolArr(tokens);

    const endTimeText = isActive ? 'Today' : 'Withdrawal time';

    let tokenSymbolsString = '';
    tokenSymbolsArr.forEach(symbol => {
        tokenSymbolsString = tokenSymbolsString + ', ' + symbol;
    });
    tokenSymbolsString = tokenSymbolsString.substring(1); //delete first char (comma)

    const feesRow = (
        <CardRow
            firstColumn="Fees earned"
            secondColumn={<FiatValue value={feesUsd} usePlusSymbol />}
            color="dark"
        />
    );

    const yieldRow = yieldUsd ? (
        <CardRow
            firstColumn="Yield farming gains"
            secondColumn={<FiatValue value={yieldUsd} usePlusSymbol />}
            color="dark"
        />
    ) : null;

    const txCostRow = (
        <CardRow
            firstColumn="Transactions expenses"
            secondColumn={<FiatValue value={-txCostUsd} usePlusSymbol />}
            color="dark"
        />
    );

    return (
        <Wrapper>
            <Header>
                <Headline>
                    <MultipleTokenLogo size={18} tokens={tokenSymbolsArr} />
                    <HeadlineText>{tokenSymbolsString}</HeadlineText>
                </Headline>
                {/* <ToggleWrapper>
                    <ToggleLabel>Show ETH</ToggleLabel>
                    <ToggleSwitch checked={false} onChange={() => setShowEth(!showEth)} isSmall />
                </ToggleWrapper> */}
            </Header>

            <HeaderWrapper>
                <CardRow
                    showThreeCols
                    firstColumn="Pool overview"
                    secondColumn="Crypto"
                    thirdColumn={endTimeText}
                    color="light"
                />
            </HeaderWrapper>
            <GrayBox padding={15}>
                <PoolValueGridWrapper>
                    <CardRow
                        showThreeCols
                        firstColumn="Your pool share value"
                        secondColumn={'TOKENS'}
                        thirdColumn={<FiatValue value={poolValueUsd} />}
                        color="dark"
                    />
                </PoolValueGridWrapper>
            </GrayBox>

            <HodlHeaderWrapper>
                <CardRow
                    showThreeCols
                    firstColumn="Rewards & Expenses"
                    secondColumn=""
                    thirdColumn={endTimeText}
                    color="light"
                />
            </HodlHeaderWrapper>
            <GrayBox padding={15}>
                <GridWrapper>
                    {feesRow}
                    {yieldRow}
                    {txCostRow}
                </GridWrapper>
                <TotalLossRowWrapper>
                    <CardRow
                        firstColumn="Total"
                        secondColumn={
                            <FiatValue
                                value={netReturnUsd - hodlReturnUsd}
                                usePlusSymbol
                                useBadgeStyle
                            />
                        }
                        color="dark"
                    />
                </TotalLossRowWrapper>
            </GrayBox>
            <HeaderWrapper>
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
            </StrategyItem>

            <GrayBox padding={15}>
                <GridWrapper>
                    <CardRow
                        firstColumn="Impermanent loss"
                        secondColumn={
                            <ImpLossValueWrapper>
                                {/* {impLossRel && (
                                    <SubValue>
                                        {getFormattedPercentageValue(Math.abs(impLossRel))}
                                    </SubValue>
                                )} */}

                                <FiatValue value={-impLossUsd} usePlusSymbol />
                            </ImpLossValueWrapper>
                        }
                        color="dark"
                    />
                </GridWrapper>
                <TotalLossRowWrapper>
                    <CardRow
                        firstColumn="Total"
                        secondColumn={
                            <FiatValue
                                value={netReturnUsd - hodlReturnUsd}
                                usePlusSymbol
                                useBadgeStyle
                            />
                        }
                        color="dark"
                    />
                </TotalLossRowWrapper>
                <DaysLeftWrapper>
                    <DaysLeftGridWrapper>
                        <CardRow
                            firstColumn="Average daily rewards"
                            secondColumn={
                                <FiatValue value={averageRewardsUsd} usePlusSymbol></FiatValue>
                            }
                            color="dark"
                        />
                        {dexReturnUsd <= 0 && dexReturnUsd && isActive && (
                            <CardRow
                                firstColumn="Days left to compensate loss*"
                                secondColumn={daysLeftStaking}
                                color="dark"
                            />
                        )}
                    </DaysLeftGridWrapper>
                    {dexReturnUsd <= 0 && dexReturnUsd && isActive && (
                        <DaysLeftNote>
                            <b>*</b> According to your average rewards (fees + yield).
                        </DaysLeftNote>
                    )}
                </DaysLeftWrapper>
            </GrayBox>
            {/* <GraphWrapper>
                <Graph />
            </GraphWrapper> */}
        </Wrapper>
    );
};

export default CardOverview;