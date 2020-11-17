import { FiatValue, GrayBox, InlineCircle } from '@components/ui';
import { colors, variables } from '@config';
import { mathUtils } from '@utils';
import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import CardRow from '../CardRow';

const GRID_GAP = 5;

const Wrapper = styled.div``;

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

const PoolsSummary = () => {
    const allPools = useSelector(state => state.allPools);
    const activePoolIds = useSelector(state => state.activePoolIds);

    if (!allPools) {
        return (
            <Wrapper>
                <h2>We didn't find any pools associated with this address :( </h2>
            </Wrapper>
        );
    }

    let activePoolsSummaryObject: any = mathUtils.getPoolsSummaryObject(allPools, activePoolIds);

    return (
        <Wrapper>
            <GrayBox>
                <GridWrapper>
                    <CardRow
                        firstColumn="Value locked in pools"
                        secondColumn={
                            <FiatValue value={activePoolsSummaryObject.endBalanceUsd}></FiatValue>
                        }
                        color="dark"
                    />
                </GridWrapper>
            </GrayBox>

            <HodlHeaderWrapper>
                <CardRow firstColumn="Rewards and expenses" secondColumn="" color="light" />
            </HodlHeaderWrapper>
            <GrayBox>
                <GridWrapper>
                    <CardRow
                        firstColumn="Fees earned"
                        secondColumn={
                            <FiatValue value={activePoolsSummaryObject.feesUsd} usePlusSymbol />
                        }
                        color="dark"
                    />
                    {activePoolsSummaryObject.yieldRewardUsd ? (
                        <CardRow
                            firstColumn="Yield farming gains"
                            secondColumn={
                                <FiatValue
                                    value={activePoolsSummaryObject.yieldRewardUsd}
                                    usePlusSymbol
                                />
                            }
                            color="dark"
                        />
                    ) : null}

                    <CardRow
                        firstColumn="Transactions expenses"
                        secondColumn={
                            <FiatValue value={-activePoolsSummaryObject.txCostUsd} usePlusSymbol />
                        }
                        color="dark"
                    />
                </GridWrapper>
                <TotalLossRowWrapper>
                    <CardRow
                        firstColumn="Total"
                        secondColumn={
                            <FiatValue
                                value={activePoolsSummaryObject.rewardFeesBalanceUSD}
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

export default PoolsSummary;
