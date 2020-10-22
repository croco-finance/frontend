import React from 'react';
import styled from 'styled-components';

import { SPIN } from '../../../config/animations';
import colors from '../../../config/colors';

const Wrapper = styled.div<Props>`
    position: relative;
    width: ${props => `${props.size}px`};
    height: ${props => `${props.size}px`};
    display: flex;
    justify-content: center;
    align-items: center;
`;

const StyledLoader = styled.div<{ size: number; strokeWidth: number; color: string }>`
    position: relative;
    text-indent: -9999em;
    border-top: ${props => `${props.strokeWidth}px solid ${props.color}`};
    border-right: ${props => `${props.strokeWidth}px solid ${props.color}`};
    border-bottom: ${props => `${props.strokeWidth}px solid ${props.color}`};
    border-left: ${props => `${props.strokeWidth}px solid transparent`};
    transform: translateZ(0);
    animation: ${SPIN} 1.1s infinite linear;
    &,
    &:after {
        border-radius: 50%;
        width: ${props => `${props.size}px`};
        height: ${props => `${props.size}px`};
    }
`;

interface Props {
    className?: string;
    size?: number;
    strokeWidth?: number;
    color?: string;
}

const Spinner = ({
    className,
    size = 100,
    strokeWidth = 2,
    color = colors.BLUE,
    ...rest
}: Props) => (
    <Wrapper className={className} size={size} {...rest}>
        <StyledLoader size={size} strokeWidth={strokeWidth} color={color} />
    </Wrapper>
);

export default Spinner;
