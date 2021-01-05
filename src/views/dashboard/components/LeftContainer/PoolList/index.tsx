import { InlineCircle, QuestionTooltip } from '@components/ui';
import { colors, variables } from '@config';
import React from 'react';
import { useSelector } from '@reducers';
import styled from 'styled-components';
import PoolItem from '../PoolItem';
import { Exchange } from '@types';

const Wrapper = styled.div`
    padding-left: 0;
    margin-bottom: 65px;
    width: 100%;
`;

const ActiveExchange = styled.div`
    display: flex;
    margin-left: -15px;
    align-items: center;
`;

const ActiveHeadlineText = styled.div`
    margin-left: 2px;
`;

const InactiveHeadline = styled.div<{ noMarginTop: boolean }>`
    margin-top: ${props => (props.noMarginTop ? 0 : '32px')};
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    color: ${props => props.theme.FONT_LIGHT};
    /* use the same sside padding as in <OverviewItem> so that the items are aligned */
    padding: 10px 10px 15px 10px;
`;

const HeaderChild = styled.div`
    display: flex;
    flex: 0 0 33%;
    justify-content: center;
    align-items: center;
`;

const ExchangeHeader = styled(HeaderChild)`
    justify-content: start;
    padding-left: 12px;
`;

const Value = styled(HeaderChild)``;

const Gains = styled(HeaderChild)``;

const PoolList = () => {
    const { activePoolIds, dexToPoolMap } = useSelector(state => state);
    const dexRenderingOrder: Array<keyof typeof Exchange> = ['UNI_V2', 'SUSHI', 'BALANCER'];

    const activePoolIdsOrdered: string[] = [];
    const inactivePoolIdsOrdered: string[] = [];

    dexRenderingOrder.forEach(dex => {
        const dexPoolIds = dexToPoolMap[dex];

        dexPoolIds.forEach(poolId => {
            if (activePoolIds.includes(poolId)) {
                activePoolIdsOrdered.push(poolId);
            } else {
                inactivePoolIdsOrdered.push(poolId);
            }
        });
    });

    return (
        <Wrapper>
            {activePoolIdsOrdered.length > 0 ? (
                <>
                    <Header>
                        <ExchangeHeader>
                            <ActiveExchange>
                                <InlineCircle size={26} color={colors.GREEN} />
                                <ActiveHeadlineText>Active positions</ActiveHeadlineText>
                            </ActiveExchange>
                        </ExchangeHeader>
                        <Value>Value</Value>
                        <Gains>
                            Reward
                            <QuestionTooltip content={'fees + yield'} />
                        </Gains>
                    </Header>
                    {activePoolIdsOrdered.map(poolId => {
                        return <PoolItem key={poolId} poolId={poolId} />;
                    })}
                </>
            ) : null}

            {inactivePoolIdsOrdered.length > 0 ? (
                <>
                    <Header>
                        <ExchangeHeader>
                            <InactiveHeadline noMarginTop={activePoolIds.length === 0}>
                                Past positions
                            </InactiveHeadline>
                        </ExchangeHeader>
                        <Value>{''}</Value>
                        <Gains>{activePoolIds.length === 0 ? 'Reward' : ''}</Gains>
                    </Header>

                    {inactivePoolIdsOrdered.map(poolId => {
                        return <PoolItem key={poolId} poolId={poolId} />;
                    })}
                </>
            ) : null}
        </Wrapper>
    );
};

export default PoolList;
