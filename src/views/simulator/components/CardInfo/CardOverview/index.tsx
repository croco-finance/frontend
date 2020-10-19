import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { FiatAmount, GrayBox, ToggleSwitch } from '../../../../../components/ui';
import { colors, variables } from '../../../../../config';
import { arrangeArray } from '../../../../../utils';
import {
    getDailyAverageFeeGains,
    getFiatFromCrypto,
    getFormattedPercentageValue,
    getBalancerImpLoss,
} from '../../../../../utils/math';
import CardRow from '../CardRow';

const GRID_GAP = 5;

const Wrapper = styled.div``;

const SwitchWrapper = styled.div`
    display: flex;
    width: 100%;
    justify-content: flex-end;
    align-items: center;
    padding: 0 10px;
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

    grid-template-columns: 190px minmax(100px, auto) minmax(100px, auto);
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
    grid-template-rows: repeat(1, 40px);
    padding: 0px 25px;
    margin-top: 20px;
    margin-bottom: -5px;
    font-size: ${variables.FONT_SIZE.SMALL};
`;

const TotalLossRowWrapper = styled(GridWrapper)`
    grid-template-rows: repeat(1, 50px);
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
    /* grid-auto-rows: 46px; */
    align-items: baseline;
    padding-top: 0;
    height: 39px;
`;
const PoolValueWrapper = styled.div``;
const PoolValueDifference = styled.div`
    font-size: ${variables.FONT_SIZE.SMALL};
`;

interface Props {
    userPoolValue?: {};
}

const CardOverview = ({}: Props) => {
    const arr = arrangeArray(-500, 500, 50);

    const [showEth, setShowEth] = useState(false);

    const allPools = useSelector(state => state.allPools);
    const selectedPoolId = useSelector(state => state.selectedPoolId);

    const pool = allPools[selectedPoolId];

    const {
        endBalanceUsd,
        netReturnUsd,
        feesUsd,
        txCostEth,
        impLossUsd,
        impLossRel,
        dexReturnUsd,
        start,
        end,
    } = pool;

    const averageFeeGains = getDailyAverageFeeGains(start, end, feesUsd);
    const daysLeftStaking = Math.abs(Math.ceil(dexReturnUsd / averageFeeGains));

    const newRateCoefficients = {
        usdt: 1.4,
        dai: 2,
        weth: 4.5,
        comp: 1.0,
        link: 0.5,
        yfi: 0.2,
        wbtc: 2.4,
    };

    const getNewSimulatedData = (tokens, currentBalances, newRateCoefficients) => {
        // 1. compute new price
        const newPrices = [];

        // 2. initial token balances = current token balances
        const initialBalances = currentBalances;

        // 3. token weights ... vysaju z pool.tokens
        const tokenWeights = [];

        // 4. compute newTokenBalances a imp loss
        const newTokenBalances = [];
        const newImpLossRel = 0;
        const newImpLossAbs = 0;

        // 5. new pool value

        // compute new
        const newValue = 0;
        const newDexReturn = 0;
        const newFeesUsd = 0;
        const newDepositCost = 0;
        const newAverageDailyFees = 0;
    };

    return (
        <Wrapper>
            <SwitchWrapper>
                <ToggleLabel>Show ETH</ToggleLabel>
                <ToggleSwitch checked={false} onChange={() => {}} isSmall />
            </SwitchWrapper>
            <HeaderWrapper>
                <CardRow
                    firstColumn="Pool overview"
                    secondColumn="Current"
                    thirdColumn="Simulated"
                    color="light"
                />
            </HeaderWrapper>
            <GrayBox padding={15}>
                <PoolValueGridWrapper>
                    <CardRow
                        firstColumn="Your pool value"
                        secondColumn={<FiatAmount value={endBalanceUsd}></FiatAmount>}
                        thirdColumn={
                            <PoolValueWrapper>
                                <FiatAmount value={20000}></FiatAmount>
                                <PoolValueDifference>
                                    <FiatAmount value={5000} usePlusSymbol colorized></FiatAmount>
                                </PoolValueDifference>
                            </PoolValueWrapper>
                        }
                        color="dark"
                    />
                </PoolValueGridWrapper>
            </GrayBox>

            <HeaderWrapper>
                <CardRow
                    firstColumn="Gains compared to HODL"
                    secondColumn="Current"
                    thirdColumn="Simulated"
                    color="light"
                />
            </HeaderWrapper>
            <GrayBox padding={15}>
                <GridWrapper>
                    <CardRow
                        firstColumn="Total fee gains"
                        secondColumn={<FiatAmount value={feesUsd} usePlusSymbol />}
                        thirdColumn={<FiatAmount value={20000} usePlusSymbol />}
                        color="dark"
                    />

                    <CardRow
                        firstColumn="Deposit tx. cost"
                        secondColumn={
                            <FiatAmount
                                value={getFiatFromCrypto('eth', 'usd', txCostEth)}
                                usePlusSymbol
                            />
                        }
                        thirdColumn={<FiatAmount value={-670} usePlusSymbol />}
                        color="dark"
                    />
                    <CardRow
                        firstColumn="Impermanent loss"
                        secondColumn={
                            <ImpLossValueWrapper>
                                <SubValue>
                                    {getFormattedPercentageValue(Math.abs(impLossRel))}
                                </SubValue>
                                <FiatAmount value={impLossUsd} usePlusSymbol />
                            </ImpLossValueWrapper>
                        }
                        thirdColumn={
                            <ImpLossValueWrapper>
                                <SubValue>9.67%</SubValue>
                                <FiatAmount value={-670} usePlusSymbol />
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
                                // colorized
                                // useBadgeStyle
                            ></FiatAmount>
                        }
                        thirdColumn={
                            <FiatAmount
                                value={670}
                                usePlusSymbol
                                colorized
                                // useBadgeStyle
                            ></FiatAmount>
                        }
                        color="dark"
                    />
                </TotalLossRowWrapper>
                <DaysLeftWrapper>
                    <DaysLeftGridWrapper>
                        <CardRow
                            firstColumn="Average daily fee gains*"
                            secondColumn={
                                <FiatAmount value={averageFeeGains} usePlusSymbol></FiatAmount>
                            }
                            thirdColumn={<FiatAmount value={67} usePlusSymbol></FiatAmount>}
                            color="dark"
                        />
                        <CardRow
                            firstColumn="Days left to compensate loss*"
                            secondColumn={dexReturnUsd < 0 ? daysLeftStaking : 0}
                            thirdColumn={0}
                            color="dark"
                        />
                    </DaysLeftGridWrapper>
                    <DaysLeftNote>
                        <b>*</b> According to your average trading fee gains
                    </DaysLeftNote>
                </DaysLeftWrapper>
            </GrayBox>
        </Wrapper>
    );
};

export default CardOverview;
