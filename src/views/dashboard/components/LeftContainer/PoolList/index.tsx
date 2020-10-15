import colors from '../../../../../config/colors';
import React from 'react';
import styled from 'styled-components';
import PoolItem from '../PoolItem';
import { TokenLogo } from '../../../../../components/ui';
import { variables } from '../../../../../config';
import { useDispatch, useSelector } from 'react-redux';

const Wrapper = styled.div`
    padding-left: 0;
    margin-bottom: 65px;
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    color: ${colors.FONT_MEDIUM};
    /* use the same sside padding as in <OverviewItem> so that the items are aligned */
    padding: 10px 10px 15px 10px;
`;

const HeaderChild = styled.div`
    display: flex;
    flex: 0 0 33%;
    justify-content: center;
    align-items: center;
`;

const Exchange = styled(HeaderChild)`
    justify-content: start;
    padding-left: 5px;
`;

const ExchangeTitle = styled.div`
    margin-left: 5px;
`;

const Value = styled(HeaderChild)``;

const Gains = styled(HeaderChild)``;

const Roi = styled(HeaderChild)``;

const ItemsWrapper = styled.div``;

const PoolGroup = styled.div`
    margin-bottom: 40px;
`;
interface Props {}

const PoolList = ({ ...rest }: Props) => {
    const exchangeToPoolMapping = useSelector(state => state.exchangeToPoolMapping);

    return (
        <Wrapper>
            {/* iterate over all exchanges */}
            {Object.keys(exchangeToPoolMapping).map((exchange, i) => {
                const poolIds = exchangeToPoolMapping[exchange];
                return (
                    <PoolGroup>
                        <Header>
                            <Exchange>
                                <TokenLogo symbol={exchange} size={26} />
                                <ExchangeTitle>Balancer</ExchangeTitle>
                            </Exchange>
                            <Value>Value</Value>
                            <Gains>Fee Gains</Gains>
                            {/* <Roi>Imp. loss</Roi> */}
                        </Header>

                        <ItemsWrapper>
                            {poolIds.map((poolId, i) => {
                                return <PoolItem key={poolId} poolId={poolId} />;
                            })}
                        </ItemsWrapper>
                    </PoolGroup>
                );
            })}
        </Wrapper>
    );
};

export default PoolList;
