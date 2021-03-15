import { styles, variables } from '@config';
import { formatUtils, mathUtils } from '@utils';
import React from 'react';
import styled, { css } from 'styled-components';

const rightAlignedStyles = css`
    text-align: right;
    justify-self: flex-end;
`;

const leftAlignedStyles = css`
    text-align: left;
    align-items: baseline;
`;

const Wrapper = styled.div<{ textAlign: 'left' | 'right'; maxHeight: number }>`
    display: flex;
    flex-direction: column;
    font-size: 12px;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    color: ${props => props.theme.FONT_LIGHT};
    letter-spacing: 0.3px;
    overflow-y: auto;
    max-height: ${props => props.maxHeight}px;
    ${styles.tinyScrollBarStyles};

    /* content alignment styles */
    ${props =>
        props.textAlign === 'left'
            ? leftAlignedStyles
            : rightAlignedStyles} /* justify-content: center; */

    @media (max-width: ${variables.SCREEN_SIZE.MD}) {
        font-size: 10px;
    }
`;

const Row = styled.div`
    margin: 2px 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
`;

const Amount = styled.div``;

const Symbol = styled.div<{ maxWidth: number }>`
    max-width: ${props => props.maxWidth}px;
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
    maxWidth?: number;
    maxHeight?: number;
}

const VerticalCryptoAmounts = ({
    tokenSymbols,
    tokenAmounts,
    textAlign = 'right',
    usePlusSymbol = false,
    maxWidth = 100,
    maxHeight = 160,
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
        <Wrapper textAlign={textAlign} maxHeight={maxHeight}>
            {tokenSymbolsRendered.map((symbol, i) => (
                <Row key={symbol}>
                    <Amount>
                        {mathUtils.roundToNDecimals(tokenAmounts[i], roundToDecimals) > 0 &&
                        usePlusSymbol
                            ? '+'
                            : null}
                        {formatUtils.getFormattedCryptoValue(tokenAmounts[i], roundToDecimals)}
                    </Amount>{' '}
                    <Symbol maxWidth={maxWidth}>{symbol}</Symbol>
                </Row>
            ))}
        </Wrapper>
    );
};

export default VerticalCryptoAmounts;
