import * as actionTypes from '@actionTypes';
import { FiatValue } from '@components/ui';
import { colors, variables } from '@config';
import { mathUtils } from '@utils';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import PoolItemCard from '../PoolItemCard';

const Item = styled.div`
    display: flex;
    flex: 0 0 33%;
    justify-content: center;
    color: ${colors.FONT_DARK};

    @media (max-width: 520px) {
        font-size: ${variables.FONT_SIZE.SMALL};
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

const ExchangeTitle = styled.div`
    font-size: ${variables.FONT_SIZE.NORMAL};
    font-weight: ${variables.FONT_WEIGHT.DEMI_BOLD};
    margin-left: 5px;
`;

interface Props {
    headline: React.ReactNode;
    value: number;
    gainsAbsolute: number;
    roi: number;
}

const SummaryItem = ({ headline }: Props) => {
    const dispatch = useDispatch();
    const allPools = useSelector(state => state.allPools);
    const selectedPoolId = useSelector(state => state.selectedPoolId);
    const activePoolIds = useSelector(state => state.activePoolIds);

    const poolsSummaryInfo: any = mathUtils.getPoolsSummaryObject(allPools, activePoolIds);

    const { feesUsd, endBalanceUsd, yieldRewardUsd } = poolsSummaryInfo;

    let isSelected = selectedPoolId === 'all';

    const handleOnClick = (e, exchangeId) => {
        // TODO make exchange specific later
        dispatch({ type: actionTypes.SET_SELECTED_POOL_ID, poolId: exchangeId });
    };

    return (
        <div onClick={event => handleOnClick(event, 'all')}>
            <PoolItemCard isSelected={isSelected}>
                <ExchangeWrapper>
                    {/* <TokenLogo symbol={exchange} size={26} /> */}
                    <ExchangeTitle>{headline}</ExchangeTitle>
                </ExchangeWrapper>
                <Value>
                    <FiatValue value={endBalanceUsd} />
                </Value>
                <Gains>
                    <FiatValue value={feesUsd + yieldRewardUsd} usePlusSymbol />
                </Gains>
            </PoolItemCard>
        </div>
    );
};

export default SummaryItem;
