import {
    FiatValue,
    GrayBox,
    VerticalCryptoAmounts,
    CollapsibleContainer,
    BoxRow,
    Icon,
} from '@components/ui';
import { colors, variables } from '@config';
import { formatUtils, mathUtils } from '@utils';
import React, { useState } from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
`;

const Top = styled.div`
    font-size: ${variables.FONT_SIZE.SMALL};
    color: ${colors.FONT_LIGHT};
`;

const Bottom = styled.div`
    font-size: ${variables.FONT_SIZE.NORMAL};
    color: ${colors.FONT_DARK};
`;

interface Props {
    top: React.ReactNode;
    bottom: React.ReactNode;
}

const DoubleValue = ({ top, bottom }: Props) => {
    return (
        <Wrapper>
            <Top>{top}</Top>
            <Bottom>{bottom}</Bottom>
        </Wrapper>
    );
};

export default DoubleValue;
