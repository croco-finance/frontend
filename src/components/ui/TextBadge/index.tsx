import { colors, variables } from '@config';
import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
    color: ${colors.GREEN};
    background-color: #e9ffeb;
    font-size: ${variables.FONT_SIZE.TINY};
    padding: 3px 5px;
    border-radius: 3px;
    font-weight: ${variables.FONT_WEIGHT.DEMI_BOLD};
    position: absolute;
    right: 0px;
    top: -8px;
`;

interface Props {
    children?: React.ReactNode;
}

const TextBadge = ({ children }: Props) => {
    return <Wrapper>{children}</Wrapper>;
};
export default TextBadge;
