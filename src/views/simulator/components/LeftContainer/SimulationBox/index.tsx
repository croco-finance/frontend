import { FiatValue, TokenLogo } from '@components/ui';
import { colors, variables, types } from '@config';
import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import PriceChangeRow from './PriceChangeRow';

const GRID_GAP = 5;

const Wrapper = styled.div`
    @media (max-width: 580px) {
        font-size: ${variables.FONT_SIZE.SMALL};
    }
`;

const GridWrapper = styled.div<{ rowsCount: number }>`
    flex-grow: 1;
    display: grid;
    grid-gap: ${GRID_GAP}px;
    grid-template-columns: 110px minmax(100px, auto) minmax(120px, auto) minmax(110px, auto);
    grid-template-rows: ${props => `repeat(${props.rowsCount}, 55px)`};
    font-size: ${variables.FONT_SIZE.NORMAL};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    align-items: center;
    overflow-x: auto; /* allow x-axis scrolling: useful on small screens when fiat amount is displayed */
    word-break: break-all;
    padding: 5px;
`;

const Title = styled.div`
    color: ${colors.FONT_DARK};
    font-weight: ${variables.FONT_WEIGHT.DEMI_BOLD};
    margin-bottom: 16px;
`;

const SubTitlesWrapper = styled.div`
    display: flex;
    margin-bottom: 12px;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    color: ${colors.FONT_MEDIUM};
    font-size: ${variables.FONT_SIZE.NORMAL};
    align-items: center;
`;

const SubTitleLeft = styled.div`
    flex-grow: 1;
`;

const SubTitleRight = styled.div`
    justify-content: flex-end;
    color: ${colors.FONT_LIGHT};
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

interface Props {
    tokensPool?: any;
    onChange: any;
    simulatedCoefficients: any;
    onNewDefaultValue: any;
}
const SimulationBox = ({
    tokensPool,
    onChange,
    simulatedCoefficients,
    onNewDefaultValue,
}: Props) => {
    const allPools: types.AllPoolsGlobal = useSelector(state => state.allPools);
    const selectedPoolId = useSelector(state => state.selectedPoolId);

    if (!allPools[selectedPoolId]) {
        return null;
    }

    const pool = allPools[selectedPoolId];
    const { tokens, poolId } = pool;
    const { tokenPricesEnd } = pool.cumulativeStats;

    return (
        <Wrapper>
            <Title>Simulation Box</Title>
            <SubTitlesWrapper>
                <SubTitleLeft>Set tokens relative price change</SubTitleLeft>
                <SubTitleRight>Simulated price</SubTitleRight>
            </SubTitlesWrapper>

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
                            onDefaultSliderValueChange={newValue => onNewDefaultValue(newValue, i)}
                            firstColumn={
                                <TokenWrapper>
                                    <TokenLogo symbol={tokenSymbol} size={22} />
                                    <TokenSymbol>{tokenSymbol}</TokenSymbol>
                                </TokenWrapper>
                            }
                            fourthColumn={
                                <FiatValue value={tokenPricesEnd[i] * simulatedCoefficients[i]} />
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
