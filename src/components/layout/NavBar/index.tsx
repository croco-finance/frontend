import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import styled from 'styled-components';
import { variables } from '../../../config';
import colors from '../../../config/colors';
import { PageLogo } from '../../ui';
import { useSelector } from 'react-redux';

const linkActiveStyles = {
    color: colors.FONT_DARK,
};
const Wrapper = styled.div`
    /* position: absolute; */
    display: flex;
    flex-direction: row;
    border-radius: 3px;
    /* border-bottom: 1px solid ${colors.STROKE_GREY}; */
    width: 100%;
    height: 80px;
    align-items: center;

    @media (max-width: 520px) {
        padding: 0 10px 10px 10px;
        height: 70px;
    }
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

const NavBar = () => {
    const addressGlobal = useSelector(state => state.userAddress);
    const addressPath = addressGlobal ? addressGlobal : '';

    return (
        <Wrapper>
            <Link
                to={{
                    pathname: '/',
                }}
            >
                <PageLogo height={20}></PageLogo>
            </Link>
            <NavItemsWrapper>
                <StyledLink
                    to={{
                        pathname: `/dashboard/${addressPath}`,
                    }}
                    activeStyle={linkActiveStyles}
                >
                    Dashboard
                </StyledLink>
                <StyledLink
                    to={{
                        pathname: `/simulator/${addressPath}`,
                    }}
                    activeStyle={linkActiveStyles}
                >
                    Simulator
                </StyledLink>
            </NavItemsWrapper>
        </Wrapper>
    );
};

export default NavBar;
