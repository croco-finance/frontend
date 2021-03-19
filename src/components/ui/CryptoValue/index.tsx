import React from 'react';
import styled, { css } from 'styled-components';

const Wrapper = styled.div<{ value: number; colorized: boolean; useBadgeStyle: boolean }>`
    ${props =>
        props.colorized &&
        props.value < 0 &&
        !props.useBadgeStyle &&
        css`
            color: ${props.theme.RED};
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
`;

const Nan = styled.div`
    color: ${props => props.theme.FONT_LIGHT};
`;

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    value: number;
    symbol?: string;
    colorized?: boolean; // change color is the amount is positive or negative
    usePlusSymbol?: boolean;
    useBadgeStyle?: boolean;
}

const CryptoValue = ({
    value,
    symbol = 'ETH',
    colorized = false,
    usePlusSymbol = false,
    useBadgeStyle = false,
}: Props) => {
    const formatter = new Intl.NumberFormat('en-US', {
        // minimumFractionDigits: 2,
        maximumSignificantDigits: 5,
    });

    // specify the sign
    let sign = '+ ';
    const originalValue = value;

    // if the value rounded to two (=displayed format) decimals is less than 0, change symbol
    const roundedValueTwoDec = Math.round((value + Number.EPSILON) * 100000) / 100000;
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
                    {usePlusSymbol && sign} {formatter.format(value)}
                    {` ${symbol.toUpperCase()}`}
                </>
            ) : (
                <Nan>-</Nan>
            )}
        </Wrapper>
    );
};

export default CryptoValue;
