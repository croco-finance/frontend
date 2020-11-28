import React from 'react';
import styled from 'styled-components';
import { colors, variables } from '@config';
import { Icon } from '@components/ui';

const Wrapper = styled.div`
    width: 100%;
    margin-top: 10px;
    padding: 10px;
    border-radius: 10px;
    font-weight: ${variables.FONT_WEIGHT.REGULAR};
    background-color: ${colors.BACKGROUND_PURPLE};
    border: 1px solid ${colors.STROKE_PURPLE};
    color: ${colors.PURPLE};
    display: flex;
`;

const Text = styled.div`
    margin-left: 5px;
`;

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
}

const InfoBox = ({ children }: Props) => {
    return (
        <Wrapper>
            <Icon icon="info" color={colors.PURPLE} size={18} />
            <Text>{children}</Text>
        </Wrapper>
    );
};

export default InfoBox;
