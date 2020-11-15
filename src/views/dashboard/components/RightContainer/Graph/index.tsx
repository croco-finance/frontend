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
        console.log('highlightedAreaId', highlightedAreaId);

        return (
            <ResponsiveContainer width="100%" height={270}>
                <AreaChart
                    width={730}
                    height={260}
                    data={this.props.data}
                    margin={{
                        top: 20,
                        right: 20,
                        bottom: 20,
                        left: 60,
                    }}
                >
                    <CartesianGrid strokeDasharray="2 2" />

                    <Tooltip
                        cursor={{ stroke: '#4366b1ff', strokeWidth: 1 }}
                        content={<CustomTooltip setHighlightedAreaId={this.setHighlightedAreaId} />}
                    />

                    {this.props.data.map((data, i) => {
                        const dataKeyName = `poolValues[${i}]`;
                        return (
                            <Area
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
                        tickFormatter={formatUtils.getFormattedDateFromTimestamp}
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
                        domain={[0, 'dataMax + 4000']}
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
