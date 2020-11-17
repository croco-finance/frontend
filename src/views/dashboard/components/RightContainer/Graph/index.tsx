import styled, { css } from 'styled-components';
import { colors, variables } from '@config';
import { formatUtils } from '@utils';
import React, { PureComponent } from 'react';
import { exampleGraphData } from './data';
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
} from 'recharts';

import CustomTooltip from './CustomTooltip';

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

    setHighlightedAreaId = (dataKey: string, timestampMillis: number) => {
        // do not highlight any Area if this is the first deposit transaction to pool
        if (timestampMillis === this.props.data[0].timestampMillis) {
            this.setState({ highlightedAreaId: null });
        } else {
            this.setState({ highlightedAreaId: dataKey });
        }
    };

    render() {
        const { highlightedAreaId } = this.state;
        const { data } = this.props;

        let maxValue = 0;

        if (data) {
            maxValue = getYAxisMaxValue(data);
        }

        return (
            <ResponsiveContainer width="100%" height={270}>
                <AreaChart
                    width={800}
                    height={260}
                    data={data}
                    margin={{
                        top: 10,
                        right: 48,
                        bottom: 10,
                        left: 48,
                    }}
                >
                    <CartesianGrid strokeDasharray="2 2" />
                    <Label value="Pool history" offset={0} position="top" />
                    <Tooltip
                        cursor={{ stroke: '#4366b1ff', strokeWidth: 1 }}
                        content={<CustomTooltip setHighlightedAreaId={this.setHighlightedAreaId} />}
                    />
                    {data.map((data, i) => {
                        const dataKeyName = `poolValues[${i}]`;
                        return (
                            <Area
                                key={dataKeyName}
                                isAnimationActive={false}
                                dataKey={dataKeyName}
                                name={`${i}`}
                                fill={highlightedAreaId === dataKeyName ? '#7697deff' : '#dbe7ffff'}
                                stroke={
                                    highlightedAreaId === dataKeyName ? '#7697deff' : '#bccbeaff'
                                }
                                strokeWidth={1.5}
                                fillOpacity={0.7}
                                activeDot={highlightedAreaId === dataKeyName ? { r: 5 } : { r: 0 }}
                            />
                        );
                    })}

                    <XAxis
                        dataKey="timestampMillis"
                        tick={{
                            fontSize: variables.FONT_SIZE.SMALL,
                            transform: 'translate(0, 12)',
                        }}
                        tickFormatter={value =>
                            formatUtils.getFormattedDateFromTimestamp(value, 'MONTH_DAY_YEAR', true)
                        }
                        stroke={colors.FONT_LIGHT}
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
                        stroke={colors.FONT_LIGHT}
                        label={{
                            value: 'Pool value [$]',
                            angle: -90,
                            offset: 460,
                            position: 'center',
                            dx: -60,
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
