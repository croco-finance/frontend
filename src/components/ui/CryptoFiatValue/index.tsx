import React from 'react';
import { CryptoValue, FiatValue } from '..';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    showCrypto?: boolean;
    fiatValue: number;
    cryptoValue: number;
    fiatSymbol?: string;
    cryptoSymbol?: string;
    colorized?: boolean; // change color is the amount is positive or negative
    usePlusSymbol?: boolean;
    useBadgeStyle?: boolean;
}

const CryptoFiatValue = ({
    showCrypto = false,
    fiatValue,
    cryptoValue,
    fiatSymbol = 'Usd',
    cryptoSymbol = 'ETH',
    colorized = false, // change color is the amount is positive or negative
    usePlusSymbol = false,
    useBadgeStyle = false,
}: Props) => {
    if (showCrypto) {
        return (
            <CryptoValue
                value={cryptoValue}
                usePlusSymbol={usePlusSymbol}
                colorized={colorized}
                useBadgeStyle={useBadgeStyle}
                symbol={cryptoSymbol}
            />
        );
    } else {
        return (
            <FiatValue
                value={fiatValue}
                usePlusSymbol={usePlusSymbol}
                colorized={colorized}
                useBadgeStyle={useBadgeStyle}
                currency={fiatSymbol}
            />
        );
    }
};

export default CryptoFiatValue;
