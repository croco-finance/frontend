import Slider from '@material-ui/core/Slider';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from '@reducers';
import React from 'react';
import styled from 'styled-components';
import { colors } from '../../../config';

const Wrapper = styled.div<{ width: number }>`
    width: ${props => props.width}px;
`;
const useStyles = makeStyles({
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
    thumbNight: {
        height: 20,
        width: 20,
        backgroundColor: '#0d0e0e',
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
    trackNight: {
        height: 6,
        borderRadius: 6,
        backgroundColor: '#3f464b',
    },
    railNight: {
        height: 6,
        borderRadius: 6,
        backgroundColor: '#3f464b',
        opacity: 1,
    },
});

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

const MaterialSlider = ({
    min,
    max,
    step,
    width = 100,
    defaultValue = 0,
    onChange,
    value,
    ...rest
}: Props) => {
    const theme = useSelector(state => state.app.theme);
    const classes = useStyles();

    return (
        <Wrapper width={width}>
            <Slider
                min={min}
                max={max}
                step={step}
                valueLabelDisplay="auto"
                aria-label="pretto slider"
                defaultValue={defaultValue}
                onChange={onChange}
                value={value}
                classes={
                    theme === 'light'
                        ? {
                              root: classes.root, // class name, e.g. `classes-nesting-root-x`
                              thumb: classes.thumb,
                              track: classes.track, // class name, e.g. `classes-nesting-label-x`
                              rail: classes.rail,
                              valueLabel: classes.valueLabel,
                          }
                        : {
                              root: classes.root, // class name, e.g. `classes-nesting-root-x`
                              track: classes.trackNight, // class name, e.g. `classes-nesting-label-x`
                              thumb: classes.thumbNight,
                              rail: classes.railNight,
                              valueLabel: classes.valueLabel,
                          }
                }
            />
        </Wrapper>
    );
};

export default MaterialSlider;
