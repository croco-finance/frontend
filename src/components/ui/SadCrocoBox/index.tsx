import React from 'react';
import styled from 'styled-components';
import Illustration from '@data/images/sad_croco.svg';
import IllustrationDark from '@data/images/sad_croco_dark.svg';
import { useSelector } from '@reducers';

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

const Headline = styled.div`
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

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
    height?: number;
}

const SadCrocoBox = ({ height = 260, children, className }: Props) => {
    const theme = useSelector(state => state.app.theme);

    return (
        <Wrapper height={height} className={className}>
            <Headline>{children}</Headline>
            <SvgWrapper height={140} src={theme === 'light' ? Illustration : IllustrationDark} />
        </Wrapper>
    );
};

export default SadCrocoBox;
