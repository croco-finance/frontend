import { Input, Select } from '@components/ui';
import { colors, variables } from '@config';
import { useTheme } from '@hooks';
import React, { useState } from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    color: ${props => props.theme.FONT_DARK};
`;

const AddressInputWrapper = styled.div`
    display: flex;
    /* flex-direction: column; */
    flex-grow: 1;
    margin: 10px 0;
`;

const DexSelectWrapper = styled.div`
    margin: 10px 0;
    // max-width: 20px;
`;

const TextareaWrapper = styled.div`
    margin: 10px 0;
`;

const Textarea = styled.textarea`
    padding: 16px;
    font-family: ${variables.FONT_FAMILY.TTHOVES};
    font-size: ${variables.FONT_SIZE.NORMAL};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    border-radius: 5px;
    border: 2px solid;
    border-color: ${props => props.theme.STROKE_GREY};
    outline: none;
    box-sizing: border-box;
    width: 100%;
    background-color: ${props => props.theme.BG_WHITE};
    transition: border 150ms ease-out;
    -moz-appearance: textfield;
    text-overflow: ellipsis;
    color: ${props => props.theme.FONT_DARK};
    height: 140px;

    &:focus {
        border-color: ${colors.PASTEL_BLUE_MEDIUM};
        border-color: #96b7ff;
        /* background-color: #f9faff; */
    }

    &::placeholder {
        color: ${props => props.theme.FONT_LIGHT};
        font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    }
`;

const ButtonWrapper = styled.div`
    display: flex;
    flex-grow: 1;
    justify-content: center;
    margin-top: 32px;
`;

const SubmitInput = styled.input<{ disabled: boolean }>`
    background-color: ${props =>
        props.disabled ? props.theme.BUTTON_PRIMARY_BG_DISABLED : props.theme.BUTTON_PRIMARY_BG};
    color: ${props => (props.disabled ? props.theme.BUTTON_PRIMARY_FONT_DISABLED : colors.WHITE)};
    border-radius: 5px;
    font-weight: ${variables.FONT_WEIGHT.DEMI_BOLD};
    padding: 8px 10px;
    font-size: ${variables.FONT_SIZE.NORMAL};
    border: none;
    cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
    width: 220px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:focus {
        outline: 0;
    }
`;

const dexOptions = [
    {
        value: 'uniswap',
        label: `Uniswap`,
    },
    {
        value: 'sushiswap',
        label: `SushiSwap`,
    },
    {
        value: 'balancer',
        label: `Balancer`,
    },
];

const FeedbackView = () => {
    // form fields
    const [address, setAddress] = useState('');
    const [dex, setDex] = useState(undefined);
    const [pair, setPair] = useState('');
    const [description, setDescription] = useState('');

    const submitFeedback = () => {
        alert('submit');
    };

    return (
        <Wrapper>
            <form onSubmit={submitFeedback}>
                <TextareaWrapper>
                    <Textarea
                        placeholder="Describe your problem in as much detail as possible"
                        value={description}
                        onChange={event => {
                            setDescription(event.target.value);
                        }}
                    />
                </TextareaWrapper>

                <AddressInputWrapper>
                    <Input
                        placeholder="Enter related ENS domain or Ethereum address (optional)"
                        onChange={event => {
                            setAddress(event.target.value.trim());
                        }}
                        useWhiteBackground
                        useDarkBorder
                        value={address}
                    />
                </AddressInputWrapper>
                <DexSelectWrapper>
                    <Select
                        placeholder="Select exchange (optional)"
                        useWhiteBackground
                        useDarkBorder
                        options={dexOptions}
                        isSearchable={false}
                        onChange={option => setDex(option)}
                        value={dex}
                    />
                </DexSelectWrapper>

                <AddressInputWrapper>
                    <Input
                        placeholder="Pool pair - e.g. ETH/WBTC (optional)"
                        onChange={event => {
                            setPair(event.target.value);
                        }}
                        useWhiteBackground
                        useDarkBorder
                        value={pair}
                    />
                </AddressInputWrapper>

                <ButtonWrapper>
                    <SubmitInput
                        type="submit"
                        value="Submit"
                        disabled={description.trim().length < 1}
                    />
                </ButtonWrapper>
            </form>
        </Wrapper>
    );
};

export default FeedbackView;
