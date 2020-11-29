import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import Overview from './Overview';
import { TabSelectHeader, PoolHeader } from '@components/ui';
import { formatUtils, graphUtils } from '@utils';
import { AllPoolsGlobal } from '@types';
import Strategies from './Strategies';

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
`;

const PageWrapper = styled.div<{ show: boolean }>`
    width: 100%;
    display: ${props => (props.show ? 'flex' : 'none')};
`;

const OverviewWrapper = styled(PageWrapper)``;
const StrategiesWrapper = styled(PageWrapper)``;

type TabOptions = 'overview' | 'strategies';

interface Props {
    simulatedCoeffs: Array<number>;
    sliderDefaultCoeffs: Array<number>;
    simulatedEthCoeff: number;
}
const RightContainer = ({ simulatedCoeffs, sliderDefaultCoeffs, simulatedEthCoeff }: Props) => {
    const allPools: AllPoolsGlobal = useSelector(state => state.allPools);
    const selectedPoolId = useSelector(state => state.selectedPoolId);
    const [selectedTab, setSelectedTab] = useState<TabOptions>('overview');

    // TODO make the following checks and computations cleaner
    if (!allPools) {
        return null;
        // <SelectPoolWrapper>Please input your Ethereum address on the left</SelectPoolWrapper>
    }

    // just in case the Pool summary is selected, return the following message
    if (selectedPoolId === 'all' || !selectedPoolId || !allPools[selectedPoolId]) {
        // return <SelectPoolWrapper>Select your pool</SelectPoolWrapper>;
        return null;
    }

    const { exchange, poolId, pooledTokens } = allPools[selectedPoolId];
    const tokenSymbolsArr = formatUtils.getTokenSymbolArr(pooledTokens);

    let pageSelected = (
        <Overview simulatedCoeffs={simulatedCoeffs} sliderDefaultCoeffs={sliderDefaultCoeffs} />
    );

    if (selectedTab === 'strategies')
        pageSelected = (
            <Strategies
                simulatedCoeffs={simulatedCoeffs}
                sliderDefaultCoeffs={sliderDefaultCoeffs}
                simulatedEthCoeff={simulatedEthCoeff}
            />
        );

    return (
        <Wrapper>
            <TabSelectHeader
                headline={
                    <PoolHeader
                        tokenSymbolsArr={tokenSymbolsArr}
                        exchange={exchange}
                        poolId={poolId}
                    />
                }
                onSelectTab={tabName => setSelectedTab(tabName)}
            />
            {pageSelected}
        </Wrapper>
    );
};
export default RightContainer;
