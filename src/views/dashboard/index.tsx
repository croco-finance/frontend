import * as H from 'history';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { DashboardContainer, NavBar } from '../../components/layout';
import { Input, LoadingBox } from '../../components/ui';
import { animations, colors, variables } from '../../config';
import { FetchPoolsHook } from '../../hooks';
import { validation } from '../../utils';
import CardInfo from './components/CardInfo';
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
    color: ${colors.RED};

    & > button {
        color: white;
        background-color: black;
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
    background-color: ${colors.BACKGROUND};
    width: 100%;
    display: flex;
    align-items: center;
    border-radius: 5px;
    margin-top: 20px;
`;

const AddressLabel = styled.div`
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    padding-left: 5px;
`;

const LeftWrapper = styled.div`
    width: 50%;
    padding: 0px 50px 20px 0;
    /* animation: ${animations.SHOW_UP} 1.5s; */
`;

const RightWrapper = styled.div`
    padding: 40px 0px 20px 50px;
    width: 50%;
    background-color: ${colors.BACKGROUND};
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

// TODO why and how does this actually work?
interface RouteComponentProps<P> {
    match: match<P>;
    location: H.Location;
    history: H.History;
    staticContext?: any;
}

interface match<P> {
    params: P;
    isExact: boolean;
    path: string;
    url: string;
}

const Dashboard = (props: RouteComponentProps<any>) => {
    const [inputAddress, setInputAddress] = useState(
        props.match.params.address ? props.match.params.address : '',
    );

    const [{ isLoading, noPoolsFound, isFetchError }, fetchData] = FetchPoolsHook(
        props.match.params.address ? props.match.params.address : '',
    );

    const allPoolsGlobal = useSelector(state => state.allPools);

    const handleAddressChange = inputAddr => {
        setInputAddress(inputAddr);

        if (validation.isValidEthereumAddress(inputAddr)) {
            fetchData(inputAddr);
            // change the url so that the user fetches data for the same address when refreshing the page
            props.history.push({
                pathname: `/dashboard/${inputAddr}`,
            });
        }
    };

    let exceptionContent;
    let rightWrapperContent;
    const noPoolsSavedInRedux = Object.keys(allPoolsGlobal).length === 0;

    if (isFetchError) {
        exceptionContent = (
            <ErrorTextWrapper>
                An error occurred while fetching data :(
                <button
                    onClick={() => {
                        fetchData(`${inputAddress} `); // TODO run fetching procedure again in a cleaner way
                    }}
                >
                    Try again
                </button>
            </ErrorTextWrapper>
        );
    }

    if (isLoading) {
        exceptionContent = <LoadingBox>please wait a sec. We are getting pool data...</LoadingBox>;
    }

    if (noPoolsFound) {
        // TODO tell the user he cat try simulator in this case, once the simulator work for manual inputs
        exceptionContent = (
            <NoPoolFoundInfo>
                We didn't find any pools associated with this address.
                <br />
                Try different address.
            </NoPoolFoundInfo>
        );
    }

    if (noPoolsSavedInRedux && !exceptionContent) {
        rightWrapperContent = <NoAddressNoPool>Input your Ethereum address first!</NoAddressNoPool>;
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
                        <CardInfo />
                    </CardInfoWrapper>
                )}
            </RightWrapper>
        </DashboardContainer>
    );
};

export default Dashboard;
