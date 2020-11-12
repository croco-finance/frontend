import styled, { css } from 'styled-components';
import { colors, variables } from '@config';
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
    Line,
    LineChart,
    ReferenceDot,
} from 'recharts';

interface Props {
    height?: number;
    referenceX?: number;
    referenceY?: number;
    data?: Array<any>;
}
class ILGraph extends PureComponent<Props> {
    constructor(props) {
        super(props);
        this.state = { counter: 0 };
    }

    render() {
        return (
            <ResponsiveContainer
                width="100%"
                height={this.props.height ? this.props.height : '300'}
            >
                <LineChart
                    // <AreaChart
                    // type={'linearClosed'}
                    data={this.props.data}
                    margin={{
                        top: 10,
                        right: 0,
                        left: 0,
                        bottom: 30,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="priceChangeRel" stroke={colors.FONT_MEDIUM}>
                        <Label
                            value="ETH/DAI price change [%]"
                            position="bottom"
                            offset={15}
                            style={{
                                textAnchor: 'middle',
                                fontSize: variables.FONT_SIZE.NORMAL,
                                fill: colors.FONT_MEDIUM,
                            }}
                        />
                    </XAxis>
                    <YAxis
                        stroke={colors.FONT_MEDIUM}
                        label={{
                            value: 'Impermanent loss [%]',
                            angle: -90,
                            offset: 40,
                            position: 'center',
                            dx: -20,
                            style: {
                                textAnchor: 'middle',
                                fontSize: variables.FONT_SIZE.NORMAL,
                                fill: colors.FONT_MEDIUM,
                            },
                        }}
                    ></YAxis>
                    {/* https://github.com/recharts/recharts/issues/1231 */}
                    <Tooltip />

                    {/* <Area
                        type="monotone"
                        dataKey="loss"
                        stroke={colors.PASTEL_PURPLE_DARK}
                        fill={colors.PASTEL_PURPLE_MEDIUM}
                        // dot={<CustomizedDot current={3908} />}
                    /> */}
                    {/* <Area
                        type="monotone"
                        dataKey="ilRel"
                        stroke={colors.PASTEL_GREEN_DARK}
                        fill={colors.PASTEL_GREEN_MEDIUM}
                    /> */}
                    <Line
                        type="monotone"
                        dataKey="loss"
                        stroke={colors.PASTEL_PURPLE_DARK}
                        fill={colors.PASTEL_PURPLE_MEDIUM}
                    />
                    <ReferenceDot
                        x={this.props.referenceX}
                        y={this.props.referenceY}
                        r={8}
                        isFront={true}
                        ifOverflow="extendDomain"
                        fill={colors.PASTEL_BLUE_DARK}
                        stroke={colors.BLUE}
                    />
                    {/* </AreaChart> */}
                </LineChart>
            </ResponsiveContainer>
        );
    }
}

export default ILGraph;
