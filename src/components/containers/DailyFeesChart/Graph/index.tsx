import styled, { css } from 'styled-components';
import { colors, variables } from '@config';
import { formatUtils } from '@utils';
import React, { PureComponent } from 'react';
import { AppThemeColors } from '@types';
import CustomTooltip from './CustomTooltip';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Label,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts';

const TickText = styled.text`
    font-size: 12px;
    fill: ${props => props.theme.FONT_MEDIUM};
`;
class CustomizedAxisTick extends PureComponent<any, any> {
    render() {
        const { x, y, stroke, payload } = this.props;
        return (
            <g transform={`translate(${x},${y})`}>
                <TickText x={0} y={0} dy={16} textAnchor="end" transform="rotate(-40)">
                    {formatUtils.getFormattedDateFromTimestamp(payload.value, 'MONTH_DAY')}
                </TickText>
            </g>
        );
    }
}
interface Props {
    height: number;
    data?: any;
    theme: AppThemeColors;
    averageFees?: number;
}

class FeesGraph extends PureComponent<Props, {}> {
    constructor(props) {
        super(props);
        this.state = { highlightedAreaId: null };
    }

    render() {
        const { data, theme, height, averageFees } = this.props;

        return (
            <ResponsiveContainer width="100%" height={height}>
                <AreaChart
                    width={800}
                    height={320}
                    data={data}
                    margin={{
                        top: 20,
                        right: 20,
                        bottom: 20,
                        left: 25,
                    }}
                >
                    <CartesianGrid strokeDasharray="2 2" stroke={theme.STROKE_GREY} />

                    <Area
                        type="monotone"
                        dataKey="feesUsd"
                        fill={theme.GRAPH_1_LIGHT}
                        stroke={theme.GRAPH_1_STROKE_LIGHT}
                    />

                    <XAxis
                        dataKey="timestamp"
                        tick={<CustomizedAxisTick />}
                        tickFormatter={value =>
                            formatUtils.getFormattedDateFromTimestamp(value, 'MONTH_DAY', true)
                        }
                        stroke={colors.FONT_MEDIUM}
                        interval={0}
                    ></XAxis>

                    <YAxis
                        tick={{ fontSize: variables.FONT_SIZE.SMALL }}
                        stroke={colors.FONT_MEDIUM}
                        tickFormatter={formatUtils.getFormattedUsdValue}
                        domain={[0, 'auto']}
                    ></YAxis>

                    <Tooltip
                        cursor={{ stroke: '#4366b1ff', strokeWidth: 1 }}
                        content={<CustomTooltip />}
                    />
                    {averageFees && (
                        <ReferenceLine
                            y={averageFees}
                            label={{
                                position: 'top',
                                value: 'Average',
                                fill: theme.PURPLE,
                                fontSize: 14,
                            }}
                            stroke={theme.PURPLE}
                            strokeDasharray="3 3"
                            isFront={true}
                        />
                    )}
                </AreaChart>
            </ResponsiveContainer>
        );
    }
}

export default FeesGraph;
