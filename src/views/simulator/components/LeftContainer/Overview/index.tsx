import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { FiatValue, TokenLogo } from '../../../../../components/ui';
import { colors, variables } from '../../../../../config';
import { currentPriceRatioExample } from '../../../../../config/example-data';
import { math } from '../../../../../utils';
import OverviewRow from '../OverviewRow';

const GRID_GAP = 5;

const Wrapper = styled.div``;

const GridWrapper = styled.div`
    flex-grow: 1;
    display: grid;
    grid-gap: ${GRID_GAP}px;

    grid-template-columns: 140px minmax(70px, auto) minmax(130px, auto) minmax(140px, auto);

    font-size: ${variables.FONT_SIZE.NORMAL};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    align-items: center;
    overflow-x: auto; /* allow x-axis scrolling: useful on small screens when fiat amount is displayed */
    word-break: break-all;
    padding: 0px 10px;

    @media (max-width: 520px) {
        font-size: ${variables.FONT_SIZE.SMALL};
    }
`;

const HeaderWrapper = styled(GridWrapper)`
    grid-template-rows: repeat(1, 50px);
`;

const TokenInfoWrapper = styled(GridWrapper)<{ rowsCount: number }>`
    grid-template-rows: ${props => `repeat(${props.rowsCount}, 45px)`};
    border-top: 1px solid ${colors.STROKE_GREY};
    /* border-bottom: 1px solid ${colors.STROKE_GREY}; */
    padding-top: 10px;
`;

const TokenWrapper = styled.div`
    display: flex;
`;
const TokenSymbol = styled.div`
    text-transform: uppercase;
    margin-left: 10px;
`;

interface Props {
    iconSize?: number;
}

const Overview = ({ iconSize = 20 }: Props) => {
    // const numberOfTokens = Object.keys(balances).length;
    const allPools = useSelector(state => state.allPools);
    const selectedPoolId = useSelector(state => state.selectedPoolId);

    if (!allPools[selectedPoolId]) {
        return null;
    }

    const { tokens, tokenWeights, endTokenBalances, endTokenPricesUsd, isActive } = allPools[
        selectedPoolId
    ];
    const numberOfTokens = tokens.length;

    return (
        <Wrapper>
            <HeaderWrapper>
                <OverviewRow
                    firstColumn="Token"
                    secondColumn="Weight"
                    thirdColumn="Your balance"
                    fourthColumn={isActive ? 'Current price' : 'Withdrawal price'}
                    color="light"
                />
            </HeaderWrapper>
            <TokenInfoWrapper rowsCount={numberOfTokens}>
                {tokens.map((token, i) => {
                    return (
                        <OverviewRow
                            key={i}
                            firstColumn={
                                <TokenWrapper>
                                    <TokenLogo symbol={token.symbol} size={iconSize} />
                                    <TokenSymbol>{token.symbol}</TokenSymbol>
                                </TokenWrapper>
                            }
                            secondColumn={math.getFormattedPercentageValue(tokenWeights[i], true)}
                            thirdColumn={endTokenBalances[i].toFixed(4)}
                            fourthColumn={<FiatValue value={endTokenPricesUsd[i]} />}
                            color="dark"
                        />
                    );
                })}
            </TokenInfoWrapper>
        </Wrapper>
    );
};

export default Overview;
