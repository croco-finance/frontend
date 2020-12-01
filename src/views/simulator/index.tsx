import * as actionTypes from '@actionTypes';
import {
    NavBar,
    SimulatorContainer,
    LeftLayoutContainer,
    RightLayoutContainer,
} from '@components/layout';
import { GrayBox, Icon, Input, LoadingBox, MultipleTokenSelect, InfoBox } from '@components/ui';
import { animations, colors, variables, types, styles } from '@config';
import { formatUtils, validationUtils } from '@utils';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import styled from 'styled-components';
import { FetchSnapsForAddress } from '../../hooks';
import RightContainer from './components/RightContainer';
import BalanceOverview from './components/LeftContainer/BalanceOverview';
import SimulationBox from './components/LeftContainer/SimulationBox';
import { AllPoolsGlobal } from '@types';

const Header = styled.div`
    padding: 0 20px;
    width: 100%;
    display: flex;
    justify-content: center;
    background-color: ${colors.BACKGROUND};
    // border-bottom: 1px solid ${colors.STROKE_GREY};
`;

const LeftSubHeaderContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 0 10px 10px 10px;
    margin: 0 10px 10px 10px; // because of scrollbar - I don't want to have it all the way to the right
    width: 100%;
    height: 100%;
    max-width: 620px;
    align-self: center;
    ${styles.scrollBarStyles};

    @media (max-width: ${variables.SCREEN_SIZE.SM}) {
        // because choose pool options are not visible on mobile screen
        min-height: 60vh;
    }
`;

const HeaderContent = styled.div`
    width: 100%;
    max-width: 620px;
    border-bottom: 1px solid ${colors.STROKE_GREY};
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

const AddressWrapper = styled.div`
    width: 100%;
    max-width: 620px;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 20px;
    /* border-radius: 8px;
    padding: 6px;
    background-color: ${colors.BACKGROUND_DARK}; */
`;

const AddressLabel = styled.div`
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    padding-left: 5px;
    color: ${colors.FONT_MEDIUM};
`;

const CardInfoWrapper = styled.div`
    /* animation: ${animations.SHOW_UP} 1.5s; */
`;

const Section = styled.div`
    display: flex;
    width: 100%;
    margin-top: 40px;
`;

const SectionLabel = styled.div`
    width: 140px;
    font-size: ${variables.FONT_SIZE.NORMAL};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
`;

const ChoosePoolWrapper = styled(Section)`
    display: flex;
    align-items: center;
    width: 100%;
    margin-top: 40px;

    @media (max-width: ${variables.SCREEN_SIZE.SM}) {
        margin-top: 20px;
    }
`;

const MultipleSelectWrapper = styled.div`
    flex-grow: 1;
`;

const PoolSelectLabel = styled(SectionLabel)``;

const OverviewWrapper = styled.div`
    margin: 20px 0 30px 0;
    padding: 20px 20px;
    width: 100%;
`;

const SimulationBoxWrapper = styled.div`
    /* background-color: ${colors.WHITE}; */
    background-color: ${colors.BACKGROUND_DARK};
    padding: 28px;
    border-radius: 10px;
    width: 100%;
    /* border: 1px solid ${colors.STROKE_GREY}; */
`;

const buildPoolOption = (pool: types.PoolItem) => {
    if (pool) {
        const tokens: any = pool.pooledTokens;
        let value = { poolId: pool.poolId, tokens: new Array(tokens.length) };
        let label = '';

        tokens.forEach((token, i) => {
            let tokenWeight = formatUtils.getFormattedPercentageValue(token.weight, true);
            label = label + ` ${token.symbol.toUpperCase()} ${tokenWeight},`;
            value.tokens[i] = token.symbol;
        });

        return {
            value: value,
            label: label.slice(0, -1), // remove last char, which is '|',
        };
    }
    return null;
};

const buildPoolOptions = (pools: any) => {
    const poolKeys = Object.keys(pools);
    const poolsCount = poolKeys.length;
    const poolOptions = new Array(poolsCount);

    poolKeys.forEach((poolId, i) => {
        poolOptions[i] = buildPoolOption(pools[poolId]);
    });

    return poolOptions;
};

type PoolOption = ReturnType<typeof buildPoolOption>;

const getInitialPriceCoeffs = (tokens: any) => {
    let coefficients = new Array(tokens.length);
    coefficients.fill(1);
    return coefficients;
};

type TabOptions = 'overview' | 'strategies';

