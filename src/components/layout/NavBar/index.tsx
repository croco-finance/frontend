import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { variables, colors } from '@config';
import { PageLogo, NoTextLogo } from '@components/ui';
import { useSelector } from 'react-redux';
import { AppThemeColors } from '@types';
import { useTheme } from '@hooks';

const Wrapper = styled.div`
    /* position: absolute; */
    display: flex;
    flex-direction: row;
    border-radius: 3px;
    /* border-bottom: 1px solid ${colors.STROKE_GREY}; */
    width: 100%;
    height: 80px;
    align-items: center;

    @media (max-width: ${variables.SCREEN_SIZE.MD}) {
        padding-right: 40px;
    }

    @media (max-width: ${variables.SCREEN_SIZE.SM}) {
        padding: 10px 30px 10px 0;
        height: auto;
    }
`;

const PageLogoWrapper = styled.div`
    display: flex;

    @media (max-width: ${variables.SCREEN_SIZE.SM}) {
        display: none;
    }
`;

const NoTextLogoWrapper = styled.div`
    display: flex;

    @media (min-width: ${variables.SCREEN_SIZE.SM}) {
        display: none;
    }
`;

const NavItemsWrapper = styled.div`
    display: flex;
    flex-grow: 1;
    justify-content: flex-end;
`;

const StyledLink = styled(NavLink)`
    color: ${props => props.theme.FONT_LIGHT};
    padding: 10px 15px;
    text-decoration: none;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    border-radius: 5px;
`;

const NavBar = () => {
    const addressGlobal = useSelector(state => state.userAddress);
    const addressPath = addressGlobal ? addressGlobal : '';
    const theme: any = useTheme();

    return (
        <Wrapper>
            <Link
                to={{
                    pathname: '/',
                }}
            >
                <PageLogoWrapper>
                    <PageLogo height={20} />
                </PageLogoWrapper>
                <NoTextLogoWrapper>
                    <NoTextLogo height={20} />
                </NoTextLogoWrapper>
            </Link>
            <NavItemsWrapper>
                <StyledLink
                    to={{
                        pathname: `/dashboard/${addressPath}`,
                    }}
                    activeStyle={{
                        color: theme.NAV_ACTIVE_FONT,
                        backgroundColor: theme.NAV_ACTIVE_BG,
                    }}
                >
                    Dashboard
                </StyledLink>
                <StyledLink
                    to={{
                        pathname: `/simulator/${addressPath}`,
                    }}
                    activeStyle={{
                        color: theme.NAV_ACTIVE_FONT,
                        backgroundColor: theme.NAV_ACTIVE_BG,
                    }}
                >
                    Simulator
                </StyledLink>
            </NavItemsWrapper>
        </Wrapper>
    );
};

export default NavBar;
