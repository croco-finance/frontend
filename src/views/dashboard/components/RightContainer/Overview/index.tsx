import { analytics, colors, variables, types } from '@config';
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import PoolOverview from '../PoolOverview';
import Graph from '../Graph';
import { graphUtils } from '@utils';
import { InfoBox } from '@components/ui';
import { useTheme } from '@hooks';
import { useSelector } from '@reducers';
import DailyFees from '../DailyFees';

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
    const { allPools, selectedPoolId, activePoolIds } = useSelector(state => state);

    const theme: any = useTheme();

    if (activePoolIds.length <= 0 && selectedPoolId === 'all') {
        return null;
    }

    let graphData =
        selectedPoolId === 'all'
            ? []
            : graphUtils.getGraphData(allPools[selectedPoolId].intervalStats);

    let exchange;
    let poolId;
    if (allPools && allPools[selectedPoolId]) {
        exchange = allPools[selectedPoolId].exchange;
        poolId = allPools[selectedPoolId].poolId;
    }

    return (
        <Wrapper>
            {/* </BalancerBanner> */}
            {exchange === 'BALANCER' ? (
                <BalancerBanner>
                    <InfoBox>
                        We show you only a rough estimate of the fees you gained on Balancer. We are
                        working on better Balancer integration.
                    </InfoBox>
                </BalancerBanner>
            ) : null}

            <PoolOverview />
            <DailyFees poolId={poolId} selectedPool={allPools[selectedPoolId]} />
            <GraphWrapper>
                <GraphTitle>History of your interactions with the pool</GraphTitle>
                <Graph data={graphData} theme={theme} />
            </GraphWrapper>
            {activePoolIds.includes(selectedPoolId) ? (
                <SimulatorButtonWrapper>
                    <StyledLink
                        // onClick={e => {
                        //     analytics.Event(
                        //         'SIMULATOR',
                        //         'Went to simulator from pool card',
                        //         userAddress,
                        //     );
                        // }}
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
