import { colors } from '@config';
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

    @media (max-width: 1100px) {
        width: 100%;
        padding: 20px;
    }

    @media (max-width: 520px) {
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
