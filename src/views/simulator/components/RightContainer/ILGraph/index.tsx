import { colors, variables } from '@config';
import { AppThemeColors } from '@types';
import React, { PureComponent } from 'react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import styled from 'styled-components';
import CustomTooltip from './CustomTooltip';

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'Usd',
    minimumFractionDigits: 2,
});

const getYAxisMaxValue = value => Math.round(value / 1000) * 1000 + 1000;

const LegendItem = styled.span`
    font-size: ${variables.FONT_SIZE.NORMAL};
`;

interface Props {
    height?: number;
    referenceX?: number;
    referenceY?: number;
    data?: any;
    maxPossibleValue: number;
    theme: AppThemeColors;
}

interface State {
    highlightedAreaId: string | null;
}

class Graph extends PureComponent<Props, State> {
    valueToUsd(value) {
        return formatter.format(value);
    }
    renderColorfulLegendText(value, _entry) {
        const legendText = value === 'poolValue' ? 'Pool value' : 'HODL value';

        return <LegendItem style={{ color: colors.FONT_MEDIUM }}>{legendText}</LegendItem>;
    }

    render() {
        const { data, maxPossibleValue, theme } = this.props;

        return (
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                    width={800}
                    height={290}
                    data={data}
                    margin={{
                        top: 10,
                        right: 55,
                        bottom: 10,
                        left: 55,
                    }}
                >
                    <CartesianGrid strokeDasharray="2 2" stroke={theme.STROKE_GREY} />

                    <Tooltip
                        cursor={{ stroke: '#4366b1ff', strokeWidth: 1 }}
                        content={<CustomTooltip />}
                    />
                    <Legend
                        iconType="plainline"
                        iconSize={18}
                        wrapperStyle={{
                            paddingLeft: '50px',
                            paddingTop: '10px',
                        }}
                        formatter={this.renderColorfulLegendText}
                    />

                    <Area
                        key="poolValue"
                        isAnimationActive={false}
                        dataKey="poolValue"
                        strokeWidth={1}
                        fillOpacity={0.65}
                        fill={theme.GRAPH_1_DARK}
                        stroke={theme.GRAPH_1_DARK}
                    />
                    <Area
                        key="hodlValue"
                        isAnimationActive={false}
                        dataKey="hodlValue"
                        strokeWidth={2.5}
                        fillOpacity={0}
                        fill={theme.BLUE}
                        stroke="#a600ffff"
                        // stroke={colors.BLUE}
                        strokeDasharray="6 3"
                    />

                    <XAxis
                        dataKey="name"
                        tick={{
                            fontSize: variables.FONT_SIZE.NORMAL,
                            transform: 'translate(0, 12)',
                        }}
                        stroke={theme.FONT_MEDIUM}
                        // padding={{ left: 2 }}
                    >
                        {/* <Label
                            value="Date"
                            position="bottom"
                            offset={15}
                            style={{
                                textAnchor: 'middle',
                                fontSize: variables.FONT_SIZE.NORMAL,
                                fill: colors.FONT_MEDIUM,
                            }}
                        /> */}
                    </XAxis>
                    <YAxis
                        tick={{
                            fontSize: variables.FONT_SIZE.SMALL,
                            transform: 'translate(-8, 0)',
                        }}
                        domain={[0, getYAxisMaxValue(maxPossibleValue)]}
                        stroke={theme.FONT_MEDIUM}
                        tickFormatter={this.valueToUsd}
                    />
                </AreaChart>
            </ResponsiveContainer>
        );
    }
}

export default Graph;
