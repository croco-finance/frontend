import { DashboardContainer, NavBar } from '@components/layout';
import { Input, LoadingBox } from '@components/ui';
import { animations, colors, variables } from '@config';
import { validationUtils } from '@utils';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import styled from 'styled-components';
import { FetchPoolsHook } from '../../hooks';
import { FetchPoolStatsHook } from '../../hooks/stats';
import { FetchPoolSnapshotsHook } from '../../hooks/snaps';
import RightContainer from './components/RightContainer';
import PoolList from './components/LeftContainer/PoolList';
import SummaryList from './components/LeftContainer/SummaryList';

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

const LeftWrapper = styled.div`
    width: 44%;
    padding: 0px 40px 20px 0;
    max-height: 99vh;
    overflow-y: auto;
    /* animation: ${animations.SHOW_UP} 1.5s; */
    @media (max-width: 1100px) {
        width: 100%;
        padding: 20px;
    }

    @media (max-width: 520px) {
        padding: 10px;
    }

    ::-webkit-scrollbar {
        background-color: #fff;
        width: 10px;
    }
    /* background of the scrollbar except button or resizer */
    ::-webkit-scrollbar-track {
        background-color: transparent;
    }
    /* scrollbar itself */
    ::-webkit-scrollbar-thumb {
        /* 7F7F7F for mac-like color */
        background-color: #babac0;
        border-radius: 10px;
        border: 2px solid #fff;
    }
    /* set button(top and bottom of the scrollbar) */
    ::-webkit-scrollbar-button {
        display: none;
    }
`;

const RightWrapper = styled.div`
    padding: 40px 0px 20px 50px;
    width: 56%;
    background-color: ${colors.BACKGROUND};
    @media (max-width: 1100px) {
        width: 100%;
        padding: 20px;
    }

    @media (max-width: 520px) {
        padding: 10px;
    }
`;

const SummaryWrapper = styled.div`
    margin-top: 40px;
`;
const CardInfoWrapper = styled.div`
    animation: ${animations.SHOW_UP} 1.5s;
`;

const Headline = styled.div`
    font-size: ${variables.FONT_SIZE.H2};
    font-weight: ${variables.FONT_WEIGHT.DEMI_BOLD};
    margin-bottom: 30px;
    padding-left: 8px;
`;

const Dashboard = (props: RouteComponentProps<any>) => {
    const [inputAddress, setInputAddress] = useState(
        props.match.params.address ? props.match.params.address : '',
    );
    const allPoolsGlobal = useSelector(state => state.allPools);
    const [invalidAddressInput, setInvalidAddressInput] = useState(false);

    // on component startup fetch pools
    // const [{ isLoading, noPoolsFound, isFetchError }, fetchData] = FetchPoolsHook(
    //     props.match.params.address ? props.match.params.address : '',
    // );

    // const [{ isLoading, noPoolsFound, isFetchError }, fetchData] = FetchPoolStatsHook(
    //     props.match.params.address ? props.match.params.address : '',
    // );

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
            <LeftWrapper>
                <NavBar></NavBar>
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
                    />
                    {invalidAddressInput ? (
                        <InputErrorMessage>Invalid Ethereum address</InputErrorMessage>
                    ) : null}
                </AddressWrapper>

                {exceptionContent
                    ? exceptionContent
                    : !noPoolsSavedInRedux && (
                          <>
                              <SummaryWrapper>
                                  <SummaryList />
                              </SummaryWrapper>

                              <Headline>Your liquidity pools</Headline>
                              <PoolList />
                          </>
                      )}
            </LeftWrapper>
            <RightWrapper>
                {rightWrapperContent}
                {!exceptionContent && !noPoolsSavedInRedux && (
                    <CardInfoWrapper>
                        <RightContainer />
                    </CardInfoWrapper>
                )}
            </RightWrapper>
        </DashboardContainer>
    );
};

export default withRouter(Dashboard);
