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
    customColor?: string;
}

// this wrapper sets the text color of the item based on the  color: 'light' | 'dark' prop
const Col = styled.div<RowContentProps>`
    display: flex;
    align-items: center;

    ${props => {
        // custom color is first so it return and overrides following styles
        if (props.customColor) {
            return css`
                color: ${props.customColor};
            `;
        }

        switch (props.color) {
            case 'light':
                return css`
                    color: ${props.theme.FONT_LIGHT};
                `;
            case 'medium':
                return css`
                    color: ${props.theme.FONT_MEDIUM};
                `;
            case 'dark':
                return css`
                    color: ${props.theme.FONT_DARK};
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
    customColor?: string;
}

const BoxRow = ({
    // set default values
    firstColumn,
    secondColumn,
    thirdColumn,
    fourthColumn,
    columnColors = ['medium', 'medium', 'medium', 'medium'],
    columnAlignment = ['left', 'right', 'right', 'left'],
    customColor,
}: Props) => {
    return (
        <>
            <Col textAlign={columnAlignment[0]} color={columnColors[0]} customColor={customColor}>
                {firstColumn}
            </Col>
            {secondColumn ? (
                <Col
                    textAlign={columnAlignment[1]}
                    color={columnColors[1]}
                    customColor={customColor}
                >
                    {secondColumn}
                </Col>
            ) : null}

            {thirdColumn ? (
                <Col
                    textAlign={columnAlignment[2]}
                    color={columnColors[2]}
                    customColor={customColor}
                >
                    {thirdColumn}
                </Col>
            ) : null}
            {fourthColumn ? (
                <Col
                    textAlign={columnAlignment[3]}
                    color={columnColors[3]}
                    customColor={customColor}
                >
                    {fourthColumn}
                </Col>
            ) : null}
        </>
    );
};

export default BoxRow;
