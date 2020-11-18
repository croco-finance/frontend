import { animations, colors, variables } from '@config';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import Overview from './Overview';
import { MultipleTokenLogo, TabSelectHeader } from '@components/ui';
import { formatUtils, graphUtils } from '@utils';
import ILGraph from './ILGraph';

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
    const allPools = useSelector(state => state.allPools);
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

    const tokenSymbolsArr = formatUtils.getTokenSymbolArr(allPools[selectedPoolId].tokens);
    const headlineIcon = <MultipleTokenLogo size={18} tokens={tokenSymbolsArr} />;
    const headlineText = formatUtils.tokenArrToCommaSeparatedString(tokenSymbolsArr);

    return (
        <Wrapper>
            {/* <SectionTitle>Pool overview</SectionTitle> */}
            <TabSelectHeader
                headlineIcon={headlineIcon}
                headlineText={headlineText}
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
