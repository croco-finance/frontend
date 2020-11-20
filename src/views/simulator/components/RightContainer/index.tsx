import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import Overview from './Overview';
import { TabSelectHeader, PoolHeader } from '@components/ui';
import { formatUtils, graphUtils } from '@utils';
import { AllPoolsGlobal } from '@types';

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
`;

type TabOptions = 'overview' | 'strategies';

interface Props {
    simulatedCoefficients: Array<number>;
    sliderDefaultCoeffs: Array<number>;
}
const RightContainer = ({ simulatedCoefficients, sliderDefaultCoeffs }: Props) => {
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
            <Overview
                simulatedCoefficients={simulatedCoefficients}
                sliderDefaultCoeffs={sliderDefaultCoeffs}
            />
        </Wrapper>
    );
};
export default RightContainer;
