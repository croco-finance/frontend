import { colors, variables } from '@config';
import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div<Props>`
    width: 58%;
    padding: 0;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    background-color: ${props => props.backgroundColor};

    @media (max-width: ${variables.SCREEN_SIZE.MD}) {
        width: 100%;
        padding: 10px 20px;
        min-height: 0vh;
        height: auto;
    }

    @media (max-width: ${variables.SCREEN_SIZE.SM}) {
        padding: 10px;
    }
`;

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
    backgroundColor?: string;
}

const RightContainer = ({ children, backgroundColor = colors.WHITE }: Props) => (
    <Wrapper backgroundColor={backgroundColor}>{children}</Wrapper>
);

export default RightContainer;
