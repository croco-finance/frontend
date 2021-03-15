import styled, { css } from 'styled-components';
import React, { ReactNode } from 'react';
import Tippy, { TippyProps } from '@tippyjs/react';
// import { tippy } from './tippy.style';
import { colors, variables } from '@config';
import 'tippy.js/dist/tippy.css'; // optional
import { Icon } from '@components/ui';
import { useTheme } from '@hooks';

const IconWrapper = styled.div`
    display: flex;
    padding: 0 5px;
    align-items: center;
`;

type Props = TippyProps & {
    readMore?: { link: string; text: ReactNode } | null;
};

const QuestionTooltip = ({
    placement = 'top',
    interactive = true,
    duration = 150,
    animation = 'scale',
    className,
    readMore = null,
    content,
    ...rest
}: Props) => {
    const theme = useTheme();
    return (
        <Tippy duration={duration} content={content}>
            <IconWrapper className={className}>
                <Icon icon="question" color={theme.FONT_LIGHT} size={16} />
            </IconWrapper>
        </Tippy>
    );
};

export default QuestionTooltip;
