import { FiatValue, TokenLogo } from '@components/ui';
import { variables } from '@config';
import { formatUtils } from '@utils';
import React from 'react';
import styled from 'styled-components';
import OverviewRow from '../OverviewRow';
import { TokenType } from '@types';

const GRID_GAP = 5;

const Wrapper = styled.div``;

const GridWrapper = styled.div`
    flex-grow: 1;
    display: grid;
    grid-gap: ${GRID_GAP}px;
    color: ${props => props.theme.FONT_MEDIUM};
    grid-template-columns: 140px minmax(70px, auto) minmax(130px, auto) minmax(140px, auto);
    font-size: ${variables.FONT_SIZE.NORMAL};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    align-items: center;
    word-break: break-all;
    padding: 0px 10px;
    width: 100%;
    min-width: fit-content;

    @media (max-width: 520px) {
        font-size: ${variables.FONT_SIZE.SMALL};
    }
`;

const HeaderWrapper = styled(GridWrapper)`
    grid-template-rows: repeat(1, 50px);
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
`;

const TokenInfoWrapper = styled(GridWrapper)<{ rowsCount: number }>`
    grid-template-rows: ${props => `repeat(${props.rowsCount}, 45px)`};
    border-top: 1px solid ${props => props.theme.STROKE_GREY};
    padding-top: 10px;
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
    tokenWeights: number[];
    tokenPricesUsd: number[];
    tokenBalances: number[];
    tokenSymbols: TokenType[];
}

const BalanceOverview = ({ tokenWeights, tokenPricesUsd, tokenBalances, tokenSymbols }: Props) => {
    const numberOfTokens = tokenSymbols.length;

    console.log('BalanceOverview');
    console.log('tokenWeights', tokenWeights);
    console.log('tokenPricesUsd', tokenPricesUsd);
    console.log('tokenBalances', tokenBalances);
    console.log('tokenSymbols', tokenSymbols);

    return (
        <Wrapper>
            <XScrollWrapper>
                <HeaderWrapper>
                    <OverviewRow
                        firstColumn="Token"
                        secondColumn="Weight"
                        thirdColumn="Your balance"
                        fourthColumn="Today's price"
                        color="light"
                    />
                </HeaderWrapper>
                <TokenInfoWrapper rowsCount={numberOfTokens}>
                    {tokenSymbols.map((symbol, i) => {
                        return (
                            <OverviewRow
                                key={i}
                                firstColumn={
                                    <TokenWrapper>
                                        <TokenLogo symbol={symbol} size={20} />
                                        <TokenSymbol>{symbol}</TokenSymbol>
                                    </TokenWrapper>
                                }
                                secondColumn={formatUtils.getFormattedPercentageValue(
                                    tokenWeights[i],
                                    true,
                                )}
                                thirdColumn={tokenBalances[i].toFixed(4)}
                                fourthColumn={<FiatValue value={tokenPricesUsd[i]} />}
                                color="medium"
                            />
                        );
                    })}
                </TokenInfoWrapper>
            </XScrollWrapper>
        </Wrapper>
    );
};

export default BalanceOverview;
