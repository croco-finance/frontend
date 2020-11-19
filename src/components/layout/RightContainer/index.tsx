import { colors, variables } from '@config';
import React from 'react';
import styled from 'styled-components';
import RightContentWrapper from '../RightContentWrapper';

const Wrapper = styled.div<Props>`
    width: 60%;
    padding: 0;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    background-color: ${props => props.backgroundColor};

    @media (max-width: ${variables.SCREEN_SIZE.LG}) {
        width: 100%;
        padding: 10px 20px;
        min-height: 0vh;
        height: auto;
    }

    @media (max-width: ${variables.SCREEN_SIZE.SM}) {
        padding: 10px;
    }
`;

const RightLayout = styled.div`
    display: flex;
`;

const LeftFillContainer = styled.div`
    width: 100px;
    flex-shrink: 1;
`;

const RightFillContainer = styled.div`
    width: 100px;
    flex-shrink: 1;
`;

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
    backgroundColor?: string;
}

const RightContainer = ({ children, backgroundColor = colors.WHITE }: Props) => (
    <Wrapper backgroundColor={backgroundColor}>
        <RightLayout>
            <LeftFillContainer />
            <RightContentWrapper> {children}</RightContentWrapper>
            <RightFillContainer />
        </RightLayout>
    </Wrapper>
);

export default RightContainer;
