import styled, { css } from 'styled-components';
import { colors, variables } from '@config';
import { formatUtils } from '@utils';
import React, { PureComponent } from 'react';
import { exampleData, exampleData2, exampleDataA, exampleDataB, exampleData3 } from './data';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Label,
    ResponsiveContainer,
    Line,
    LineChart,
    ReferenceDot,
    ReferenceLine,
} from 'recharts';

import CustomTooltip from './CustomTooltip';

interface Props {
    height?: number;
    referenceX?: number;
    referenceY?: number;
    data?: Array<any>;
}
class Graph extends PureComponent<Props> {
    constructor(props) {
        super(props);
        this.state = { counter: 0 };
    }

    render() {
        return (
            <ResponsiveContainer width="100%" height={270}>
                <AreaChart
                    width={730}
                    height={260}
                    data={exampleData3}
                    margin={{
                        top: 20,
                        right: 20,
                        bottom: 20,
                        left: 60,
                    }}
                >
                    <CartesianGrid strokeDasharray="2 2" />
                    <XAxis
                        dataKey="timestamp"
                        tick={{
                            fontSize: variables.FONT_SIZE.SMALL,
                            transform: 'translate(0, 12)',
                        }}
                        tickFormatter={formatUtils.getFormattedDateFromTimestamp}
                        stroke={colors.FONT_MEDIUM}
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
                        domain={[0, 'dataMax + 4000']}
                        stroke={colors.FONT_MEDIUM}
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
                    <Area
                        isAnimationActive={false}
                        dataKey="poolValue"
                        stroke={colors.PASTEL_PURPLE_DARK}
                        fill={colors.PASTEL_PURPLE_LIGHT}
                    />
                    <Area
                        isAnimationActive={false}
                        dataKey="poolValue2"
                        stroke={colors.PASTEL_PURPLE_DARK}
                        fill={colors.PASTEL_PURPLE_LIGHT}
                    />
                    <Area
                        isAnimationActive={false}
                        dataKey="poolValue3"
                        stroke={colors.PASTEL_PURPLE_DARK}
                        fill={colors.PASTEL_PURPLE_LIGHT}
                    />
                    <Tooltip
                        cursor={{ stroke: '#2b2c4f', strokeWidth: 1 }}
                        content={<CustomTooltip feesUsd={123} yieldUsd={90} />}
                    />
                </AreaChart>
            </ResponsiveContainer>
        );
    }
}

export default Graph;
