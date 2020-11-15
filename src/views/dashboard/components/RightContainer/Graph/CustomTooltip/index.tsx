import React from 'react';
import styled from 'styled-components';
import { TooltipProps } from 'recharts';
import { colors, variables } from '../../../../../../config';
import { FiatValue } from '../../../../../../components/ui';
import TooltipRow from './TooltipRow.ts';

const GridWrapper = styled.div`
    flex-grow: 1;
    display: grid;
    gap: 4px;
    grid-template-columns: minmax(60px, auto) minmax(75px, auto);
    grid-auto-rows: auto;
    font-size: ${variables.FONT_SIZE.TINY};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    align-items: center;
    overflow-x: auto; /* allow x-axis scrolling: useful on small screens when fiat amount is displayed */
    word-break: break-all;
    /* padding: 0px 10px; */
`;

const DateHeader = styled.div`
    color: #b1bac5;
    margin-bottom: 5px;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    font-size: 10px;
`;
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

const DateValuesWrapper = styled.div`
    background-color: #24364bbb;
    padding: 8px 10px;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
`;

const IntervalValuesWrapper = styled.div`
    background-color: #0a131dbb;
    padding: 8px 10px;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
`;

interface Props extends TooltipProps {
    onShow?: (index: number) => void;
    feesUsd?: number;
    yieldUsd?: number;

    // inherited from TooltipProps
    payload?: any;
    active?: boolean;
}

const CustomTooltip = (props: Props) => {
    if (props.active && props.payload) {
        // console.log('payload', props.payload);
        const {
            poolValue,
            poolValue2,
            poolValue3,
            feesUsd,
            yieldUsd,
            txCostUsd,
        } = props.payload[0].payload;

        const totalPoolBalance = feesUsd + yieldUsd - txCostUsd;

        return (
            <CustomTooltipWrapper>
                <DateValuesWrapper>
                    <DateHeader>Nov 5</DateHeader>
                    <GridWrapper>
                        <TooltipRow
                            firstColumn="Pool value"
                            secondColumn={<FiatValue value={poolValue} />}
                        />
                        <TooltipRow
                            firstColumn="Tx. cost"
                            secondColumn={<FiatValue value={-txCostUsd} usePlusSymbol />}
                        />
                    </GridWrapper>
                </DateValuesWrapper>

                <IntervalValuesWrapper>
                    <DateHeader>20 Aug - Nov 5</DateHeader>
                    <GridWrapper>
                        <TooltipRow
                            firstColumn="Fees"
                            secondColumn={<FiatValue value={feesUsd} usePlusSymbol />}
                        />
                        <TooltipRow
                            firstColumn="Yield"
                            secondColumn={<FiatValue value={yieldUsd} usePlusSymbol />}
                        />
                        <TooltipRow
                            firstColumn="Imp. loss"
                            secondColumn={<FiatValue value={-yieldUsd} usePlusSymbol />}
                        />
                    </GridWrapper>
                </IntervalValuesWrapper>
            </CustomTooltipWrapper>
        );
    }

    return null;
};

export default CustomTooltip;
