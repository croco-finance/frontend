import React from 'react';
import styled from 'styled-components';
import { colors, variables } from '@config';

const Wrapper = styled.div`
    min-width: fit-content;
    width: 100%;
`;

const Content = styled.div<{
    hasBottomBar: boolean;
    padding: Array<number>;
    borderRadius: Array<number>;
    backgroundColor: string;
}>`
    border-radius: ${props => (props.hasBottomBar ? '10px 10px 0 0' : '10px')};
    background-color: ${props => props.backgroundColor};
    padding: ${props => `${props.padding[0]}px 
    ${props.padding[1]}px
    ${props.padding[2]}px
    ${props.padding[3]}px`};

    border-radius: ${props => `${props.borderRadius[0]}px 
    ${props.borderRadius[1]}px
    ${props.borderRadius[2]}px
    ${props.borderRadius[3]}px`};
`;

const BottomBar = styled.div<{ padding: Array<number>; borderRadius: Array<number> }>`
    border-radius: 0 0 10px 10px;
    background-color: ${colors.BACKGROUND_DARK};
    padding: ${props => `${props.padding[0]}px 
    ${props.padding[1]}px
    ${props.padding[2]}px
    ${props.padding[3]}px`};

    border-radius: ${props => `${props.borderRadius[0]}px 
    ${props.borderRadius[1]}px
    ${props.borderRadius[2]}px
    ${props.borderRadius[3]}px`};
`;
interface Props extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
    bottomBar?: React.ReactNode;
    padding?: Array<number>;
    bottomBarPadding?: Array<number>;
    borderRadius?: Array<number>;
    bottomBarBorderRadius?: Array<number>;
    backgroundColor?: string;
}

const GrayBox = ({
    children,
    bottomBar = undefined,
    className,
    padding = [15, 15, 15, 15],
    bottomBarPadding = padding,
    borderRadius = [10, 10, 10, 10],
    bottomBarBorderRadius = borderRadius,
    backgroundColor = colors.BACKGROUND,
}: Props) => {
    return (
        <Wrapper className={className}>
            <Content
                hasBottomBar={bottomBar !== undefined}
                padding={padding}
                borderRadius={borderRadius}
                backgroundColor={backgroundColor}
            >
                {children}
            </Content>
            {bottomBar && (
                <BottomBar padding={bottomBarPadding} borderRadius={bottomBarBorderRadius}>
                    {bottomBar}
                </BottomBar>
            )}
        </Wrapper>
    );
};

export default GrayBox;
