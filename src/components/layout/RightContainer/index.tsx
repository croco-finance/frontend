import { colors, variables } from '@config';
import React from 'react';
import styled from 'styled-components';
import RightContentWrapper from '../RightContentWrapper';
import { styles } from '@config';

const Wrapper = styled.div`
    width: 60%;
    padding: 0;
    max-height: 100vh;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    background-color: ${props => props.theme.BG_WHITE};
    ${styles.scrollBarStyles};

    @media (max-width: ${variables.SCREEN_SIZE.LG}) {
        width: 100%;
        padding: 10px 20px;
        min-height: 0vh;
        height: auto;
    }

    @media (max-width: ${variables.SCREEN_SIZE.SM}) {
        padding: 10px;
        padding-bottom: 50px;
        max-height: 100%;
    }
`;

const RightLayout = styled.div`
    display: flex;
`;

const LeftFillContainer = styled.div`
    width: 120px;
    flex-shrink: 10;
`;

const RightFillContainer = styled.div`
    width: 120px;
    flex-shrink: 10;
`;

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
    backgroundColor?: string;
}

const RightContainer = ({ children }: Props) => (
    <Wrapper>
        <RightLayout>
            <LeftFillContainer />
            <RightContentWrapper> {children}</RightContentWrapper>
            <RightFillContainer />
        </RightLayout>
    </Wrapper>
);

export default RightContainer;
