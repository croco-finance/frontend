import styled, { css } from 'styled-components';
import { colors, variables } from '@config';
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
            <ResponsiveContainer width="100%" height={240}>
                <AreaChart
                    width={730}
                    height={250}
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
                        stroke={colors.FONT_MEDIUM}
                        tick={{ fontSize: variables.FONT_SIZE.SMALL }}
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
                    <Tooltip
                        cursor={{ stroke: '#2b2c4f', strokeWidth: 1 }}
                        content={<CustomTooltip feesUsd={123} yieldUsd={90} />}
                    />
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
                    <ReferenceLine x="1" isFront stroke={colors.STROKE_GREY} />
                    <ReferenceLine x="2" isFront stroke={colors.STROKE_GREY} />
                    <Tooltip />
                </AreaChart>
            </ResponsiveContainer>
        );
    }
}

export default Graph;
