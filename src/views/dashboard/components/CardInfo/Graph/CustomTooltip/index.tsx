import React from 'react';
import styled from 'styled-components';
import { TooltipProps } from 'recharts';
import { colors, variables } from '../../../../../../config';
import { FiatValue } from '../../../../../../components/ui';

const CustomTooltipWrapper = styled.div`
    display: flex;
    flex-direction: column;
    color: white;
    background: #001826;
    font-weight: ${variables.FONT_WEIGHT.REGULAR};
    font-size: ${variables.FONT_SIZE.SMALL};
    padding: 8px 6px;
    border-radius: 4px;
    box-shadow: 0 3px 14px 0 rgba(0, 0, 0, 0.15);
    font-variant-numeric: tabular-nums;
    line-height: 1.5;
    opacity: 0.8;
`;

const Col = styled.div`
    display: flex;
    flex-direction: column;
`;

const Row = styled.div<{ noBottomMargin?: boolean }>`
    display: flex;
    white-space: nowrap;
    align-items: center;
    justify-content: space-between;
    padding: 0px 8px;
    margin-bottom: ${props => (props.noBottomMargin ? '0px' : '4px')};
    margin: 0;
`;

const Title = styled.span`
    font-weight: 500;
    margin-right: 20px;
`;
const Value = styled.span`
    font-weight: ${variables.FONT_WEIGHT.REGULAR};
    display: flex;
`;

const ColsWrapper = styled.div`
    display: flex;
`;

const Sign = styled.span<{ color: string }>`
    color: ${props => props.color};
    width: 1ch;
    margin-right: 4px;
    font-weight: ${variables.FONT_WEIGHT.DEMI_BOLD};
`;

const TotalValueRow = styled(Row)`
    border-top: 1px solid white;
    margin-top: 5px;
    padding-top: 5px;
`;

const TotalTitleRow = styled(Row)`
    /* border-top: 1px solid white; */
    margin-top: 5px;
    padding-top: 5px;
`;

interface Props extends TooltipProps {
    onShow?: (index: number) => void;
    feesUsd?: number;
    yieldUsd?: number;

    // inherited from TooltipProps
    payload?: any;
    active?: boolean;
}

const CustomTooltip = (props: Props) => {
    if (props.active && props.payload) {
        // console.log('payload', props.payload);
        const {
            poolValue,
            poolValue2,
            poolValue3,
            feesUsd,
            yieldUsd,
            txCostUsd,
        } = props.payload[0].payload;

        const totalPoolBalance = feesUsd + yieldUsd - txCostUsd;

        return (
            <CustomTooltipWrapper>
                <ColsWrapper>
                    <Col>
                        <Row>
                            <Title>Value</Title>
                        </Row>
                        {feesUsd && (
                            <Row>
                                <Title>Fees</Title>
                            </Row>
                        )}
                        {yieldUsd && (
                            <Row>
                                <Title>Yield</Title>
                            </Row>
                        )}

                        {txCostUsd && (
                            <Row noBottomMargin>
                                <Title>Tx. cost</Title>
                            </Row>
                        )}
                        <TotalTitleRow noBottomMargin>
                            <Title>Total</Title>
                        </TotalTitleRow>
                    </Col>
                    <Col>
                        <Row>
                            <Value>
                                <FiatValue value={poolValue} />
                            </Value>
                        </Row>
                        {feesUsd && (
                            <Row>
                                <Value>
                                    <Sign color={colors.GREEN}>+</Sign>
                                    <FiatValue value={feesUsd} />
                                </Value>
                            </Row>
                        )}

                        {yieldUsd && (
                            <Row>
                                <Value>
                                    <Sign color={colors.GREEN}>+</Sign>
                                    <FiatValue value={yieldUsd} />
                                </Value>
                            </Row>
                        )}

                        {txCostUsd && (
                            <Row noBottomMargin>
                                <Value>
                                    <Sign color={colors.RED}>-</Sign>
                                    <FiatValue value={txCostUsd} />
                                </Value>
                            </Row>
                        )}
                        <Row noBottomMargin>
                            <TotalValueRow>
                                <FiatValue value={totalPoolBalance} colorized usePlusSymbol />
                            </TotalValueRow>
                        </Row>
                    </Col>
                </ColsWrapper>
            </CustomTooltipWrapper>
        );
    }

    return null;
};

export default CustomTooltip;
