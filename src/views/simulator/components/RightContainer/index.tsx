import { Card } from '@components/ui';
import { animations, colors, variables } from '@config';
import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import CardOverview from './CardOverview';

const Wrapper = styled.div`
    padding-bottom: 20px;

    /* animation: ${animations.SHOW_UP} 1s; */
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

const SelectPoolWrapper = styled.div`
    display: flex;
    height: 88vh;
    align-items: center;
    justify-content: center;
    color: ${colors.FONT_LIGHT};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    font-size: ${variables.FONT_SIZE.H2};
    text-align: center;
`;

const GraphWrapper = styled.div`
    display: flex;
    margin-top: 35px;
    padding: 0 30px;
`;

interface Props {
    simulatedCoefficients: Array<number>;
}
const RightContainer = ({ simulatedCoefficients }: Props) => {
    const allPools = useSelector(state => state.allPools);
    const selectedPoolId = useSelector(state => state.selectedPoolId);

    // TODO make the following checks and computations cleaner
    if (!allPools) {
        return null;
        // <SelectPoolWrapper>Please input your Ethereum address on the left</SelectPoolWrapper>
    }

    // just in case the Pool summary is selected, return the following message
    if (selectedPoolId === 'all' || !selectedPoolId || !allPools[selectedPoolId]) {
        // return <SelectPoolWrapper>Select your pool</SelectPoolWrapper>;
        return null;
    }

    return (
        <Card>
            <Wrapper>
                {/* <SectionTitle>Pool overview</SectionTitle> */}
                <CardOverview simulatedCoefficients={simulatedCoefficients}></CardOverview>
                {/* {tokenCount === 2 && (
                    <>
                        <GraphWrapper>
                            <ILGraph
                                height={240}
                                referenceX={currentPriceChangeRatio}
                                referenceY={currentImpLoss}
                                data={graphData}
                            ></ILGraph>
                        </GraphWrapper>
                    </>
                )} */}
            </Wrapper>
        </Card>
    );
};
export default RightContainer;
