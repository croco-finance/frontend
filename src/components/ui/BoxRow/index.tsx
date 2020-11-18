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
    fourthColumn?: React.ReactNode;
    showThreeCols?: boolean;
    columnColors?: Array<'light' | 'medium' | 'dark'>;
    columnAlignment?: Array<'left' | 'right'>;
}

const BoxRow = ({
    // set default values
    firstColumn,
    secondColumn,
    thirdColumn,
    fourthColumn,
    columnColors = ['medium', 'medium', 'medium', 'medium'],
    columnAlignment = ['left', 'right', 'right', 'left'],
}: Props) => {
    return (
        <>
            <Col textAlign={columnAlignment[0]} color={columnColors[0]}>
                {firstColumn}
            </Col>
            {secondColumn ? (
                <Col textAlign={columnAlignment[1]} color={columnColors[1]}>
                    {secondColumn}
                </Col>
            ) : null}

            {thirdColumn ? (
                <Col textAlign={columnAlignment[2]} color={columnColors[2]}>
                    {thirdColumn}
                </Col>
            ) : null}
            {fourthColumn ? (
                <Col textAlign={columnAlignment[3]} color={columnColors[3]}>
                    {fourthColumn}
                </Col>
            ) : null}
        </>
    );
};

export default BoxRow;
