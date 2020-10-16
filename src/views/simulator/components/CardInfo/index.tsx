import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import styled from 'styled-components';
import { animations, colors, variables } from '../../../../config';
import { Card } from '../../../../components/ui';

import { Link } from 'react-router-dom';
import CardOverview from './CardOverview';
import ILGraph from './ILGraph';

const Wrapper = styled.div`
    /* animation: ${animations.SHOW_UP} 1s; */
    height: 88vh;
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

/* 
QUESTIONS
- když se cena tohoto tokenu zvíší o tolik a cena totohle tokenua  tolik, jaká bude moje loss?
- Jaká je teď moje impermanent loss?
- Jak dlouho musím stakovat, abych byl profitable 
- token Balance after price change
- Porovnání s ostatními startegiemi 
- total Balance balance

*/

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    initialPrices?: any;
    newPrices?: any;
    userPoolShare?: any;
    initialTokenBalance?: any;
    newTokenBalance?: any;
}

const CardInfo = ({}: Props) => {
    const allPools = useSelector(state => state.allPools);
    const selectedPoolId = useSelector(state => state.selectedPoolId);

    // TODO make the following checks and computations cleaner
    if (!allPools || !allPools[selectedPoolId]) {
        return (
            <SelectPoolWrapper>
                We didn't find any pools associated with this address :(
            </SelectPoolWrapper>
        );
    }

    // just in case the Pool summary is selected, return the following message
    if (selectedPoolId === 'all' || !selectedPoolId) {
        return <SelectPoolWrapper>Select your pool</SelectPoolWrapper>;
    }

    return (
        <Card>
            <Wrapper>
                {/* <SectionTitle>Pool overview</SectionTitle> */}
                {/* <GrayBox> */}
                <CardOverview></CardOverview>
                <GraphWrapper>
                    <ILGraph height={250}></ILGraph>
                </GraphWrapper>
                {/* </GrayBox> */}
            </Wrapper>
        </Card>
    );
};
export default CardInfo;
