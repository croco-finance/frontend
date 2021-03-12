import { changeSelectedPool } from '@actions';
import { AddressSelect } from '@components/containers';
import { LeftLayoutContainer, RightLayoutContainer, SimulatorContainer } from '@components/layout';
import { InfoBox, LoadingBox, MultipleTokenSelect } from '@components/ui';
import { analytics, styles, types, variables } from '@config';
import { useTheme } from '@hooks';
import { useSelector } from '@reducers';
import { AllPoolsGlobal } from '@types';
import { formatUtils } from '@utils';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { withRouter } from 'react-router';
import styled from 'styled-components';
import BalanceOverview from './components/LeftContainer/BalanceOverview';
import SimulationBox from './components/LeftContainer/SimulationBox';
import RightContainer from './components/RightContainer';

const PageHeadline = styled.div`
    color: ${props => props.theme.FONT_DARK};
    font-size: ${variables.FONT_SIZE.H1};
    font-weight: ${variables.FONT_WEIGHT.BOLD};
    align-self: baseline;
    margin-bottom: 30px;
    margin-top: 12px;
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
    max-width: 580px;
    align-self: center;
    ${styles.scrollBarStyles};

    @media (max-width: ${variables.SCREEN_SIZE.LG}) {
        // because choose pool options are not visible on mobile screen
        min-height: 60vh;
    }
`;

const HeaderContent = styled.div`
    width: 100%;
    max-width: 620px;
    border-bottom: 1px solid ${props => props.theme.STROKE_GREY};
`;

const ExceptionWrapper = styled.div`
    display: flex;
    height: 260px;
    align-items: center;
    justify-content: center;
    font-weight: ${variables.FONT_WEIGHT.DEMI_BOLD};
    flex-direction: column;
    background-color: ${props => props.theme.BACKGROUND};
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

const AddressWrapper = styled.div`
    width: 100%;
    // max-width: 540px;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const ContentWrapper = styled.div`
    // max-width: 540px;
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
    margin-top: 10px;

    @media (max-width: ${variables.SCREEN_SIZE.SM}) {
        margin-top: 20px;
    }
`;

const MultipleSelectWrapper = styled.div`
    flex-grow: 1;
`;

const PoolSelectLabel = styled(SectionLabel)`
    color: ${props => props.theme.FONT_DARK};
`;

const OverviewWrapper = styled.div`
    margin: 20px 0 30px 0;
    padding: 20px 20px;
    width: 100%;
`;

const SimulationBoxWrapper = styled.div`
    background-color: ${props => props.theme.BACKGROUND_DARK};
    padding: 28px;
    border-radius: 10px;
    width: 100%;
