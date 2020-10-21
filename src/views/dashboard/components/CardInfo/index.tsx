import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Card } from '../../../../components/ui';
import { animations, colors, variables } from '../../../../config';
import CardOverview from './CardOverview';
import CardPoolsSummary from './CardPoolsSummary';

const Wrapper = styled.div`
    /* animation: ${animations.SHOW_UP} 1s; */
    max-height: calc(100vh - 60px);
    overflow-y: auto;
    ::-webkit-scrollbar {
        background-color: #fff;
        width: 10px;
    }
    /* background of the scrollbar except button or resizer */
    ::-webkit-scrollbar-track {
        background-color: transparent;
    }
    /* scrollbar itself */
    ::-webkit-scrollbar-thumb {
        /* 7F7F7F for mac-like color */
        background-color: #babac0;
        border-radius: 10px;
        border: 2px solid #fff;
    }
    /* set button(top and bottom of the scrollbar) */
    ::-webkit-scrollbar-button {
        display: none;
    }
`;

const SimulatorButtonWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 24px auto 0 auto;
    padding: 4px 20px;
    flex-direction: column;
    color: ${colors.FONT_MEDIUM};
`;

const StyledLink = styled(Link)`
    display: flex;
    text-decoration: none;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    color: ${colors.PASTEL_BLUE_DARK};
    background-color: ${colors.PASTEL_BLUE_LIGHT};
    border-radius: 4px;
    margin-top: 16px;
    padding: 10px;
    transition: 0.12s;

    &:hover {
        /* text-decoration: underline; */
        color: white;
        background-color: ${colors.PASTEL_BLUE_DARK};
    }
`;

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    address?: string;
}

const CardInfo = ({ address }: Props) => {
    const selectedPoolId = useSelector(state => state.selectedPoolId);
    const userAddress = useSelector(state => state.userAddress);

    return (
        <Card>
            <Wrapper>
                {selectedPoolId === 'all' ? (
                    <CardPoolsSummary />
                ) : (
                    <>
                        <CardOverview />
                        <SimulatorButtonWrapper>
                            See how changes in assets' price affect your funds
                            <StyledLink
                                to={{
                                    pathname: `/simulator/${userAddress}`,
                                }}
                            >
                                Open in simulator
                            </StyledLink>
                        </SimulatorButtonWrapper>
                    </>
                )}
            </Wrapper>
        </Card>
    );
};
export default CardInfo;
