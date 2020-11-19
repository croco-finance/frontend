import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div``;

const StyledLink = styled.a`
    display: flex;
    text-decoration: none;
`;

interface Props {
    children?: React.ReactNode;
    url: string;
    showIcon?: boolean;
    iconSize?: number;
    color?: string;
}

const CustomLink = ({ children, url, ...rest }: Props) => {
    return (
        <Wrapper>
            <StyledLink target="_blank" href={url}>
                {children}
            </StyledLink>
        </Wrapper>
    );
};

export default CustomLink;
