import React from 'react';
import styled, { css } from 'styled-components';
import { colors, variables } from '@config';
import { formatUtils, mathUtils } from '@utils';
import { SignedValue } from '@components/ui';

const rightAlignedStyles = css`
    text-align: right;
    justify-self: flex-end;
`;

const leftAlignedStyles = css`
    text-align: left;
    align-items: baseline;
`;

const Wrapper = styled.div<{ textAlign: 'left' | 'right' }>`
    display: flex;
    flex-direction: column;
    font-size: 12px;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    color: ${colors.FONT_LIGHT};
    letter-spacing: 0.3px;

    /* content alignment styles */
    ${props =>
        props.textAlign === 'left'
            ? leftAlignedStyles
            : rightAlignedStyles}/* justify-content: center; */
`;

const Row = styled.div`
    margin: 2px 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
`;

const Amount = styled.div``;

const Symbol = styled.div`
    max-width: 100px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-left: 5px;
`;

interface Props {
    tokenSymbols: Array<string>;
    tokenAmounts: Array<number>;
    textAlign?: 'left' | 'right';
    usePlusSymbol?: boolean;
}

const VerticalCryptoAmounts = ({
    tokenSymbols,
    tokenAmounts,
    textAlign = 'right',
    usePlusSymbol = false,
}: Props) => {
    let tokenSymbolsRendered = tokenSymbols;
    let tokenAmountsRendered = tokenAmounts;

    // if the user passed just one symbol/amount, convert that number to array so that I can loop through it
    // if (!Array.isArray(props.tokenSymbols)) {
    //     tokenSymbolsRendered = [props.tokenSymbols];
    // } else {
    //     tokenSymbolsRendered = props.tokenSymbols;
    // }

    // if (!Array.isArray(props.tokenAmounts)) {
    //     tokenAmountsRendered = [props.tokenAmounts];
    // } else {
    //     tokenAmountsRendered = props.tokenAmounts;
    // }

    const roundToDecimals = 4;
    return (
        <Wrapper textAlign={textAlign}>
            {tokenSymbolsRendered.map((symbol, i) => (
                <Row key={symbol}>
                    <Amount>
                        {mathUtils.roundToNDecimals(tokenAmounts[i], roundToDecimals) > 0 &&
                        usePlusSymbol
                            ? '+'
                            : null}
                        {formatUtils.getFormattedCryptoValue(tokenAmounts[i], roundToDecimals)}
                    </Amount>{' '}
                    <Symbol>{symbol}</Symbol>
                </Row>
            ))}
        </Wrapper>
    );
};

export default VerticalCryptoAmounts;
