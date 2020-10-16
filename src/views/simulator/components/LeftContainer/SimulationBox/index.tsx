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

const getInitialStateCoeffs = (tokens: any, initialValue: number = 1) => {
    let coefficients = {};
    tokens.forEach(token => {
        coefficients[token.symbol] = 1;
    });

    return coefficients;
};

interface Props {
    tokensPool?: any;
    currentPrices?: any;
}
const SimulationBox = ({ tokensPool, currentPrices = currentPriceRatioExample }: Props) => {
    const allPools = useSelector(state => state.allPools);
    const selectedPoolId = useSelector(state => state.selectedPoolId);
    const pool = allPools[selectedPoolId];

    const [newPriceCoefficients, setNewPriceCoefficients] = useState(
        getInitialStateCoeffs(pool.tokens),
    );

    const setNewPrices = (newValue, token) => {
        const newPriceCoefficientsCopy = { ...newPriceCoefficients };
        newPriceCoefficientsCopy[token] = newValue;
        setNewPriceCoefficients(newPriceCoefficientsCopy);
    };

    useEffect(() => {
        const newPool = allPools[selectedPoolId];
        setNewPriceCoefficients(getInitialStateCoeffs(newPool.tokens));
    }, [selectedPoolId]);

    const tokens = pool.tokens;

    return (
        <Wrapper>
            <Title>Simulation Box</Title>
            <SubTitle>Relative token price change</SubTitle>
            <GridHeader>Token price</GridHeader>
            <GridWrapper rowsCount={tokens.length}>
                {tokens.map(token => {
                    const tokenSymbol = token.symbol;
                    return (
                        <PriceChangeRow
                            key={tokenSymbol}
                            token={tokenSymbol}
                            onSliderChange={newValue => {
                                setNewPrices(newValue, tokenSymbol);
                            }}
                            firstColumn={
                                <TokenWrapper>
                                    <TokenLogo symbol={tokenSymbol} size={22} />
                                    <TokenSymbol>{tokenSymbol}</TokenSymbol>
                                </TokenWrapper>
                            }
                            fourthColumn={
                                newPriceCoefficients[tokenSymbol] && (
                                    <FiatAmount
                                        value={
                                            currentPrices.usd[tokenSymbol] *
                                            newPriceCoefficients[tokenSymbol]
                                        }
                                    />
                                )
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
