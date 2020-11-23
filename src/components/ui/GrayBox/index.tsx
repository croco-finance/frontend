import React from 'react';
import styled from 'styled-components';
import { colors, variables } from '@config';

const Wrapper = styled.div`
    min-width: fit-content;
    width: 100%;
`;

const Content = styled.div<{ hasBottomBar: boolean; padding: Array<number> }>`
    border-radius: ${props => (props.hasBottomBar ? '10px 10px 0 0' : '10px')};
    background-color: ${colors.BACKGROUND};
    padding: ${props => `${props.padding[0]}px 
    ${props.padding[1]}px
    ${props.padding[2]}px
    ${props.padding[3]}px`};
`;

const BottomBar = styled.div<{ padding: Array<number> }>`
    border-radius: 0 0 10px 10px;
    background-color: ${colors.BACKGROUND_DARK};
    padding: ${props => `${props.padding[0]}px 
    ${props.padding[1]}px
    ${props.padding[2]}px
    ${props.padding[3]}px`};
`;
interface Props extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
    bottomBar?: React.ReactNode;
    padding?: Array<number>;
}

const GrayBox = ({
    children,
    bottomBar = undefined,
    className,
    padding = [15, 15, 15, 15],
}: Props) => {
    return (
        <Wrapper className={className}>
            <Content hasBottomBar={bottomBar !== undefined} padding={padding}>
                {children}
            </Content>
            {bottomBar && <BottomBar padding={padding}>{bottomBar}</BottomBar>}
        </Wrapper>
    );
};

export default GrayBox;
