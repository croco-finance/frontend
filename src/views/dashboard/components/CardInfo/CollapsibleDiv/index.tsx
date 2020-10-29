import React, { useState } from 'react';
import { Collapse } from 'react-collapse';

interface Props {
    isOpened?: boolean;
    paragraphs?: number;
}

const CollapsibleDiv = ({ isOpened = false, paragraphs = 0 }: Props) => {
    const [isOpenedState, setIsOpenedState] = useState(isOpened);
    return (
        <div>
            <div className="config">
                <div
                    onClick={() => {
                        setIsOpenedState(!isOpenedState);
                    }}
                >
                    Header
                </div>
            </div>

            <Collapse isOpened={isOpenedState}>
                <div className="text">
                    <p>UAAAAAAAAAAAAAAAAAAAa</p>
                </div>
            </Collapse>
        </div>
    );
};

export default CollapsibleDiv;