const Simulator = (props: RouteComponentProps<any>) => {
    const allPools: AllPoolsGlobal = useSelector(state => state.allPools);
    const selectedPoolId = useSelector(state => state.selectedPoolId);
    const dispatch = useDispatch();
    const [selectedTab, setSelectedTab] = useState<TabOptions>('overview');

    const [inputAddress, setInputAddress] = useState(
        props.match.params.address ? props.match.params.address : '',
    );

    const handleAddressChange = inputAddr => {
        // show in the input whatever user typed in, even if it's not a valid ETH address
        setInputAddress(inputAddr);

        // trim and lowercase the address
        const formattedAddress = inputAddr.trim().toLowerCase();
        if (validationUtils.isValidEthereumAddress(formattedAddress)) {
            fetchData(formattedAddress);
            // change the url so that the user fetches data for the same address when refreshing the page
            props.history.push({
                pathname: `/simulator/${formattedAddress}`,
            });
        }
    };

    const [{ isLoading, noPoolsFound, isFetchError }, fetchData] = FetchSnapsForAddress(
        props.match.params.address ? props.match.params.address : '',
    );

    // SIMULATOR FUNCTIONS
    const [simulatedPriceCoefficients, setSimulatedPriceCoefficients]: any = useState(
        allPools[selectedPoolId]
            ? getInitialPriceCoeffs(allPools[selectedPoolId].pooledTokens)
            : [],
    );

    const [simulatedEthPriceCoefficient, setSimulatedEthPriceCoefficient] = useState(1);
    const [simulatedYieldPriceCoefficient, setSimulatedYieldPriceCoefficient] = useState(1);

    const [sliderDefaultCoeffs, setSliderDefaultCoeffs]: any = useState(
        allPools[selectedPoolId]
            ? getInitialPriceCoeffs(allPools[selectedPoolId].pooledTokens)
            : [],
    );

    const setNewPrices = (newValue, index) => {
        const coefficientsArrCopy = [...simulatedPriceCoefficients];
        coefficientsArrCopy[index] = newValue;
        setSimulatedPriceCoefficients(coefficientsArrCopy);
    };

    const setNewEthPrice = newValue => {
        setSimulatedEthPriceCoefficient(newValue);
    };

    const setNewYieldPrice = newValue => {
        setSimulatedYieldPriceCoefficient(newValue);
    };

    const setNewDefaultCoeffs = (newValue, index) => {
        const coefficientsArrCopy = [...simulatedPriceCoefficients];
        coefficientsArrCopy[index] = newValue;
        setSliderDefaultCoeffs(coefficientsArrCopy);
    };

    useEffect(() => {
        if (allPools[selectedPoolId]) {
            const newPool = allPools[selectedPoolId];
            setSimulatedPriceCoefficients(getInitialPriceCoeffs(newPool.pooledTokens));
            setSliderDefaultCoeffs(getInitialPriceCoeffs(newPool.pooledTokens));
        }
    }, [selectedPoolId]);

    const poolOptions = buildPoolOptions(allPools);

    let exceptionContent;

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

    return (
        <SimulatorContainer>
            <LeftLayoutContainer backgroundColor={colors.BACKGROUND}>
                <Header>
                    <HeaderContent>
                        <NavBar></NavBar>
                    </HeaderContent>
                </Header>
                <LeftSubHeaderContent>
                    <AddressWrapper>
                        <Input
                            // noBorder
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
                    </AddressWrapper>

                    {exceptionContent ? (
                        exceptionContent
                    ) : Object.keys(allPools).length > 0 ? (
                        <ChoosePoolWrapper>
                            {/* TODO add Exchange icon (Balancer/Uniswap) */}
                            <PoolSelectLabel>Choose pool:</PoolSelectLabel>
                            <MultipleSelectWrapper>
                                <MultipleTokenSelect
                                    options={poolOptions}
                                    onChange={(option: PoolOption) => {
                                        // setIsFetchingPrices(true);
                                        option &&
                                            dispatch({
                                                type: actionTypes.SET_SELECTED_POOL_ID,
                                                poolId: option.value.poolId,
                                            });
                                    }}
                                    selected={buildPoolOption(allPools[selectedPoolId])}
                                    useWhiteBackground
                                    useDarkBorder
                                ></MultipleTokenSelect>
                            </MultipleSelectWrapper>
                        </ChoosePoolWrapper>
                    ) : null}

                    {allPools[selectedPoolId] && (
                        <>
                            {!allPools[selectedPoolId].isActive ? (
                                <InfoBox>
                                    You have already withdrawn all funds from this pool. Below you
                                    see prices and balances at the time of your withdrawal.
                                </InfoBox>
                            ) : null}
                        </>
                    )}

                    {allPools[selectedPoolId] && !exceptionContent && (
                        <>
                            <OverviewWrapper>
                                <BalanceOverview />
                            </OverviewWrapper>
                            <SimulationBoxWrapper>
                                <SimulationBox
                                    selectedTab={selectedTab}
                                    onChange={setNewPrices}
                                    onEthChange={setNewEthPrice}
                                    onYieldChange={setNewYieldPrice}
                                    onNewDefaultValue={setNewDefaultCoeffs}
                                    onNewDefaultEthValue={newValue =>
                                        setSimulatedEthPriceCoefficient(newValue)
                                    }
                                    simulatedCoefficients={simulatedPriceCoefficients}
                                    simulatedEthCoefficient={simulatedEthPriceCoefficient}
                                />
                            </SimulationBoxWrapper>
                        </>
                    )}
                </LeftSubHeaderContent>
            </LeftLayoutContainer>
            <RightLayoutContainer>
                <RightContainer
                    onTabChanged={tab => setSelectedTab(tab)}
                    selectedTab={selectedTab}
                    simulatedPooledTokensCoeffs={simulatedPriceCoefficients}
                    sliderDefaultCoeffs={sliderDefaultCoeffs}
                    simulatedEthCoeff={simulatedEthPriceCoefficient}
                    simulatedYieldCoeff={simulatedYieldPriceCoefficient}
                />
            </RightLayoutContainer>
        </SimulatorContainer>
    );
};
export default withRouter(Simulator);
