import { Input, MaterialSlider } from '@components/ui';
import { colors, variables } from '@config';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';

const rightAlignedStyles = css`
    text-align: right;
    justify-self: flex-end; /* text-align is not enough if you want to align for example button */
`;

const leftAlignedStyles = css`
    text-align: left;
    justify-self: flex-start;
`;

const SliderWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-self: flex-start;
`;

const SliderLabel = styled.div`
    color: ${colors.FONT_LIGHT};
    font-weight: ${variables.FONT_WEIGHT.REGULAR};
`;
const SliderLeftLabel = styled(SliderLabel)`
    padding-right: 10px;
`;
const SliderRightLabel = styled(SliderLabel)`
    padding-left: 12px;
`;

const InputWrapper = styled.div`
    max-width: 76px;
`;

interface RowContentProps {
    color?: 'light' | 'dark';
    textAlign?: 'left' | 'right';
}

// this wrapper sets the text color of the item based on the  color: 'light' | 'dark' prop
const Col = styled.div<RowContentProps>`
    display: flex;
    align-items: center;
    /* height: 36px; */
    color: ${props => (props.color === 'light' ? `${colors.FONT_MEDIUM}` : `${colors.FONT_DARK}`)};

    /* content alignment styles */
    ${props =>
        props.textAlign === 'left'
            ? leftAlignedStyles
            : rightAlignedStyles} /* justify-content: center; */

@media (max-width: 580px) {
        font-size: ${variables.FONT_SIZE.SMALL};
    }
`;

const TokenNameCol = styled(Col)<RowContentProps>`
    max-width: 90px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;
interface Props {
    firstColumn?: React.ReactNode;
    secondColumn?: React.ReactNode;
    thirdColumn?: React.ReactNode;
    fourthColumn?: React.ReactNode;
    color?: 'light' | 'dark';
    onSliderChange?: any;
    defaultSliderValue?: number;
}

const PriceChangeRow = ({
    firstColumn,
    fourthColumn,
    onSliderChange,
    defaultSliderValue = 1,
    color = 'light',
}: Props) => {
    const [sliderMidValue, setSliderMidValue] = useState(defaultSliderValue);
    const [sliderValue, setSliderValue] = useState(defaultSliderValue);

    const handleSliderChange = newValue => {
        setSliderValue(newValue);
        onSliderChange(newValue);
    };

    const handleInputChange = event => {
        let typedValueFloat = parseFloat(event.target.value);

        // TODO handle the situation when user types in empty string
        // if (!isNaN(typedValueFloat)) {
        //     handleSliderChange(typedValueFloat);
        //     setSliderMidValue(typedValueFloat);
        // }
        handleSliderChange(typedValueFloat);
        setSliderMidValue(typedValueFloat);
    };

    return (
        <>
            <TokenNameCol textAlign="left" color={color}>
                {firstColumn}
            </TokenNameCol>
            <Col textAlign="left" color={color}>
                <InputWrapper>
                    <Input
                        noBorder
                        useWhiteBackground
                        useDarkBorder
                        variant="small"
                        type="number"
                        value={sliderValue.toString()}
                        onChange={event => {
                            handleInputChange(event);
                        }}
                    />
                </InputWrapper>
            </Col>
            <Col textAlign="left" color={color}>
                <SliderWrapper>
                    <SliderLeftLabel>0</SliderLeftLabel>

                    <MaterialSlider
                        min={0}
                        max={sliderMidValue * 2}
                        step={sliderMidValue / 400}
                        value={sliderValue}
                        onChange={(event, newValue) => handleSliderChange(newValue)}
                    />
                    <SliderRightLabel>
                        {/* handle the situation when user types in empty string */}
                        {sliderMidValue * 2 ? `${sliderMidValue * 2}x` : ''}
                    </SliderRightLabel>
                </SliderWrapper>
            </Col>
            <Col textAlign="right" color={'dark'}>
                {fourthColumn}
            </Col>
        </>
    );
};

export default PriceChangeRow;
