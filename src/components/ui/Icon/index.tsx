import React from 'react';
import { ReactSVG } from 'react-svg';
import styled, { css } from 'styled-components';
import { ICONS } from './icons';
import { IconType } from '@types';

const SvgWrapper = styled.div<{ size: number; color?: string; hoverColor?: string }>`
    display: inline-block;
    height: ${props => props.size}px;

    div {
        height: ${props => props.size}px;
        line-height: ${props => props.size}px;
    }

    & > div > svg {
        ${props =>
            props.color
                ? css`
                      fill: ${props.color} !important;
                  `
                : null}
    }

    & > div > svg > path {
        ${props =>
            props.color
                ? css`
                      fill: ${props.color} !important;
                  `
                : null}
    }

    &:hover > div > svg {
        ${props =>
            props.hoverColor
                ? css`
                      transition: 0.2s;
                      fill: ${props.hoverColor} !important;
                  `
                : null}
    }

    &:hover > div > svg > path {
        ${props =>
            props.hoverColor
                ? css`
                      transition: 0.2s;
                      fill: ${props.hoverColor} !important;
                  `
                : null}
    }
`;

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
    icon: IconType;
    size?: number;
    color?: string;
    hoverColor?: string;
}

const Icon = ({ icon, className, size = 32, color, hoverColor, ...rest }: Props) => (
    <SvgWrapper className={className} size={size} color={color} hoverColor={hoverColor} {...rest}>
        <ReactSVG
            src={ICONS[icon].default}
            fill="#00ff00"
            beforeInjection={(svg: any) => {
                svg.setAttribute('width', `${size}px`);
                svg.setAttribute('height', `${size}px`);
            }}
            loading={() => <span className="loading" />}
        />
    </SvgWrapper>
);

export default Icon;
