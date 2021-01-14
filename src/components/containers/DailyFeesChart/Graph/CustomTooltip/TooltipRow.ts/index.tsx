import React from 'react';
import styled, { css } from 'styled-components';
import { colors } from '@config';

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
    /* height: 36px; */
    color: white;

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
    color?: 'light' | 'medium' | 'dark';
    showThreeCols?: boolean;
    columnColors?: Array<'light' | 'medium' | 'dark'>;
}

const TooltipRow = ({
    // set default values
    firstColumn,
    secondColumn,
    thirdColumn,
    showThreeCols = false,
    columnColors = ['medium', 'medium', 'medium'],
}: Props) => {
    return (
        <>
            <Col textAlign="left" color={columnColors[0]}>
                {firstColumn}
            </Col>
            <Col textAlign="right" color={columnColors[1]}>
                {secondColumn}
            </Col>
            {showThreeCols && (
                <Col textAlign="right" color={columnColors[2]}>
                    {thirdColumn}
                </Col>
            )}
        </>
    );
};

export default TooltipRow;
