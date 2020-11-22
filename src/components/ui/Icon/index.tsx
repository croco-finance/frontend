import React from 'react';
import { ReactSVG } from 'react-svg';
import styled, { css } from 'styled-components';
import { ICONS } from './icons';

const SvgWrapper = styled.div<{ size: number; color?: string }>`
    display: inline-block;
    height: ${props => props.size}px;

    div {
        height: ${props => props.size}px;
        line-height: ${props => props.size}px;
    }

    & > div > div > svg > path {
        ${props =>
            props.color
                ? css`
                      fill: ${props.color};
                  `
                : null}
    }
`;

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
    icon: string; // add TokenType later
    size?: number;
    color?: string;
}

const Icon = ({ icon, className, size = 32, color, ...rest }: Props) => {
    return (
        <SvgWrapper className={className} size={size} color={color} {...rest}>
            <ReactSVG
                src={ICONS[icon]}
                beforeInjection={(svg: any) => {
                    svg.setAttribute('width', `${size}px`);
                    svg.setAttribute('height', `${size}px`);
                }}
                loading={() => <span className="loading" />}
            />
        </SvgWrapper>
    );
};

export default Icon;
