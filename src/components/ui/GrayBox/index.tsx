import React from 'react';
import styled from 'styled-components';
import colors from '../../../config/colors';

const Wrapper = styled.div<{ padding: number }>`
    background-color: ${colors.BACKGROUND};
    width: 100%;
    padding: ${props => props.padding}px;
    color: ${colors.FONT_DARK};
    border-radius: 10px;
`;

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
    padding?: number;
}

const GrayBox = ({ children, padding = 20 }: Props) => (
    <Wrapper padding={padding}>{children}</Wrapper>
);

export default GrayBox;
