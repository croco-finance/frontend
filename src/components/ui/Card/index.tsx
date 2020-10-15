import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
    background-color: white;
    border-radius: 10px;
    box-shadow: rgba(33, 35, 74, 0.11) 0px 8px 40px;
    padding: 20px;
    min-height: 100px;
    min-width: 100px;
`;

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
}

const Card = ({ children }: Props) => <Wrapper>{children}</Wrapper>;

export default Card;
