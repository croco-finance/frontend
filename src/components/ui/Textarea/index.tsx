import { colors, variables } from '@config';
import React from 'react';
import styled, { css } from 'styled-components';

const Area = styled.textarea<Props>`
    padding: 16px;
    font-family: ${variables.FONT_FAMILY.TTHOVES};
    font-size: ${variables.FONT_SIZE.NORMAL};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    border-radius: 5px;
    border: ${props => (props.noBorder ? 'none' : '2px solid')};
    border-color: ${props =>
        props.useDarkBorder ? props.theme.STROKE_GREY : props.theme.BACKGROUND_DARK};
    outline: none;
    box-sizing: border-box;
    width: 100%;
    background-color: ${props =>
        props.useWhiteBackground ? props.theme.BG_WHITE : props.theme.BACKGROUND};
    transition: border 150ms ease-out;
    -moz-appearance: textfield;
    text-overflow: ellipsis;
    color: ${props => props.theme.FONT_DARK};
    ${props =>
        props.height
            ? css`
                  height: ${props.height}px;
              `
            : 'auto'};

    &:focus {
        border-color: ${colors.PASTEL_BLUE_MEDIUM};
        border-color: #96b7ff;
        /* background-color: #f9faff; */
    }

    &::placeholder {
        color: ${props => props.theme.FONT_LIGHT};
        font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    }
`;

interface Props extends React.InputHTMLAttributes<HTMLTextAreaElement> {
    noBorder?: boolean;
    useWhiteBackground?: boolean;
    useDarkBorder?: boolean;
    height?: number;
}

const Textarea = (props: Props) => (
    <Area
        height={props.height}
        useWhiteBackground={props.useWhiteBackground}
        noBorder={props.noBorder}
        useDarkBorder={props.useDarkBorder}
        placeholder={props.placeholder}
    />
);
export default Textarea;
