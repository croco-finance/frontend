import React from 'react';
import styled from 'styled-components';
import { colors } from '../../../config';

const Wrapper = styled.div`
    position: relative;
    display: flex;
    max-width: 1400px;
    min-height: 100vh;
    flex: 1000 1 0%;
    -webkit-box-flex: 1000;
    color: ${colors.FONT_DARK};
`;
interface Props extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
}

const MainContainer = ({ children }: Props) => <Wrapper>{children}</Wrapper>;

export default MainContainer;