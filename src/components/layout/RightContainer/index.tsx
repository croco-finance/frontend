import { styles, variables } from '@config';
import React from 'react';
import styled from 'styled-components';
import RightContentWrapper from '../RightContentWrapper';

const Wrapper = styled.div`
    width: 57%;
    padding-top: 10px;
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
    justify-content: center;
`;
interface Props extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
    backgroundColor?: string;
}

const RightContainer = ({ children }: Props) => (
    <Wrapper>
        <RightLayout>
            <RightContentWrapper>{children}</RightContentWrapper>
        </RightLayout>
    </Wrapper>
);

export default RightContainer;
