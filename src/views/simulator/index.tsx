import {
    changeSelectedPool,
    setSelectedPoolId,
    fetchPoolSnap,
    setNewSimulationPoolData,
    resetPoolSnapData,
    setSimulationMode,
} from '@actions';
import { AddressSelect } from '@components/containers';
import { LeftLayoutContainer, RightLayoutContainer, SimulatorContainer } from '@components/layout';
import {
    InfoBox,
    LoadingBox,
    MultipleTokenSelect,
    Input,
    Spinner,
    TabSelectHeader,
} from '@components/ui';
import { analytics, styles, types, variables, colors } from '@config';
import { useTheme } from '@hooks';
import { useSelector } from '@reducers';
import { AllPoolsGlobal, TokenType, SimulatorStateInterface } from '@types';
import { formatUtils, validationUtils } from '@utils';
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
    max-width: 620px;
    align-self: center;
    ${styles.scrollBarStyles};

    @media (max-width: ${variables.SCREEN_SIZE.LG}) {
        // because choose pool options are not visible on mobile screen
        min-height: 60vh;
    }
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

const StyledTabSelectHeader = styled(TabSelectHeader)`
    margin-bottom: 20px;
    border-color: ${props => props.theme.STROKE_GREY};
`;
const NoPoolFoundInfo = styled(ExceptionWrapper)`
    color: ${props => props.theme.FONT_MEDIUM};
`;

const ErrorTextWrapper = styled(ExceptionWrapper)`
    color: ${props => props.theme.FONT_DARK};
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

const PoolDataEntryWrapper = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 14px;
    // background-color: ${props => props.theme.BACKGROUND_DARK};
`;

const SelectLabel = styled.div`
    color: ${props => props.theme.FONT_MEDIUM};
    padding-bottom: 10px;
    align-self: end;
`;

const Section = styled.div`
    display: flex;
    width: 100%;
    margin-top: 40px;
`;

const ChoosePoolWrapper = styled(Section)`
    display: flex;
    align-items: center;
    align-self: baseline;
    width: 100%;
    max-width: 511px;
    margin-top: 10px;

    @media (max-width: ${variables.SCREEN_SIZE.SM}) {
        margin-top: 20px;
    }
`;

const PoolImportWrapper = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    padding-bottom: 24px;
`;

const PoolImportInputWrapper = styled.div`
    display: flex;
`;

const AddPoolButton = styled.button<{ disabled: boolean }>`
    background-color: ${props =>
        props.disabled ? props.theme.BUTTON_PRIMARY_BG_DISABLED : props.theme.BUTTON_PRIMARY_BG};
    color: ${props => (props.disabled ? props.theme.BUTTON_PRIMARY_FONT_DISABLED : 'white')};
    border-radius: 5px;
    font-weight: ${variables.FONT_WEIGHT.DEMI_BOLD};
    font-size: ${variables.FONT_SIZE.NORMAL};
    padding: 12px;
    border: none;
    margin-left: 10px;
    cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
    display: flex;
    align-items: center;
    justify-content: center;

    &:focus {
        outline: 0;
    }

    &:hover {
        background-color: ${props =>
            props.disabled
                ? props.theme.BUTTON_PRIMARY_BG_DISABLED
                : props.theme.BUTTON_PRIMARY_BG_HOVER};
    }
`;

const MultipleSelectWrapper = styled.div`
    flex-grow: 1;
`;

const OverviewWrapper = styled.div`
    margin: 6px 0 30px 0;
    padding: 16px;
    width: 100%;
`;

const SimulationBoxWrapper = styled.div`
    background-color: ${props => props.theme.BACKGROUND_DARK};
    padding: 28px;
    border-radius: 10px;
    width: 100%;
`;

const PoolInvestmentWrapper = styled.div`
    display: flex;
    align-items: center;
    margin-top: 16px;
`;

const PoolInvestmentLabel = styled.div`
    display: flex;
    color: ${props => props.theme.FONT_DARK};
    margin-right: 12px;
    padding-left: 6px;
`;

const PoolInvestmentInputWrapper = styled.div`
    width: 120px;
`;

const InvestedCurrency = styled.div`
    text-transform: uppercase;
    color: ${props => props.theme.FONT_LIGHT};
    margin-left: 10px;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
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
        // allow to choose active pools
        if (pools[poolId].isActive) {
            poolOptions[i] = buildPoolOption(pools[poolId], poolId);
        }
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
type ImportPoolTabOptions = 'positions' | 'import';

