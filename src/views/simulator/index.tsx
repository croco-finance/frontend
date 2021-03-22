import {
    changeSelectedPool,
    fetchPoolSnap,
    resetPoolSnapData,
    setDefaultSliderEthCoefficient,
    setDefaultSliderTokenCoefficient,
    setEthCoefficient,
    setNewSimulationPoolData,
    setSelectedPoolId,
    setSimulationMode,
    setTokenCoefficients,
    setYieldCoefficient,
    resetSimulationCoefficients,
} from '@actions';
import { AddressSelect } from '@components/containers';
import { LeftLayoutContainer, RightLayoutContainer, SimulatorContainer } from '@components/layout';
import {
    Input,
    LoadingBox,
    MultipleTokenSelect,
    Spinner,
    TabSelectHeader,
    QuestionTooltip,
    SadCrocoBox,
} from '@components/ui';
import { analytics, colors, styles, types, variables, constants } from '@config';
import { useTheme } from '@hooks';
import { useSelector } from '@reducers';
import { AllPoolsGlobal, DailyData, SimulatorStateInterface, TokenType } from '@types';
import { formatUtils, validationUtils } from '@utils';
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router';
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

    @media (max-width: ${variables.SCREEN_SIZE.SM}) {
        margin-bottom: 20px;
    }
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
    overflow-y: auto;
    ${styles.scrollBarStyles};

    @media (max-width: ${variables.SCREEN_SIZE.LG}) {
        // because choose pool options are not visible on mobile screen
        min-height: 60vh;
    }
`;

const StyledTabSelectHeader = styled(TabSelectHeader)`
    margin-bottom: 20px;
    border-color: ${props => props.theme.STROKE_GREY};
`;

const ExceptionWrapper = styled.div`
    display: flex;
    height: 260px;
    align-items: center;
    justify-content: center;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    flex-direction: column;
    margin-top: 24px;
    text-align: center;
    padding: 20px;
    line-height: 26px;
`;

const NoAddressNoPool = styled(ExceptionWrapper)`
    width: 100%;
    height: 100px;
    color: ${props => props.theme.FONT_LIGHT};
    font-size: ${variables.FONT_SIZE.H3};
`;

const RefreshPageDescWrapper = styled.div`
    display: flex;
    flex-direction: column;
`;

const RefreshButton = styled.button`
    color: white;
    background-color: ${props => props.theme.BUTTON_PRIMARY_BG};
    font-weight: ${variables.FONT_WEIGHT.DEMI_BOLD};
    padding: 10px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin: 16px auto 0 auto;
    outline: none;
`;

const PoolDataEntryWrapper = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 14px;
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
`;

const PoolImportInputWrapper = styled.div`
    display: flex;
`;

const PoolInvestmentWrapper = styled.div`
    display: flex;
    align-items: center;
    padding: 8px 14px 20px 14px;
    width: 100%;
}
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

    &:hover {setNewPrices
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

const StyledQuestionTooltip = styled(QuestionTooltip)`
    display: inline-block;
`;

const DexPairLink = styled.a`
    color: ${props => props.theme.BLUE};
    text-decoration: none;
