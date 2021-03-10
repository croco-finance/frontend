import React from 'react';
import styled from 'styled-components';
import { variables } from '@config';
import { NavigationPanel } from '@components/layout';

const Wrapper = styled.div`
    display: flex;
    flex-direction: row;
    height: 100vh;
    // flex: 1 1 0%;
    // overflow-y: auto;
    // min-height: 100vh;

    @media (max-width: ${variables.SCREEN_SIZE.LG}) {
        flex-direction: column;
    }
`;

const ContentWrapper = styled.div`
    background: linear-gradient(#1c1f20 0%, #151718 413px);
    width: 100%;
    height: 100%;
    overflow-y: auto;
`;

const Content = styled.div`
    width: 100%;
    margin: 0 auto;
`;

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
}

const AppLayout = ({ children }: Props) => (
    <Wrapper>
        <NavigationPanel />
        <ContentWrapper>
            <Content>{children}</Content>
        </ContentWrapper>
    </Wrapper>
);

export default AppLayout;