`;

const buildPoolOption = (poolData: types.PoolItem, uniquePoolId: string) => {
    if (poolData) {
        // pool.poolId is not unique in case there are more addresses with deposits in the same pool
        const tokens = poolData.pooledTokens;
        let value = { poolId: uniquePoolId, tokens: new Array(tokens.length) };
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

const buildPoolOptions = (pools: AllPoolsGlobal) => {
    const poolKeys = Object.keys(pools);
    const poolsCount = poolKeys.length;
    const poolOptions = new Array(poolsCount);

    poolKeys.forEach((poolId, i) => {
        poolOptions[i] = buildPoolOption(pools[poolId], poolId);
    });

    return poolOptions;
};

type PoolOption = ReturnType<typeof buildPoolOption>;

const getInitialPriceCoeffs = (tokens: any) => {
    let coefficients = new Array(tokens.length);
    coefficients.fill(1);
    return coefficients;
};

type TabOptions = 'il' | 'strategies';

const Simulator = () => {
    const allPools: AllPoolsGlobal = useSelector(state => state.app.allPools);
    const selectedPoolId: string = useSelector(state => state.app.selectedPoolId);
    const dispatch = useDispatch();
    const [selectedTab, setSelectedTab] = useState<TabOptions>('il');
    const isLoading: boolean = useSelector(state => state.app.loading);
    const isFetchError: boolean = useSelector(state => state.app.error);
    const noPoolsFound: boolean = useSelector(state => state.app.noPoolsFound);
    const theme = useTheme();

    // SIMULATOR FUNCTIONS
    const [simulatedPriceCoefficients, setSimulatedPriceCoefficients] = useState<number[]>(
        allPools && allPools[selectedPoolId]
            ? getInitialPriceCoeffs(allPools[selectedPoolId].pooledTokens)
            : [],
    );

    const [simulatedEthPriceCoefficient, setSimulatedEthPriceCoefficient] = useState(1);
    const [simulatedYieldPriceCoefficient, setSimulatedYieldPriceCoefficient] = useState(1);

    const [sliderDefaultCoeffs, setSliderDefaultCoeffs]: any = useState(
        allPools && allPools[selectedPoolId]
            ? getInitialPriceCoeffs(allPools[selectedPoolId].pooledTokens)
            : [],
    );

    const [sliderDefaultEthPriceCoefficient, setSliderDefaultEthPriceCoefficient] = useState(1);

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
        if (allPools && allPools[selectedPoolId]) {
            const newPool = allPools[selectedPoolId];
            setSimulatedPriceCoefficients(getInitialPriceCoeffs(newPool.pooledTokens));
            setSliderDefaultCoeffs(getInitialPriceCoeffs(newPool.pooledTokens));
            setSimulatedEthPriceCoefficient(1);
            setSliderDefaultEthPriceCoefficient(1);
            setSimulatedYieldPriceCoefficient(1);
        }
    }, [selectedPoolId]);

    const handleTabChange = (tab: TabOptions) => {
        analytics.logEvent(`simulator_${tab}_view`);
        setSelectedTab(tab);
    };

    const refreshPage = () => {
        window.location.reload();
    };

    let exceptionContent;

    if (!allPools) {
        exceptionContent = <ErrorTextWrapper>No pools found :(</ErrorTextWrapper>;
    }

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
        <>
            <SimulatorContainer>
                <LeftLayoutContainer backgroundColor={theme.BACKGROUND}>
                    <LeftSubHeaderContent>
                        <AddressWrapper>
                            <PageHeadline>Simulator</PageHeadline>
                            <AddressSelect />
                            {/* <AddPoolButton>Add Custom Pools</AddPoolButton> */}
                        </AddressWrapper>
                        {/* <ContentWrapper> */}
                        {exceptionContent ? (
                            exceptionContent
                        ) : allPools && Object.keys(allPools).length > 0 ? (
                            <ChoosePoolWrapper>
                                <PoolSelectLabel>Choose pool:</PoolSelectLabel>
                                <MultipleSelectWrapper>
                                    <MultipleTokenSelect
                                        options={buildPoolOptions(allPools)}
                                        onChange={(option: PoolOption) => {
                                            if (option)
                                                dispatch(changeSelectedPool(option.value.poolId));
                                        }}
                                        selected={buildPoolOption(
                                            allPools[selectedPoolId],
                                            selectedPoolId,
                                        )}
                                        useWhiteBackground
                                        useDarkBorder
                                    ></MultipleTokenSelect>
                                </MultipleSelectWrapper>
                            </ChoosePoolWrapper>
                        ) : null}

                        {allPools && allPools[selectedPoolId] && !exceptionContent && (
                            <>
                                {!allPools[selectedPoolId].isActive ? (
                                    <InfoBox>
                                        You have already withdrawn all funds from this pool. Below
                                        you see prices and balances at the time of your withdrawal.
                                    </InfoBox>
                                ) : null}
                            </>
                        )}

                        {allPools && allPools[selectedPoolId] && !exceptionContent && (
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
                                            setSliderDefaultEthPriceCoefficient(newValue)
                                        }
                                        simulatedCoefficients={simulatedPriceCoefficients}
                                        simulatedEthCoefficient={simulatedEthPriceCoefficient}
                                    />
                                </SimulationBoxWrapper>
                            </>
                        )}
                        {/* </ContentWrapper> */}
                    </LeftSubHeaderContent>
                </LeftLayoutContainer>
                <RightLayoutContainer>
                    <RightContainer
                        onTabChanged={tab => handleTabChange(tab)}
                        selectedTab={selectedTab}
                        simulatedPooledTokensCoeffs={simulatedPriceCoefficients}
                        sliderDefaultCoeffs={sliderDefaultCoeffs}
                        simulatedEthCoeff={simulatedEthPriceCoefficient}
                        simulatedYieldCoeff={simulatedYieldPriceCoefficient}
                        sliderDefaultEthCoeff={sliderDefaultEthPriceCoefficient}
                    />
                </RightLayoutContainer>
            </SimulatorContainer>
        </>
    );
};
export default withRouter(Simulator);
