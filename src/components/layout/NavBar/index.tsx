import colors from '../../../config/colors';
import React from 'react';
import styled, { css } from 'styled-components';
import { NavLink } from 'react-router-dom';
import { PageLogo } from '../../ui';
import { variables } from '../../../config';

const linkActiveStyles = {
    color: colors.FONT_DARK,
};
const Wrapper = styled.div`
    /* position: absolute; */
    display: flex;
    flex-direction: row;
    background-color: white;
    border-radius: 3px;
    padding: 20px 0px;
    /* border-bottom: 1px solid ${colors.STROKE_GREY}; */
    width: 100%;
    height: 80px;
    align-items: center;
`;

const NavItemsWrapper = styled.div`
    display: flex;
    flex-grow: 1;
    justify-content: flex-end;
`;

const StyledLink = styled(NavLink)`
    color: ${colors.FONT_LIGHT};
    padding: 10px 15px;
    text-decoration: none;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};

    &:hover {
    }
`;

const NavBar = () => (
    <Wrapper>
        <PageLogo height={16}></PageLogo>

        <NavItemsWrapper>
            <StyledLink
                to={{
                    pathname: '/dashboard',
                }}
                activeStyle={linkActiveStyles}
            >
                Dashboard
            </StyledLink>
            <StyledLink
                to={{
                    pathname: '/simulator',
                }}
                activeStyle={linkActiveStyles}
            >
                Simulator
            </StyledLink>
        </NavItemsWrapper>
    </Wrapper>
);

export default NavBar;
