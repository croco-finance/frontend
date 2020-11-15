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
`;

interface Props {
    tokenSymbols: Array<string>;
    tokenAmounts: Array<number>;
}

const VerticalCryptoAmounts = (props: Props) => {
    return (
        <Wrapper>
            {props.tokenSymbols.map((symbol, i) => (
                <Row>
                    {formatUtils.getFormattedCryptoValue(props.tokenAmounts[i])} {symbol}
                </Row>
            ))}
        </Wrapper>
    );
};

export default VerticalCryptoAmounts;
