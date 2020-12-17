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
} from 'recharts';

import { GraphData } from '@types';
import CustomTooltip from './CustomTooltip';

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'Usd',
    minimumFractionDigits: 2,
});

const getYAxisMaxValue = data => {
    let maxValue = 0;
    data.forEach(item => {
        item.poolValues.forEach(value => {
            if (value > maxValue) maxValue = value;
        });
    });

    // Increase the max value by 5% and round value to thousands
    maxValue = maxValue + 0.05 * maxValue;
    maxValue = Math.round(maxValue / 1000) * 1000;

    return maxValue;
};

const getFormattedXAxisLabel = (value: string) => {
    const values = value.split('_');
    const timestamp = values[0];
    const label = values[1];

    return label;
};

const TickText = styled.text<{ isPurple: boolean }>`
    font-size: 12px;
    fill: ${props => (props.isPurple ? '#c752f1' : colors.FONT_MEDIUM)};
`;
class CustomizedAxisTick extends PureComponent<any, any> {
    render() {
        const { x, y, stroke, payload } = this.props;
        // console.log('payload.value'
        return (
            <g transform={`translate(${x},${10})`}>
                <TickText
                    x={0}
                    y={0}
                    dy={16}
                    textAnchor="end"
                    transform="rotate(-40)"
                    isPurple={payload.value.includes('Yield')}
                >
                    {getFormattedXAxisLabel(payload.value)}
                </TickText>
            </g>
        );
    }
}

const isYieldArea = (data: GraphData) => {
    const actionLabel = getFormattedXAxisLabel(data.label);
    if (actionLabel === 'Yield start') return true;
    return false;
};

const getBarColor = (data: GraphData, highlightedAreaId, dataKeyName) => {
    // is hovered
    if (highlightedAreaId === dataKeyName) {
        if (isYieldArea(data)) {
            return '#c752f1';
        } else {
            return colors.GRAPH_1_DARK;
        }
    } else {
        // not highlighted
        if (isYieldArea(data)) {
            return '#e9bcf9';
        } else {
            return colors.GRAPH_1_LIGHT;
        }
    }
};

const getBarStrokeColor = (data: GraphData, highlightedAreaId, dataKeyName) => {
    // is hovered
    if (highlightedAreaId === dataKeyName) {
        if (isYieldArea(data)) {
            return '#af3ada';
        } else {
            return colors.GRAPH_1_DARK;
        }
    } else {
        // not highlighted
        if (isYieldArea(data)) {
            return '#dca7f0';
        } else {
            return colors.GRAPH_1_STROKE_LIGHT;
        }
    }
};

interface Props {
    height?: number;
    referenceX?: number;
    referenceY?: number;
    data?: any;
}

interface State {
    highlightedAreaId: string | null;
}

class Graph extends PureComponent<Props, State> {
    constructor(props) {
        super(props);
        this.state = { highlightedAreaId: null };
    }

    setHighlightedAreaId = (dataKey: string, timestamp: number) => {
        // do not highlight any Area if this is the first deposit transaction to pool
        if (timestamp === this.props.data[0].timestamp) {
            this.setState({ highlightedAreaId: null });
        } else {
            this.setState({ highlightedAreaId: dataKey });
        }
    };

    valueToUsd(value) {
        return formatter.format(value);
    }

    render() {
        const { highlightedAreaId } = this.state;
        const { data } = this.props;

        let maxValue = 0;

        if (data) {
            maxValue = getYAxisMaxValue(data);
        }

        return (
            <ResponsiveContainer width="100%" height={350}>
                <AreaChart
                    width={800}
                    height={320}
                    data={data}
                    margin={{
                        top: 40,
                        right: 10,
                        bottom: 10,
                        left: 70,
                    }}
                >
                    <CartesianGrid strokeDasharray="2 2" />
                    <Tooltip
                        cursor={{ stroke: '#4366b1ff', strokeWidth: 1 }}
                        content={<CustomTooltip setHighlightedAreaId={this.setHighlightedAreaId} />}
                    />
                    {data.map((_data, i) => {
                        const dataKeyName = `poolValues[${i}]`;
                        console.log('_data', _data);
                        console.log('dataKeyName', dataKeyName);
                        return (
                            <Area
                                key={dataKeyName}
                                isAnimationActive={false}
                                dataKey={dataKeyName}
                                name={`${i}`}
                                fill={getBarColor(_data, highlightedAreaId, dataKeyName)}
                                stroke={getBarStrokeColor(_data, highlightedAreaId, dataKeyName)}
                                strokeWidth={1.5}
                                fillOpacity={0.8}
                                activeDot={highlightedAreaId === dataKeyName ? { r: 5 } : { r: 0 }}
                            />
                        );
                    })}

                    <XAxis
                        xAxisId={0}
                        dataKey="label"
                        tick={
                            data.length > 20 ? (
                                {
                                    display: 'none',
                                }
                            ) : (
                                <CustomizedAxisTick />
                            )
                        }
                        tickFormatter={value => getFormattedXAxisLabel(value)}
                        orientation={'top'}
                        interval={data.length > 20 ? 2 : 0}
                        stroke={colors.STROKE_GREY}
                    ></XAxis>

                    <XAxis
                        xAxisId={1}
                        dataKey="timestamp"
                        tick={{
                            fontSize: variables.FONT_SIZE.SMALL,
                            transform: 'translate(0, 12)',
                        }}
                        tickFormatter={value =>
                            formatUtils.getFormattedDateFromTimestamp(value, 'MONTH_DAY_YEAR', true)
                        }
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
                        tick={{ fontSize: variables.FONT_SIZE.SMALL }}
                        domain={[0, maxValue]}
                        stroke={colors.FONT_MEDIUM}
                        tickFormatter={this.valueToUsd}
                        label={{
                            value: 'Pool value',
                            angle: -90,
                            offset: 460,
                            position: 'center',
                            dx: -90,
                            style: {
                                textAnchor: 'middle',
                                fontSize: variables.FONT_SIZE.SMALL,
                                fill: colors.FONT_MEDIUM,
                            },
                        }}
                    ></YAxis>
                </AreaChart>
            </ResponsiveContainer>
        );
    }
}

export default Graph;
