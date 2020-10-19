import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { FiatAmount, TokenLogo } from '../../../../../components/ui';
import { colors, variables } from '../../../../../config';
import * as actionTypes from '../../../../../store/actions/actionTypes';
import { getPoolsSummaryObject } from '../../../../../utils/math';

const Wrapper = styled.div<{ isSelected: boolean }>`
    display: flex;
    align-items: center;
    background-color: inherit;
    border-radius: 5px;
    background-color: ${colors.BACKGROUND};
    padding: 10px;
    flex: 0 0 10em 25em;
    min-height: 70px;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    cursor: pointer;
    transition: 0.1s;
    outline: 0;
    /* border: 1px solid ${colors.BACKGROUND}; */
    /* background-color: ${props => (props.isSelected ? '#c5e3ff' : colors.BACKGROUND)}; */
    background-color: ${props => (props.isSelected ? colors.PASTEL_BLUE_LIGHT : colors.BACKGROUND)};

    &:hover {
        /* background-color: ${props => (props.isSelected ? '#c5e3ff' : colors.BACKGROUND)}; */
        background-color: ${props =>
            props.isSelected ? colors.PASTEL_BLUE_LIGHT : colors.BACKGROUND};
        border-color: ${colors.BACKGROUND_DARK};
    }
`;

const Item = styled.div`
    display: flex;
    flex: 0 0 33%;
    justify-content: center;
    color: ${colors.FONT_DARK};
`;

const Value = styled(Item)``;
const Gains = styled(Item)``;

const ExchangeWrapper = styled(Item)`
    display: flex;
    align-items: center;
    /* add some padding to make it look more centered than actually is (because of the DEX icon) */
    padding-right: 10px;
`;

const ExchangeTitle = styled.div`
    font-size: 18px;
    font-weight: ${variables.FONT_WEIGHT.DEMI_BOLD};
    margin-left: 5px;
`;

interface Props {
    exchange: string;
    value: number;
    gainsAbsolute: number;
    roi: number;
}

const SummaryItem = ({ exchange, value, gainsAbsolute, roi }: Props) => {
    const dispatch = useDispatch();
    const allPools = useSelector(state => state.allPools);
    const selectedPoolId = useSelector(state => state.selectedPoolId);

    const poolsSummaryInfo: any = getPoolsSummaryObject(allPools);

    const { feesUsd, endBalanceUsd } = poolsSummaryInfo;

    let isSelected = selectedPoolId === 'all';

    const handleOnClick = (e, exchangeId) => {
        // TODO make exchange specific later
        dispatch({ type: actionTypes.SET_SELECTED_POOL_ID, poolId: exchangeId });
    };

    return (
        <Wrapper onClick={event => handleOnClick(event, 'all')} isSelected={isSelected}>
            <ExchangeWrapper>
                {/* <TokenLogo symbol={exchange} size={26} /> */}
                <ExchangeTitle>Pools Summary</ExchangeTitle>
            </ExchangeWrapper>
            <Value>
                <FiatAmount value={endBalanceUsd} />
            </Value>
            <Gains>
                <FiatAmount value={feesUsd} usePlusSymbol />
            </Gains>
        </Wrapper>
    );
};

export default SummaryItem;