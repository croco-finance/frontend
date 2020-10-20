import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { FiatAmount, GrayBox, ToggleSwitch } from '../../../../../components/ui';
import { colors, variables } from '../../../../../config';
import { getDailyAverageFeeGains, getPoolsSummaryObject } from '../../../../../utils/math';
import CardRow from '../CardRow';

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

const CardOverview = () => {
    const [showEth, setShowEth] = useState(false);

    const allPools = useSelector(state => state.allPools);
    const selectedPoolId = useSelector(state => state.selectedPoolId);
    let pool: any = allPools[selectedPoolId];

    // TODO make the following checks and computations cleaner
    if (!allPools || !pool) {
        return (
            <Wrapper>
                <h2>We didn't find any pools associated with this address :( </h2>
            </Wrapper>
        );
    }

    const {
        endBalanceUsd,
        netReturnUsd,
        feesUsd,
        txCostEth,
        txCostUsd,
        impLossUsd,
        impLossRel,
        dexReturnUsd,
        yieldRewardUsd,
        start,
        end,
    } = pool;
    const startBalance = endBalanceUsd - netReturnUsd;

    const averageFeeGains = getDailyAverageFeeGains(start, end, feesUsd);
    const daysLeftStaking = Math.abs(Math.ceil(dexReturnUsd / averageFeeGains));

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
                        firstColumn="Your pool share value"
                        secondColumn={<FiatAmount value={startBalance}></FiatAmount>}
                        thirdColumn={
                            <PoolValueWrapper>
                                <FiatAmount value={endBalanceUsd}></FiatAmount>
                                <PoolValueDifference>
                                    <FiatAmount
                                        value={netReturnUsd}
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
                        secondColumn={<FiatAmount value={feesUsd} usePlusSymbol />}
                        color="dark"
                    />
                    {yieldRewardUsd ? (
                        <CardRow
                            firstColumn="Yield farming gains"
                            secondColumn={<FiatAmount value={yieldRewardUsd} usePlusSymbol />}
                            color="dark"
                        />
                    ) : null}

                    <CardRow
                        firstColumn="Transactions cost"
                        secondColumn={<FiatAmount value={-txCostUsd} usePlusSymbol />}
                        color="dark"
                    />

                    <CardRow
                        firstColumn="Impermanent loss"
                        secondColumn={
                            <ImpLossValueWrapper>
                                {/* {impLossRel && (
                                    <SubValue>
                                        {getFormattedPercentageValue(Math.abs(impLossRel))}
                                    </SubValue>
                                )} */}

                                <FiatAmount value={-impLossUsd} usePlusSymbol />
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
                                value={dexReturnUsd}
                                usePlusSymbol
                                colorized
                                useBadgeStyle
                            ></FiatAmount>
                        }
                        color="dark"
                    />
                </TotalLossRowWrapper>
                <DaysLeftWrapper>
                    <DaysLeftGridWrapper>
                        <CardRow
                            firstColumn="Average daily fee gains"
                            secondColumn={
                                <FiatAmount value={averageFeeGains} usePlusSymbol></FiatAmount>
                            }
                            color="dark"
                        />
                        {dexReturnUsd <= 0 && dexReturnUsd && (
                            <CardRow
                                firstColumn="Days left to compensate loss*"
                                secondColumn={daysLeftStaking}
                                color="dark"
                            />
                        )}
                    </DaysLeftGridWrapper>
                    {dexReturnUsd <= 0 && dexReturnUsd && (
                        <DaysLeftNote>
                            <b>*</b> According to your average trading fee gains
                        </DaysLeftNote>
                    )}
                </DaysLeftWrapper>
            </GrayBox>
        </Wrapper>
    );
};

export default CardOverview;
