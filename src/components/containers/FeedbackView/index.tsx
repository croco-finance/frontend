import { Input, Select, Spinner } from '@components/ui';
import { colors, firebase, variables } from '@config';
import { useSelector } from '@reducers';
import React, { useState } from 'react';
import styled from 'styled-components';
import Illustration from '../../../data/images/croco_thumb_up.svg';
import IllustrationDark from '../../../data/images/croco_thumb_up_dark.svg';

const Wrapper = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    color: ${props => props.theme.FONT_DARK};
`;

const AnonymousNote = styled.div`
    text-align: left;
    font-size: ${variables.FONT_SIZE.SMALL};
    color: ${props => props.theme.FONT_LIGHT};
    margin-bottom: 14px;
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
    flex-direction: column;
    align-items: center;
`;

const AddButton = styled.button<{ disabled: boolean }>`
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

const IllustrationWrapper = styled.img`
    display: inline-block;
    height: ${props => props.height}px;

    div {
        height: ${props => props.height}px;
        line-height: ${props => props.height}px;
    }
`;

const ThankYouMessage = styled.div`
    font-weight: ${variables.FONT_WEIGHT.DEMI_BOLD};
    font-size: ${variables.FONT_SIZE.NORMAL};
    color: ${props => props.theme.FONT_DARK};
    margin-bottom: 44px;
`;

const FeedbackSentContent = styled.div`
    padding-bottom: 40px;
`;

const ErrorWrapper = styled.div`
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    font-size: ${variables.FONT_SIZE.SMALL};
    color: ${props => props.theme.RED};
    margin: 10px 0;
`;

interface Option {
    value: string;
    label: string;
}
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
    {
        value: 'materia',
        label: `Materia`,
    },
];

const FeedbackView = () => {
    const { theme, selectedAddress } = useSelector(state => state.app);

    // form fields
    const [address, setAddress] = useState(selectedAddress);
    const [dex, setDex] = useState<Option | undefined>(undefined);
    const [pair, setPair] = useState('');
    const [description, setDescription] = useState('');

    // validation
    const [feedbackSent, setFeedbackSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const submitFeedback = async () => {
        if (!isFeedbackTooShort() && !isFeedbackTooLong()) {
            setLoading(true);
            const timestampSec = Math.floor(Date.now() / 1000);
            const firebaseRef = firebase.feedback(timestampSec.toString());

            let feedbackObj: { [key: string]: string } = {
                description: description.toString().trim(),
            };

            // send only the fields that are defined
            if (address) feedbackObj = { ...feedbackObj, userAddress: address.toString().trim() };
            if (dex) feedbackObj = { ...feedbackObj, exchange: dex.value.toString().trim() };
            if (pair) feedbackObj = { ...feedbackObj, pair: pair.toString().trim() };

            // send feedback
            try {
                await firebaseRef.set(feedbackObj);
                setFeedbackSent(true);
                setLoading(false);
                resetForm();
            } catch (e) {
                console.log('Error while sending feedback');
                setFeedbackSent(false);
                setLoading(false);
            }
        }
    };

    const resetForm = () => {
        setDex(undefined);
        setPair('');
        setDescription('');
        setAddress('');
    };

    const isFeedbackTooShort = () => {
        return description.trim().length < 1;
    };

    const isFeedbackTooLong = () => {
        return description.trim().length > 5000;
    };

    return (
        <Wrapper>
            {feedbackSent ? (
                <FeedbackSentContent>
                    <ThankYouMessage>Thank you for your feedback!</ThankYouMessage>
                    <IllustrationWrapper
                        height={120}
                        src={theme === 'light' ? Illustration : IllustrationDark}
                    />
                </FeedbackSentContent>
            ) : (
                <>
                    <AnonymousNote>
                        This feedback is 100% anonymous - we store only the information that you
                        type in this form.
                    </AnonymousNote>
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
                        <AddButton
                            onClick={() => {
                                submitFeedback();
                            }}
                            disabled={isFeedbackTooShort() || isFeedbackTooLong()}
                        >
                            {loading ? <Spinner size={14} color={colors.FONT_MEDIUM} /> : 'Submit'}
                        </AddButton>
                        {isFeedbackTooLong() && (
                            <ErrorWrapper>
                                Your feedback is too long (maximum of 5000 characters is allowed)
                            </ErrorWrapper>
                        )}
                    </ButtonWrapper>
                </>
            )}
        </Wrapper>
    );
};

export default FeedbackView;
