import { FiatValue, TokenLogo } from '@components/ui';
import { variables } from '@config';
import { useSelector } from '@reducers';
import { formatUtils } from '@utils';
import React from 'react';
import styled from 'styled-components';
import OverviewRow from '../OverviewRow';

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
    iconSize?: number;
}

const BalanceOverview = ({ iconSize = 20 }: Props) => {
    // const numberOfTokens = Object.keys(balances).length;
    const { allPools, selectedPoolId } = useSelector(state => state.app);

    if (!allPools[selectedPoolId]) {
        return null;
    }

    const { pooledTokens, isActive } = allPools[selectedPoolId];

    const { tokenBalances, tokenPricesEnd } = allPools[selectedPoolId].cumulativeStats;
    const numberOfTokens = pooledTokens.length;

    return (
        <Wrapper>
            <XScrollWrapper>
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
                    {pooledTokens.map((token, i) => {
                        return (
                            <OverviewRow
                                key={i}
                                firstColumn={
                                    <TokenWrapper>
                                        <TokenLogo symbol={token.symbol} size={iconSize} />
                                        <TokenSymbol>{token.symbol}</TokenSymbol>
                                    </TokenWrapper>
                                }
                                secondColumn={formatUtils.getFormattedPercentageValue(
                                    token.weight,
                                    true,
                                )}
                                thirdColumn={tokenBalances[i].toFixed(4)}
                                fourthColumn={<FiatValue value={tokenPricesEnd[i]} />}
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
