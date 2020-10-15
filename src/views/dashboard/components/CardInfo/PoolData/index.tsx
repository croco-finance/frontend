import colors from '../../../../../config/colors';
import React from 'react';
import styled from 'styled-components';
import { variables } from '../../../../../config';

const Wrapper = styled.div`
    padding-left: 0;
    flex-direction: column;
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    color: ${colors.FONT_MEDIUM};
    /* use the same sside padding as in <OverviewItem> so that the items are aligned */
    padding: 10px 10px 15px 10px;
`;

const Item = styled.div`
    display: flex;
    flex-direction: row;
    padding: 4px 0;
`;

const IL = styled(Item)``;

const Fee = styled(Item)``;

const Deposit = styled(Item)``;

const Withdrawal = styled(Item)``;

const Title = styled(Item)`
    flex: 0 0 60%;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
`;

const Amount = styled(Item)`
    flex: 0 0 40%;
`;

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    impermanentLossAbsolute?: number;
    impermanentLossRelative?: number;
    depositCost?: number;
    withdrawalCost?: number;
    feeReward?: number;
}

const PoolData = ({
    impermanentLossAbsolute = 1234,
    impermanentLossRelative = 5,
    depositCost = 34,
    withdrawalCost = 12,
    feeReward = 2120,
}: Props) => {
    return (
        <Wrapper>
            <IL>
                <Title>Initial pool value:</Title>
                <Amount>
                    ${impermanentLossAbsolute} | {impermanentLossRelative}%
                </Amount>
            </IL>

            <IL>
                <Title>Current pool value:</Title>
                <Amount>
                    ${impermanentLossAbsolute} | {impermanentLossRelative}%
                </Amount>
            </IL>
            <Fee>
                <Title>Your share value:</Title>
                <Amount>${feeReward}</Amount>
            </Fee>
            <Deposit>
                <Title>You pool share:</Title>
                <Amount>${depositCost}</Amount>
            </Deposit>
            <Withdrawal>
                <Title>24 trading volume:</Title>
                <Amount>${withdrawalCost}</Amount>
            </Withdrawal>
        </Wrapper>
    );
};

export default PoolData;
