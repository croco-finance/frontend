import React from 'react';
import ReactSelect, { Props as SelectProps } from 'react-select';
import styled from 'styled-components';
import { colors, variables } from '../../../config';

const selectStyle = (
    isSearchable: boolean,
    withDropdownIndicator = true,
    variant: 'small' | 'large',
    usePointerCursor: boolean,
    fontFamily: string,
    noBorder: boolean,
    useWhiteBackground: boolean,
    useDarkBorder: boolean,
) => ({
    singleValue: (base: Record<string, any>) => ({
        ...base,
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        color: colors.FONT_DARK,
        fontWeight: variables.FONT_WEIGHT.DEMI_BOLD,
        fontSize: variables.FONT_SIZE.NORMAL,
        // explicitly define font-family because elements in <ReactSelect/> can inherit some other fonts unexpectedly
        fontFamily: `${fontFamily} !important`,
        '&:hover': {
            cursor: usePointerCursor || !isSearchable ? 'pointer' : 'text',
        },
    }),
    control: (
        base: Record<string, any>,
        { isDisabled, isFocused }: { isDisabled: boolean; isFocused: boolean },
    ) => {
        return {
            ...base,
            minHeight: 'initial',
            display: 'flex',
            alignItems: 'center',
            fontSize: variables.FONT_SIZE.SMALL,
            height: variant === 'small' ? '36px' : '48px',
            borderRadius: '4px',
            borderWidth: noBorder ? 0 : '2px',
            borderColor: useDarkBorder ? colors.BACKGROUND_DARK : colors.BACKGROUND,
            boxShadow: 'none',
            backgroundColor: useWhiteBackground ? 'white' : colors.BACKGROUND,
            transition: 'border 500ms ease-out',
            '&:hover, &:focus': {
                cursor: 'pointer',
                borderRadius: '4px',
                // borderColor: colors.PASTEL_BLUE_MEDIUM,
                borderColor: '#96b7ff',
                backgroundColor: ' #f7f9ff',
            },
        };
    },
    indicatorSeparator: () => ({
        display: 'none',
    }),
    dropdownIndicator: (base: Record<string, any>, { isDisabled }: { isDisabled: boolean }) => ({
        ...base,
        display: !withDropdownIndicator || isDisabled ? 'none' : 'flex',
        alignItems: 'center',
        color: colors.FONT_LIGHT,
        path: '',
        '&:hover': {
            // color: colors.FONT_DARK,
            color: '#96b7ff',
        },
    }),
    menu: (base: Record<string, any>) => ({
        ...base,
        margin: '5px 0',
        boxShadow: 'box-shadow: 0 4px 10px 0 rgba(0, 0, 0, 0.15)',
        zIndex: 9,
    }),
    menuList: (base: Record<string, any>) => ({
        ...base,
        padding: 0,
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.2)',
        background: colors.WHITE,
        // border: `1px solid ${colors.BLACK80}`,
        borderRadius: '4px',
    }),
    option: (base: Record<string, any>, { isFocused }: { isFocused: boolean }) => ({
        ...base,
        color: colors.FONT_MEDIUM,
        fontWeight: variables.FONT_WEIGHT.MEDIUM,
        background: isFocused ? colors.BACKGROUND : colors.WHITE,
        borderRadius: 0,
        fontSize: variables.FONT_SIZE.NORMAL,
        fontFamily: `${fontFamily} !important`,
        '&:hover': {
            cursor: 'pointer',
        },
    }),
    input: (base: Record<string, any>) => ({
        ...base,
        fontSize: variables.FONT_SIZE.NORMAL,
        color: colors.FONT_DARK,
        '& input': {
            fontFamily: `${fontFamily} !important`,
        },
    }),
    placeholder: (base: Record<string, any>) => ({
        ...base,
        color: colors.FONT_LIGHT,
        fontWeight: variables.FONT_WEIGHT.MEDIUM,
        fontSize: variables.FONT_SIZE.NORMAL,
    }),
});

const Wrapper = styled.div<Props>`
    width: ${props => (props.width ? `${props.width}px` : '100%')};
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
`;

interface Props extends Omit<SelectProps, 'components'> {
    withDropdownIndicator?: boolean;
    label?: React.ReactNode;
    wrapperProps?: Record<string, any>;
    variant?: 'small' | 'large';
    usePointerCursor?: boolean;
    fontFamily?: string;
    noBorder?: boolean;
    useWhiteBackground?: boolean;
    useDarkBorder?: boolean;
}

const Select = ({
    isSearchable = true,
    usePointerCursor = false,
    withDropdownIndicator = true,
    wrapperProps,
    label,
    width,
    variant = 'large',
    fontFamily = variables.FONT_FAMILY.OPEN_SANS,
    noBorder = false,
    useWhiteBackground = false,
    useDarkBorder = false,
    ...props
}: Props) => {
    return (
        <Wrapper width={width} {...wrapperProps}>
            <ReactSelect
                styles={selectStyle(
                    isSearchable,
                    withDropdownIndicator,
                    variant,
                    usePointerCursor,
                    fontFamily,
                    noBorder,
                    useWhiteBackground,
                    useDarkBorder,
                )}
                isSearchable={isSearchable}
                {...props}
                components={{ ...props.components }}
            />
        </Wrapper>
    );
};

export default Select;
