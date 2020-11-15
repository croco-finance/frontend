import { Card } from '@components/ui';
import { analytics, animations, colors, variables, styles } from '@config';
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import CardOverview from './CardOverview';
import CardPoolsSummary from './CardPoolsSummary';

const Wrapper = styled.div`
    /* animation: ${animations.SHOW_UP} 1s; */
    max-height: calc(100vh - 40px);
    ${styles.scrollBarStyles};
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

const RightContainer = () => {
    const selectedPoolId = useSelector(state => state.selectedPoolId);
    const userAddress = useSelector(state => state.userAddress);
    const activePoolIds = useSelector(state => state.activePoolIds);

    if (activePoolIds.length <= 0 && selectedPoolId === 'all') {
        return null;
    }

    return (
        <Card>
            <Wrapper>
                {selectedPoolId === 'all' ? (
                    <CardPoolsSummary />
                ) : (
                    <>
                        <CardOverview />
                        {activePoolIds.includes(selectedPoolId) ? (
                            <SimulatorButtonWrapper>
                                See how changes in assets' prices affect your funds
                                <StyledLink
                                    onClick={e => {
                                        analytics.Event(
                                            'SIMULATOR',
                                            'Went to simulator from pool card',
                                            userAddress,
                                        );
                                    }}
                                    to={{
                                        pathname: `/simulator/${userAddress}`,
                                    }}
                                >
                                    Open in simulator
                                </StyledLink>
                            </SimulatorButtonWrapper>
                        ) : null}
                    </>
                )}
            </Wrapper>
        </Card>
    );
};
export default RightContainer;
