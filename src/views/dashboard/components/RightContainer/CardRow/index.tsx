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
    color: ${props => (props.color === 'light' ? `${colors.FONT_MEDIUM}` : `${colors.FONT_DARK}`)};

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
    color?: 'light' | 'medium' | 'dark';
    firstColColor?: 'light' | 'dark' | 'lightest';
    showThreeCols?: boolean;
    columnColors?: Array<'light' | 'medium' | 'dark'>;
}

const CardRow = ({
    // set default values
    firstColumn,
    secondColumn,
    thirdColumn,
    color = 'light',
    firstColColor = 'light',
    showThreeCols = true,
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

export default CardRow;
