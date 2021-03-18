import { DailyFeesChart } from '@components/containers';
import { InfoBox } from '@components/ui';
import { colors, variables } from '@config';
import { useTheme } from '@hooks';
import { useSelector } from '@reducers';
import { graphUtils, statsComputations } from '@utils';
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Graph from '../Graph';
import PoolOverview from '../PoolOverview';
import SummaryOverview from '../SummaryOverview';

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
`;

const GraphWrapper = styled.div`
    padding: 45px 10px 10px 10px;
    width: 100%;
`;

const GraphTitle = styled.div`
    color: ${props => props.theme.FONT_MEDIUM};
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
    color: ${props => props.theme.FONT_MEDIUM};
    font-size: ${variables.FONT_SIZE.NORMAL};
`;

const StyledLink = styled(Link)`
    display: flex;
    text-decoration: none;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    color: ${props => props.theme.BUTTON_SECONDARY_FONT};
    background-color: ${props => props.theme.BUTTON_SECONDARY_BG};
    border-radius: 4px;
    margin-top: 16px;
    padding: 8px 10px;
    transition: 0.12s;

    &:hover {
        color: ${props => props.theme.BUTTON_SECONDARY_FONT_HOVER};
        background-color: ${colors.PASTEL_BLUE_DARK};
    }
`;

const BalancerBanner = styled.div`
    margin-bottom: 20px;
`;

const Overview = () => {
    const { allPools, selectedPoolId, activePoolIds } = useSelector(state => state.app);
    const theme = useTheme();

    if (activePoolIds.length <= 0 && selectedPoolId === 'all') {
        return null;
    }

    const activePoolsSummary = statsComputations.getPoolsSummaryObject(allPools, activePoolIds);

    const historyGraphData =
        selectedPoolId === 'all'
            ? undefined
            : graphUtils.getInteractionsGraphData(allPools[selectedPoolId].intervalStats);

    let exchange;
    let poolId;
    let dailyStats;

    console.log('allPools[selectedPoolId]', allPools[selectedPoolId]);

    // stats for daily fee chart
    if (selectedPoolId === 'all') {
        dailyStats = activePoolsSummary.dailyStats;
    } else {
        dailyStats = allPools[selectedPoolId].dailyStats;
    }
    if (allPools && allPools[selectedPoolId]) {
        exchange = allPools[selectedPoolId].exchange;
        poolId = allPools[selectedPoolId].poolId;
    }

    // choose if to show fee/yield overview for a single pool ir pool summary
    let poolOverview;
    if (allPools && selectedPoolId === 'all' && activePoolsSummary) {
        poolOverview = <SummaryOverview summary={activePoolsSummary} />;
    } else if (allPools && allPools[selectedPoolId]) {
        poolOverview = <PoolOverview pool={allPools[selectedPoolId]} />;
    }

    console.log('dailyStats', dailyStats);

    return (
        <Wrapper>
            {exchange === 'BALANCER' ? (
                <BalancerBanner>
                    <InfoBox>
                        We show you only a rough estimate of the fees you gained on Balancer. We are
                        working on better Balancer integration.
                    </InfoBox>
                </BalancerBanner>
            ) : null}

            {poolOverview}

            {dailyStats && (
                <DailyFeesChart dailyStats={dailyStats} noBorder={selectedPoolId === 'all'} />
            )}
            {historyGraphData && (
                <GraphWrapper>
                    <GraphTitle>History of your interactions with the pool</GraphTitle>
                    <Graph data={historyGraphData} theme={theme} />
                </GraphWrapper>
            )}

            {activePoolIds.includes(selectedPoolId) ? (
                <SimulatorButtonWrapper>
                    <StyledLink
                        to={{
                            pathname: `/simulator`,
                        }}
                    >
                        Open in simulator
                    </StyledLink>
                </SimulatorButtonWrapper>
            ) : null}
        </Wrapper>
    );
};
export default Overview;
