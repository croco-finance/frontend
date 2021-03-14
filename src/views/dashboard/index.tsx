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
    // margin: 0 10px 10px 10px; // because of scrollbar - I don't want to have it all the way to the right
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow-y: auto;
    overflow-x: hidden;
    ${styles.scrollBarStyles};
    margin-top: 20px;
    // padding-right: 34px;
    // max-width: 580px;
    align-items: baseline;
    padding-left: 10px;
    padding-right: 10px;
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
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 14px;
`;

const RightNonExceptionContentWrapper = styled.div`
    /* animation: ${animations.SHOW_UP} 1.5s; */
    width: 100%;
`;

const Dashboard = () => {
    const allPoolsGlobal = useSelector(state => state.app.allPools);
    const isLoading = useSelector(state => state.app.loading);
    const isFetchError = useSelector(state => state.app.error);
    const noPoolsFound = useSelector(state => state.app.noPoolsFound);

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
