import React from 'react';
import styled, { css } from 'styled-components';
import { colors, variables } from '@config';
import { formatUtils } from '@utils';

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    font-size: 12px;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    color: ${colors.FONT_LIGHT};
    letter-spacing: 0.3px;
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
}

const VerticalCryptoAmounts = (props: Props) => {
    let tokenSymbolsRendered = props.tokenSymbols;
    let tokenAmountsRendered = props.tokenAmounts;

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

    return (
        <Wrapper>
            {tokenSymbolsRendered.map((symbol, i) => (
                <Row>
                    <Amount>{formatUtils.getFormattedCryptoValue(props.tokenAmounts[i])}</Amount>{' '}
                    <Symbol>{symbol}</Symbol>
                </Row>
            ))}
        </Wrapper>
    );
};

export default VerticalCryptoAmounts;
