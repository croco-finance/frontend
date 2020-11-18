import styled, { css } from 'styled-components';
import { colors, variables } from '@config';
import { formatUtils } from '@utils';
import React, { PureComponent } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Label,
    ResponsiveContainer,
    ReferenceDot,
    ReferenceLine,
    Legend,
} from 'recharts';

import CustomTooltip from './CustomTooltip';

const getYAxisMaxValue = value => {
    return Math.round(value / 1000) * 1000 + 1000;
};

const LegendItem = styled.span`
    font-size: ${variables.FONT_SIZE.NORMAL};
`;

interface Props {
    height?: number;
    referenceX?: number;
    referenceY?: number;
    data?: any;
    maxPossibleValue: number;
}

interface State {
    highlightedAreaId: string | null;
}

class Graph extends PureComponent<Props, State> {
    constructor(props) {
        super(props);
    }

    renderColorfulLegendText(value, entry) {
        const legendText = value === 'poolValue' ? 'Pool value' : 'HODL value';

        return <LegendItem style={{ color: colors.FONT_LIGHT }}>{legendText}</LegendItem>;
    }

    valueToUsd(value) {
        return `$${value}`;
    }

    render() {
        const { data, maxPossibleValue } = this.props;

        return (
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                    width={800}
                    height={290}
                    data={data}
                    margin={{
                        top: 10,
                        right: 40,
                        bottom: 10,
                        left: 30,
                    }}
                >
                    <CartesianGrid strokeDasharray="2 2" />

                    <Tooltip
                        cursor={{ stroke: '#4366b1ff', strokeWidth: 1 }}
                        content={<CustomTooltip />}
                    />
                    <Legend
                        iconType="plainline"
                        wrapperStyle={{
                            paddingLeft: '50px',
                            paddingTop: '10px',
                        }}
                        formatter={this.renderColorfulLegendText}
                    />

                    <Area
                        key={'poolValue'}
                        isAnimationActive={false}
                        dataKey={'poolValue'}
                        strokeWidth={1}
                        fillOpacity={0.65}
                        fill={colors.GRAPH_1_DARK}
                        stroke={colors.GRAPH_1_DARK}
                    />
                    <Area
                        key={'hodlValue'}
                        isAnimationActive={false}
                        dataKey={'hodlValue'}
                        strokeWidth={2}
                        fillOpacity={0}
                        fill={colors.BLUE}
                        stroke={'#a600ffff'}
                        // stroke={colors.BLUE}
                        strokeDasharray="4 3"
                    />

                    <XAxis
                        dataKey="name"
                        tick={{
                            fontSize: variables.FONT_SIZE.NORMAL,
                            transform: 'translate(0, 12)',
                        }}
                        stroke={colors.FONT_MEDIUM}
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
                        stroke={colors.FONT_LIGHT}
                        tickFormatter={this.valueToUsd}
                    ></YAxis>
                </AreaChart>
            </ResponsiveContainer>
        );
    }
}

export default Graph;
