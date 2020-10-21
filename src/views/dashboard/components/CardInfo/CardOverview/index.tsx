import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { FiatValue, GrayBox, ToggleSwitch, MultipleTokenLogo } from '../../../../../components/ui';
import { colors, variables } from '../../../../../config';
import { getDailyAverageFeeGains } from '../../../../../utils/math';
import { getTokenSymbolArr } from '../../../../../utils';
import CardRow from '../CardRow';

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
`;

const HeaderWrapper = styled(GridWrapper)`
    grid-template-columns: 190px minmax(100px, auto) minmax(100px, auto);
    grid-template-rows: repeat(1, 40px);
    padding: 0px 25px;
    margin-top: 20px;
    margin-bottom: -5px;
    font-size: ${variables.FONT_SIZE.SMALL};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    color: ${colors.FONT_LIGHT};
`;

const HodlHeaderWrapper = styled(HeaderWrapper)`
    grid-template-columns: 190px minmax(100px, auto);
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
        tokens,
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

    const tokenSymbols = getTokenSymbolArr(tokens);

    return (
        <Wrapper>
            <Header>
                <Headline>
                    <MultipleTokenLogo size={18} tokens={tokenSymbols} />
                    <HeadlineText>Liquidity pool</HeadlineText>
                </Headline>
                <ToggleWrapper>
                    <ToggleLabel>Show ETH</ToggleLabel>
                    <ToggleSwitch checked={false} onChange={() => setShowEth(!showEth)} isSmall />
                </ToggleWrapper>
            </Header>

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
                        secondColumn={<FiatValue value={startBalance}></FiatValue>}
                        thirdColumn={
                            <PoolValueWrapper>
                                <FiatValue value={endBalanceUsd}></FiatValue>
                                <PoolValueDifference>
                                    <FiatValue
                                        value={netReturnUsd}
                                        usePlusSymbol
                                        colorized
                                    ></FiatValue>
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
                        secondColumn={<FiatValue value={feesUsd} usePlusSymbol />}
                        color="dark"
                    />
                    {yieldRewardUsd ? (
                        <CardRow
                            firstColumn="Yield farming gains"
                            secondColumn={<FiatValue value={yieldRewardUsd} usePlusSymbol />}
                            color="dark"
                        />
                    ) : null}

                    <CardRow
                        firstColumn="Transactions cost"
                        secondColumn={<FiatValue value={-txCostUsd} usePlusSymbol />}
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
                                value={dexReturnUsd}
                                usePlusSymbol
                                colorized
                                useBadgeStyle
                            ></FiatValue>
                        }
                        color="dark"
                    />
                </TotalLossRowWrapper>
                <DaysLeftWrapper>
                    <DaysLeftGridWrapper>
                        <CardRow
                            firstColumn="Average daily fee gains"
                            secondColumn={
                                <FiatValue value={averageFeeGains} usePlusSymbol></FiatValue>
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
