import { colors, variables } from '@config';
import React, { useState } from 'react';
import styled from 'styled-components';
import { useTheme } from '@hooks';

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
    border-bottom: 1px solid ${props => props.theme.BACKGROUND_DARK};
    margin-bottom: 30px;
    color: ${props => props.theme.FONT_LIGHT};
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

const Button = styled.div<{ selected: boolean; disabled?: boolean; color: string; bold: boolean }>`
    display: flex;
    flex-grow: 1;
    color: ${props => (props.selected ? props.color : props.theme.FONT_LIGHT)};
    border-bottom: 2px solid;
    border-color: ${props => (props.selected ? props.color : 'transparent')};
    cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
    padding: 0 14px;
    box-sizing: border-box;
    margin-bottom: -1px;
    font-weight: ${props =>
        props.bold ? variables.FONT_WEIGHT.MEDIUM : variables.FONT_WEIGHT.REGULAR};
    position: relative;
    height: 100%;
    align-items: center;
`;
interface Props extends React.HTMLAttributes<HTMLDivElement> {
    headline?: React.ReactNode;
    onSelectTab: any;
    hideTabs?: boolean;
    tabHeadlines: string[];
    tabIds: string[];
    focusColor?: string;
    bold?: boolean;
}

const TabSelectHeader = ({
    headline,
    onSelectTab,
    hideTabs = false,
    tabHeadlines,
    tabIds,
    focusColor,
    bold = false,
    className,
}: Props) => {
    const [selectedTab, setSelectedTab] = useState(tabIds[0]);
    const theme = useTheme();

    return (
        <Header className={className}>
            {headline && <Headline>{headline}</Headline>}
            {!hideTabs && (
                <ButtonsWrapper>
                    {tabIds.map((id, i) => {
                        return (
                            <Button
                                color={focusColor ? focusColor : theme.GREEN}
                                bold={bold}
                                onClick={() => {
                                    onSelectTab(id);
                                    setSelectedTab(id);
                                }}
                                selected={selectedTab === id}
                            >
                                <span>{tabHeadlines[i]}</span>
                            </Button>
                        );
                    })}
                </ButtonsWrapper>
            )}
        </Header>
    );
};
export default TabSelectHeader;
