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

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'Usd',
    minimumFractionDigits: 2,
});

interface Props {
    height?: number;
    data?: any;
    theme: AppThemeColors;
}

class FeesGraph extends PureComponent<Props, {}> {
    constructor(props) {
        super(props);
        this.state = { highlightedAreaId: null };
    }

    valueToUsd(value) {
        return formatter.format(value);
    }

    render() {
        const { data, theme } = this.props;
        const pooledTokensCount = data[0].feesTokenAmounts.length; // if UNI-WETH pool, returns 2

        console.log('data', data);
        console.log('pooledTokensCount', pooledTokensCount);

        let maxValue = 0;

        // let lines: React.ReactNode[] = [];
        // for (let i = 0; i < pooledTokensCount.length; i++) {
        //     const dataKeyName = `feesTokenAmounts[${i}]`;
        //     lines.push(<Line type="monotone" key={dataKeyName} dataKey={dataKeyName} />);
        // }

        // let lines = <Line type="monotone" key={dataKeyName} dataKey={dataKeyName} />

        return (
            <ResponsiveContainer width="100%" height={350}>
                <AreaChart
                    width={800}
                    height={320}
                    data={data}
                    margin={{
                        top: 20,
                        right: 20,
                        bottom: 10,
                        left: 20,
                    }}
                >
                    <CartesianGrid strokeDasharray="2 2" />

                    <Area
                        type="monotone"
                        dataKey="feesUsd"
                        fill={theme.GRAPH_1_LIGHT}
                        stroke={theme.GRAPH_1_DARK}
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
                        tickFormatter={this.valueToUsd}
                        // label={{
                        //     value: 'Fees',
                        //     angle: -90,
                        //     offset: 460,
                        //     position: 'center',
                        //     dx: -90,
                        //     style: {
                        //         textAnchor: 'middle',
                        //         fontSize: variables.FONT_SIZE.SMALL,
                        //         fill: colors.FONT_MEDIUM,
                        //     },
                        // }}
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
