import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { FiatValue, TokenLogo } from '../../../../../components/ui';
import { colors, variables } from '../../../../../config';
import PriceChangeRow from './PriceChangeRow';

const GRID_GAP = 5;

const Wrapper = styled.div``;

const GridWrapper = styled.div<{ rowsCount: number }>`
    flex-grow: 1;
    display: grid;
    grid-gap: ${GRID_GAP}px;
    grid-template-columns: 100px minmax(100px, auto) minmax(120px, auto) minmax(110px, auto);
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

interface Props {
    tokensPool?: any;
    onChange: any;
    simulatedCoefficients: any;
}
const SimulationBox = ({ tokensPool, onChange, simulatedCoefficients }: Props) => {
    const allPools = useSelector(state => state.allPools);
    const selectedPoolId = useSelector(state => state.selectedPoolId);

    if (!allPools[selectedPoolId]) {
        return null;
    }

    const pool = allPools[selectedPoolId];
    const { endTokenPricesUsd, tokens, poolId } = pool;

    return (
        <Wrapper>
            <Title>Simulation Box</Title>
            <SubTitle>Relative token price change</SubTitle>
            <GridHeader>Simulated price</GridHeader>
            <GridWrapper rowsCount={tokens.length}>
                {tokens.map((token, i) => {
                    const tokenSymbol = token.symbol;
                    return (
                        <PriceChangeRow
                            // make sure the id is unique to the pool and the token. We want the token sliders
                            // to re/render if in the new pool are the same tokens as in the previous pool
                            key={`${poolId}${tokenSymbol}`}
                            onSliderChange={newValue => {
                                onChange(newValue, i);
                            }}
                            firstColumn={
                                <TokenWrapper>
                                    <TokenLogo symbol={tokenSymbol} size={22} />
                                    <TokenSymbol>{tokenSymbol}</TokenSymbol>
                                </TokenWrapper>
                            }
                            fourthColumn={
                                <FiatValue
                                    value={endTokenPricesUsd[i] * simulatedCoefficients[i]}
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
