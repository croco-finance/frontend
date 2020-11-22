import { colors, variables } from '@config';
import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div<{ isSelected: boolean }>`
    position: relative;
    display: flex;
    align-items: center;
    background-color: inherit;
    border-radius: 5px;
    background-color: ${props => (props.isSelected ? colors.BACKGROUND_BLUE : colors.WHITE)};
    color: ${props => (props.isSelected ? colors.BLUE : colors.FONT_DARK)};
    border: 1px solid white;
    border-color: ${props => (props.isSelected ? colors.STROKE_BLUE : colors.WHITE)};
    padding: 10px;
    flex: 0 0 10em 25em;
    min-height: 70px;
    margin-bottom: 10px;
    cursor: pointer;
    transition: 0s;
    font-size: ${variables.FONT_SIZE.NORMAL};
    /* box-shadow: ${props =>
        props.isSelected ? '#00000000 0px 1px 2px 0px;' : '#00000030 0px 1px 2px 0px;'}; */

    &:hover {
        background-color: ${props =>
            props.isSelected ? colors.BACKGROUND_BLUE : colors.BACKGROUND_LIGHT};

        border-color: ${props => (props.isSelected ? colors.STROKE_BLUE : colors.STROKE_GREY)};
    }

    @media (max-width: ${variables.SCREEN_SIZE.MD}) {
        font-size: ${variables.FONT_SIZE.SMALL};
    }

    @media (max-width: ${variables.SCREEN_SIZE.SM}) {
        padding: 4px;
    }
`;

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
    isSelected?: boolean;
}

const PoolItemCard = ({ children, isSelected = false, className }: Props) => {
    return (
        <Wrapper isSelected={isSelected} className={className}>
            {children}
        </Wrapper>
    );
};

export default PoolItemCard;
