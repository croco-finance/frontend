import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
    display: flex;
    flex: 1 1 0px;
    -webkit-box-flex: 1;
    padding-left: 15px;
    background-color: ${props => props.theme.BACKGROUND_DARK};

    @media (max-width: 1100px) {
        background-color: ${props => props.theme.BACKGROUND_DARK};
    }

    @media (max-width: 520px) {
        padding: 0;
    }
`;

const LeftFillContainer = () => <Wrapper></Wrapper>;

export default LeftFillContainer;
