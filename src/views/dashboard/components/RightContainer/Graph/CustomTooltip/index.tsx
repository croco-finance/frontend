import React from 'react';
import styled from 'styled-components';
import { TooltipProps } from 'recharts';
import { colors, variables } from '@config';
import { FiatValue } from '@components/ui';
import TooltipRow from './TooltipRow.ts';
import { formatUtils } from '@utils';
import { GraphData } from '@types';

const CustomTooltipWrapper = styled.div`
    display: flex;
    flex-direction: column;
    color: white;
    /* background: #001826; */
    /* background-color: ${colors.FONT_DARK}; */
    font-weight: ${variables.FONT_WEIGHT.REGULAR};
    font-size: ${variables.FONT_SIZE.TINY};
    /* border-radius: 4px; */
    box-shadow: 0 3px 14px 0 rgba(0, 0, 0, 0.15);
    font-variant-numeric: tabular-nums;
    line-height: 1.5;
`;

const GridWrapper = styled.div`
    flex-grow: 1;
    display: grid;
    gap: 4px;
    grid-template-columns: minmax(64px, auto) minmax(75px, auto);
    grid-auto-rows: auto;
    font-size: ${variables.FONT_SIZE.TINY};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    align-items: center;
    overflow-x: auto; /* allow x-axis scrolling: useful on small screens when fiat amount is displayed */
    word-break: break-all;
    /* padding: 0px 10px; */
`;

const DateValuesWrapper = styled.div<{ roundedBorderAll?: boolean }>`
    /* background-color: #24364bcc; */
    background-color: #0a131dcc;
    padding: 8px 10px;
    border-radius: ${props => (props.roundedBorderAll ? '5px' : '0 0 5px 5px')};
`;

const DateHeader = styled.div`
    color: #b1bac5;
    margin-bottom: 5px;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    font-size: 10px;
`;

const IntervalValuesWrapper = styled.div<{ roundedBottom: boolean }>`
    background-color: #0a131ddd;
    padding: 8px 10px;
    border-radius: ${props => (props.roundedBottom ? '0 0 5px 5px' : '0px')};
`;

const IntervalsDateHeader = styled(DateHeader)`
    background-color: #0a131ddd;
    margin: 0;
    padding: 8px 10px 0px 10px;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
`;

const PoolValuesWrapper = styled.div`
    border-bottom: 1px solid #4b5c79;
    margin-bottom: 5px;
    padding-bottom: 5px;
`;

const RewardsExpensesWrapper = styled.div``;

interface Props extends TooltipProps {
    onShow?: (index: number) => void;
    feesUsd?: number;
    yieldUsd?: number;

    // inherited from TooltipProps
    payload?: any;
    active?: boolean;
    setHighlightedAreaId?: any;
}

const CustomTooltip = (props: Props) => {
    if (props.active && props.payload && props.payload[0]) {
        const { dataKey, name } = props.payload[0];
        const graphData: GraphData = props.payload[0].payload;
        const {
            lastTimestamp,
            timestampPrev,
            timestamp,
            poolValues,
            poolValuePrev,
            feesUsd,
            yieldUsd,
            txCostUsd,
            impLossUsd,
        } = graphData;

        props.setHighlightedAreaId(dataKey, timestamp);

        // get the correct pool value by index (I pass "name" property in Graph/index.ts file)
        const poolValue = poolValues[name];

        let poolValueDiff;

        if (poolValue !== undefined && poolValuePrev !== undefined) {
            poolValueDiff = poolValue - poolValuePrev;
        }

        const ifHoveredFirst = timestampPrev === null;
        const isHoveredLast = lastTimestamp === timestamp;

        return (
            <CustomTooltipWrapper>
                {timestampPrev && (
                    <>
                        <IntervalsDateHeader>
                            {formatUtils.getFormattedDateFromTimestamp(timestampPrev, 'MONTH_DAY')}
                            &nbsp;-&nbsp;
                            {formatUtils.getFormattedDateFromTimestamp(timestamp, 'MONTH_DAY')}
                        </IntervalsDateHeader>
                        <IntervalValuesWrapper roundedBottom={isHoveredLast && !txCostUsd}>
                            <PoolValuesWrapper>
                                <GridWrapper>
                                    <TooltipRow
                                        firstColumn="Value start"
                                        secondColumn={
                                            <FiatValue value={poolValuePrev ? poolValuePrev : 0} />
                                        }
                                    />

                                    <TooltipRow
                                        firstColumn="Value end"
                                        secondColumn={
                                            <FiatValue value={poolValue ? poolValue : 0} />
                                        }
                                    />

                                    {poolValueDiff ? (
                                        <TooltipRow
                                            firstColumn=""
                                            secondColumn={
                                                <FiatValue
                                                    value={poolValueDiff ? poolValueDiff : 0}
                                                    colorized
                                                    usePlusSymbol
                                                    useLightRed
                                                />
                                            }
                                        />
                                    ) : null}
                                </GridWrapper>
                            </PoolValuesWrapper>
                            <RewardsExpensesWrapper>
                                <GridWrapper>
                                    {feesUsd ? (
                                        <TooltipRow
                                            firstColumn="Fees"
                                            secondColumn={
                                                <FiatValue value={feesUsd} usePlusSymbol />
                                            }
                                        />
                                    ) : null}

                                    {yieldUsd ? (
                                        <TooltipRow
                                            firstColumn="Yield"
                                            secondColumn={
                                                <FiatValue value={yieldUsd} usePlusSymbol />
                                            }
                                        />
                                    ) : null}

                                    {/* <TooltipRow
                                        firstColumn="Imp. loss"
                                        secondColumn={
                                            <FiatValue value={-impLossUsd} usePlusSymbol />
                                        }
                                    /> */}
                                </GridWrapper>
                            </RewardsExpensesWrapper>
                        </IntervalValuesWrapper>
                    </>
                )}

                {txCostUsd ? (
                    <DateValuesWrapper roundedBorderAll={ifHoveredFirst}>
                        <DateHeader>
                            {formatUtils.getFormattedDateFromTimestamp(timestamp, 'MONTH_DAY')}
                        </DateHeader>
                        <GridWrapper>
                            {!timestampPrev ? (
                                <TooltipRow
                                    firstColumn="Value"
                                    secondColumn={<FiatValue value={poolValue ? poolValue : 0} />}
                                />
                            ) : null}

                            <TooltipRow
                                firstColumn="Tx. cost"
                                secondColumn={<FiatValue value={-txCostUsd} usePlusSymbol />}
                            />
                        </GridWrapper>
                    </DateValuesWrapper>
                ) : null}
            </CustomTooltipWrapper>
        );
    }

    props.setHighlightedAreaId(null);
    return null;
};

export default CustomTooltip;
