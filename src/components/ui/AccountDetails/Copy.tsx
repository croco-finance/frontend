import React from 'react';
import styled from 'styled-components/macro';
import useCopyClipboard from '../../../hooks';
import { CheckCircle, Copy } from 'react-feather';

// A button that triggers some onClick result, but looks like a link.
const LinkStyledButton = styled.button<{ disabled?: boolean }>`
    border: none;
    text-decoration: none;
    background: none;

    cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
    color: ${({ theme, disabled }) => (disabled ? theme.text2 : theme.primary1)};
    font-weight: 500;

    :hover {
        text-decoration: ${({ disabled }) => (disabled ? null : 'underline')};
    }

    :focus {
        outline: none;
        text-decoration: ${({ disabled }) => (disabled ? null : 'underline')};
    }

    :active {
        text-decoration: none;
    }
`;

const CopyIcon = styled(LinkStyledButton)`
    color: ${({ theme }) => theme.text3};
    flex-shrink: 0;
    display: flex;
    text-decoration: none;
    font-size: 0.825rem;
    :hover,
    :active,
    :focus {
        text-decoration: none;
        color: ${({ theme }) => theme.text2};
    }
`;
const TransactionStatusText = styled.span`
    margin-left: 0.25rem;
    font-size: 0.825rem;
    ${({ theme }) => theme.flexRowNoWrap};
    align-items: center;
`;

export default function CopyHelper(props: { toCopy: string; children?: React.ReactNode }) {
    const [isCopied, setCopied] = useCopyClipboard();

    return (
        <CopyIcon onClick={() => setCopied(props.toCopy)}>
            {isCopied ? (
                <TransactionStatusText>
                    <CheckCircle size="16" />
                    <TransactionStatusText>Copied</TransactionStatusText>
                </TransactionStatusText>
            ) : (
                <TransactionStatusText>
                    <Copy size="16" />
                </TransactionStatusText>
            )}
            {isCopied ? '' : props.children}
        </CopyIcon>
    );
}
