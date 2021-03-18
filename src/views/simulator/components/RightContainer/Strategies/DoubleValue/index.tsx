import { variables } from '@config';
import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
`;

const Top = styled.div`
    font-size: ${variables.FONT_SIZE.SMALL};
    color: ${props => props.theme.FONT_LIGHT};
`;

const Bottom = styled.div`
    font-size: ${variables.FONT_SIZE.NORMAL};
    color: ${props => props.theme.FONT_DARK};
`;

interface Props {
    top: React.ReactNode;
    bottom: React.ReactNode;
}

const DoubleValue = ({ top, bottom }: Props) => (
    <Wrapper>
        <Top>{top}</Top>
        <Bottom>{bottom}</Bottom>
    </Wrapper>
);

export default DoubleValue;
