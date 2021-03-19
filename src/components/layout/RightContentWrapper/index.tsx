import { variables } from '@config';
import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    padding: 0px 10px 0 10px;
    width: 100%;
    max-width: 680px;
    align-items: center;
    flex-grow: 1;
    flex-shrink: 0.1;

    @media (max-width: ${variables.SCREEN_SIZE.MD}) {
        padding: 20px 10px;
    }

    @media (max-width: ${variables.SCREEN_SIZE.SM}) {
        padding: 0px;
    }
`;

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
}

const RightContentWrapper = ({ children }: Props) => <Wrapper>{children}</Wrapper>;

export default RightContentWrapper;