const Simulator = () => {
    const allPools = useSelector(state => state.app.allPools);
    const selectedPoolId: string = useSelector(state => state.app.selectedPoolId);
    const dispatch = useDispatch();
    const [selectedTab, setSelectedTab] = useState<TabOptions>('il');
    const isLoading: boolean = useSelector(state => state.app.loading);
    const isFetchError: boolean = useSelector(state => state.app.error);
    const noPoolsFound: boolean = useSelector(state => state.app.noPoolsFound);
    // pool import
    const [importedPoolAddress, setImportedPoolAddress] = useState('');
    const [isImportedPoolAddressValid, setIsImportedPoolAddressValid] = useState(false);
    const [importedPoolInvestment, setImportedPoolInvestment] = useState('');
    const [isUsePoolActive, setIsUsePoolActive] = useState(false);

    // simulation pool data
    const {
        poolId,
        tokenSymbols,
        tokenWeights,
        yieldTokenSymbol,
        ethPriceUsd,
        tokenPricesUsd,
        userTokenBalances,
        simulationMode,
        poolSnapFetchError,
        poolSnapLoading,
        poolSnapError,
        poolSnapData,
    } = useSelector(state => state.simulator);

    // theme
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

    const handleInvestedAmountChanged = (amount: string) => {
        if (!poolSnapData) return;
        // compute how much tokens the user have according to the invested amount

        const tokenCounts = poolSnapData.tokens.length;
        const investedAmountTotal = parseInt(amount);
        const investedAmountsUsd: number[] = new Array(tokenCounts);
        const userTokenBalances: number[] = new Array(tokenCounts);
        const tokenSymbols: TokenType[] = new Array(tokenCounts);
        const tokenWeights: number[] = new Array(tokenCounts);
        const tokenPricesUsd: number[] = new Array(tokenCounts);

        if (poolSnapData) {
            poolSnapData.tokens.forEach((token, i) => {
                const investedToToken = token.weight * investedAmountTotal;
                tokenWeights[i] = token.weight;
                tokenPricesUsd[i] = token.priceUsd;
                investedAmountsUsd[i] = investedToToken;
                userTokenBalances[i] = investedToToken / token.priceUsd;
                tokenSymbols[i] = token.token.symbol as TokenType;
            });

            dispatch(
                setNewSimulationPoolData(
                    importedPoolAddress,
                    tokenSymbols,
                    tokenWeights,
                    null,
                    tokenPricesUsd,
                    poolSnapData.ethPrice,
                    userTokenBalances,
                ),
            );
        }
    };

    const handlePoolImportTabChange = (tabName: ImportPoolTabOptions) => {
        dispatch(setSimulationMode(tabName));
        // reset pool data
        dispatch(resetPoolSnapData());
        // reset selected Pool ID
        dispatch(setSelectedPoolId(''));
        // reset pool investment amount
        setImportedPoolInvestment('');
    };

    const handlePoolSelectionChange = (poolId: string) => {
        const pool = allPools[poolId];
        const { yieldToken, tokenWeights, tokenSymbols } = pool;
        const { tokenPricesEnd, ethPriceEnd, tokenBalances } = pool.cumulativeStats;
        const yieldTokenSymbol = yieldToken?.symbol;

        dispatch(
            setNewSimulationPoolData(
                poolId,
                tokenSymbols,
                tokenWeights,
                yieldTokenSymbol,
                tokenPricesEnd,
                ethPriceEnd,
                tokenBalances,
            ),
        );
    };

    // import pool
    const handleImportAddressChange = input => {
        dispatch(resetPoolSnapData());
        setImportedPoolInvestment('');
        setImportedPoolAddress(input);
        setIsUsePoolActive(false);

        // check for ETH address validity
        if (validationUtils.isValidEthereumAddress(input)) {
            setIsImportedPoolAddressValid(true);
            setIsUsePoolActive(true);
            return;
        } else {
            setIsImportedPoolAddressValid(false);
        }
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

    const showData = poolId && tokenSymbols && tokenWeights && ethPriceUsd && tokenPricesUsd;
    return (
        <>
            <SimulatorContainer>
                <LeftLayoutContainer backgroundColor={theme.BACKGROUND}>
                    <LeftSubHeaderContent>
                        <PageHeadline>Simulator</PageHeadline>
                        <StyledTabSelectHeader
                            focusColor={theme.FONT_DARK}
                            bold
                            onSelectTab={tabName => handlePoolImportTabChange(tabName)}
                            tabHeadlines={['Your positions', 'Import pool']}
                            tabIds={['positions', 'import']}
                        />

                        <PoolDataEntryWrapper>
                            {simulationMode === 'positions' ? (
                                <>
                                    <SelectLabel>Choose from your active positions</SelectLabel>
                                    <AddressSelect />
                                    {exceptionContent ? null : allPools &&
                                      Object.keys(allPools).length > 0 ? (
                                        <ChoosePoolWrapper>
                                            <MultipleSelectWrapper>
                                                <MultipleTokenSelect
                                                    options={buildPoolOptions(allPools)}
                                                    onChange={(option: PoolOption) => {
                                                        if (option) {
                                                            handlePoolSelectionChange(
                                                                option.value.poolId,
                                                            );
                                                            dispatch(
                                                                changeSelectedPool(
                                                                    option.value.poolId,
                                                                ),
                                                            );
                                                        }
                                                    }}
                                                    selected={buildPoolOption(
                                                        allPools[selectedPoolId],
                                                        selectedPoolId,
                                                    )}
                                                    useWhiteBackground
                                                    useDarkBorder
                                                    placeholder={'Select pool...'}
                                                ></MultipleTokenSelect>
                                            </MultipleSelectWrapper>
                                        </ChoosePoolWrapper>
                                    ) : null}
                                </>
                            ) : (
                                <PoolImportWrapper>
                                    <SelectLabel>
                                        Import pool by its address (from Uniswap, Balancer or
                                        Sushiswap)
                                    </SelectLabel>
                                    <PoolImportInputWrapper>
                                        <Input
                                            placeholder="Pool address (e.g. 0xbb2b8038a1640196fbe3e38816f3e67cba72d940)"
                                            onChange={event => {
                                                handleImportAddressChange(
                                                    event.target.value.trim(),
                                                );
                                                setImportedPoolAddress(event.target.value.trim());
                                            }}
                                            useWhiteBackground
                                            useDarkBorder
                                            value={importedPoolAddress}
                                        />
                                        <AddPoolButton
                                            disabled={!isUsePoolActive}
                                            onClick={() => {
                                                dispatch(fetchPoolSnap(importedPoolAddress));
                                                dispatch(setSimulationMode('import'));
                                                setIsUsePoolActive(false);
                                            }}
                                        >
                                            {poolSnapLoading ? (
                                                <Spinner size={14} color={colors.FONT_MEDIUM} />
                                            ) : (
                                                'Import'
                                            )}
                                        </AddPoolButton>
                                    </PoolImportInputWrapper>
                                    {simulationMode === 'import' &&
                                        poolSnapData &&
                                        !isUsePoolActive && (
                                            <PoolInvestmentWrapper>
                                                <PoolInvestmentLabel>
                                                    Type how much you want to invest to the pool
                                                </PoolInvestmentLabel>

                                                <PoolInvestmentInputWrapper>
                                                    <Input
                                                        onChange={event => {
                                                            handleInvestedAmountChanged(
                                                                event.target.value.trim(),
                                                            );
                                                            setImportedPoolInvestment(
                                                                event.target.value.trim(),
                                                            );
                                                        }}
                                                        useWhiteBackground
                                                        useDarkBorder
                                                        value={importedPoolInvestment}
                                                    />
                                                </PoolInvestmentInputWrapper>
                                                <InvestedCurrency>USD</InvestedCurrency>
                                            </PoolInvestmentWrapper>
                                        )}

                                    {poolSnapError && <div>Error fetching pool snap</div>}
                                </PoolImportWrapper>
                            )}
                        </PoolDataEntryWrapper>

                        {exceptionContent ? exceptionContent : null}

                        {showData && !exceptionContent && (
                            <>
                                <OverviewWrapper>
                                    <BalanceOverview
                                        tokenWeights={tokenWeights}
                                        tokenPricesUsd={tokenPricesUsd}
                                        tokenBalances={userTokenBalances}
                                        tokenSymbols={tokenSymbols}
                                    />
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
                                        tokenSymbols={tokenSymbols}
                                        poolId={poolId}
                                        yieldTokenSymbol={yieldTokenSymbol}
                                        tokenPrices={tokenPricesUsd}
                                        ethPrice={ethPriceUsd}
                                    />
                                </SimulationBoxWrapper>
                            </>
                        )}
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
