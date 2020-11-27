import { analytics, animations, colors, variables, types } from '@config';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import PoolOverview from './PoolOverview';
import PoolsSummary from './PoolsSummary';
import Graph from './Graph';
import { graphUtils, formatUtils } from '@utils';
import { InlineCircle, TabSelectHeader, PoolHeader } from '@components/ui';
import Overview from './Overview';
import Strategies from './Strategies';

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const SummaryHeadline = styled.div`
    display: flex;
    align-items: center;
    font-size: ${variables.FONT_SIZE.SMALL};
`;

const SummaryHeadlineText = styled.div`
    margin-left: 5px;
    font-size: ${variables.FONT_SIZE.NORMAL};
`;

type TabOptions = 'overview' | 'strategies';

const RightContainer = () => {
    const allPools: types.AllPoolsGlobal = useSelector(state => state.allPools);
    const selectedPoolId = useSelector(state => state.selectedPoolId);
    const activePoolIds = useSelector(state => state.activePoolIds);
    const [selectedTab, setSelectedTab] = useState<TabOptions>('overview');

    if (activePoolIds.length <= 0 && selectedPoolId === 'all') {
        return null;
    }

    const tokenSymbolsArr =
        selectedPoolId !== 'all'
            ? formatUtils.getTokenSymbolArr(allPools[selectedPoolId].pooledTokens)
            : [];

    const headerHeadline =
        selectedPoolId === 'all' ? (
            <SummaryHeadline>
                <InlineCircle size={32} color={colors.GREEN} />
                <SummaryHeadlineText>Summary of active positions</SummaryHeadlineText>
            </SummaryHeadline>
        ) : (
            <PoolHeader
                tokenSymbolsArr={tokenSymbolsArr}
                exchange={allPools[selectedPoolId].exchange}
                poolId={allPools[selectedPoolId].poolId}
            />
        );

    let pageToShow = <PoolsSummary />;

    if (selectedPoolId !== 'all') {
        if (selectedTab === 'overview') {
            pageToShow = <Overview />;
        } else if (selectedTab === 'strategies') {
            pageToShow = <Strategies />;
        }
    }

    return (
        <Wrapper>
            <TabSelectHeader
                headline={headerHeadline}
                onSelectTab={tabName => setSelectedTab(tabName)}
                hideTabs={selectedPoolId === 'all'}
            />

            {pageToShow}
        </Wrapper>
    );
};
export default RightContainer;
