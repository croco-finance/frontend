import { variables } from '@config';
import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
    display: flex;
    flex-direction: row;
    flex: 1 1 0%;
    overflow-y: auto;
    min-height: 100vh;

    @media (max-width: ${variables.SCREEN_SIZE.LG}) {
        flex-direction: column;
    }
`;

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
}

const SimulatorContainer = ({ children }: Props) => <Wrapper>{children}</Wrapper>;

export default SimulatorContainer;
