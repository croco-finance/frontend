import React from 'react';
import styled from 'styled-components';
import { TooltipProps } from 'recharts';
import { colors, variables, types } from '@config';
import { FiatValue } from '@components/ui';
import TooltipRow from './TooltipRow';
import { formatUtils } from '@utils';

const CustomTooltipWrapper = styled.div`
    display: flex;
    flex-direction: column;
    color: white;
    /* background: #001826; */
    /* background-color: ${colors.FONT_DARK}; */
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    font-size: ${variables.FONT_SIZE.SMALL};
    /* border-radius: 4px; */
    box-shadow: 0 3px 14px 0 rgba(0, 0, 0, 0.15);
    font-variant-numeric: tabular-nums;
    line-height: 1.5;
    background-color: #0a131ddd;
    border-radius: 5px;
    padding: 14px;
`;

const GridWrapper = styled.div`
    flex-grow: 1;
    display: grid;
    gap: 4px;
    grid-template-columns: minmax(90px, auto) minmax(90px, auto);
    grid-auto-rows: auto;
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
        const { dataKey, name } = props.payload[0];
        const graphData: any = props.payload[0].payload;
        const { poolValue, hodlValue } = graphData;

        const poolValueDiff = poolValue - hodlValue;

        return (
            <CustomTooltipWrapper>
                <GridWrapper>
                    <TooltipRow
                        firstColumn="HODL value"
                        secondColumn={<FiatValue value={hodlValue ? hodlValue : 0} />}
                    />

                    <TooltipRow
                        firstColumn="Pool value"
                        secondColumn={<FiatValue value={poolValue ? poolValue : 0} />}
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
            </CustomTooltipWrapper>
        );
    }
    return null;
};

export default CustomTooltip;
