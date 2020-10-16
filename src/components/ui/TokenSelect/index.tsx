import React from 'react';
import styled from 'styled-components';
import { TokenLogo, Select } from '..';

const Wrapper = styled.div`
    display: flex;
    align-items: center;
    /* padding: 0px 15px; */
    /* border: 1px solid #e0e0e6; */
    width: 140px;
    /* border-radius: 50px; */
`;

interface Option {
    value: string;
    label: string;
}
const TokenOption = ({ value, label }: Option) => (
    <OptionWrapper>
        <LogoWrapper>
            <TokenLogo size={20} symbol={value} />
        </LogoWrapper>
        <div>{label}</div>
    </OptionWrapper>
);

const OptionWrapper = styled.div`
    display: flex;
    align-items: center;
    height: 30px;
`;

const LogoWrapper = styled.div`
    padding-left: 8px;
    padding-right: 10px;
    display: flex;
    align-items: center;
`;

interface Props {
    selectedToken: string;
    tokens?: any;
    onChange?: any;
    options?: any;
}

const TokenSelect = ({ tokens, selectedToken, onChange }: Props) => {
    return (
        <Wrapper>
            <Select
                withDropdownIndicator
                options={tokens}
                onChange={onChange}
                isSearchable
                formatOptionLabel={TokenOption}
            />
        </Wrapper>
    );
};

export default TokenSelect;
