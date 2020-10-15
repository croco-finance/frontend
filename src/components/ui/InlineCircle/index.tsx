import React from 'react';
import styled from 'styled-components';
import {colors, variables} from '../../../config';

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  });

const Wrapper = styled.div`
    display: flex;
    align-items: center;
    background-color: inherit;
    border-radius: 5px;
    background-color: ${colors.BACKGROUND};
    padding: 10px;
    flex: 0 0 10em 25em;
    min-height: 70px;
    margin-bottom: 10px;
    cursor: pointer;
    /* transition: 0.1s; */

    &:hover {
        background-color: ${colors.PASTEL_BLUE_LIGHT};
    }
`;

const Item = styled.div`
    display: flex;
    flex: 0 0 25%;
    justify-content: center;
    align-items: center;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
`;


const Value = styled(Item)`
`;
const Gains = styled(Item)`
`;

const Roi = styled(Item)``;

const PoolWrapper = styled(Item)`
flex-direction: column;
align-items: start;
padding-left: 10px;

`;

const TokenItem = styled.div`
display: flex;
flex-direction: row;
padding: 5px 0;
`;

const PoolShare = styled.div`
margin-left: 10px;`;

const TokenSymbol = styled.div`
`;

const Circle = styled.div<Props>`
    display: inline-flex;
    margin-left: ${props => props.marginLeft}px;
    margin-right: ${props => props.marginRight}px;
    color: ${props => props.color};
    font-size: ${props => props.size}px;
`;

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    size?: number;
    color?: string;
    marginLeft?: number;
    marginRight?: number;
}

const InlineCircle = ({
    size= 16,
    color=colors.FONT_LIGHT,
    marginLeft=0,
    marginRight=0,
}: Props) => (
    <Circle size={size} color={color}marginLeft={marginLeft} marginRight={marginRight}>&bull;</Circle>
);

export default InlineCircle;
