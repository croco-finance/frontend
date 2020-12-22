import React from 'react';
import styled from 'styled-components';
import { colors, variables } from '@config';

const Wrapper = styled.div<Props>`
    width: 40%;
    padding: 0;
    max-height: 100vh;
    height: 100vh;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    background-color: ${props => props.theme.BACKGROUND};

    @media (max-width: ${variables.SCREEN_SIZE.LG}) {
        width: 100%;
        max-height: 80vh;
        height: auto;
        /* padding-bottom: 20px; */
        border-bottom: 10px solid ${props => props.theme.STROKE_GREY};
    }
`;

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
    backgroundColor?: string;
}

const LeftContainer = ({ children }: Props) => <Wrapper>{children}</Wrapper>;

export default LeftContainer;
