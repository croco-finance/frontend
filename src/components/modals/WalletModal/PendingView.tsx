import { AbstractConnector } from '@web3-react/abstract-connector';
import React from 'react';
import styled from 'styled-components/macro';
import { constants } from '@config';
import Option from './Option';
import { injected } from '../../../connectors';
import { darken } from 'polished';
import Loader from '@components/ui/Spinner';

const PendingSection = styled.div`
    align-items: center;
    justify-content: center;
    width: 100%;
    & > * {
        width: 100%;
    }
`;

const StyledLoader = styled(Loader)`
    margin-right: 1rem;
`;

const LoadingMessage = styled.div<{ error?: boolean }>`
    align-items: center;
    justify-content: flex-start;
    border-radius: 12px;
    margin-bottom: 20px;

    & > * {
        padding: 1rem;
    }
`;

const ErrorGroup = styled.div`
    align-items: center;
    justify-content: flex-start;
`;

const ErrorButton = styled.div`
    border-radius: 8px;
    font-size: 12px;
    color: ${({ theme }) => theme.text1};
    margin-left: 1rem;
    padding: 0.5rem;
    font-weight: 600;
    user-select: none;

    &:hover {
        cursor: pointer;
    }
`;

const LoadingWrapper = styled.div`
    align-items: center;
    justify-content: center;
`;

export default function PendingView({
    connector,
    error = false,
    setPendingError,
    tryActivation,
}: {
    connector?: AbstractConnector;
    error?: boolean;
    setPendingError: (error: boolean) => void;
    tryActivation: (connector: AbstractConnector) => void;
}) {
    const isMetamask = window?.ethereum?.isMetaMask;

    return (
        <PendingSection>
            <LoadingMessage error={error}>
                <LoadingWrapper>
                    {error ? (
                        <ErrorGroup>
                            <div>Error connecting</div>
                            <ErrorButton
                                onClick={() => {
                                    setPendingError(false);
                                    // eslint-disable-next-line no-unused-expressions
                                    connector && tryActivation(connector);
                                }}
                            >
                                Try Again
                            </ErrorButton>
                        </ErrorGroup>
                    ) : (
                        <>
                            <StyledLoader />
                            Initializing...
                        </>
                    )}
                </LoadingWrapper>
            </LoadingMessage>
            {Object.keys(constants.SUPPORTED_WALLETS).map(key => {
                const option = constants.SUPPORTED_WALLETS[key];
                if (option.connector === connector) {
                    if (option.connector === injected) {
                        if (isMetamask && option.name !== 'MetaMask') {
                            return null;
                        }
                        if (!isMetamask && option.name === 'MetaMask') {
                            return null;
                        }
                    }
                    return (
                        <Option
                            id={`connect-${key}`}
                            key={key}
                            clickable={false}
                            color={option.color}
                            header={option.name}
                            subheader={option.description}
                            icon={option.iconURL}
                        />
                    );
                }
                return null;
            })}
        </PendingSection>
    );
}
