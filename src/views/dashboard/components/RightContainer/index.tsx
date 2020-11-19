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

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const GraphWrapper = styled.div`
    padding: 45px 10px 10px 10px;
    width: 100%;
`;

const GraphTitle = styled.div`
    color: ${colors.FONT_MEDIUM};
    text-align: center;
    padding-bottom: 15px;
    padding-left: 40px;
`;

const SimulatorButtonWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 16px auto 0 auto;
    padding: 4px 20px;
    flex-direction: column;
    color: ${colors.FONT_MEDIUM};
    font-size: ${variables.FONT_SIZE.NORMAL};
`;

const StyledLink = styled(Link)`
    display: flex;
    text-decoration: none;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    color: ${colors.PASTEL_BLUE_DARK};
    background-color: ${colors.PASTEL_BLUE_LIGHT};
    border-radius: 4px;
    margin-top: 16px;
    padding: 8px 10px;
    transition: 0.12s;

    &:hover {
        /* text-decoration: underline; */
        color: white;
        background-color: ${colors.PASTEL_BLUE_DARK};
    }
`;

const SummaryHeadline = styled.div`
    display: flex;
    align-items: center;
    font-size: ${variables.FONT_SIZE.SMALL};
`;

const SummaryHeadlineText = styled.div`
    margin-left: 5px;
`;

type TabOptions = 'overview' | 'strategies';

const RightContainer = () => {
    const allPools: types.AllPoolsGlobal = useSelector(state => state.allPools);
    const selectedPoolId = useSelector(state => state.selectedPoolId);
    const userAddress = useSelector(state => state.userAddress);
    const activePoolIds = useSelector(state => state.activePoolIds);
    const [selectedTab, setSelectedTab] = useState<TabOptions>('overview');

    if (activePoolIds.length <= 0 && selectedPoolId === 'all') {
        return null;
    }

    let graphData =
        selectedPoolId === 'all'
            ? []
            : graphUtils.getGraphData(allPools[selectedPoolId].intervalStats);

    const tokenSymbolsArr =
        selectedPoolId !== 'all'
            ? formatUtils.getTokenSymbolArr(allPools[selectedPoolId].tokens)
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

    return (
        <Wrapper>
            <TabSelectHeader
                headline={headerHeadline}
                onSelectTab={tabName => setSelectedTab(tabName)}
            />

            {selectedPoolId === 'all' ? (
                <PoolsSummary />
            ) : (
                <>
                    <PoolOverview />
                    <GraphWrapper>
                        <GraphTitle>History of your pool share value</GraphTitle>
                        <Graph data={graphData} />
                    </GraphWrapper>
                    {activePoolIds.includes(selectedPoolId) ? (
                        <SimulatorButtonWrapper>
                            {/* See how changes in assets' prices affect your funds */}
                            <StyledLink
                                onClick={e => {
                                    analytics.Event(
                                        'SIMULATOR',
                                        'Went to simulator from pool card',
                                        userAddress,
                                    );
                                }}
                                to={{
                                    pathname: `/simulator/${userAddress}`,
                                }}
                            >
                                Open in simulator
                            </StyledLink>
                        </SimulatorButtonWrapper>
                    ) : null}
                </>
            )}
        </Wrapper>
    );
};
export default RightContainer;
