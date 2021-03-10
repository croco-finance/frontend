import { CustomLink, Icon, MultipleTokenLogo } from '@components/ui';
import { constants, variables } from '@config';
import { useTheme } from '@hooks';
import { Exchange, TokenType } from '@types';
import { formatUtils } from '@utils';
import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
    display: flex;
    align-items: center;
    width: 100%;
    flex-grow: 1;
    font-size: ${variables.FONT_SIZE.SMALL};
`;

const Text = styled.div`
    display: flex;
    align-items: center;
    margin-left: 8px;
    margin-right: 6px;
    margin-top: 2px; // text is not aligning exactly to the center and I don't know why
    max-width: 250px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    @media (max-width: ${variables.SCREEN_SIZE.SM}) {
        max-width: 120px;
        font-size: ${variables.FONT_SIZE.TINY};
    }
`;

const IconWrapper = styled.div`
    transition: 0.15s;
    padding: 5px;
    border-radius: 20px;
    display: flex;

    &:hover {
        background-color: ${props => props.theme.BACKGROUND_DARK};
    }
`;

interface Props {
    tokenSymbolsArr: Array<TokenType>;
    exchange: Exchange;
    poolId: string;
}
const PoolHeader = ({ tokenSymbolsArr, exchange, poolId }: Props) => {
    const poolUrl = constants.DEX_POOL_BASE_URLS[exchange] + poolId;
    const theme = useTheme();

    return (
        <Wrapper>
            <MultipleTokenLogo size={18} tokens={tokenSymbolsArr} />
            <Text>{formatUtils.tokenArrToCommaSeparatedString(tokenSymbolsArr)}</Text>
            <CustomLink url={poolUrl} iconSize={16} color={theme.FONT_MEDIUM}>
                <IconWrapper>
                    <Icon icon="external_link" size={16} color={theme.FONT_MEDIUM} />
                </IconWrapper>
            </CustomLink>
        </Wrapper>
    );
};
export default PoolHeader;
