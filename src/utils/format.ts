import { mathUtils } from '.';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const getFormattedDateFromTimestamp = (timestampMillis: number) => {
    const dateObj = new Date(timestampMillis);
    const year = dateObj.getFullYear(); // 2019
    const day = dateObj.getDate(); // 23
    const monthName = months[dateObj.getMonth()]; // getMonth() return month index

    return `${monthName} ${day}/${year}`;
};

const getFormattedPercentageValue = (value: number, hideDecimals = false) => {
    let percentageFormat = 100 * value;
    const numOfDecimals = mathUtils.countDecimals(percentageFormat);

    if (numOfDecimals === 0 && hideDecimals) {
        return `${percentageFormat.toFixed(0)}%`;
    }

    return `${percentageFormat.toFixed(2)}%`;
};

const getFormattedCryptoValue = (value: number) => {
    if (value === 0) {
        return 0;
    }

    if (isNaN(value)) {
        return '-';
    }

    const firstTwoAfterDecimals = mathUtils.toTwoDecimals(value);

    // compute how many decimals are there before first non-zero value after decimal
    const decimalsCount = mathUtils.countDecimals(firstTwoAfterDecimals);
    if (decimalsCount > 5) {
        return '0.000...';
    }

    return value.toFixed(5);
};

export { getFormattedDateFromTimestamp, getFormattedPercentageValue, getFormattedCryptoValue };
