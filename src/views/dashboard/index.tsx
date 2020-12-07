import {
    DashboardContainer,
    LeftLayoutContainer,
    RightLayoutContainer,
    NavBar,
    Modal,
} from '@components/layout';
import { Input, LoadingBox, SocialButtonBubble, Icon, Select } from '@components/ui';
import { AddressModal } from '@components/containers';
import { animations, colors, variables, styles } from '@config';
import { validationUtils } from '@utils';
import React, { useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import styled from 'styled-components';
import { FetchSnapsForAddress } from '../../hooks';
import RightContainer from './components/RightContainer';
import PoolList from './components/LeftContainer/PoolList';
import SummaryList from './components/LeftContainer/SummaryList';
import { useDispatch, useSelector } from 'react-redux';
import { AllAddressesGlobal } from '@types';

const Header = styled.div`
    width: 100%;
    /* padding-bottom: 44px; */
    /* max-width: 540px; */
    display: flex;
    justify-content: center;
    background-color: ${colors.BACKGROUND};
    padding: 0 20px;
`;

const HeaderContent = styled.div`
    width: 100%;
    max-width: 620px;
    border-bottom: 1px solid ${colors.STROKE_GREY};

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

const AddressLabel = styled.div`
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    padding-left: 5px;
    color: ${colors.FONT_MEDIUM};
`;

const LeftSubHeaderContent = styled.div`
    margin: 0 10px 10px 10px; // because of scrollbar - I don't want to have it all the way to the right
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
    color: ${colors.FONT_MEDIUM};
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

const ManageAddressesButton = styled.button`
    border: none;
    background-color: ${colors.BACKGROUND_DARK};
    padding: 12px 15px;
    border-radius: 5px;
    margin-left: 10px;
    cursor: pointer;
    /* border: 1px solid ${colors.STROKE_GREY}; */

    &:focus {
        border: none;
        outline: none;
    }

    &:hover {
        background-color: ${colors.STROKE_GREY};
    }
`;

const buildAddressOptions = (addresses: string[]) => {
    const addressesCount = addresses.length;
    const addressOptions = new Array(addressesCount);

    addresses.forEach((address, i) => {
        addressOptions[i] = {
            value: address,
            label: address,
        };
    });

    addressOptions.push({
        value: 'bundled',
        label: 'Bundled Wallets',
    });

    return addressOptions;

    // if (addressesCount > 1) {
    //     const addressOptions = new Array(addressesCount);

    //     addresses.forEach((address, i) => {
    //         addressOptions[i] = {
    //             value: address,
    //             label: address,
    //         };
    //     });

    //     addressOptions.push({
    //         value: 'bundled',
    //         label: 'BUNDLED ADDRESSES',
    //     });

    //     return addressOptions;
    // }

    // return {
    //     value: addresses[0],
    //     label: addresses[0],
    // };
};

interface AddressOption {
    value: string | 'bundled';
    label: string;
}

const Dashboard = (props: RouteComponentProps<any>) => {
    const dispatch = useDispatch();
    const allAddresses: AllAddressesGlobal = useSelector(state => state.allAddresses);

    const [inputAddress, setInputAddress] = useState(
        props.match.params.address ? props.match.params.address : '',
    );
    const allPoolsGlobal = useSelector(state => state.allPools);
    const [showAddressModal, setShowAddressModal] = useState(false);

    const [{ isLoading, noPoolsFound, isFetchError }, fetchData] = FetchSnapsForAddress(
        props.match.params.address ? props.match.params.address : '',
    );

    const handleAddressChange = inputAddr => {
        // show in the input whatever user typed in, even if it's not a valid ETH address
        setInputAddress(inputAddr);

        if (inputAddr === 'bundled') {
            // fetchData(inputAddr);
        } else if (validationUtils.isValidEthereumAddress(inputAddr)) {
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
                Don't forget that we support only Uniswap and Balancer at this time.
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
            <LeftLayoutContainer backgroundColor={colors.BACKGROUND}>
                <Header>
                    <HeaderContent>
                        <NavBar />
                    </HeaderContent>
                </Header>
                <LeftSubHeaderContent>
                    <AddressWrapper>
                        <Select
                            // textIndent={[70, 0]}
                            // innerAddon={<AddressLabel>Address:</AddressLabel>}
                            // addonAlign="left"
                            // placeholder="Enter valid Ethereum address"
                            // value={inputAddress}
                            // onChange={event => {
                            //     handleAddressChange(event.target.value);
                            // }}
                            // useWhiteBackground
                            // useDarkBorder
                            // noBorder

                            options={buildAddressOptions(Object.keys(allAddresses))}
                            onChange={(option: AddressOption) => {
                                handleAddressChange(option.value);
                            }}
                            selected={['a']}
                            useWhiteBackground
                            useDarkBorder
                        />

                        <ManageAddressesButton
                            onClick={() => {
                                setShowAddressModal(true);
                            }}
                        >
                            <Icon icon="edit" size={18} />
                        </ManageAddressesButton>

                        {showAddressModal && (
                            <Modal
                                cancelable
                                onCancel={() => setShowAddressModal(false)}
                                heading={'Manage addresses'}
                            >
                                <AddressModal />
                            </Modal>
                        )}
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
    );
};

export default withRouter(Dashboard);
