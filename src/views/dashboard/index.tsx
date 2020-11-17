import {
    DashboardContainer,
    LeftLayoutContainer,
    RightLayoutContainer,
    NavBar,
} from '@components/layout';
import { Input, LoadingBox } from '@components/ui';
import { animations, colors, variables, styles } from '@config';
import { validationUtils } from '@utils';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import styled from 'styled-components';
import { FetchPoolSnapshotsHook } from '../../hooks/snaps';
import RightContainer from './components/RightContainer';
import PoolList from './components/LeftContainer/PoolList';
import SummaryList from './components/LeftContainer/SummaryList';

const RightContentWrapper = styled.div`
    display: flex;
    flex-direction: column;
    padding: 40px 10px 0 120px;
    max-width: 800px;
    align-items: center;

    @media (max-width: ${variables.SCREEN_SIZE.MD}) {
        padding: 20px 10px;
    }

    @media (max-width: ${variables.SCREEN_SIZE.SM}) {
        padding: 0px;
    }
`;

const Header = styled.div`
    width: 100%;
    padding-bottom: 44px;
    display: flex;
    justify-content: center;
    background-color: ${colors.BACKGROUND_LIGHT};
`;

const HeaderContent = styled.div`
    width: 100%;
    max-width: 80%;
`;

const ExceptionWrapper = styled.div`
    display: flex;
    height: 260px;
    align-items: center;
    justify-content: center;
    font-weight: ${variables.FONT_WEIGHT.DEMI_BOLD};
    flex-direction: column;
    background-color: ${colors.BACKGROUND};
    margin-top: 24px;
    text-align: center;
    padding: 20px;
    line-height: 26px;
`;

const NoPoolFoundInfo = styled(ExceptionWrapper)`
    color: ${colors.FONT_MEDIUM};
`;

const ErrorTextWrapper = styled(ExceptionWrapper)`
    & > button {
        color: white;
        background-color: ${colors.BLUE};
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
    color: ${colors.FONT_LIGHT};
    font-size: ${variables.FONT_SIZE.H2};
`;

const AddressWrapper = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    border-radius: 5px;
    margin-top: 20px;
`;

const InputErrorMessage = styled.div`
    margin-top: 6px;
    font-size: ${variables.FONT_SIZE.SMALL};
    color: ${colors.RED};
    font-weight: ${variables.FONT_WEIGHT.DEMI_BOLD};
`;

const AddressLabel = styled.div`
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    padding-left: 5px;
`;

const LeftSubHeaderContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow-y: auto;
    overflow-x: hidden;
    ${styles.scrollBarStyles};
`;

const CardInfoWrapper = styled.div`
    animation: ${animations.SHOW_UP} 1.5s;
    width: 100%;
`;

const Headline = styled.div`
    /* align-self: baseline; */
    padding-top: 24px;
    margin-bottom: 38px;
    padding-left: 20px;
    color: ${colors.FONT_MEDIUM};
    font-size: ${variables.FONT_SIZE.H3};
    font-weight: ${variables.FONT_WEIGHT.DEMI_BOLD};
`;

const PoolListWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px;
    width: 100%;
    max-width: 540px;
`;

const Dashboard = (props: RouteComponentProps<any>) => {
    const [inputAddress, setInputAddress] = useState(
        props.match.params.address ? props.match.params.address : '',
    );
    const allPoolsGlobal = useSelector(state => state.allPools);
    const [invalidAddressInput, setInvalidAddressInput] = useState(false);

    const [{ isLoading, noPoolsFound, isFetchError }, fetchData] = FetchPoolSnapshotsHook(
        props.match.params.address ? props.match.params.address : '',
    );

    const handleAddressChange = inputAddr => {
        setInvalidAddressInput(false);
        // show in the input whatever user typed in, even if it's not a valid ETH address
        setInputAddress(inputAddr);

        if (validationUtils.isValidEthereumAddress(inputAddr)) {
            setInvalidAddressInput(false);
            fetchData(inputAddr);
            // change the url so that the user fetches data for the same address when refreshing the page
            props.history.push({
                pathname: `/dashboard/${inputAddr}`,
            });
        } else {
            if (inputAddr.trim()) setInvalidAddressInput(true);
        }
    };

    let exceptionContent;
    let rightWrapperContent;
    const noPoolsSavedInRedux = Object.keys(allPoolsGlobal).length === 0;

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
    }

    if (noPoolsFound) {
        // TODO tell the user he cat try simulator in this case, once the simulator work for manual inputs
        exceptionContent = (
            <NoPoolFoundInfo>
                We didn't find any pools associated with this address.
                <br />
                Try different address or refresh the page.
            </NoPoolFoundInfo>
        );
    }

    if (noPoolsSavedInRedux && !exceptionContent) {
        rightWrapperContent = (
            <NoAddressNoPool>Input valid Ethereum address first!</NoAddressNoPool>
        );
    }

    return (
        <DashboardContainer>
            <LeftLayoutContainer>
                <Header>
                    <HeaderContent>
                        <NavBar />
                        <AddressWrapper>
                            <Input
                                textIndent={[70, 0]}
                                innerAddon={<AddressLabel>Address:</AddressLabel>}
                                addonAlign="left"
                                placeholder="Enter valid Ethereum address"
                                value={inputAddress}
                                onChange={event => {
                                    handleAddressChange(event.target.value);
                                }}
                                useWhiteBackground
                            />
                            {invalidAddressInput ? (
                                <InputErrorMessage>Invalid Ethereum address</InputErrorMessage>
                            ) : null}
                        </AddressWrapper>
                    </HeaderContent>
                </Header>
                <LeftSubHeaderContent>
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
                <RightContentWrapper>
                    {rightWrapperContent}
                    {!exceptionContent && !noPoolsSavedInRedux && (
                        <CardInfoWrapper>
                            <RightContainer />
                        </CardInfoWrapper>
                    )}
                </RightContentWrapper>
            </RightLayoutContainer>
        </DashboardContainer>
    );
};

export default withRouter(Dashboard);
