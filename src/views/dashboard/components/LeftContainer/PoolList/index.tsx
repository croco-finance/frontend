import { InlineCircle } from '@components/ui';
import { colors, variables } from '@config';
import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import PoolItem from '../PoolItem';

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
    color: ${colors.FONT_LIGHT};
    /* use the same sside padding as in <OverviewItem> so that the items are aligned */
    padding: 10px 10px 15px 10px;
`;

const HeaderChild = styled.div`
    display: flex;
    flex: 0 0 33%;
    justify-content: center;
    align-items: center;
`;

const Exchange = styled(HeaderChild)`
    justify-content: start;
    padding-left: 12px;
`;

const Value = styled(HeaderChild)``;

const Gains = styled(HeaderChild)``;

const PoolList = () => {
    const activePoolIds = useSelector(state => state.activePoolIds);
    const inactivePoolIds = useSelector(state => state.inactivePoolIds);

    return (
        <Wrapper>
            {activePoolIds.length > 0 ? (
                <>
                    <Header>
                        <Exchange>
                            <ActiveExchange>
                                <InlineCircle size={26} color={colors.GREEN} />
                                <ActiveHeadlineText>Active positions</ActiveHeadlineText>
                            </ActiveExchange>
                        </Exchange>
                        <Value>Value</Value>
                        <Gains>Reward/Loss</Gains>
                    </Header>
                    {activePoolIds.map(poolId => {
                        return <PoolItem key={poolId} poolId={poolId} />;
                    })}
                </>
            ) : null}

            {inactivePoolIds.length > 0 ? (
                <>
                    <Header>
                        <Exchange>
                            <InactiveHeadline noMarginTop={activePoolIds.length === 0}>
                                Past positions
                            </InactiveHeadline>
                        </Exchange>
                        <Value>{''}</Value>
                        <Gains>{activePoolIds.length === 0 ? 'Reward/Loss' : ''}</Gains>
                    </Header>

                    {inactivePoolIds.map(poolId => {
                        return <PoolItem key={poolId} poolId={poolId} />;
                    })}
                </>
            ) : null}
        </Wrapper>
    );
};

export default PoolList;
