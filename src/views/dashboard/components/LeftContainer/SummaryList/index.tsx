import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { variables } from '../../../../../config';
import colors from '../../../../../config/colors';
import { getPoolsSummaryObject } from '../../../../../utils/math';
import SummaryItem from '../SummaryItem';

const Wrapper = styled.div`
    padding-left: 0;
    margin-bottom: 65px;
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    font-weight: ${variables.FONT_WEIGHT.REGULAR};
    color: ${colors.FONT_LIGHT};
    /* use the same side padding as in <OverviewItem> so that the items are aligned */
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

const SummaryList = () => {
    const allPools = useSelector(state => state.allPools);
    const poolsSummaryInfo: any = getPoolsSummaryObject(allPools);

    return (
        <Wrapper>
            <Header>
                <Exchange>&ensp;</Exchange>
                <Value>Value</Value>
                <Gains>Fee gains</Gains>
            </Header>
            <ItemsWrapper>
                <SummaryItem
                    exchange="balancer"
                    value={poolsSummaryInfo.endBalanceUsd}
                    gainsAbsolute={poolsSummaryInfo.feesUsd}
                    roi={5}
                />
            </ItemsWrapper>
        </Wrapper>
    );
};

export default SummaryList;
