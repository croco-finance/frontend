import React from 'react';
import styled, { css } from 'styled-components';
import { variables } from '../../../config';
import colors from '../../../config/colors';

const Wrapper = styled.div<{ value: number; colorized: boolean; useBadgeStyle: boolean }>`
    ${props =>
        props.colorized &&
        props.value < 0 &&
        !props.useBadgeStyle &&
        css`
            color: ${colors.RED};
        `}

    ${props =>
        props.colorized &&
        props.value > 0 &&
        !props.useBadgeStyle &&
        css`
            color: ${colors.GREEN};
        `}

    ${props =>
        props.colorized &&
        props.value < 0 &&
        props.useBadgeStyle &&
        css`
            background-color: ${colors.RED};
            color: white;
            padding: 5px;
            border-radius: 5px;
            margin: -5px;
        `}
    
        ${props =>
        props.colorized &&
        props.value > 0 &&
        props.useBadgeStyle &&
        css`
            background-color: ${colors.GREEN};
            color: white;
            padding: 5px;
            margin: -5px;

            border-radius: 5px;
        `}
`;

const Nan = styled.div`
    color: ${colors.FONT_LIGHT};
`;

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    value: number;
    currency?: string;
    colorized?: boolean; // change color is the amount is positive or negative
    minimumFractionDigits?: number;
    usePlusSymbol?: boolean;
    useBadgeStyle?: boolean;
}

const FiatValue = ({
    value,
    currency = 'Usd',
    colorized = false,
    usePlusSymbol = false,
    minimumFractionDigits = 2,
    useBadgeStyle = false,
}: Props) => {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: minimumFractionDigits,
    });

    // specify the sign
    let sign = '+ ';
    const originalValue = value;

    // if the value rounded to two (=displayed format) decimals is less than 0, change symbol
    const roundedValueTwoDec = Math.round((value + Number.EPSILON) * 100) / 100;
    if (usePlusSymbol && roundedValueTwoDec < 0) {
        value = Math.abs(value);
        sign = '- ';
    } else if (roundedValueTwoDec === 0) {
        sign = '';
    }

    return (
        <Wrapper value={originalValue} colorized={colorized} useBadgeStyle={useBadgeStyle}>
            {roundedValueTwoDec ? (
                <>
                    {usePlusSymbol && sign} {formatter.format(value)}{' '}
                </>
            ) : (
                <Nan>-</Nan>
            )}
        </Wrapper>
    );
};

export default FiatValue;
