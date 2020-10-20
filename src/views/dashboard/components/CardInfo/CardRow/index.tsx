import React from 'react';
import styled, { css } from 'styled-components';
import { colors } from '../../../../../config';

const rightAlignedStyles = css`
    text-align: right;
    justify-self: flex-end; /* text-align is not enough if you want to align for example button */
`;

const leftAlignedStyles = css`
    text-align: left;
    justify-self: flex-start;
`;

interface RowContentProps {
    color?: 'light' | 'dark';
    textAlign?: 'left' | 'right';
}

// this wrapper sets the text color of the item based on the  color: 'light' | 'dark' prop
const Col = styled.div<RowContentProps>`
    display: flex;
    align-items: center;
    /* height: 36px; */
    color: ${props => (props.color === 'light' ? `${colors.FONT_MEDIUM}` : `${colors.FONT_DARK}`)};

    /* content alignment styles */
    ${props =>
        props.textAlign === 'left'
            ? leftAlignedStyles
            : rightAlignedStyles}/* justify-content: center; */
`;

interface Props {
    firstColumn?: React.ReactNode;
    secondColumn?: React.ReactNode;
    thirdColumn?: React.ReactNode;
    color?: 'light' | 'dark';
    firstColColor?: 'light' | 'dark';
    showThreeCols?: boolean;
}

const CardRow = ({
    // set default values
    firstColumn,
    secondColumn,
    thirdColumn,
    color = 'light',
    firstColColor = 'light',
    showThreeCols = false,
}: Props) => {
    return (
        <>
            <Col textAlign="left" color={firstColColor}>
                {firstColumn}
            </Col>
            <Col textAlign="right" color={color}>
                {secondColumn}
            </Col>
            {showThreeCols && (
                <Col textAlign="right" color={color}>
                    {thirdColumn}
                </Col>
            )}
        </>
    );
};

export default CardRow;
