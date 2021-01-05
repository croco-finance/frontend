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
} from 'recharts';

interface Props {
    height: number;
    data?: any;
    theme: AppThemeColors;
}

class FeesGraph extends PureComponent<Props, {}> {
    constructor(props) {
        super(props);
        this.state = { highlightedAreaId: null };
    }

    render() {
        const { data, theme, height } = this.props;
        const pooledTokensCount = data[0].feesTokenAmounts.length; // if UNI-WETH pool, returns 2

        return (
            <ResponsiveContainer width="100%" height={height}>
                <AreaChart
                    width={800}
                    height={320}
                    data={data}
                    margin={{
                        top: 20,
                        right: 20,
                        bottom: 10,
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
                        tick={{
                            fontSize: variables.FONT_SIZE.SMALL,
                            transform: 'translate(0, 12)',
                        }}
                        tickFormatter={value =>
                            formatUtils.getFormattedDateFromTimestamp(value, 'MONTH_DAY', true)
                        }
                        stroke={colors.FONT_MEDIUM}
                    ></XAxis>

                    <YAxis
                        tick={{ fontSize: variables.FONT_SIZE.SMALL }}
                        stroke={colors.FONT_MEDIUM}
                        tickFormatter={formatUtils.getFormattedUsdValue}
                    ></YAxis>
                    <Tooltip
                        cursor={{ stroke: '#4366b1ff', strokeWidth: 1 }}
                        content={<CustomTooltip />}
                    />
                </AreaChart>
            </ResponsiveContainer>
        );
    }
}

export default FeesGraph;
