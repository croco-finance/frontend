import React, { useState } from 'react';
import styled from 'styled-components';
import { TokenLogo, FiatAmount, GrayBox, ToggleSwitch } from '../../../../../components/ui';
import { variables, colors } from '../../../../../config';
import CardRow from '../CardRow';
import { currentPriceRatioExample, oldRatioExample } from '../../../../../config/example-data';
import { PoolItemInterface } from '../../../../../config/types';
import { useDispatch, useSelector } from 'react-redux';
import {
    getFiatFromCrypto,
    getFormattedPercentageValue,
    getPoolsSummaryObject,
} from '../../../../../utils/math';

const GRID_GAP = 5;

const Wrapper = styled.div``;

const SwitchWrapper = styled.div`
    display: flex;
    width: 100%;
    justify-content: flex-end;
    align-items: center;
    padding: 0 10px;
    margin-bottom: 40px;
`;

const ToggleLabel = styled.div`
    font-size: ${variables.FONT_SIZE.TINY};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    color: ${colors.FONT_MEDIUM};
    margin-right: 6px;
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
`;

const HeaderWrapper = styled(GridWrapper)`
    grid-template-columns: 190px minmax(100px, auto) minmax(100px, auto);
    grid-template-rows: repeat(1, 40px);
    padding: 0px 25px;
    margin-top: 20px;
    margin-bottom: -5px;
    font-size: ${variables.FONT_SIZE.SMALL};
`;

const HodlHeaderWrapper = styled(HeaderWrapper)`
    grid-template-columns: 190px minmax(100px, auto);
`;

const TotalLossRowWrapper = styled(GridWrapper)`
    /* grid-template-rows: repeat(1, 50px); */
    border-top: 1px solid ${colors.STROKE_GREY};
    margin-top: 3px;
    padding-top: 3px;
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
const PoolValueWrapper = styled.div``;
const PoolValueDifference = styled.div`
    font-size: ${variables.FONT_SIZE.SMALL};
`;

interface Props {}

const CardOverview = ({}: Props) => {
    const [showEth, setShowEth] = useState(false);

    const allPools = useSelector(state => state.allPools);
    const selectedPoolId = useSelector(state => state.selectedPoolId);
    let pool: any = allPools[selectedPoolId];

    // TODO make the following checks and computations cleaner
    if (!allPools) {
        return (
            <Wrapper>
                <h2>We didn't find any pools associated with this address :( </h2>
            </Wrapper>
        );
    }

    if (!pool) {
        pool = getPoolsSummaryObject();
    }

    const {
        endBalanceUSD,
        netReturnUSD,
        feesUSD,
        txCostEth,
        impLossUSD,
        impLossRel,
        dexReturnUSD,
        start,
        end,
    } = pool;
    const startBalance = endBalanceUSD - netReturnUSD;

    const getDailyAverageFeeGains = (timeStampStart, timeStampEnd, totalFeesUSD) => {
        const differenceMilliseconds = timeStampEnd - timeStampStart;
        const differenceDays = differenceMilliseconds / (1000 * 3600 * 24);
        return totalFeesUSD / differenceDays;
    };

    let averageFeeGains;
    if (selectedPoolId === 'all') {
        averageFeeGains = pool.averageDailyFeesUSD;
        console.log('averageFeeGains', averageFeeGains);
    } else {
        averageFeeGains = getDailyAverageFeeGains(start, end, feesUSD);
    }

    const daysLefStaking = Math.abs(Math.ceil(dexReturnUSD / averageFeeGains));

    // getPoolsSummaryObject();
    return (
        <Wrapper>
            <SwitchWrapper>
                <ToggleLabel>Show ETH</ToggleLabel>
                <ToggleSwitch checked={false} onChange={() => setShowEth(!showEth)} isSmall />
            </SwitchWrapper>
            <HeaderWrapper>
                <CardRow
                    showThreeCols
                    firstColumn="Pool overview"
                    secondColumn="Initial"
                    thirdColumn="Current"
                    color="light"
                />
            </HeaderWrapper>
            <GrayBox padding={15}>
                <PoolValueGridWrapper>
                    <CardRow
                        showThreeCols
                        firstColumn="Your pool value"
                        secondColumn={<FiatAmount value={startBalance}></FiatAmount>}
                        thirdColumn={
                            <PoolValueWrapper>
                                <FiatAmount value={endBalanceUSD}></FiatAmount>
                                <PoolValueDifference>
                                    <FiatAmount
                                        value={netReturnUSD}
                                        usePlusSymbol
                                        colorized
                                    ></FiatAmount>
                                </PoolValueDifference>
                            </PoolValueWrapper>
                        }
                        color="dark"
                    />
                </PoolValueGridWrapper>
            </GrayBox>

            <HodlHeaderWrapper>
                <CardRow
                    firstColumn="Gains compared to HODL"
                    secondColumn="Current"
                    color="light"
                />
            </HodlHeaderWrapper>
            <GrayBox padding={15}>
                <GridWrapper>
                    <CardRow
                        firstColumn="Total fee gains"
                        secondColumn={<FiatAmount value={feesUSD} usePlusSymbol />}
                        color="dark"
                    />

                    <CardRow
                        firstColumn="Transactions cost"
                        secondColumn={
                            <FiatAmount
                                value={-getFiatFromCrypto('eth', 'usd', txCostEth)}
                                usePlusSymbol
                            />
                        }
                        color="dark"
                    />
                    <CardRow
                        firstColumn="Impermanent loss"
                        secondColumn={
                            <ImpLossValueWrapper>
                                {impLossRel && (
                                    <SubValue>{getFormattedPercentageValue(impLossRel)}</SubValue>
                                )}

                                <FiatAmount value={impLossUSD} usePlusSymbol />
                            </ImpLossValueWrapper>
                        }
                        color="dark"
                    />
                </GridWrapper>
                <TotalLossRowWrapper>
                    <CardRow
                        firstColumn="Total"
                        secondColumn={
                            <FiatAmount
                                value={dexReturnUSD}
                                usePlusSymbol
                                colorized
                                useBadgeStyle
                            ></FiatAmount>
                        }
                        color="dark"
                    />
                </TotalLossRowWrapper>
                {dexReturnUSD < 0 && (
                    <DaysLeftWrapper>
                        <DaysLeftGridWrapper>
                            <CardRow
                                firstColumn="Average fee gains"
                                secondColumn={
                                    <FiatAmount value={averageFeeGains} usePlusSymbol></FiatAmount>
                                }
                                color="dark"
                            />
                            <CardRow
                                firstColumn="Days left to compensate loss*"
                                secondColumn={daysLefStaking}
                                color="dark"
                            />
                        </DaysLeftGridWrapper>
                        <DaysLeftNote>
                            <b>*</b> According to your average trading fee gains
                        </DaysLeftNote>
                    </DaysLeftWrapper>
                )}
            </GrayBox>
        </Wrapper>
    );
};

export default CardOverview;
