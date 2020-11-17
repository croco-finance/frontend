import { analytics, animations, colors, variables, styles, types } from '@config';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import PoolOverview from './PoolOverview';
import PoolsSummary from './PoolsSummary';
import Graph from './Graph';
import { graphUtils, getTokenSymbolArr } from '@utils';
import { MultipleTokenLogo, InlineCircle } from '@components/ui';

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const Headline = styled.div`
    padding: 0 10px;
    font-size: ${variables.FONT_SIZE.SMALL};
    margin-top: 0;
    display: flex;
    flex-direction: row;
    flex-grow: 1;
    justify-self: flex-start;
    align-items: center;
`;

const HeadlineText = styled.div<{ isLarge: boolean }>`
    margin-left: 6px;
    color: ${colors.FONT_LIGHT};
    max-width: 250px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    @media (max-width: ${variables.SCREEN_SIZE.SM}) {
        max-width: 120px;
        font-size: ${variables.FONT_SIZE.TINY};
    }
`;

const Header = styled.div`
    display: flex;
    width: 100%;
    align-items: center;
    /* padding: 0 10px 10px 10px; */
    align-items: center;
    border-bottom: 1px solid ${colors.BACKGROUND_DARK};
    margin-bottom: 40px;
    color: ${colors.FONT_LIGHT};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
`;

const ButtonsWrapper = styled.div`
    display: flex;
    font-size: ${variables.FONT_SIZE.NORMAL};

    @media (max-width: ${variables.SCREEN_SIZE.SM}) {
        font-size: ${variables.FONT_SIZE.SMALL};
    }
`;

const Button = styled.div<{ selected: boolean }>`
    flex-grow: 1;
    color: ${props => (props.selected ? colors.GREEN : colors.FONT_LIGHT)};
    border-bottom: 2px solid;
    border-color: ${props => (props.selected ? colors.GREEN : 'transparent')};
    cursor: pointer;
    padding: 14px 20px;
    box-sizing: border-box;
    margin-bottom: -1px;
    font-weight: ${variables.FONT_WEIGHT.REGULAR};
`;

const GraphWrapper = styled.div`
    padding: 45px 10px 10px 10px;
    width: 100%;
`;

const GraphTitle = styled.div`
    color: ${colors.FONT_MEDIUM};
    text-align: center;
    padding-bottom: 15px;
    /* padding-left: 60px; */
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

    let tokenSymbolsArr;
    let headlineText = '';
    let isLargeHeadline = true;

    if (selectedPoolId !== 'all') {
        isLargeHeadline = false;
        tokenSymbolsArr = getTokenSymbolArr(allPools[selectedPoolId].tokens);
        tokenSymbolsArr?.forEach((symbol, i) => {
            headlineText = headlineText + ', ' + symbol;
        });
        headlineText = headlineText.substring(1); //delete first char (comma)
    } else {
        headlineText = 'Summary of active positions';
    }

    return (
        <Wrapper>
            <Header>
                <Headline>
                    {selectedPoolId === 'all' ? (
                        <InlineCircle size={32} color={colors.GREEN} />
                    ) : (
                        <MultipleTokenLogo size={18} tokens={tokenSymbolsArr} />
                    )}

                    <HeadlineText isLarge={isLargeHeadline}>{headlineText}</HeadlineText>
                </Headline>
                <ButtonsWrapper>
                    <Button
                        onClick={() => {
                            setSelectedTab('overview');
                        }}
                        selected={selectedTab === 'overview'}
                    >
                        Overview
                    </Button>
                    <Button
                        onClick={() => {
                            setSelectedTab('strategies');
                        }}
                        selected={selectedTab === 'strategies'}
                    >
                        Compare strategies
                    </Button>
                </ButtonsWrapper>
            </Header>

            {selectedPoolId === 'all' ? (
                <PoolsSummary />
            ) : (
                <>
                    <PoolOverview />
                    <GraphWrapper>
                        <GraphTitle>Pool history</GraphTitle>
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
