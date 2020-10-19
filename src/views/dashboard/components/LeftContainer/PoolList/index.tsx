import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { TokenLogo } from '../../../../../components/ui';
import { variables } from '../../../../../config';
import colors from '../../../../../config/colors';
import PoolItem from '../PoolItem';

const Wrapper = styled.div`
    padding-left: 0;
    margin-bottom: 65px;
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
    const allPools = useSelector(state => state.allPools);

    return (
        <Wrapper>
            <Header>
                <Exchange>Pool</Exchange>
                <Value>Value</Value>
                <Gains>Fee Gains</Gains>
            </Header>
            {Object.keys(allPools).map((poolId, i) => {
                return <PoolItem key={poolId} poolId={poolId} />;
            })}
        </Wrapper>
    );
};

export default PoolList;
