import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
    width: 50%;
    background-color: white;
    padding: 0;
    margin: 0;
`;

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
}

const LeftContainer = ({ children }: Props) => <Wrapper>{children}</Wrapper>;

export default LeftContainer;
