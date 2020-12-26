import { DarkModeSwitch, NoTextLogo, PageLogo } from '@components/ui';
import { analytics, variables } from '@config';
import { useTheme } from '@hooks';
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import styled from 'styled-components';

const Wrapper = styled.div`
    display: flex;
    flex-direction: row;
    border-radius: 3px;
    width: 100%;
    height: 80px;
    align-items: center;

    @media (max-width: ${variables.SCREEN_SIZE.SM}) {
        padding: 10px 0px;
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

const DarkModeSwitchWrapper = styled.div`
    margin-left: 10px;
    @media (min-width: ${variables.SCREEN_SIZE.LG}) {
        display: none;
    }
`;

const NavBar = () => {
    const theme: any = useTheme();

    return (
        <Wrapper>
            <Link
                onClick={() => {
                    analytics.logEvent('navbar_view_change', {
                        changedTo: 'landing_page',
                    });
                }}
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
                    onClick={() => {
                        analytics.logEvent('navbar_view_change', {
                            changedTo: 'dashboard',
                        });
                    }}
                    to={{
                        pathname: `/dashboard`,
                    }}
                    activeStyle={{
                        color: theme.NAV_ACTIVE_FONT,
                        backgroundColor: theme.NAV_ACTIVE_BG,
                    }}
                >
                    Dashboard
                </StyledLink>
                <StyledLink
                    onClick={() => {
                        analytics.logEvent('navbar_view_change', {
                            changedTo: 'simulator',
                        });
                    }}
                    to={{
                        pathname: `/simulator`,
                    }}
                    activeStyle={{
                        color: theme.NAV_ACTIVE_FONT,
                        backgroundColor: theme.NAV_ACTIVE_BG,
                    }}
                >
                    Simulator
                </StyledLink>
                <DarkModeSwitchWrapper>
                    <DarkModeSwitch />
                </DarkModeSwitchWrapper>
            </NavItemsWrapper>
        </Wrapper>
    );
};

export default NavBar;
