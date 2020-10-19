import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { FiatAmount, TokenLogo } from '../../../../../components/ui';
import { colors, variables } from '../../../../../config';
import { currentPriceRatioExample } from '../../../../../config/example-data';
import PriceChangeRow from './PriceChangeRow';

const GRID_GAP = 5;

const Wrapper = styled.div``;

const GridWrapper = styled.div<{ rowsCount: number }>`
    flex-grow: 1;
    display: grid;
    grid-gap: ${GRID_GAP}px;
    grid-template-columns: 110px minmax(110px, auto) minmax(100px, auto) minmax(110px, auto);
    grid-template-rows: ${props => `repeat(${props.rowsCount}, 55px)`};
    font-size: ${variables.FONT_SIZE.NORMAL};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    align-items: center;
    overflow-x: auto; /* allow x-axis scrolling: useful on small screens when fiat amount is displayed */
    word-break: break-all;
    padding: 5px;
`;

const Title = styled.div`
    color: ${colors.FONT_MEDIUM};
    font-weight: ${variables.FONT_WEIGHT.DEMI_BOLD};
    margin-bottom: 20px;
`;

const SubTitle = styled.div`
    font-weight: ${variables.FONT_WEIGHT.DEMI_BOLD};
`;

const GridHeader = styled.div`
    display: flex;
    flex-grow: 1;
    align-items: center;
    justify-content: flex-end;
    color: ${colors.FONT_LIGHT};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
`;

const TokenWrapper = styled.div`
    display: flex;
`;
const TokenSymbol = styled.div`
    text-transform: uppercase;
    margin-left: 10px;
`;

const getInitialPriceCoeffs = (tokens: any, initialValue: number = 1) => {
    let coefficients = {};
    let coefficientsArr = new Array(tokens.length);
    tokens.forEach((token, i) => {
        coefficients[token.symbol] = 1;
    });

    coefficientsArr.fill(1);

    return coefficientsArr;
};

interface Props {
    tokensPool?: any;
}
const SimulationBox = ({ tokensPool }: Props) => {
    const allPools = useSelector(state => state.allPools);
    const selectedPoolId = useSelector(state => state.selectedPoolId);
    const pool = allPools[selectedPoolId];

    const { endTokenPricesUsd } = pool;

    const [simulatedPriceCoefficients, setSimulatedPriceCoefficients]: any = useState(
        getInitialPriceCoeffs(pool.tokens),
    );

    const setNewPrices = (newValue, index) => {
        const coefficientsArrCopy = [...simulatedPriceCoefficients];
        coefficientsArrCopy[index] = newValue;
        setSimulatedPriceCoefficients(coefficientsArrCopy);
    };

    useEffect(() => {
        const newPool = allPools[selectedPoolId];
        setSimulatedPriceCoefficients(getInitialPriceCoeffs(newPool.tokens));
    }, [selectedPoolId]);

    const tokens = pool.tokens;

    return (
        <Wrapper>
            <Title>Simulation Box</Title>
            <SubTitle>Relative token price change</SubTitle>
            <GridHeader>Token price</GridHeader>
            <GridWrapper rowsCount={tokens.length}>
                {tokens.map((token, i) => {
                    const tokenSymbol = token.symbol;
                    return (
                        <PriceChangeRow
                            key={tokenSymbol}
                            token={tokenSymbol}
                            onSliderChange={newValue => {
                                setNewPrices(newValue, i);
                            }}
                            firstColumn={
                                <TokenWrapper>
                                    <TokenLogo symbol={tokenSymbol} size={22} />
                                    <TokenSymbol>{tokenSymbol}</TokenSymbol>
                                </TokenWrapper>
                            }
                            fourthColumn={
                                <FiatAmount
                                    value={endTokenPricesUsd[i] * simulatedPriceCoefficients[i]}
                                />
                            }
                            color="dark"
                        />
                    );
                })}
            </GridWrapper>
        </Wrapper>
    );
};

export default SimulationBox;
