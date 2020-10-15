import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Slider from '@material-ui/core/Slider';
import Tooltip from '@material-ui/core/Tooltip';
import { colors } from '../../../config';
import styled from 'styled-components';

const Wrapper = styled.div<{ width: number }>`
    width: ${props => props.width}px;
`;

const MySlider = withStyles({
    root: {
        color: colors.PASTEL_BLUE_DARK,
        height: 0,
    },
    thumb: {
        height: 20,
        width: 20,
        backgroundColor: colors.FONT_DARK,
        marginTop: -8,
        marginLeft: -8,
        '&:focus, &:hover, &$active': {
            boxShadow: 'inherit',
        },
    },
    active: {},
    valueLabel: {
        left: 'calc(-50% + 4px)',
        display: 'none',
    },
    track: {
        height: 6,
        borderRadius: 6,
        backgroundColor: '#dadee2',
    },
    rail: {
        height: 6,
        borderRadius: 6,
        backgroundColor: '#dadee2',
        opacity: 1,
    },
})(Slider);

interface Props extends React.ImgHTMLAttributes<HTMLDivElement> {
    min: number;
    max: number;
    step?: number;
    defaultValue?: number;
    size?: number;
    width?: number;
    onChange?: any;
    value?: number;
}

export default function MaterialSlider({
    min,
    max,
    step,
    width = 100,
    defaultValue = 0,
    onChange,
    value,
    ...rest
}: Props) {
    return (
        <Wrapper width={width}>
            <MySlider
                min={min}
                max={max}
                step={step}
                valueLabelDisplay="auto"
                aria-label="pretto slider"
                defaultValue={defaultValue}
                onChange={onChange}
                value={value}
            />
        </Wrapper>
    );
}
