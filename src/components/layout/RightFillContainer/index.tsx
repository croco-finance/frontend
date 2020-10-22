import React from 'react';
import styled from 'styled-components';
import colors from '../../../config/colors';

const Wrapper = styled.div`
    display: flex;
    flex: 1 1 0px;
    -webkit-box-flex: 1;
    background-color: ${colors.BACKGROUND};
    padding-right: 15px;

    @media (max-width: 520px) {
        padding: 0;
    }
`;

const RightFillContainer = () => <Wrapper></Wrapper>;

export default RightFillContainer;
