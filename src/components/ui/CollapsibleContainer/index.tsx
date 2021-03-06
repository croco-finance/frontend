import { colors } from '@config';
import React, { useState } from 'react';
import { UnmountClosed } from 'react-collapse';
import styled from 'styled-components';
import './index.css';

const Header = styled.div<{ roundedBottom: boolean }>`
    /* display: flex;
    align-items: center;
    background-color: ${colors.BACKGROUND};
    border-radius: 10px 10px 0 0;
    padding: 15px; */
    cursor: pointer;
`;

const Headline = styled.div`
    flex-grow: 1;
`;

const ExpandButton = styled.div`
    cursor: pointer;
    border-radius: 20px;
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    &:hover {
        background-color: #dcdce6; // used only here
    }
`;

const Content = styled.div``;

interface Props {
    isOpenedDefault?: boolean;
    header: React.ReactNode;
    collapseBody: React.ReactNode;
    onChange?: any;
}

const CollapsibleContainer = ({
    isOpenedDefault = false,
    collapseBody,
    header,
    onChange,
}: Props) => {
    const [isOpened, setIsOpened] = useState(isOpenedDefault);
    return (
        <div>
            <Header
                className="config"
                roundedBottom={!isOpened}
                onClick={() => {
                    setIsOpened(!isOpened);
                    onChange(!isOpened);
                }}
            >
                {header}
                {/* <Headline>{headline}</Headline>
                <ExpandButton>
                    <Icon icon="arrow_down" size={16} color={colors.FONT_DARK} />
                </ExpandButton> */}
            </Header>

            <UnmountClosed isOpened={isOpened}>
                <Content className="text">{collapseBody}</Content>
            </UnmountClosed>
        </div>
    );
};

export default CollapsibleContainer;
