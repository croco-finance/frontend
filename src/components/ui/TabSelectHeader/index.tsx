import { colors, variables, types } from '@config';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { formatUtils } from '@utils';
import { MultipleTokenLogo, InlineCircle } from '@components/ui';

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const Headline = styled.div`
    padding: 0 10px;
    font-size: ${variables.FONT_SIZE.SMALL};
    margin-top: 0;
    display: flex;
    flex-direction: row;
    flex-grow: 1;
    justify-self: flex-start;
    align-items: center;
`;

const HeadlineIcon = styled.div``;

const HeadlineText = styled.div<{ isLarge: boolean }>`
    margin-left: 6px;
    color: ${colors.FONT_LIGHT};
    max-width: 250px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    @media (max-width: ${variables.SCREEN_SIZE.SM}) {
        max-width: 120px;
        font-size: ${variables.FONT_SIZE.TINY};
    }
`;

const Header = styled.div`
    display: flex;
    width: 100%;
    align-items: center;
    /* padding: 0 10px 10px 10px; */
    align-items: center;
    border-bottom: 1px solid ${colors.BACKGROUND_DARK};
    margin-bottom: 40px;
    color: ${colors.FONT_LIGHT};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
`;

const ButtonsWrapper = styled.div`
    display: flex;
    font-size: ${variables.FONT_SIZE.NORMAL};

    @media (max-width: ${variables.SCREEN_SIZE.SM}) {
        font-size: ${variables.FONT_SIZE.SMALL};
    }
`;

const Button = styled.div<{ selected: boolean; disabled?: boolean }>`
    flex-grow: 1;
    color: ${props => (props.selected ? colors.GREEN : colors.FONT_LIGHT)};
    border-bottom: 2px solid;
    border-color: ${props => (props.selected ? colors.GREEN : 'transparent')};
    cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
    padding: 14px 20px;
    box-sizing: border-box;
    margin-bottom: -1px;
    font-weight: ${variables.FONT_WEIGHT.REGULAR};
    position: relative;
`;

const SoonBadge = styled.div`
    color: ${colors.GREEN};
    background-color: #e9ffeb;
    font-size: ${variables.FONT_SIZE.TINY};
    padding: 3px 5px;
    border-radius: 3px;
    font-weight: ${variables.FONT_WEIGHT.DEMI_BOLD};
    position: absolute;
    right: 0px;
    top: -8px;
`;

type TabOptions = 'overview' | 'strategies';

interface Props {
    headlineIcon?: React.ReactNode;
    headlineText?: string;
    onSelectTab: any;
}

const TabSelectHeader = ({ headlineIcon, headlineText, onSelectTab }: Props) => {
    const [selectedTab, setSelectedTab] = useState<TabOptions>('overview');

    return (
        <Header>
            <Headline>
                {headlineIcon && <HeadlineIcon>{headlineIcon}</HeadlineIcon>}
                {headlineText && <HeadlineText isLarge={false}>{headlineText}</HeadlineText>}
            </Headline>
            <ButtonsWrapper>
                <Button
                    onClick={() => {
                        onSelectTab('overview');
                        setSelectedTab('overview');
                    }}
                    selected={selectedTab === 'overview'}
                >
                    Overview
                </Button>
                <Button
                    disabled
                    onClick={() => {
                        // onSelectTab('strategies');
                        // setSelectedTab('strategies');
                    }}
                    selected={selectedTab === 'strategies'}
                >
                    Compare strategies
                    <SoonBadge>SOON</SoonBadge>
                </Button>
            </ButtonsWrapper>
        </Header>
    );
};
export default TabSelectHeader;