`;

const buildPoolOption = (poolData: types.PoolItem, uniquePoolId: string) => {
    if (poolData) {
        // pool.poolId is not unique in case there are more addresses with deposits in the same pool
        const tokens = poolData.pooledTokens;
        const value = { poolId: uniquePoolId, tokens: new Array(tokens.length) };
        let label = '';

        tokens.forEach((token, i) => {
            const tokenWeight = formatUtils.getFormattedPercentageValue(token.weight, true);
            label += ` ${token.symbol.toUpperCase()} ${tokenWeight},`;
            value.tokens[i] = token.symbol;
        });

        return {
            value,
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
type StatisticsTabOptions = 'il' | 'strategies';

const Simulator = (props: RouteComponentProps<any>) => {
    // theme
    const themeColors = useTheme();
    // pool data
    const { allPools, selectedPoolId, selectedAddress } = useSelector(state => state.app);
    const dispatch = useDispatch();
    const [selectedTab, setSelectedTab] = useState<StatisticsTabOptions>('il');
    const isLoading = useSelector(state => state.app.loading);
    const isFetchError = useSelector(state => state.app.error);
    const noPoolsFound = useSelector(state => state.app.noPoolsFound);
    // pool import
    const [importedPoolAddress, setImportedPoolAddress] = useState('');
    const [isImportedPoolAddressValid, setIsImportedPoolAddressValid] = useState(false);
    const [importedPoolInvestment, setImportedPoolInvestment] = useState('');

    // when the page is loaded, reset everything
    useEffect(() => {
        const initSimulator = () => {
            // check if there is some address in url and if it's valid
            let poolIdUrl: string | undefined = props.match.params.poolId;
            if (poolIdUrl) poolIdUrl = poolIdUrl.trim().toLowerCase();
            if (poolIdUrl && validationUtils.isValidEthereumAddress(poolIdUrl)) {
                // set import mode
                dispatch(setSimulationMode('import'));
                // paste address from URL to input
                setImportedPoolAddress(poolIdUrl);
                // mark address as valid
                setIsImportedPoolAddressValid(true);
                // fetch data for pool in URL
                dispatch(fetchPoolSnap(poolIdUrl));
                analytics.logEvent('import_pool_url', {
                    poolAddress: poolIdUrl,
                });
            } else {
                // clear url
                props.history.push({
                    pathname: `/simulator`,
                });

                dispatch(setSimulationMode('positions'));
                if (
                    allPools &&
                    selectedPoolId &&
                    allPools[selectedPoolId] &&
                    allPools[selectedPoolId].isActive
                ) {
                    const pool = allPools[selectedPoolId];
                    const { tokenWeights, tokenSymbols } = pool;
                    const { tokenPricesEnd, ethPriceEnd, tokenBalances } = pool.cumulativeStats;
                    const yieldTokenSymbol = '';

                    dispatch(
                        setNewSimulationPoolData(
                            pool.poolId,
                            tokenSymbols,
                            tokenWeights,
                            yieldTokenSymbol,
                            tokenPricesEnd,
                            ethPriceEnd,
                            tokenBalances,
                            pool.exchange,
                            null,
                            null,
                            null,
                        ),
                    );

                    dispatch(resetSimulationCoefficients(tokenBalances.length));
                } else {
                    // reset pool data
                    dispatch(resetPoolSnapData());
                    // reset selected Pool ID
                    dispatch(setSelectedPoolId(''));
                }
            }
        };

        initSimulator();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
        poolSnapData,
        // simulation coefficients
        simulatedTokenCoefficients,
        simulatedEthCoefficient,
        simulatedYieldCoefficient,
        defaultSliderTokenCoefficients,
        defaultSliderEthCoefficient,
    } = useSelector(state => state.simulator);

    const handleTabChange = (tab: StatisticsTabOptions) => {
        analytics.logEvent(`simulator_${tab}_view`);
        setSelectedTab(tab);
    };

    const handleInvestedAmountChanged = (amount: string) => {
        if (!poolSnapData) return;

        // check if input is number or empty field
        const re = /^[0-9\b]+$/;
        if (!re.test(amount) && amount !== '') return;
        // compute how much tokens the user have according to the invested amount

        const tokenCounts = poolSnapData.tokens.length;
        const investedAmountTotal = parseInt(amount, 10);
        const investedAmountsUsd: number[] = new Array(tokenCounts);
        const userTokenBalances: number[] = new Array(tokenCounts);
        const tokenSymbols: TokenType[] = new Array(tokenCounts);
        const tokenWeights: number[] = new Array(tokenCounts);
        const tokenPricesUsd: number[] = new Array(tokenCounts);
        const poolTokenReserves: number[] = new Array(tokenCounts);

        if (poolSnapData) {
            poolSnapData.tokens.forEach((token, i) => {
                const investedToToken = token.weight * investedAmountTotal;
                tokenWeights[i] = token.weight;
                tokenPricesUsd[i] = token.priceUsd;
                investedAmountsUsd[i] = investedToToken;
                userTokenBalances[i] = investedToToken / token.priceUsd;
                tokenSymbols[i] = token.token.symbol as TokenType;
                poolTokenReserves[i] = token.reserve;
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
                    poolSnapData.exchange,
                    poolTokenReserves,
                    poolSnapData.volumeUsd24,
                    poolSnapData.swapFee,
                ),
            );
        }

        setImportedPoolInvestment(amount);
    };

    const handlePoolImportTabChange = (tabName: SimulatorStateInterface['simulationMode']) => {
        // reset simulation coefficients
        dispatch(resetSimulationCoefficients(simulatedTokenCoefficients.length));
        // set new simulation state
        dispatch(setSimulationMode(tabName));
        // reset pool data
        dispatch(resetPoolSnapData());
        // reset selected Pool ID
        dispatch(setSelectedPoolId(''));
        // reset pool investment amount
        setImportedPoolInvestment('');
        // change selected tab to impermanent loss view
        setSelectedTab('il');
        // clear url
        if (tabName === 'positions') {
            props.history.push({
                pathname: `/simulator`,
            });
        } else {
            // if there is pool address stored from previous attempt
            // eslint-disable-next-line no-lonely-if
            if (importedPoolAddress) {
                props.history.push({
                    pathname: `/simulator/pool/${importedPoolAddress}`,
                });
            } else {
                props.history.push({
                    pathname: `/simulator/pool`,
                });
            }
        }
    };

    const handlePoolSelectionChange = (poolId: string) => {
        const pool = allPools[poolId];
        const { tokenWeights, tokenSymbols } = pool;
        const { tokenPricesEnd, ethPriceEnd, tokenBalances } = pool.cumulativeStats;
        const yieldTokenSymbol = '';

        dispatch(
            setNewSimulationPoolData(
                poolId,
                tokenSymbols,
                tokenWeights,
                yieldTokenSymbol,
                tokenPricesEnd,
                ethPriceEnd,
                tokenBalances,
                pool.exchange,
                null,
                null,
                null,
            ),
        );

        dispatch(resetSimulationCoefficients(tokenBalances.length));
    };

    // import pool
    const handleImportAddressChange = input => {
        dispatch(resetPoolSnapData());
        setImportedPoolInvestment('');
        setImportedPoolAddress(input);

        // check for ETH address validity
        if (validationUtils.isValidEthereumAddress(input)) {
            setIsImportedPoolAddressValid(true);
            return;
        }

        setIsImportedPoolAddressValid(false);
    };

    const refreshPage = () => {
        window.location.reload();
    };

    const getExceptionContent = () => {
        if (simulationMode === 'positions') {
            if (!selectedAddress) {
                return <NoAddressNoPool>Input valid Ethereum address first</NoAddressNoPool>;
            }

            if (isLoading) {
                return <LoadingBox>Wait a moment. We are getting pool data...</LoadingBox>;
            }

            if (isFetchError) {
                return (
                    <SadCrocoBox>
                        <RefreshPageDescWrapper>
                            An error occurred while fetching data :(
                            <RefreshButton onClick={refreshPage}>Try again</RefreshButton>
                        </RefreshPageDescWrapper>
                    </SadCrocoBox>
                );
            }

            if (!allPools) {
                return (
                    <SadCrocoBox>
                        Sorry, Croco could not find any pools for this address :(
                        <StyledQuestionTooltip content="We track only pools on Uniswap, SushiSwap, Balancer and Materia exchanges." />
                    </SadCrocoBox>
                );
            }

            if (noPoolsFound) {
                return (
                    <SadCrocoBox>
                        Sorry, Croco could not find any pools for this address :(
                        <StyledQuestionTooltip content="We track only pools on Uniswap, SushiSwap, Balancer and Materia exchanges." />
                    </SadCrocoBox>
                );
            }
        }

        if (simulationMode === 'import') {
            if (poolSnapFetchError) {
                return (
                    <SadCrocoBox>
                        <div>
                            Sorry, Croco could not find any pool for this address :(
                            <StyledQuestionTooltip
                                content={
                                    "We track only pools on Uniswap, SushiSwap, Balancer and Materia exchanges. Also, we don't store information about pools with less than $10,000 in liquidity."
                                }
                            />
                        </div>
                    </SadCrocoBox>
                );
            }
        }

        return null;
    };

    const exceptionContent = getExceptionContent();
    let showData: any =
        poolId &&
        tokenSymbols &&
        tokenWeights &&
        ethPriceUsd &&
        tokenPricesUsd &&
        !isLoading &&
        !poolSnapLoading;
    if (simulationMode === 'positions' && (!selectedPoolId || selectedPoolId === 'all'))
        showData = false;

    return (
        <>
            <SimulatorContainer>
                <LeftLayoutContainer backgroundColor={themeColors.BACKGROUND}>
                    <LeftContentWrapper>
                        <PageHeadline>Simulator</PageHeadline>
                        <StyledTabSelectHeader
                            selected={simulationMode}
                            focusColor={themeColors.FONT_DARK}
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
                                    {!exceptionContent &&
                                    allPools &&
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
                                                    placeholder="Select pool..."
                                                />
                                            </MultipleSelectWrapper>
                                        </ChoosePoolWrapper>
                                    ) : null}
                                </>
                            ) : (
                                <PoolImportWrapper>
                                    <SelectLabel>
                                        Import pool by its address (from{' '}
                                        <DexPairLink
                                            rel="noreferrer"
                                            target="_blank"
                                            href={constants.DEX_POOLS_BASE_URLS.UNI_V2}
                                        >
                                            Uniswap
                                        </DexPairLink>
                                        ,{' '}
                                        <DexPairLink
                                            rel="noreferrer"
                                            target="_blank"
                                            href={constants.DEX_POOLS_BASE_URLS.SUSHI}
                                        >
                                            SushiSwap
                                        </DexPairLink>{' '}
                                        or{' '}
                                        <DexPairLink
                                            rel="noreferrer"
                                            target="_blank"
                                            href={constants.DEX_POOLS_BASE_URLS.BALANCER}
                                        >
                                            Balancer
                                        </DexPairLink>
                                        )
                                        <StyledQuestionTooltip content="Usually you can find pool address in the url. E.g. info.uniswap.org/pair/0x..." />
                                    </SelectLabel>
                                    <PoolImportInputWrapper>
                                        <Input
                                            placeholder="Pool address (e.g. 0xbb2b8038a1640196fbe3e38816f3e67cba72d940)"
                                            onChange={event => {
                                                handleImportAddressChange(
                                                    event.target.value.trim(),
                                                );
                                            }}
                                            useWhiteBackground
                                            useDarkBorder
                                            value={importedPoolAddress}
                                        />
                                        <AddPoolButton
                                            disabled={
                                                !(isImportedPoolAddressValid && !showData) ||
                                                poolSnapLoading
                                            }
                                            onClick={() => {
                                                dispatch(fetchPoolSnap(importedPoolAddress));
                                                dispatch(setSimulationMode('import'));
                                                analytics.logEvent('import_pool', {
                                                    poolAddress: importedPoolAddress,
                                                });
                                                props.history.push({
                                                    pathname: `/simulator/pool/${importedPoolAddress}`,
                                                });
                                            }}
                                        >
                                            {poolSnapLoading ? (
                                                <Spinner size={14} color={colors.FONT_MEDIUM} />
                                            ) : (
                                                'Import'
                                            )}
                                        </AddPoolButton>
                                    </PoolImportInputWrapper>
                                </PoolImportWrapper>
                            )}
                        </PoolDataEntryWrapper>

                        {exceptionContent && exceptionContent}

                        {showData && !exceptionContent && (
                            <>
                                {simulationMode === 'import' && (
                                    <PoolInvestmentWrapper>
                                        <PoolInvestmentLabel>
                                            Type how much you want to invest in the pool
                                        </PoolInvestmentLabel>

                                        <PoolInvestmentInputWrapper>
                                            <Input
                                                onChange={event => {
                                                    handleInvestedAmountChanged(
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
                                        onChange={(newValue, index) =>
                                            dispatch(setTokenCoefficients(newValue, index))
                                        }
                                        onEthChange={newValue =>
                                            dispatch(setEthCoefficient(newValue))
                                        }
                                        onYieldChange={newValue =>
                                            dispatch(setYieldCoefficient(newValue))
                                        }
                                        onNewDefaultValue={(newValue, index) =>
                                            dispatch(
                                                setDefaultSliderTokenCoefficient(newValue, index),
                                            )
                                        }
                                        onNewDefaultEthValue={newValue =>
                                            dispatch(setDefaultSliderEthCoefficient(newValue))
                                        }
                                        simulatedCoefficients={simulatedTokenCoefficients}
                                        simulatedEthCoefficient={simulatedEthCoefficient}
                                        tokenSymbols={tokenSymbols}
                                        poolId={poolId}
                                        yieldTokenSymbol={yieldTokenSymbol}
                                        tokenPrices={tokenPricesUsd}
                                        ethPrice={ethPriceUsd}
                                    />
                                </SimulationBoxWrapper>
                            </>
                        )}
                    </LeftContentWrapper>
                </LeftLayoutContainer>
                <RightLayoutContainer>
                    {showData && (
                        <RightContainer
                            onTabChanged={tab => handleTabChange(tab)}
                            selectedTab={selectedTab}
                            simulatedPooledTokensCoeffs={simulatedTokenCoefficients}
                            sliderDefaultCoeffs={defaultSliderTokenCoefficients}
                            simulatedEthCoeff={simulatedEthCoefficient}
                            simulatedYieldCoeff={simulatedYieldCoefficient}
                            sliderDefaultEthCoeff={defaultSliderEthCoefficient}
                            pool={
                                selectedPoolId && allPools[selectedPoolId]
                                    ? allPools[selectedPoolId]
                                    : undefined
                            }
                        />
                    )}
                </RightLayoutContainer>
            </SimulatorContainer>
        </>
    );
};
export default withRouter(Simulator);
