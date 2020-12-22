import { colors, variables, constants } from '@config';
import React, { useState } from 'react';
import styled from 'styled-components';
import { Icon } from '@components/ui';

const Wrapper = styled.div`
    position: fixed;
    display: flex;
    align-items: center;
    justify-content: center;
    bottom: 25px;
    right: 25px;
    border-radius: 100px;
    background-color: transparent;
    box-shadow: rgba(33, 35, 74, 0.11) 0px 2px 10px;

    @media (max-width: ${variables.SCREEN_SIZE.LG}) {
        bottom: 0;
        right: 0;
        left: 0;
        border-radius: 0;
        position: static;
    }
`;

const FeedbackIconWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 20px;
    background-color: ${props => props.theme.BUTTON_PRIMARY_BG};
    border-radius: 100px;
    height: 46px;
    width: 46px;

    @media (max-width: ${variables.SCREEN_SIZE.LG}) {
        display: none;
    }
`;

const SocialIconsWrapper = styled.div<{ isHovered: boolean }>`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: ${props => props.theme.BACKGROUND};
    border-radius: 100px;
    padding-bottom: 56px;
    padding-top: 8px;
    position: fixed;
    bottom: 25px;
    right: 25px;
    width: 46px;
    max-height: ${props => (props.isHovered ? '500px' : '0px')};
    opacity: ${props => (props.isHovered ? '1' : '0')};
    transition: ${props =>
        props.isHovered
            ? 'max-height 0.4s ease-out, opacity 0.3s cubic-bezier(0.04, 0.79, 0.32, 0.98)'
            : 'max-height 0.3s ease-out, opacity 0.2s cubic-bezier(0.97, 0.02, 1, 0.24)'};

    @media (max-width: ${variables.SCREEN_SIZE.LG}) {
        transition: none;
        opacity: 1;
        bottom: 0;
        flex-direction: row;
        width: 100%;
        max-height: none;
        height: auto;
        padding: 6px;
        right: 0;
        left: 0;
        border-radius: 0;
        align-items: center;
        justify-content: center;
        position: static;
    }
`;

const IconLinkWrapper = styled.a`
    text-decoration: none;
    cursor: pointer;
    margin: 5px 0;
    height: 32px;
    width: 32px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        text-decoration: none;
    }

    @media (max-width: ${variables.SCREEN_SIZE.LG}) {
        height: auto;
        width: auto;
        padding: 5px;
        margin: 0 20px;
    }
`;

const SocialButtonBubble = () => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Wrapper
            onMouseEnter={() => {
                setIsHovered(true);
            }}
            onMouseLeave={() => {
                setIsHovered(false);
            }}
        >
            <FeedbackIconWrapper>
                <Icon icon={'feedback'} size={18} color={colors.WHITE} />
            </FeedbackIconWrapper>
            <SocialIconsWrapper isHovered={isHovered}>
                <IconLinkWrapper rel="noreferrer" target="_blank" href={constants.TWITTER_LINK}>
                    <Icon icon="twitter" size={18} />
                </IconLinkWrapper>
                <IconLinkWrapper rel="noreferrer" target="_blank" href={constants.TELEGRAM_LINK}>
                    <Icon icon="telegram" size={18} />
                </IconLinkWrapper>
                <IconLinkWrapper rel="noreferrer" target="_blank" href={constants.DISCORD_LINK}>
                    <Icon icon="discord" size={18} />
                </IconLinkWrapper>
            </SocialIconsWrapper>
        </Wrapper>
    );
};
export default SocialButtonBubble;
