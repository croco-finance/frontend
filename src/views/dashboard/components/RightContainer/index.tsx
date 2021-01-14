import { InlineCircle, PoolHeader, TabSelectHeader } from '@components/ui';
import { analytics, colors, variables } from '@config';
import React, { useState } from 'react';
import styled from 'styled-components';
import { useSelector } from '@reducers';
import Overview from './Overview';
import Strategies from './Strategies';

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 50px;
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
    const { allPools, selectedPoolId, activePoolIds } = useSelector(state => state);
    const [selectedTab, setSelectedTab] = useState<TabOptions>('overview');

    if (activePoolIds.length <= 0 && selectedPoolId === 'all') {
        return null;
    }

    if (!selectedPoolId) return null;

    const handleTabChange = (tab: TabOptions) => {
        analytics.logEvent(`dashboard_${tab}_view`);
        setSelectedTab(tab);
    };

    const headerHeadline =
        selectedPoolId === 'all' ? (
            <SummaryHeadline>
                <InlineCircle size={32} color={colors.GREEN} />
                <SummaryHeadlineText>Summary of all active positions</SummaryHeadlineText>
            </SummaryHeadline>
        ) : (
            <PoolHeader
                tokenSymbolsArr={allPools[selectedPoolId].tokenSymbols}
                exchange={allPools[selectedPoolId].exchange}
                poolId={allPools[selectedPoolId].poolId}
            />
        );

    let pageToShow;

    if (selectedTab === 'overview' || selectedPoolId === 'all') {
        pageToShow = <Overview />;
    } else if (selectedTab === 'strategies') {
        pageToShow = <Strategies />;
    }

    return (
        <Wrapper>
            <TabSelectHeader
                headline={headerHeadline}
                onSelectTab={tab => handleTabChange(tab)}
                hideTabs={selectedPoolId === 'all'}
            />
            {pageToShow}
        </Wrapper>
    );
};
export default RightContainer;
