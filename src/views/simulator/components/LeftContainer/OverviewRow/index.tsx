import { colors } from '@config';
import React from 'react';
import styled, { css } from 'styled-components';

const rightAlignedStyles = css`
    text-align: right;
    justify-self: flex-end; /* text-align is not enough if you want to align for example button */
`;

const leftAlignedStyles = css`
    text-align: left;
    justify-self: flex-start;
`;

interface RowContentProps {
    color?: 'light' | 'medium' | 'dark';
    textAlign?: 'left' | 'right';
}

// this wrapper sets the text color of the item based on the  color: 'light' | 'dark' prop
const Col = styled.div<RowContentProps>`
    display: flex;
    align-items: center;

    ${props => {
        switch (props.color) {
            case 'light':
                return css`
                    color: ${colors.FONT_LIGHT};
                `;
            case 'medium':
                return css`
                    color: ${colors.FONT_MEDIUM};
                `;
            case 'dark':
                return css`
                    color: ${colors.FONT_DARK};
                `;
        }
    }}

    /* content alignment styles */
    ${props =>
        props.textAlign === 'left'
            ? leftAlignedStyles
            : rightAlignedStyles} /* justify-content: center; */
`;

interface Props {
    firstColumn?: React.ReactNode;
    secondColumn?: React.ReactNode;
    thirdColumn?: React.ReactNode;
    fourthColumn?: React.ReactNode;
    color?: 'light' | 'medium' | 'dark';
}

const OverviewRow = ({
    // set default values
    firstColumn,
    secondColumn,
    thirdColumn,
    fourthColumn,
    color = 'light',
}: Props) => {
    return (
        <>
            <Col textAlign="left" color={color}>
                {firstColumn}
            </Col>
            <Col textAlign="left" color={color}>
                {secondColumn}
            </Col>
            <Col textAlign="right" color={color}>
                {thirdColumn}
            </Col>
            <Col textAlign="right" color={color}>
                {fourthColumn}
            </Col>
        </>
    );
};

export default OverviewRow;
