import { QuestionTooltip } from '@components/ui';
import { variables } from '@config';
import { useSelector } from '@reducers';
import { statsComputations } from '@utils';
import React from 'react';
import styled from 'styled-components';
import SummaryItem from '../SummaryItem';

const Wrapper = styled.div`
    padding-left: 0;
    margin-bottom: 45px;
    width: 100%;
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    color: ${props => props.theme.FONT_LIGHT};
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
    const { allPools, activePoolIds } = useSelector(state => state.app);

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
                <Gains>
                    Reward <QuestionTooltip content={'fees + yield'} />
                </Gains>
            </Header>
            <ItemsWrapper>
                <SummaryItem
                    headline="All active positions"
                    value={valueLockedUsd}
                    gainsAbsolute={feesUsd + yieldUsd - txCostUsd}
                    roi={5}
                />
            </ItemsWrapper>
        </Wrapper>
    );
};

export default SummaryList;
