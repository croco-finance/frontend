import * as actionTypes from '@actionTypes';
import { NavBar, SimulatorContainer } from '@components/layout';
import { GrayBox, Input, LoadingBox, MultipleTokenSelect } from '@components/ui';
import { animations, colors, variables, types } from '@config';
import { mathUtils, validationUtils } from '@utils';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import styled from 'styled-components';
import { FetchPoolsHook } from '../../hooks';
import RightContainer from './components/RightContainer';
import Overview from './components/LeftContainer/Overview';
import SimulationBox from './components/LeftContainer/SimulationBox';

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
    width: 46%;
    padding: 0px 40px 20px 0;
    @media (max-width: 1100px) {
        width: 100%;
        padding: 20px;
    }
`;

const RightWrapper = styled.div`
    padding: 40px 0px 20px 40px;
    width: 54%;
    background-color: ${colors.BACKGROUND};
    @media (max-width: 1100px) {
        width: 100%;
        padding: 20px;
    }
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
`;

const MultipleSelectWrapper = styled.div`
    flex-grow: 1;
`;

const PoolSelectLabel = styled(SectionLabel)``;

const OverviewWrapper = styled.div`
    margin: 20px auto 25px auto;
    padding: 20px 15px;
`;

const InactivePoolWarning = styled.div`
    margin-top: 30px;
    padding: 10px;
    border-radius: 3px;
    font-weight: ${variables.FONT_WEIGHT.REGULAR};
    background-color: #f7f4ff;
    border: 1px solid #baa6f9;
    color: #673df1;
`;

const buildPoolOption = (pool: types.PoolItem) => {
    if (pool) {
        const tokens: any = pool.tokens;
        let value = { poolId: pool.poolId, tokens: new Array(tokens.length) };
        let label = '';

        tokens.forEach((token, i) => {
            let tokenWeight = mathUtils.getFormattedPercentageValue(pool.tokens[i].weight, true);
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

const Simulator = (props: RouteComponentProps<any>) => {
    const allPools = useSelector(state => state.allPools);
    const selectedPoolId = useSelector(state => state.selectedPoolId);
    const dispatch = useDispatch();

    const [inputAddress, setInputAddress] = useState(
        props.match.params.address ? props.match.params.address : '',
    );

    const [simulatedPriceCoefficients, setSimulatedPriceCoefficients]: any = useState(
        allPools[selectedPoolId] ? getInitialPriceCoeffs(allPools[selectedPoolId].tokens) : [],
    );

    const [{ isLoading, noPoolsFound, isFetchError }, fetchData] = FetchPoolsHook(
        props.match.params.address ? props.match.params.address : '',
    );

    const setNewPrices = (newValue, index) => {
        const coefficientsArrCopy = [...simulatedPriceCoefficients];
        coefficientsArrCopy[index] = newValue;
        setSimulatedPriceCoefficients(coefficientsArrCopy);
    };

    const handleAddressChange = inputAddr => {
        // show in the input whatever user typed in, even if it's not a valid ETH address
        setInputAddress(inputAddr);

        if (validationUtils.isValidEthereumAddress(inputAddr)) {
            fetchData(inputAddr);
            // change the url so that the user fetches data for the same address when refreshing the page
            props.history.push({
                pathname: `/simulator/${inputAddr}`,
            });
        }
    };

    useEffect(() => {
        if (allPools[selectedPoolId]) {
            const newPool = allPools[selectedPoolId];
            setSimulatedPriceCoefficients(getInitialPriceCoeffs(newPool.tokens));
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

                {exceptionContent ? (
                    exceptionContent
                ) : allPools ? (
                    <>
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
                                ></MultipleTokenSelect>
                            </MultipleSelectWrapper>
                        </ChoosePoolWrapper>
                    </>
                ) : null}
                {allPools[selectedPoolId] && (
                    <>
                        {!allPools[selectedPoolId].isActive ? (
                            <InactivePoolWarning>
                                You have already withdrawn all funds from this pool. Below you see
                                prices and balances at the time of your final withdrawal.
                            </InactivePoolWarning>
                        ) : null}
                        <OverviewWrapper>
                            <Overview />
                        </OverviewWrapper>
                        <GrayBox>
                            <SimulationBox
                                onChange={setNewPrices}
                                simulatedCoefficients={simulatedPriceCoefficients}
                            />
                        </GrayBox>
                    </>
                )}
            </LeftWrapper>
            <RightWrapper>
                <CardInfoWrapper>
                    <RightContainer simulatedCoefficients={simulatedPriceCoefficients} />
                </CardInfoWrapper>
            </RightWrapper>
        </SimulatorContainer>
    );
};
export default withRouter(Simulator);
