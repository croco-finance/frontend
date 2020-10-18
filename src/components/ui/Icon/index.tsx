import React from 'react';
import { ReactSVG } from 'react-svg';
import styled from 'styled-components';
import { ICONS } from './icons';

const SvgWrapper = styled.div<Omit<Props, 'icon'>>`
    display: inline-block;
    height: ${props => props.size}px;
    color: red;

    div {
        height: ${props => props.size}px;
        line-height: ${props => props.size}px;
    }

    /* & > div > div > svg > path {
        fill: red !important;
    } */
`;

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
    icon: string; // add TokenType later
    size?: number;
}

const Icon = ({ icon, className, size = 32, ...rest }: Props) => {
    return (
        <SvgWrapper className={className} size={size} {...rest}>
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
