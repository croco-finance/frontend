import React from 'react';
import styled, { css } from 'styled-components';
import colors from '../../../config/colors';

const Wrapper = styled.div<{
    value: number;
    colorized: boolean;
    useBadgeStyle: boolean;
    useLightRed: boolean;
    color?: string;
}>`
    ${props =>
        props.colorized &&
        props.value < 0 &&
        !props.useBadgeStyle &&
        css`
            color: ${props.useLightRed ? colors.RED_LIGHT : props.theme.RED};
        `}

    ${props =>
        props.colorized &&
        props.value > 0 &&
        !props.useBadgeStyle &&
        css`
            color: ${props.theme.GREEN};
        `}

    ${props =>
        props.colorized &&
        props.value < 0 &&
        props.useBadgeStyle &&
        css`
            background-color: ${props.theme.RED};
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
            background-color: ${props.theme.GREEN};
            color: white;
            padding: 5px;
            margin: -5px;

            border-radius: 5px;
        `}

        ${props =>
        !props.colorized &&
        props.useBadgeStyle &&
        props.value &&
        css`
            background-color: ${props.theme.FIAT_BADGE_BG_NEUTRAl};
            color: white;
            padding: 5px;
            margin: -5px;
            border-radius: 5px;
        `}

        ${props =>
        props.color &&
        css`
            color: ${props.color};
        `}
`;

const Nan = styled.div`
    color: ${props => props.theme.FONT_LIGHT};
`;

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    value: number | typeof NaN;
    currency?: string;
    colorized?: boolean; // change color is the amount is positive or negative
    minimumFractionDigits?: number;
    usePlusSymbol?: boolean;
    useBadgeStyle?: boolean;
    useLightRed?: boolean;
    customColor?: string;
}

const FiatValue = ({
    value,
    currency = 'Usd',
    colorized = false,
    usePlusSymbol = false,
    minimumFractionDigits = 2,
    useBadgeStyle = false,
    useLightRed = false,
    customColor,
    className,
}: Props) => {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits,
    });

    // save the original value
    const originalValue = value;

    // specify the sign
    let sign = '+ ';

    // if passed value is not a number
    if (Number.isNaN(originalValue)) {
        return (
            <Wrapper
                value={0}
                colorized={colorized}
                useBadgeStyle={useBadgeStyle}
                useLightRed={false}
                className={className}
                color={customColor}
            >
                <Nan>-</Nan>
            </Wrapper>
        );
    }

    // if passed value is equal to 0
    if (originalValue === 0) {
        return (
            <Wrapper
                value={originalValue}
                colorized={colorized}
                useBadgeStyle={useBadgeStyle}
                useLightRed={false}
                className={className}
                color={customColor}
            >
                {formatter.format(0)}
            </Wrapper>
        );
    }

    // if the value rounded to two (=displayed format) decimals is less than 0, change symbol
    const roundedValueTwoDec = Math.round((value + Number.EPSILON) * 100) / 100;
    if (usePlusSymbol && roundedValueTwoDec < 0) {
        value = Math.abs(value);
        sign = '- ';
    } else if (roundedValueTwoDec === 0) {
        sign = '';
    }

    return (
        <Wrapper
            value={originalValue}
            colorized={colorized}
            useBadgeStyle={useBadgeStyle}
            useLightRed={useLightRed}
            className={className}
            color={customColor}
        >
            {roundedValueTwoDec ? (
                <>
                    {usePlusSymbol && sign} {formatter.format(value)}{' '}
                </>
            ) : (
                <Nan>0</Nan>
            )}
        </Wrapper>
    );
};

export default FiatValue;
