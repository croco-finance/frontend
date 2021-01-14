import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
    display: flex;
    flex: 1 1 0px;
    -webkit-box-flex: 1;
    background-color: ${props => props.theme.BG_WHITE};
    padding-right: 15px;

    @media (max-width: 520px) {
        padding: 0;
    }
`;

const RightFillContainer = () => <Wrapper></Wrapper>;

export default RightFillContainer;
