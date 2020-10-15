import React from 'react';
import styled from 'styled-components';
import { Select } from '..';
import { MultipleTokenLogo } from '..';

const Wrapper = styled.div`
    display: flex;
    align-items: center;
    width: 100%;
`;

interface Option {
    value: any;
    label: string;
}
const TokenOption = ({ value, label }: Option) => {
    return (
        <OptionWrapper>
            <LogoWrapper>
                <MultipleTokenLogo size={20} tokens={value.tokens} />
            </LogoWrapper>
            <div>{label}</div>
        </OptionWrapper>
    );
};

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
    selected?: any;
    options?: any; // ['usdt', 'wbtc', 'eth', 'dai', '...']
    onChange?: any;
    isSearchable?: boolean;
}

const MultipleTokenSelect = ({ options, selected, onChange, isSearchable = false }: Props) => {
    return (
        <Wrapper>
            <Select
                withDropdownIndicator
                options={options}
                onChange={onChange}
                isSearchable={isSearchable}
                formatOptionLabel={TokenOption}
                value={selected}
            />
        </Wrapper>
    );
};

export default MultipleTokenSelect;
