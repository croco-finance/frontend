import { colors, variables } from '@config';
import { mathUtils, statsComputations } from '@utils';
import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import SummaryItem from '../SummaryItem';
import { AllPoolsGlobal } from '@types';

const Wrapper = styled.div`
    padding-left: 0;
    margin-bottom: 65px;
    width: 100%;
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    color: ${colors.FONT_LIGHT};
    /* use the same side padding as in <OverviewItem> so that the items are aligned */
    padding: 10px;
`;

const HeaderChild = styled.div`
    display: flex;
    flex: 0 0 33%;
    justify-content: center;
`;

const Exchange = styled(HeaderChild)``;

const Value = styled(HeaderChild)``;

const Gains = styled(HeaderChild)``;

const ItemsWrapper = styled.div``;

const SummaryList = () => {
    const allPools: AllPoolsGlobal = useSelector(state => state.allPools);
    const activePoolIds = useSelector(state => state.activePoolIds);

    if (!allPools || Object.keys(allPools).length === 0) return null;
    const poolsSummaryInfo = statsComputations.getPoolsSummaryObject(allPools, activePoolIds);
    const { feesUsd, yieldUsd, txCostUsd, valueLockedUsd } = poolsSummaryInfo;

    // do not show if there are none or just one active pool
    if (activePoolIds.length <= 1) {
        return null;
    }

    return (
        <Wrapper>
            <Header>
                <Exchange>Pools</Exchange>
                <Value>Value</Value>
                <Gains>Reward/Loss</Gains>
            </Header>
            <ItemsWrapper>
                <SummaryItem
                    headline="All active pools"
                    value={valueLockedUsd}
                    gainsAbsolute={feesUsd + yieldUsd - txCostUsd}
                    roi={5}
                />
            </ItemsWrapper>
        </Wrapper>
    );
};

export default SummaryList;
