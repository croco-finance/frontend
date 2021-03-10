import { AddressSelect } from '@components/containers';
import { DashboardContainer, LeftLayoutContainer, RightLayoutContainer } from '@components/layout';
import { LoadingBox } from '@components/ui';
import { animations, colors, styles, variables } from '@config';
import { useTheme } from '@hooks';
import { useSelector } from '@reducers';
import React from 'react';
import { withRouter } from 'react-router';
import styled from 'styled-components';
import PoolList from './components/LeftContainer/PoolList';
import SummaryList from './components/LeftContainer/SummaryList';
import RightContainer from './components/RightContainer';

const PageHeadline = styled.div`
    color: ${props => props.theme.FONT_DARK};
    font-size: ${variables.FONT_SIZE.H1};
    font-weight: ${variables.FONT_WEIGHT.BOLD};
    align-self: baseline;
    margin-bottom: 30px;
    margin-top: 12px;
`;

const ExceptionWrapper = styled.div`
    display: flex;
    height: 260px;
    align-items: center;
    justify-content: center;
    font-weight: ${variables.FONT_WEIGHT.DEMI_BOLD};
    flex-direction: column;
    margin-top: 24px;
    text-align: center;
    padding: 20px;
    line-height: 26px;
`;

const NoPoolFoundInfo = styled(ExceptionWrapper)`
    color: ${props => props.theme.FONT_MEDIUM};
`;

const ErrorTextWrapper = styled(ExceptionWrapper)`
    & > button {
        color: white;
        background-color: ${props => props.theme.BUTTON_PRIMARY_BG};
        font-weight: ${variables.FONT_WEIGHT.DEMI_BOLD};
        padding: 10px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        margin: 16px auto 0 auto;
        outline: none;
    }
`;

const NoAddressNoPool = styled(ExceptionWrapper)`
    color: ${props => props.theme.FONT_LIGHT};
    font-size: ${variables.FONT_SIZE.H2};
`;

const AddressWrapper = styled.div`
    width: 100%;
    max-width: 540px;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 14px;
`;

const LeftSubHeaderContent = styled.div`
    margin: 0 10px 10px 10px; // because of scrollbar - I don't want to have it all the way to the right
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow-y: auto;
    overflow-x: hidden;
    ${styles.scrollBarStyles};
`;

const RightNonExceptionContentWrapper = styled.div`
    /* animation: ${animations.SHOW_UP} 1.5s; */
    width: 100%;
`;

const Headline = styled.div`
    /* align-self: baseline; */
    padding-top: 0px;
    margin-bottom: 50px;
    padding-left: 20px;
    color: ${props => props.theme.FONT_MEDIUM};
    font-size: ${variables.FONT_SIZE.H3};
    font-weight: ${variables.FONT_WEIGHT.DEMI_BOLD};

    @media (max-width: ${variables.SCREEN_SIZE.SM}) {
        margin-bottom: 30px;
    }
`;

const PoolListWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px;
    width: 100%;
    max-width: 540px;
`;

const Dashboard = () => {
    const allPoolsGlobal = useSelector(state => state.app.allPools);
    const isLoading = useSelector(state => state.app.loading);
    const isFetchError = useSelector(state => state.app.error);
    const noPoolsFound = useSelector(state => state.app.noPoolsFound);
    const theme = useTheme();

    let exceptionContent;
    let rightWrapperContent;
    const noPoolsSavedInRedux = allPoolsGlobal ? Object.keys(allPoolsGlobal).length === 0 : true;

    const refreshPage = () => {
        window.location.reload();
    };

    if (isFetchError) {
        exceptionContent = (
            <ErrorTextWrapper>
                An error occurred while fetching data :(
                <button onClick={refreshPage}>Try again</button>
            </ErrorTextWrapper>
        );
    }

    if (isLoading) {
        exceptionContent = <LoadingBox>Wait a moment. We are getting pool data...</LoadingBox>;
    } else if (noPoolsFound) {
        exceptionContent = (
            <NoPoolFoundInfo>
                We didn't find any pools associated with this address.
                <br />
                Don't forget that we support only Uniswap, SushiSwap and Balancer at this time.
            </NoPoolFoundInfo>
        );
    }

    if (noPoolsSavedInRedux && !exceptionContent) {
        rightWrapperContent = (
            <NoAddressNoPool>Input valid Ethereum address first!</NoAddressNoPool>
        );
    }

    return (
        <>
            <DashboardContainer>
                <LeftLayoutContainer>
                    <LeftSubHeaderContent>
                        <AddressWrapper>
                            <PageHeadline>Dashboard</PageHeadline>
                            <AddressSelect />
                        </AddressWrapper>

                        {exceptionContent
                            ? exceptionContent
                            : !noPoolsSavedInRedux && (
                                  <PoolListWrapper>
                                      {/* <Headline>Your liquidity pools</Headline> */}
                                      <SummaryList />
                                      <PoolList />
                                  </PoolListWrapper>
                              )}
                    </LeftSubHeaderContent>
                </LeftLayoutContainer>
                <RightLayoutContainer>
                    {rightWrapperContent}
                    {!exceptionContent && !noPoolsSavedInRedux && (
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
