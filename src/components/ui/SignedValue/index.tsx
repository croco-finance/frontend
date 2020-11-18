import React from 'react';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    value: number | typeof NaN;
}

const SignedValue = ({ value, className }: Props) => {
    if (isNaN(value)) {
        return '-';
    }

    if (value === 0) {
        return 0;
    }

    // save the original value
    const originalValue = value;

    let sign = '+ ';

    if (originalValue < 0) {
        sign = '- ';
    }

    const valueAbs = Math.abs(value);

    return (
        <div>
            {sign}
            {valueAbs}
        </div>
    );
};

export default SignedValue;
