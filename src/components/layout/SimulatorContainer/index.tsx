import React from 'react';
import styled from 'styled-components';
import { LeftFillContainer, RightFillContainer, MainContainer } from '..';
import { variables } from '@config';

const Wrapper = styled.div`
    display: flex;
    flex-direction: row;
    flex: 1 1 0%;
    overflow-y: auto;
    min-height: 100%;

    @media (max-width: ${variables.SCREEN_SIZE.MD}) {
        flex-direction: column;
    }
`;

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
}

const SimulatorContainer = ({ children }: Props) => (
    <Wrapper>
        {children}

        {/* <LeftFillContainer /> */}
        {/* <MainContainer>{children}</MainContainer> */}
        {/* <RightFillContainer /> */}
    </Wrapper>
);

export default SimulatorContainer;
