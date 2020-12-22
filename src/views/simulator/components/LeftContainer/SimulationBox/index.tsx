import { FiatValue, TokenLogo } from '@components/ui';
import { colors, variables, types } from '@config';
import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import PriceChangeRow from './PriceChangeRow';
import { formatUtils } from '@utils';

const GRID_GAP = 5;

const Wrapper = styled.div`
    @media (max-width: ${variables.SCREEN_SIZE.SM}) {
        font-size: ${variables.FONT_SIZE.SMALL};
    }
`;

const GridWrapper = styled.div`
    flex-grow: 1;
    display: grid;
    grid-gap: ${GRID_GAP}px;
    grid-template-columns: 110px minmax(100px, auto) minmax(120px, auto) minmax(110px, auto);
    grid-auto-rows: 55px;
    font-size: ${variables.FONT_SIZE.NORMAL};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    align-items: center;
    word-break: break-all;
    padding: 5px;
    width: 100%;
    min-width: fit-content;
`;

const Title = styled.div`
    color: ${props => props.theme.FONT_DARK};
    font-weight: ${variables.FONT_WEIGHT.DEMI_BOLD};
    margin-bottom: 16px;
`;

const SubTitlesWrapper = styled.div`
    display: flex;
    margin-bottom: 12px;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    color: ${props => props.theme.FONT_MEDIUM};
    font-size: ${variables.FONT_SIZE.NORMAL};
    align-items: center;
`;

const SubTitleLeft = styled.div`
    flex-grow: 1;
`;

const SubTitleRight = styled.div`
    justify-content: flex-end;
    color: ${props => props.theme.FONT_LIGHT};
`;

const TokenWrapper = styled.div`
    display: flex;
`;
const TokenSymbol = styled.div`
    text-transform: uppercase;
    margin-left: 10px;
    max-width: 70px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const XScrollWrapper = styled.div`
    overflow-x: auto;
`;

interface Props {
    onChange: any;
    onEthChange: any;
    onYieldChange: any;
    simulatedCoefficients: number[];
    simulatedEthCoefficient?: number;
    onNewDefaultValue: any;
    selectedTab: string;
    onNewDefaultEthValue: any;
}
const SimulationBox = ({
    onChange,
    onEthChange,
    onYieldChange,
    simulatedCoefficients,
    onNewDefaultValue,
    onNewDefaultEthValue,
    simulatedEthCoefficient,
    selectedTab,
}: Props) => {
    const allPools: types.AllPoolsGlobal = useSelector(state => state.allPools);
    const selectedPoolId = useSelector(state => state.selectedPoolId);

    if (!allPools[selectedPoolId]) {
        return null;
    }

    const pool = allPools[selectedPoolId];
    const { pooledTokens, poolId, yieldToken } = pool;
    const { tokenPricesEnd, ethPriceEnd } = pool.cumulativeStats;
    const tokenSymbolsArr = formatUtils.getTokenSymbolArr(pooledTokens);
    const yieldTokenSymbol = yieldToken?.symbol;

    // find out if WETH is among pooled tokens. If not, the index will be -1
    const indexOfWeth = tokenSymbolsArr.indexOf('WETH');

    // get index of yield token
    const indexOfYield = tokenSymbolsArr.indexOf(yieldTokenSymbol);

    const simulatedEthPrice = simulatedEthCoefficient
        ? ethPriceEnd * simulatedEthCoefficient
        : ethPriceEnd;

    return (
        <Wrapper>
            <Title>Simulation Box</Title>
            <SubTitlesWrapper>
                <SubTitleLeft>Set tokens relative price change</SubTitleLeft>
                <SubTitleRight>Simulated price</SubTitleRight>
            </SubTitlesWrapper>

            <XScrollWrapper>
                <GridWrapper>
                    {pooledTokens.map((token, i) => {
                        const tokenSymbol = token.symbol;
                        return (
                            <PriceChangeRow
                                // make sure the id is unique to the pool and the token. We want the token sliders
                                // to re/render if in the new pool are the same tokens as in the previous pool
                                key={`${poolId}${tokenSymbol}`}
                                onSliderChange={newValue => {
                                    onChange(newValue, i);

                                    // if it is WETH slider, increase price of ETH as well
                                    if (i === indexOfWeth) onEthChange(newValue);
                                    if (i === indexOfYield) onYieldChange(newValue);
                                }}
                                onDefaultSliderValueChange={newValue => {
                                    onNewDefaultValue(newValue, i);
                                    if (i === indexOfWeth) onNewDefaultEthValue(newValue);
                                }}
                                firstColumn={
                                    <TokenWrapper>
                                        <TokenLogo symbol={tokenSymbol} size={22} />
                                        <TokenSymbol>{tokenSymbol}</TokenSymbol>
                                    </TokenWrapper>
                                }
                                fourthColumn={
                                    <FiatValue
                                        value={tokenPricesEnd[i] * simulatedCoefficients[i]}
                                    />
                                }
                                color="dark"
                            />
                        );
                    })}
                    {/* If WETH not among pooled tokens, show ETH slider as well */}
                    {indexOfWeth === -1 && selectedTab !== 'overview' && (
                        <PriceChangeRow
                            key={`${poolId}ETH`}
                            onSliderChange={newValue => {
                                onEthChange(newValue);
                            }}
                            onDefaultSliderValueChange={newValue => onNewDefaultEthValue(newValue)}
                            firstColumn={
                                <TokenWrapper>
                                    <TokenLogo symbol={'ETH'} size={22} />
                                    <TokenSymbol>ETH</TokenSymbol>
                                </TokenWrapper>
                            }
                            fourthColumn={<FiatValue value={simulatedEthPrice} />}
                            color="dark"
                        />
                    )}
                </GridWrapper>
            </XScrollWrapper>
        </Wrapper>
    );
};

export default SimulationBox;
