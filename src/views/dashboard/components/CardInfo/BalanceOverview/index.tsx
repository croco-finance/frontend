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

const TotalBalance = styled(Item)`
    border-top: 1px solid ${colors.STROKE_GREY};
    margin-top: 10px;
    padding-top: 15px;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
`;

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    impermanentLossAbsolute?: number;
    impermanentLossRelative?: number;
    depositCost?: number;
    withdrawalCost?: number;
    feeReward?: number;
}

const BalanceOverview = ({
    impermanentLossAbsolute = 1234,
    impermanentLossRelative = 5,
    depositCost = 34,
    withdrawalCost = 12,
    feeReward = 2120,
}: Props) => {
    return (
        <Wrapper>
            <IL>
                <Title>Impermanent loss:</Title>
                <Amount>
                    ${impermanentLossAbsolute} | {impermanentLossRelative}%
                </Amount>
            </IL>
            <Fee>
                <Title>Fee rewards:</Title>
                <Amount>${feeReward}</Amount>
            </Fee>
            <Deposit>
                <Title>Deposit cost:</Title>
                <Amount>${depositCost}</Amount>
            </Deposit>
            <Withdrawal>
                <Title>Withdrawal cost:</Title>
                <Amount>${withdrawalCost}</Amount>
            </Withdrawal>
            <TotalBalance>
                <Title>Total balance</Title>
                <Amount>-${3343}</Amount>
            </TotalBalance>
        </Wrapper>
    );
};

export default BalanceOverview;
