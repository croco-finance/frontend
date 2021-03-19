import { useSelector } from '@reducers';
import React from 'react';
import styled from 'styled-components';
import IllustrationDark from '../../../data/images/loading-illustration-dark.svg';
import Illustration from '../../../data/images/loading-illustration.svg';
import Spinner from '../Spinner';

const Wrapper = styled.div<{ height: number }>`
    display: flex;
    height: ${props => props.height}px;
    width: 100%;
    justify-content: center;
    align-items: center;
    flex-direction: column-reverse;
    border-radius: 5px;
    margin-top: 10px;
    padding: 20px;
`;

const SpinnerDescription = styled.div`
    color: ${props => props.theme.FONT_LIGHT};
    margin: 40px auto 0 auto;
    display: flex;
    align-items: center;
`;

const SvgWrapper = styled.img`
    display: inline-block;
    height: ${props => props.height}px;

    div {
        height: ${props => props.height}px;
        line-height: ${props => props.height}px;
    }
`;

const SpinnerWrapper = styled.div`
    /* margin: 40px 0; */
    margin-right: 10px;
`;

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
    spinnerSize?: number;
    height?: number;
}

const LoadingBox = ({ spinnerSize = 16, height = 260, children }: Props) => {
    const theme = useSelector(state => state.app.theme);

    return (
        <Wrapper height={height}>
            <SpinnerDescription>
                <SpinnerWrapper>
                    <Spinner size={spinnerSize} />
                </SpinnerWrapper>
                {children}
            </SpinnerDescription>
            <SvgWrapper height={140} src={theme === 'light' ? Illustration : IllustrationDark} />
        </Wrapper>
    );
};

export default LoadingBox;
