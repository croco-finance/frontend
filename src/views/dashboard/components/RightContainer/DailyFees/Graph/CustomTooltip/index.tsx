import React from 'react';
import styled from 'styled-components';
import { TooltipProps } from 'recharts';
import { colors, variables, types } from '@config';
import { FiatValue } from '@components/ui';
import TooltipRow from './TooltipRow.ts';
import { formatUtils } from '@utils';

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

const DateHeader = styled.div`
    background-color: #0a131ddd;
    margin: 0;
    padding: 8px 10px 0px 10px;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
`;

const ValueWrapper = styled.div`
    background-color: #0a131ddd;
    padding: 8px 10px;
    border-radius: 0 0 5px 5px;
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

interface Props extends TooltipProps {
    // inherited from TooltipProps
    payload?: any;
    active?: boolean;
}

const CustomTooltip = (props: Props) => {
    if (props.active && props.payload) {
        const graphData: any = props.payload[0].payload;
        const { feesUsd, timestamp } = graphData;

        const dayString = formatUtils.getFormattedDateFromTimestamp(timestamp, 'MONTH_DAY');

        return (
            <CustomTooltipWrapper>
                <DateHeader>{dayString}</DateHeader>
                <ValueWrapper>
                    <GridWrapper>
                        <TooltipRow
                            firstColumn="Fees earned"
                            secondColumn={<FiatValue value={feesUsd ? feesUsd : 0} />}
                        />
                    </GridWrapper>
                </ValueWrapper>
            </CustomTooltipWrapper>
        );
    }
    return null;
};

export default CustomTooltip;
