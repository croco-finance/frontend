import Tippy, { TippyProps } from '@tippyjs/react';
import React, { ReactNode } from 'react';
import styled from 'styled-components';
import 'tippy.js/dist/tippy.css'; // optional

const Wrapper = styled.div``;

const Content = styled.div``;

type Props = TippyProps & {
    children: JSX.Element | JSX.Element[] | string;
    readMore?: { link: string; text: ReactNode } | null;
};

const Tooltip = ({
    placement = 'top',
    interactive = true,
    children,
    duration = 150,
    animation = 'scale',
    className,
    readMore = null,
    content,
    ...rest
}: Props) => (
    <Tippy
        // zIndex={10070}
        // arrow
        // placement={placement}
        // animation={'scale'}
        duration={duration}
        // interactive={interactive}
        // appendTo={() => document.body}
        content={content}
        // {...rest}
    >
        {children}
    </Tippy>
);

export default Tooltip;
