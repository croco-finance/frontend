import { colors, variables } from '@config';
import React, { useState } from 'react';
import styled from 'styled-components';

const Headline = styled.div`
    display: flex;
    flex-grow: 1;
`;

const Header = styled.div`
    display: flex;
    width: 100%;
    align-items: center;
    /* padding: 0 10px 10px 10px; */
    align-items: center;
    border-bottom: 1px solid ${colors.BACKGROUND_DARK};
    margin-bottom: 30px;
    color: ${colors.FONT_LIGHT};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    height: 60px;
`;

const ButtonsWrapper = styled.div`
    display: flex;
    font-size: ${variables.FONT_SIZE.NORMAL};
    height: 100%;

    @media (max-width: ${variables.SCREEN_SIZE.SM}) {
        font-size: ${variables.FONT_SIZE.SMALL};
    }
`;

const Button = styled.div<{ selected: boolean; disabled?: boolean }>`
    display: flex;
    flex-grow: 1;
    color: ${props => (props.selected ? colors.GREEN : colors.FONT_LIGHT)};
    border-bottom: 2px solid;
    border-color: ${props => (props.selected ? colors.GREEN : 'transparent')};
    cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
    padding: 0 20px;
    box-sizing: border-box;
    margin-bottom: -1px;
    font-weight: ${variables.FONT_WEIGHT.REGULAR};
    position: relative;
    height: 100%;
    align-items: center;
`;

type TabOptions = 'overview' | 'strategies';

interface Props {
    headline?: React.ReactNode;
    onSelectTab?: any;
    hideTabs?: boolean;
}

const TabSelectHeader = ({ headline, onSelectTab, hideTabs = false }: Props) => {
    const [selectedTab, setSelectedTab] = useState<TabOptions>('overview');

    return (
        <Header>
            <Headline>{headline}</Headline>
            {!hideTabs && (
                <ButtonsWrapper>
                    <Button
                        onClick={() => {
                            onSelectTab('overview');
                            setSelectedTab('overview');
                        }}
                        selected={selectedTab === 'overview'}
                    >
                        <span>Overview</span>
                    </Button>
                    <Button
                        onClick={() => {
                            onSelectTab('strategies');
                            setSelectedTab('strategies');
                        }}
                        selected={selectedTab === 'strategies'}
                    >
                        <span>Compare strategies</span>
                    </Button>
                </ButtonsWrapper>
            )}
        </Header>
    );
};
export default TabSelectHeader;
