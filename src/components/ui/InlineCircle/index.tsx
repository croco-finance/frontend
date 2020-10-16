import React from 'react';
import styled from 'styled-components';
import { colors } from '../../../config';

const Circle = styled.div<Props>`
    display: inline-flex;
    margin-left: ${props => props.marginLeft}px;
    margin-right: ${props => props.marginRight}px;
    color: ${props => props.color};
    font-size: ${props => props.size}px;
`;

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    size?: number;
    color?: string;
    marginLeft?: number;
    marginRight?: number;
}

const InlineCircle = ({
    size = 16,
    color = colors.FONT_LIGHT,
    marginLeft = 0,
    marginRight = 0,
}: Props) => (
    <Circle size={size} color={color} marginLeft={marginLeft} marginRight={marginRight}>
        &bull;
    </Circle>
);

export default InlineCircle;
