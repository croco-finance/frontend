import React from 'react';
import styled from 'styled-components';
import { MultipleTokenLogo, Select } from '@components/ui';

const Wrapper = styled.div`
    display: flex;
    align-items: center;
    width: 100%;
`;

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

interface Option {
    value: any;
    label: string;
}
const TokenOption = ({ value, label }: Option) => (
    <OptionWrapper>
        <LogoWrapper>
            <MultipleTokenLogo size={20} tokens={value.tokens} />
        </LogoWrapper>
        <div>{label}</div>
    </OptionWrapper>
);
interface Props {
    selected?: any;
    options?: any; // ['usdt', 'wbtc', 'eth', 'dai', '...']
    onChange?: any;
    isSearchable?: boolean;
    useWhiteBackground?: boolean;
    useDarkBorder?: boolean;
    placeholder?: string;
}

const MultipleTokenSelect = ({
    options,
    selected,
    onChange,
    isSearchable = false,
    useWhiteBackground = false,
    useDarkBorder = false,
    placeholder,
}: Props) => (
    <Wrapper>
        <Select
            withDropdownIndicator
            options={options}
            onChange={onChange}
            isSearchable={isSearchable}
            formatOptionLabel={TokenOption}
            value={selected}
            useWhiteBackground={useWhiteBackground}
            useDarkBorder={useDarkBorder}
            placeholder={placeholder}
        />
    </Wrapper>
);

export default MultipleTokenSelect;
