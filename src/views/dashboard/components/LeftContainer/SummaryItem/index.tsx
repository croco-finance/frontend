/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import * as actionTypes from '@actionTypes';
import { FiatValue } from '@components/ui';
import { variables } from '@config';
import { useSelector } from '@reducers';
import { statsComputations } from '@utils';
import React from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import PoolItemCard from '../PoolItemCard';

const Item = styled.div`
    display: flex;
    flex: 0 0 33%;
    justify-content: center;
    align-items: center;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};

    @media (max-width: ${variables.SCREEN_SIZE.SM}) {
        font-size: ${variables.FONT_SIZE.SMALL};
        flex-shrink: 1; // allow to shrink if necessary
    }
`;
const Value = styled(Item)``;
const Gains = styled(Item)``;

const ExchangeWrapper = styled(Item)`
    display: flex;
    align-items: center;
    /* add some padding to make it look more centered than actually is (because of the DEX icon) */
    padding-right: 10px;
`;

const ExchangeTitle = styled.div<{ isSelected: boolean }>`
    font-size: ${variables.FONT_SIZE.NORMAL};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    margin-left: 5px;
    color: ${props => (props.isSelected ? props.theme.BLUE : props.theme.FONT_DARK)};
`;

const StyledPoolItemCard = styled(PoolItemCard)<{ isSelected: boolean }>`
    background-color: ${props =>
        props.isSelected ? props.theme.BACKGROUND_BLUE : props.theme.BACKGROUND_DARK};
    border: 1px solid;
    border-color: ${props =>
        props.isSelected ? props.theme.STROKE_BLUE : props.theme.BACKGROUND_DARK};

    &:hover {
        background-color: ${props =>
            props.isSelected ? props.theme.BACKGROUND_BLUE : props.theme.STROKE_GREY};

        border-color: ${props =>
            props.isSelected ? props.theme.STROKE_BLUE : props.theme.STROKE_GREY};
    }
`;

interface Props {
    headline: React.ReactNode;
}

const SummaryItem = ({ headline }: Props) => {
    const dispatch = useDispatch();
    const { allPools, selectedPoolId, activePoolIds } = useSelector(state => state.app);

    const poolsSummaryInfo = statsComputations.getPoolsSummaryObject(allPools, activePoolIds);
    const { feesUsd, yieldUsd, valueLockedUsd } = poolsSummaryInfo;

    const isSelected = selectedPoolId === 'all';

    const handleOnClick = (e, exchangeId) => {
        // TODO make exchange specific later
        dispatch({ type: actionTypes.SET_SELECTED_POOL_ID, poolId: exchangeId });
    };

    return (
        <div onClick={event => handleOnClick(event, 'all')}>
            <StyledPoolItemCard isSelected={isSelected}>
                <ExchangeWrapper>
                    {/* <TokenLogo symbol={exchange} size={26} /> */}
                    <ExchangeTitle isSelected={isSelected}>{headline}</ExchangeTitle>
                </ExchangeWrapper>
                <Value>
                    <FiatValue value={valueLockedUsd} />
                </Value>
                <Gains>
                    <FiatValue value={feesUsd + yieldUsd} usePlusSymbol />
                </Gains>
            </StyledPoolItemCard>
        </div>
    );
};

export default SummaryItem;
