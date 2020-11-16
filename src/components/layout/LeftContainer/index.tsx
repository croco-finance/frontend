import React from 'react';
import styled from 'styled-components';
import { colors } from '@config';

const Wrapper = styled.div<Props>`
    width: 42%;
    padding: 0;
    height: 100vh;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    background-color: ${props => props.backgroundColor};

    @media (max-width: 1200px) {
        width: 100%;
    }
`;

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
    backgroundColor?: string;
}

const LeftContainer = ({ children, backgroundColor = colors.BACKGROUND_DARK }: Props) => (
    <Wrapper backgroundColor={backgroundColor}>{children}</Wrapper>
);

export default LeftContainer;
