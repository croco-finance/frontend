import React from 'react';
import styled from 'styled-components';
import { colors } from '../../../config';
import Spinner from '../Spinner';

const Wrapper = styled.div<{ height: number }>`
    display: flex;
    height: ${props => props.height}px;
    width: 100%;
    justify-content: center;
    align-items: center;
    flex-direction: column-reverse;
    background-color: ${colors.BACKGROUND};
    border-radius: 5px;
    margin-top: 24px;
`;

const SpinnerDescription = styled.div`
    color: ${colors.FONT_LIGHT};
    margin: 20px auto 0 auto;
`;

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
    spinnerSize?: number;
    height?: number;
}

const LoadingBox = ({ spinnerSize = 28, height = 260, children }: Props) => (
    <Wrapper height={height}>
        <SpinnerDescription>{children}</SpinnerDescription>
        <Spinner size={spinnerSize} />
    </Wrapper>
);

export default LoadingBox;
