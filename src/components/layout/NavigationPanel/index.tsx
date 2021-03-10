import { variables, constants } from '@config';
import logo from '@data/images/logo.svg';
import React, { useState } from 'react';
import styled from 'styled-components';
import { DarkModeSwitch, NoTextLogo, PageLogo, Icon } from '@components/ui';
import { Link, NavLink } from 'react-router-dom';
import { useTheme } from '@hooks';
import { useDispatch } from 'react-redux';
import { openModal } from '@actions';
import { useSelector } from '@reducers';
import { matchPath, withRouter } from 'react-router';
import { useLayoutSize } from '@hooks';

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 220px;
    border-right: 1px solid ${props => props.theme.STROKE_GREY};
    background-color: ${props => props.theme.BACKGROUND_DARK};
    padding: 20px;

    @media (max-width: ${variables.SCREEN_SIZE.LG}) {
        height: 70px;
        width: 100%;
        align-items: center;
        flex-direction: row;
    }
`;

const AppLogo = styled.div`
    border-bottom: 1px solid ${props => props.theme.STROKE_GREY};
    padding-bottom: 20px;
    margin-bottom: 14px;
    padding-top: 4px;

    @media (max-width: ${variables.SCREEN_SIZE.LG}) {
        border: none;
        padding: 0;
        margin: 0 20px 0 0;
    }
`;

const NavItems = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1 1 0%;

    @media (max-width: ${variables.SCREEN_SIZE.LG}) {
        flex-direction: row;
    }

    @media (max-width: ${variables.SCREEN_SIZE.MD}) {
        flex-direction: column;
        flex: 1 1 0%;
    }
`;

const NavItem = styled(NavLink)`
    color: ${props => props.theme.FONT_MEDIUM};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    font-size: ${variables.FONT_SIZE.NORMAL};
    padding: 12px 0;
    text-decoration: none;
    display: flex;
    align-items: center;

    @media (max-width: ${variables.SCREEN_SIZE.LG}) {
        margin-right: 20px;
    }

    @media (max-width: ${variables.SCREEN_SIZE.MD}) {
        margin-right: 0;
        padding: 16px 0; // bigger padding for mobile use
    }
`;

const NavIcon = styled(Icon)`
    margin-right: 10px;
`;

const FeedbackWrapper = styled.div`
    padding-bottom: 14px;
    margin-bottom: 14px;
    border-bottom: 1px solid ${props => props.theme.STROKE_GREY};
    color: ${props => props.theme.FONT_MEDIUM};
    font-size: ${variables.FONT_SIZE.NORMAL};

    @media (max-width: ${variables.SCREEN_SIZE.LG}) {
        border: none;
        padding: 0;
        margin: 0;
    }

    @media (max-width: ${variables.SCREEN_SIZE.MD}) {
        padding-bottom: 20px;
        margin-bottom: 16px;
        border-bottom: 1px solid ${props => props.theme.STROKE_GREY};
    }
`;

const FeedbackIcon = styled(Icon)`
    margin-right: 8px;
`;
const Tools = styled.div`
    display: flex;
`;

const SocialLinks = styled.div`
    display: flex;
    flex: 1 1 0%;
`;

const ToolItem = styled.div``;
const IconLinkWrapper = styled.a`
    text-decoration: none;
    cursor: pointer;
    margin: 0 10px;
    display: flex;
    align-items: center;

    &:hover {
        text-decoration: none;
    }
`;

const HamburgerIcon = styled(Icon)`
    display: flex;
    width: 100%;
    justify-content: flex-end;
`;

const MobileMenuWrapper = styled.div`
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 67px;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 20px;
    background-color: ${props => props.theme.BG_WHITE};
    z-index: 10;
`;

const NavigationPanel = props => {
    const theme: any = useTheme();
    const dispatch = useDispatch();
    const themeApp = useSelector(state => state.app.theme);
    const { layoutSize } = useLayoutSize();
    const [mobileMenuOpened, setMobileMenuOpened] = useState(false);

    const isDashboardPathActive = !!matchPath(props.location.pathname, '/dashboard/');
    const isSimulatorPathActive = !!matchPath(props.location.pathname, '/simulator/');
    const hideNavIcons = layoutSize === 'NORMAL';
    const hideNavbarItems = layoutSize === 'TINY' || layoutSize === 'SMALL';

    const menu = (
        <>
            <NavItems>
                <NavItem
                    to={{
                        pathname: `/dashboard`,
                    }}
                    activeStyle={{
                        color: theme.NAV_ACTIVE_FONT,
                    }}
                    onClick={() => setMobileMenuOpened(false)}
                >
                    {!hideNavIcons && (
                        <NavIcon
                            icon="dashboard"
                            size={16}
                            color={
                                isDashboardPathActive ? theme.NAV_ACTIVE_FONT : theme.FONT_MEDIUM
                            }
                        />
                    )}
                    Dashboard
                </NavItem>
                <NavItem
                    to={{
                        pathname: `/simulator`,
                    }}
                    activeStyle={{
                        color: theme.NAV_ACTIVE_FONT,
                    }}
                    onClick={() => setMobileMenuOpened(false)}
                >
                    {!hideNavIcons && (
                        <NavIcon
                            icon="filter"
                            size={16}
                            color={
                                isSimulatorPathActive ? theme.NAV_ACTIVE_FONT : theme.FONT_MEDIUM
                            }
                        />
                    )}
                    Simulator
                </NavItem>
            </NavItems>
            <FeedbackWrapper>
                <IconLinkWrapper
                    onClick={() => {
                        dispatch(openModal({ type: 'feedback' }));
                        setMobileMenuOpened(false);
                    }}
                >
                    <FeedbackIcon
                        icon="feedback"
                        size={16}
                        color={themeApp === 'light' ? theme.FONT_MEDIUM : '#ccd6db'}
                    />
                    Give Feedback
                </IconLinkWrapper>
            </FeedbackWrapper>
            <Tools>
                <SocialLinks>
                    <IconLinkWrapper rel="noreferrer" target="_blank" href={constants.DISCORD_LINK}>
                        <Icon icon="discord" size={18} />
                    </IconLinkWrapper>
                    <IconLinkWrapper
                        rel="noreferrer"
                        target="_blank"
                        href={constants.TELEGRAM_LINK}
                    >
                        <Icon icon="telegram" size={18} />
                    </IconLinkWrapper>
                    <IconLinkWrapper rel="noreferrer" target="_blank" href={constants.TWITTER_LINK}>
                        <Icon icon="twitter" size={18} />
                    </IconLinkWrapper>
                </SocialLinks>
                <ToolItem>
                    <DarkModeSwitch />
                </ToolItem>
            </Tools>
        </>
    );

    return (
        <Wrapper>
            <Link
                to={{
                    pathname: '/',
                }}
                onClick={() => setMobileMenuOpened(false)}
            >
                <AppLogo>
                    <PageLogo height={20} />
                </AppLogo>
            </Link>

            {/* DESKTOP layout */}
            {!hideNavbarItems && menu}

            {/* MOBILE layout */}
            {hideNavbarItems && (
                <HamburgerIcon
                    icon={mobileMenuOpened ? 'close' : 'hamburger_menu'}
                    size={mobileMenuOpened ? 20 : 26}
                    color={theme.FONT_DARK}
                    onClick={() => setMobileMenuOpened(!mobileMenuOpened)}
                />
            )}
            {mobileMenuOpened && hideNavbarItems && <MobileMenuWrapper>{menu}</MobileMenuWrapper>}
        </Wrapper>
    );
};

export default withRouter(NavigationPanel);
