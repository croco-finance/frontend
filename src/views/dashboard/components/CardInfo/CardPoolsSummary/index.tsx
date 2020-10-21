import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { FiatValue, GrayBox, ToggleSwitch } from '../../../../../components/ui';
import { colors, variables } from '../../../../../config';
import { math } from '../../../../../utils';
import CardRow from '../CardRow';

const GRID_GAP = 5;

const Wrapper = styled.div``;

const Headline = styled.div`
    padding: 0 6px;
    /* font-weight: ${variables.FONT_WEIGHT.MEDIUM}; */
    font-size: ${variables.FONT_SIZE.NORMAL};
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
    color: ${colors.FONT_DARK};
`;

const Header = styled.div`
    display: flex;
    width: 100%;
    align-items: center;
    padding: 0 10px 10px 10px;
    align-items: center;
    /* margin-bottom: 14px; */
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
`;

const HodlHeaderWrapper = styled(HeaderWrapper)`
    grid-template-columns: 190px minmax(100px, auto);
`;

const TotalLossRowWrapper = styled(GridWrapper)`
    /* grid-template-rows: repeat(1, 50px); */
    border-top: 1px solid ${colors.STROKE_GREY};
    margin-top: 6px;
    padding-top: 6px;
`;

const CardPoolsSummary = () => {
    const [showEth, setShowEth] = useState(false);

    const allPools = useSelector(state => state.allPools);

    if (!allPools) {
        return (
            <Wrapper>
                <h2>We didn't find any pools associated with this address :( </h2>
            </Wrapper>
        );
    }

    let poolsSummaryObject: any = math.getPoolsSummaryObject(allPools);
    console.log('poolsSummaryObject', poolsSummaryObject);

    return (
        <Wrapper>
            <Header>
                <Headline>
                    <HeadlineText>Summary of all your liquidity pool positions</HeadlineText>
                </Headline>
                {/* <ToggleWrapper>
                    <ToggleLabel>Show ETH</ToggleLabel>
                    <ToggleSwitch checked={false} onChange={() => setShowEth(!showEth)} isSmall />
                </ToggleWrapper> */}
            </Header>

            <GrayBox padding={15}>
                <GridWrapper>
                    <CardRow
                        firstColumn="Value locked in pools"
                        secondColumn={
                            <FiatValue value={poolsSummaryObject.endBalanceUsd}></FiatValue>
                        }
                        color="dark"
                    />
                </GridWrapper>
            </GrayBox>

            <HodlHeaderWrapper>
                <CardRow firstColumn="Rewards and expenses" secondColumn="" color="light" />
            </HodlHeaderWrapper>
            <GrayBox padding={15}>
                <GridWrapper>
                    <CardRow
                        firstColumn="Fees earned"
                        secondColumn={
                            <FiatValue value={poolsSummaryObject.feesUsd} usePlusSymbol />
                        }
                        color="dark"
                    />
                    {poolsSummaryObject.yieldRewardUsd ? (
                        <CardRow
                            firstColumn="Yield farming gains"
                            secondColumn={
                                <FiatValue
                                    value={poolsSummaryObject.yieldRewardUsd}
                                    usePlusSymbol
                                />
                            }
                            color="dark"
                        />
                    ) : null}

                    <CardRow
                        firstColumn="Transactions expenses"
                        secondColumn={
                            <FiatValue value={-poolsSummaryObject.txCostUsd} usePlusSymbol />
                        }
                        color="dark"
                    />
                </GridWrapper>
                <TotalLossRowWrapper>
                    <CardRow
                        firstColumn="Total"
                        secondColumn={
                            <FiatValue
                                value={poolsSummaryObject.rewardFeesBalanceUSD}
                                usePlusSymbol
                                colorized
                                useBadgeStyle
                            ></FiatValue>
                        }
                        color="dark"
                    />
                </TotalLossRowWrapper>
            </GrayBox>
        </Wrapper>
    );
};

export default CardPoolsSummary;
