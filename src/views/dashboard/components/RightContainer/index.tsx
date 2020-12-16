import { analytics, animations, colors, variables, types } from '@config';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import PoolOverview from './PoolOverview';
import PoolsSummary from './PoolsSummary';
import Graph from './Graph';
import { graphUtils, formatUtils } from '@utils';
import { InlineCircle, TabSelectHeader, PoolHeader } from '@components/ui';
import Overview from './Overview';
import Strategies from './Strategies';
import { AppStateInterface } from '@types';
import { useSelector } from '../../../../store/reducers';

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

    const headerHeadline =
        selectedPoolId === 'all' ? (
            <SummaryHeadline>
                <InlineCircle size={32} color={colors.GREEN} />
                <SummaryHeadlineText>Summary of active positions</SummaryHeadlineText>
            </SummaryHeadline>
        ) : (
            <PoolHeader
                tokenSymbolsArr={allPools[selectedPoolId].tokenSymbols}
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
