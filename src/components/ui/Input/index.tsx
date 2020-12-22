import * as React from 'react';
import styled, { css } from 'styled-components';
import { colors, variables } from '../../../config';
import { useEffect, createRef } from 'react';

interface WrappedProps {
    width?: any;
}

const Wrapper = styled.div<WrappedProps>`
    display: inline-flex;
    flex-direction: column;
    width: ${props => (props.width ? `${props.width}px` : '100%')};
`;

interface InputProps extends Props {
    inputAddonWidth?: number;
}

const StyledInput = styled.input<InputProps>`
    /* text-indent: ${props => props.textIndent}px; */
    font-family: ${variables.FONT_FAMILY.TTHOVES};
    font-size: ${variables.FONT_SIZE.NORMAL};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    padding: 1px ${props => (props.textIndent ? `${props.textIndent[1] + 16}px` : '16px')} 0
        ${props => (props.textIndent ? `${props.textIndent[0] + 20}px` : '16px')};

    border-radius: 5px;
    border: ${props => (props.noBorder ? 'none' : '2px solid')};
    border-color: ${props =>
        props.useDarkBorder ? props.theme.STROKE_GREY : props.theme.BACKGROUND_DARK};
    outline: none;
    box-sizing: border-box;
    width: 100%;
    height: ${props => (props.variant === 'small' ? '38px' : '50px')};
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

const InputWrapper = styled.div`
    display: flex;
    position: relative;
    // hide arrows when input type = number
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
`;

const InputAddon = styled.div<{ align: 'left' | 'right' }>`
    position: absolute;
    top: 1px;
    bottom: 1px;
    display: flex;
    align-items: center;

    ${props =>
        props.align === 'right' &&
        css`
            right: 10px;
        `}

    ${props =>
        props.align === 'left' &&
        css`
            left: 10px;
        `}
`;

const Overlay = styled.div<Props>`
    bottom: 1px;
    top: 1px;
    left: 1px;
    right: 1px;
    border: 1px solid transparent;
    border-radius: 3px;
    position: absolute;
    background-image: linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgba(255, 255, 255, 1) 220px);
    z-index: 1;
`;

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
    value?: string;
    innerRef?: React.Ref<HTMLInputElement>;
    variant?: 'small' | 'large';
    label?: React.ReactElement | string;
    labelAddon?: React.ReactElement;
    labelRight?: React.ReactElement;
    innerAddon?: React.ReactNode;
    isDisabled?: boolean;
    isLoading?: boolean;
    isPartiallyHidden?: boolean;
    wrapperProps?: Record<string, any>;
    type?: string;
    addonAlign?: 'left' | 'right';
    noError?: boolean;
    labelAddonIsVisible?: boolean;
    textIndent?: [number, number]; // [left, right]
    clearButton?: boolean;
    noBorder?: boolean;
    onClear?: () => void;
    useWhiteBackground?: boolean;
    useDarkBorder?: boolean;
    height?: number;
}

const Input = ({
    value,
    type = 'text',
    innerRef,
    variant = 'large',
    width,
    height,
    label,
    labelAddon,
    labelRight,
    innerAddon,
    isDisabled,
    wrapperProps,
    labelAddonIsVisible,
    isPartiallyHidden,
    clearButton,
    onClear,
    addonAlign = 'right',
    noError = false,
    textIndent = [0, 0],
    noBorder = false,
    useWhiteBackground = false,
    useDarkBorder = false,
    ...rest
}: Props) => {
    const inputAddonRef = createRef<HTMLDivElement>();
    const [inputAddonWidth, setInputAddonWidth] = React.useState(0);

    useEffect(() => {
        if (inputAddonRef.current) {
            const rect = inputAddonRef.current.getBoundingClientRect();
            setInputAddonWidth(rect.width + 10); // addon ha absolute pos with 10px offset
        } else {
            setInputAddonWidth(0);
        }
    }, [inputAddonRef]);

    return (
        <Wrapper {...wrapperProps}>
            <InputWrapper>
                {innerAddon && addonAlign === 'left' && (
                    <InputAddon align="left" ref={inputAddonRef}>
                        {innerAddon}
                    </InputAddon>
                )}
                {((innerAddon && addonAlign === 'right') || clearButton) && (
                    <InputAddon align="right" ref={inputAddonRef}>
                        {addonAlign === 'right' && innerAddon}
                    </InputAddon>
                )}

                {isPartiallyHidden && <Overlay />}
                <StyledInput
                    value={value}
                    textIndent={textIndent}
                    type={type}
                    spellCheck={false}
                    variant={variant}
                    disabled={isDisabled}
                    width={width}
                    ref={innerRef}
                    inputAddonWidth={inputAddonWidth}
                    noBorder={noBorder}
                    useWhiteBackground={useWhiteBackground}
                    useDarkBorder={useDarkBorder}
                    {...rest}
                />
            </InputWrapper>
        </Wrapper>
    );
};

export default Input;
