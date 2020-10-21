import colors from '../../../config/colors';
import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
    width: 50%;
    background-color: ${colors.BACKGROUND};
    /* background-color: white; */
    padding: 40px;
    margin: 0;
    padding-top: 100px;

    @media (max-width: 1100px) {
        width: 100%;
    }
`;

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
}

const RightContainer = ({ children }: Props) => <Wrapper>{children}</Wrapper>;

export default RightContainer;
