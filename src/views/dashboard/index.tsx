import { AddressSelect } from '@components/containers';
import { DashboardContainer, LeftLayoutContainer, RightLayoutContainer } from '@components/layout';
import { LoadingBox, SadCrocoBox, QuestionTooltip } from '@components/ui';
import { animations, styles, variables } from '@config';
import { useSelector } from '@reducers';
import React from 'react';
import { withRouter } from 'react-router';
import styled from 'styled-components';
import PoolList from './components/LeftContainer/PoolList';
import SummaryList from './components/LeftContainer/SummaryList';
import RightContainer from './components/RightContainer';

const POOL_CARD_MAX_WIDTH = '530px';

const PageHeadline = styled.div`
    color: ${props => props.theme.FONT_DARK};
    font-size: ${variables.FONT_SIZE.H1};
    font-weight: ${variables.FONT_WEIGHT.BOLD};
    align-self: baseline;
    margin-bottom: 30px;
    margin-top: 12px;

    @media (max-width: ${variables.SCREEN_SIZE.SM}) {
        margin-bottom: 20px;
    }
`;
const PoolsWrapper = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow-y: auto;
    overflow-x: hidden;
    ${styles.scrollBarStyles};
    margin-top: 20px;
    align-items: baseline;
    padding-left: 10px;
    padding-right: 10px;
`;

const ExceptionWrapper = styled.div`
    display: flex;
    height: 260px;
    align-items: center;
    justify-content: center;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    flex-direction: column;
    margin-top: 24px;
    text-align: center;
    padding: 20px;
    line-height: 26px;
`;

const NoAddressNoPool = styled(ExceptionWrapper)`
    width: 100%;
    height: 100px;
    color: ${props => props.theme.FONT_LIGHT};
    font-size: ${variables.FONT_SIZE.H3};
`;

const RefreshPageDescWrapper = styled.div`
    display: flex;
    flex-direction: column;
`;

const RefreshButton = styled.button`
    color: white;
    background-color: ${props => props.theme.BUTTON_PRIMARY_BG};
    font-weight: ${variables.FONT_WEIGHT.DEMI_BOLD};
    padding: 10px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin: 16px auto 0 auto;
    outline: none;
`;

const LeftContentWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 10px 10px 10px;
    margin: 0 10px 10px 10px; // because of scrollbar - I don't want to have it all the way to the right
    width: 100%;
    height: 100%;
    max-width: 620px;
    align-self: center;
    ${styles.scrollBarStyles};

    @media (max-width: ${variables.SCREEN_SIZE.LG}) {
        // because choose pool options are not visible on mobile screen
        min-height: 60vh;
    }
`;

const AddressWrapper = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 14px;
`;

const RightNonExceptionContentWrapper = styled.div`
    /* animation: ${animations.SHOW_UP} 1.5s; */
    width: 100%;
`;

const StyledQuestionTooltip = styled(QuestionTooltip)`
    display: inline-block;
`;

const Dashboard = () => {
    const { allPools, selectedAddress } = useSelector(state => state.app);
    const isLoading = useSelector(state => state.app.loading);
    const isFetchError = useSelector(state => state.app.error);
    const noPoolsFound = useSelector(state => state.app.noPoolsFound);
    const noPoolsSavedInRedux = allPools ? Object.keys(allPools).length === 0 : true;

    const refreshPage = () => {
        window.location.reload();
    };

    const getExceptionContent = () => {
        if (isLoading) {
            return <LoadingBox>Wait a moment. We are getting pool data...</LoadingBox>;
        }

        if (isFetchError) {
            return (
                <SadCrocoBox>
                    <RefreshPageDescWrapper>
                        An error occurred while fetching data :(
                        <RefreshButton onClick={refreshPage}>Try again</RefreshButton>
                    </RefreshPageDescWrapper>
                </SadCrocoBox>
            );
        }

        if (!selectedAddress) {
            return <NoAddressNoPool>Input valid Ethereum address first</NoAddressNoPool>;
        }

        if (!allPools || noPoolsSavedInRedux || noPoolsFound) {
            return (
                <SadCrocoBox>
                    Sorry, Croco could not find any pools for this address :(
                    <StyledQuestionTooltip
                        content={
                            'We track only pools on Uniswap, SushiSwap, Balancer and Materia exchanges.'
                        }
                    />
                </SadCrocoBox>
            );
        }
        return null;
    };

    let exceptionContent = getExceptionContent();

    return (
        <>
            <DashboardContainer>
                <LeftLayoutContainer maxHeightMobileScreen="75vh">
                    <LeftContentWrapper>
                        <AddressWrapper>
                            <PageHeadline>Dashboard</PageHeadline>
                            <AddressSelect />
                        </AddressWrapper>
                        <PoolsWrapper>
                            {exceptionContent
                                ? exceptionContent
                                : !noPoolsSavedInRedux && (
                                      <>
                                          <SummaryList cardMaxWidth={POOL_CARD_MAX_WIDTH} />
                                          <PoolList cardMaxWidth={POOL_CARD_MAX_WIDTH} />
                                      </>
                                  )}
                        </PoolsWrapper>
                    </LeftContentWrapper>
                </LeftLayoutContainer>
                <RightLayoutContainer>
                    {!exceptionContent && (
                        <RightNonExceptionContentWrapper>
                            <RightContainer />
                        </RightNonExceptionContentWrapper>
                    )}
                </RightLayoutContainer>
            </DashboardContainer>
        </>
    );
};

export default withRouter(Dashboard);
