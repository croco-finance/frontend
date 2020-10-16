import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { FiatAmount, TokenLogo } from '../../../../../components/ui';
import { colors, variables } from '../../../../../config';
import { currentPriceRatioExample } from '../../../../../config/example-data';
import { getFormattedPercentageValue } from '../../../../../utils';
import OverviewRow from '../OverviewRow';

const GRID_GAP = 5;

const Wrapper = styled.div``;

const GridWrapper = styled.div`
    flex-grow: 1;
    display: grid;
    grid-gap: ${GRID_GAP}px;

    grid-template-columns: 140px minmax(60px, auto) minmax(130px, auto) minmax(130px, auto);

    font-size: ${variables.FONT_SIZE.NORMAL};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    align-items: center;
    overflow-x: auto; /* allow x-axis scrolling: useful on small screens when fiat amount is displayed */
    word-break: break-all;
    padding: 0px 10px;
`;

const HeaderWrapper = styled(GridWrapper)`
    grid-template-rows: repeat(1, 50px);
`;

const TokenInfoWrapper = styled(GridWrapper)<{ rowsCount: number }>`
    grid-template-rows: ${props => `repeat(${props.rowsCount}, 50px)`};
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
    size?: number;
}

const Overview = ({ size = 20 }: Props) => {
    // const numberOfTokens = Object.keys(balances).length;
    const allPools = useSelector(state => state.allPools);
    const selectedPoolId = useSelector(state => state.selectedPoolId);

    if (!allPools[selectedPoolId]) {
        return null;
    }

    const { tokens, tokenWeights, endTokenBalance } = allPools[selectedPoolId];
    const numberOfTokens = tokens.length;

    return (
        <Wrapper>
            <HeaderWrapper>
                <OverviewRow
                    firstColumn="Token"
                    secondColumn="Weight"
                    thirdColumn="Your balance"
                    fourthColumn="Current price"
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
                                    <TokenLogo symbol={token.symbol} size={size} />
                                    <TokenSymbol>{token.symbol}</TokenSymbol>
                                </TokenWrapper>
                            }
                            secondColumn={getFormattedPercentageValue(tokenWeights[i], true)}
                            thirdColumn={endTokenBalance[i].toFixed(4)}
                            fourthColumn={
                                <FiatAmount value={currentPriceRatioExample['usd'][token.symbol]} />
                            }
                            color="dark"
                        />
                    );
                })}
            </TokenInfoWrapper>
        </Wrapper>
    );
};

export default Overview;
