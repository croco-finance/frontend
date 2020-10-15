import colors from '../../../../../config/colors';
import React from 'react';
import styled from 'styled-components';
import PoolItem from '../PoolItem';
import { variables } from '../../../../../config';
import SummaryItem from '../SummaryItem';
import { useDispatch, useSelector } from 'react-redux';
import { getPoolsSummaryObject } from '../../../../../utils/math';

const Wrapper = styled.div`
    padding-left: 0;
    margin-bottom: 65px;
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    color: ${colors.FONT_MEDIUM};
    /* use the same sside padding as in <OverviewItem> so that the items are aligned */
    padding: 10px 10px 15px 10px;
`;

const HeaderChild = styled.div`
    display: flex;
    flex: 0 0 33%;
    justify-content: center;
`;

const Exchange = styled(HeaderChild)``;

const Value = styled(HeaderChild)``;

const Gains = styled(HeaderChild)``;

const Roi = styled(HeaderChild)``;

const ItemsWrapper = styled.div``;

interface Props {}

const SummaryList = ({}: Props) => {
    const dispatch = useDispatch();
    const allPools = useSelector(state => state.allPools);
    const selectedPoolId = useSelector(state => state.selectedPoolId);
    const exchangeToPoolMapping = useSelector(state => state.exchangeToPoolMapping);

    const poolsSummaryInfo: any = getPoolsSummaryObject(allPools);

    return (
        <Wrapper>
            <Header>
                <Exchange>Exchange</Exchange>
                <Value>Value</Value>
                <Gains>Fee gains</Gains>
                <Roi>Balance</Roi>
            </Header>
            <ItemsWrapper>
                <SummaryItem
                    exchange="balancer"
                    value={poolsSummaryInfo.endBalanceUSD}
                    gainsAbsolute={poolsSummaryInfo.feesUSD}
                    roi={5}
                />
            </ItemsWrapper>
        </Wrapper>
    );
};

export default SummaryList;
