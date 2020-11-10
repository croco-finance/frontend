import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import {
    Icon,
    FiatValue,
    CryptoValue,
    GrayBox,
    ToggleSwitch,
    MultipleTokenLogo,
    CryptoFiatValue,
} from '@components/ui';
import { colors, variables } from '@config';
import { mathUtils, lossUtils, getTokenSymbolArr } from '@utils';
import CardRow from '../CardRow';
import Graph from '../Graph';
import { Collapse } from 'react-collapse';
import CollapsibleDiv from '../CollapsibleDiv';

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

    grid-template-columns: 250px minmax(100px, auto);
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
    grid-template-rows: repeat(1, 48px);
    padding: 0px 25px;
    margin-top: 10px;
    margin-bottom: -5px;
    font-size: ${variables.FONT_SIZE.SMALL};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    color: ${colors.FONT_LIGHT};
`;

const StrategyHeaderGridWrapper = styled(GridWrapper)`
    grid-template-columns: minmax(100px, auto) minmax(100px, auto) 26px;
`;

const PoolValueRow = styled(GridWrapper)`
    border-bottom: 1px solid ${colors.STROKE_GREY};
    margin-bottom: 8px;
    padding-bottom: 5px;
`;

const StrategyItem = styled(GrayBox)`
    margin-bottom: 6px;
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
    grid-template-columns: 250px minmax(100px, auto);
    font-size: 15px;
    grid-auto-rows: 37px;
`;

const DaysLeftNote = styled.div`
    border-top: 1px solid ${colors.STROKE_GREY};
    color: ${colors.FONT_MEDIUM};
    padding: 10px;
`;

const ImpLossValueWrapper = styled.div`
    display: flex;
    align-items: center;
`;
const PoolOverviewGrid = styled(GridWrapper)`
    grid-template-columns: 190px minmax(100px, auto);
    align-items: center;
    padding-top: 0;
    min-height: 40px;
`;
const PoolValueWrapper = styled.div``;
const PoolValueDifference = styled.div`
    font-size: ${variables.FONT_SIZE.SMALL};
`;

const GraphWrapper = styled.div`
    padding: 40px 10px 0 10px;
