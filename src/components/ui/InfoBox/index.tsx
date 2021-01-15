import React from 'react';
import styled from 'styled-components';
import { colors, variables } from '@config';
import { Icon } from '@components/ui';
import { useTheme } from '@hooks';

const Wrapper = styled.div`
    width: 100%;
    margin-top: 10px;
    padding: 10px;
    border-radius: 10px;
    font-weight: ${variables.FONT_WEIGHT.REGULAR};
    background-color: ${props => props.theme.BACKGROUND_PURPLE};
    border: 1px solid ${props => props.theme.STROKE_PURPLE};
    color: ${props => props.theme.PURPLE};
    display: flex;
`;

const Text = styled.div`
    margin-left: 5px;
`;

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
    iconSize?: number;
}

const InfoBox = ({ children, iconSize = 16, className }: Props) => {
    const theme: any = useTheme();
    return (
        <Wrapper className={className}>
            <Icon icon="info" color={theme.PURPLE} size={iconSize} />
            <Text>{children}</Text>
        </Wrapper>
    );
};

export default InfoBox;
