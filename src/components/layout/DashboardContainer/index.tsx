import React from 'react';
import styled from 'styled-components';
import { LeftFillContainer, MainContainer, RightFillContainer } from '..';

const Wrapper = styled.div`
    display: flex;
    flex-direction: row;
    flex: 1 1 0%;
    overflow-y: auto;
    min-height: 100%;

    @media (max-width: 1200px) {
        flex-direction: column;
    }
`;

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
}

const DashboardContainer = ({ children }: Props) => (
    <Wrapper>
        {children}
        {/* <LeftFillContainer /> */}
        {/* <MainContainer>{children}</MainContainer> */}
        {/* <RightFillContainer /> */}
    </Wrapper>
);

export default DashboardContainer;