`;

const CardOverview = () => {
    const [showEth, setShowEth] = useState(false);
    const [isHodlCollapseOpened, setIsHodlCollapseOpened] = useState(false);

    const allPools = useSelector(state => state.allPools);
    const poolGroups = useSelector(state => state.poolGroups);
    const selectedPoolId = useSelector(state => state.selectedPoolId);
    let pool: any = allPools[selectedPoolId];

    // Get pool group
    // const poolSnapshots = poolGroups['0xd3d2e2692501a5c9ca623199d38826e513033a17'];

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

    let {
        tokens,
        endBalanceUsd,
        endBalanceEth,
        netReturnUsd,
        netReturnEth,
        feesUsd,
        feesEth,
        txCostEth,
        txCostUsd,
        impLossUsd,
        impLossEth,
        impLossRel,
        dexReturnUsd,
        yieldRewardUsd,
        yieldRewardEth,
        start,
        end,
        isActive,
        hodlReturnUsd,
    } = pool;
    const startBalanceUsd = endBalanceUsd - netReturnUsd;
    const startBalanceEth = endBalanceEth - netReturnEth;

    const averageRewardsUsd = mathUtils.getDailyAverageFeeGains(
        start,
        end,
        feesUsd + yieldRewardUsd,
    );
    const daysLeftStaking = Math.abs(Math.floor(dexReturnUsd / averageRewardsUsd));

    if (!txCostEth) {
        txCostEth = 0;
    }
    const dexReturnEth = feesEth + yieldRewardEth - txCostEth - impLossEth;
    const tokenSymbolsArr = getTokenSymbolArr(tokens);

    const endTimeText = isActive ? 'Today' : 'Withdrawal time';

    let tokenSymbolsString = '';
    tokenSymbolsArr.forEach(symbol => {
        tokenSymbolsString = tokenSymbolsString + ', ' + symbol;
    });
    tokenSymbolsString = tokenSymbolsString.substring(1); //delete first char (comma)

    const poolBalanceUsd = feesUsd + yieldRewardUsd - txCostUsd;

    const feesRow = (
        <CardRow
            firstColumn="Fees earned"
            secondColumn={
                <CryptoFiatValue
                    showCrypto={false}
                    fiatValue={feesUsd}
                    cryptoValue={feesEth}
                    usePlusSymbol
                />
            }
            color="dark"
        />
    );

    const yieldRow = yieldRewardUsd ? (
        <CardRow
            firstColumn="Yield farming"
            secondColumn={
                <CryptoFiatValue
                    showCrypto={false}
                    fiatValue={yieldRewardUsd}
                    cryptoValue={yieldRewardEth}
                    usePlusSymbol
                />
            }
            color="dark"
        />
    ) : null;

    const txCostRow = (
        <CardRow
            firstColumn="Transactions cost"
            secondColumn={
                <CryptoFiatValue
                    showCrypto={false}
                    fiatValue={-txCostUsd}
                    cryptoValue={-txCostEth}
                    usePlusSymbol
                />
            }
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
                <CardRow firstColumn="Pool overview" secondColumn={endTimeText} color="light" />
            </HeaderWrapper>
            <GrayBox padding={15}>
                <PoolValueRow>
                    <CardRow
                        // showThreeCols=
                        firstColumn="Your pool share value"
                        // secondColumn={
                        //     impLossUsd ? (
                        //         <CryptoFiatValue
                        //             showCrypto={showEth}
                        //             fiatValue={startBalanceUsd}
                        //             cryptoValue={startBalanceEth}
                        //         />
                        //     ) : (
                        //         ''
                        //     )
                        // }
                        secondColumn={
                            <PoolValueWrapper>
                                <CryptoFiatValue
                                    showCrypto={showEth}
                                    fiatValue={endBalanceUsd}
                                    cryptoValue={endBalanceEth}
                                />

                                {/* {impLossUsd ? (
                                    <PoolValueDifference>
                                        <CryptoFiatValue
                                            showCrypto={showEth}
                                            fiatValue={netReturnUsd}
                                            cryptoValue={netReturnEth}
                                            usePlusSymbol
                                            colorized
                                        />
                                    </PoolValueDifference>
                                ) : null} */}
                            </PoolValueWrapper>
                        }
                        color="dark"
                    />
                </PoolValueRow>
                <PoolOverviewGrid>
                    {feesRow}
                    {yieldRow}
                    {txCostRow}
                </PoolOverviewGrid>
                <DaysLeftWrapper>
                    <DaysLeftGridWrapper>
                        <CardRow
                            firstColumn="Total (rewards - expenses)"
                            secondColumn={
                                <FiatValue
                                    value={poolBalanceUsd}
                                    usePlusSymbol
                                    colorized
                                    useBadgeStyle
                                ></FiatValue>
                            }
                            color="dark"
                        />
                    </DaysLeftGridWrapper>
                </DaysLeftWrapper>
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

            <StrategyItem padding={15}>
                <StrategyHeaderGridWrapper>
                    <CardRow
                        showThreeCols
                        firstColumn="If you converted all deposits to ETH"
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
                {/* <GridWrapper>
                    <CardRow
                        firstColumn="Impermanent loss"
                        secondColumn={
                            <ImpLossValueWrapper>
                                <CryptoFiatValue
                                    showCrypto={false}
                                    fiatValue={-impLossUsd}
                                    cryptoValue={-impLossEth}
                                    usePlusSymbol
                                />
                            </ImpLossValueWrapper>
                        }
                        color="dark"
                    />
                </GridWrapper> */}
                {/* <TotalLossRowWrapper>
                    <CardRow
                        firstColumn="Total"
                        secondColumn={
                            <CryptoFiatValue
                                showCrypto={false}
                                fiatValue={netReturnUsd - hodlReturnUsd}
                                cryptoValue={dexReturnEth}
                                usePlusSymbol
                                useBadgeStyle
                            />
                        }
                        color="dark"
                    />
                </TotalLossRowWrapper> */}
                {/* <DaysLeftWrapper>
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
                </DaysLeftWrapper> */}
            </StrategyItem>

            {/* <CollapsibleDiv /> */}
            {/* <h3>Pool value in time</h3> */}
            {/* <GraphWrapper>
                <Graph />
            </GraphWrapper> */}
        </Wrapper>
    );
};

export default CardOverview;
