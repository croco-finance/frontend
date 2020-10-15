import React from 'react';
import styled from 'styled-components';
import { LeftFillContainer, RightFillContainer, MainContainer } from '..';

const Wrapper = styled.div`
    display: flex;
    flex-direction: row;
    flex: 1 1 0%;
    overflow-y: auto;
    min-height: 100%;
`;

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
}

const SimulatorContainer = ({ children }: Props) => (
    <Wrapper>
        <LeftFillContainer />
        <MainContainer>{children}</MainContainer>
        <RightFillContainer />
    </Wrapper>
);

export default SimulatorContainer;
