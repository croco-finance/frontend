import {
    DashboardContainer,
    LeftLayoutContainer,
    RightLayoutContainer,
    NavBar,
    Modal,
} from '@components/layout';
import {
    Input,
    LoadingBox,
    SocialButtonBubble,
    Icon,
    Select,
    DarkModeSwitch,
} from '@components/ui';
import { AddressSelect } from '@components/containers';
import { animations, colors, variables, styles } from '@config';
import { validationUtils } from '@utils';
import React, { useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import styled from 'styled-components';
import RightContainer from './components/RightContainer';
import PoolList from './components/LeftContainer/PoolList';
import SummaryList from './components/LeftContainer/SummaryList';
import { AllAddressesGlobal, AppThemeColors } from '@types';
import * as actionTypes from '@actionTypes';
import { useTheme } from '@hooks';
import { useSelector } from '@reducers';

const Header = styled.div`
    width: 100%;
    /* padding-bottom: 44px; */
    /* max-width: 540px; */
    display: flex;
    justify-content: center;
    background-color: ${props => props.theme.BACKGROUND};
    padding: 0 20px;
`;

const DarkModeSwitchWrapper = styled.div`
    position: fixed;
    display: flex;
    align-items: center;
    justify-content: center;
    top: 8px;
    right: 10px;

    @media (max-width: ${variables.SCREEN_SIZE.LG}) {
        display: none;
    }
`;

const HeaderContent = styled.div`
    width: 100%;
    max-width: 620px;
    border-bottom: 1px solid ${props => props.theme.STROKE_GREY};

    /* padding: 0 20px 40px 20px; */
    /* border-bottom: 2px solid ${colors.BACKGROUND_DARK}; */
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
    max-width: 610px;
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-top: 20px;
    margin-bottom: 30px;
    padding: 0 5px;
    /* padding: 6px;
    border-radius: 8px;
    background-color: ${colors.BACKGROUND_DARK}; */
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
            <DarkModeSwitchWrapper>
                <DarkModeSwitch />
            </DarkModeSwitchWrapper>

            <DashboardContainer>
                <LeftLayoutContainer backgroundColor={'red'}>
                    <Header>
                        <HeaderContent>
                            <NavBar />
                        </HeaderContent>
                    </Header>
                    <LeftSubHeaderContent>
                        <AddressWrapper>
                            <AddressSelect />
                        </AddressWrapper>

                        {exceptionContent
                            ? exceptionContent
                            : !noPoolsSavedInRedux && (
                                  <PoolListWrapper>
                                      <Headline>Your liquidity pools</Headline>
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
                <SocialButtonBubble />
            </DashboardContainer>
        </>
    );
};

export default withRouter(Dashboard);
