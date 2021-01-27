import { variables } from '@config';
import React, { ReactNode } from 'react';
import styled from 'styled-components';

const Feature = styled.section<{ flip?: boolean }>`
    position: relative;
    display: flex;
    align-items: center;
    flex-direction: ${props => (props.flip === true ? 'row-reverse' : 'row')};
    overflow: hidden;
    padding: 40px 0;
    text-align: 'left' !important;
    max-width: 1200px;
    & + & {
        border-top: 1px solid ${props => props.theme.STROKE_GREY_LIGHT};
    }

    @media only screen and (min-width: ${variables.SCREEN_SIZE.MD}) {
        min-height: 360px;
        padding: 0;
    }

    @media only screen and (max-width: ${variables.SCREEN_SIZE.MD}) {
        flex-direction: column;
    }
`;

const StyledText = styled.div<{ flip?: boolean }>`
    display: flex;
    align-items: center;
    flex-direction: column;
    width: 50%;
    text-align: left;
    padding: 20px 60px;

    @media only screen and (max-width: ${variables.SCREEN_SIZE.MD}) {
        width: 100%;
        padding: 10px 20px;
    }
`;

const ImageWrapper = styled.div`
    padding: 20px 40px;
    width: 50%;
    display: flex;
    justify-content: center;

    @media only screen and (max-width: ${variables.SCREEN_SIZE.MD}) {
        padding: 10px 20px;
    }
`;
const FeatureImage = styled.img<{ size: number; sizeSmall: number }>`
    height: ${props => props.size}px;

    @media only screen and (min-width: ${variables.SCREEN_SIZE.MD}) {
        display: block;
    }

    @media only screen and (max-width: ${variables.SCREEN_SIZE.MD}) {
        height: ${props => props.sizeSmall}px;
    }
`;

interface Props {
    children: ReactNode;
    flip?: boolean;
    imageSize: number;
    imageSizeSmall: number;
    image: string;
}

const Index = ({ children, flip, image, imageSize, imageSizeSmall }: Props) => {
    return (
        <Feature flip={flip}>
            <StyledText flip={flip}>{children}</StyledText>
            <ImageWrapper>
                <FeatureImage src={image} size={imageSize} sizeSmall={imageSizeSmall} />
            </ImageWrapper>
        </Feature>
    );
};

export default Index;
