import { mathUtils } from '.';
import { types } from '@config';

type DateFormats = 'MONTH_DAY_YEAR' | 'MONTH_DAY';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const getFormattedDateFromTimestamp = (
    timestampMillis: number,
    type: DateFormats = 'MONTH_DAY_YEAR',
    useTodayFormat: boolean = false,
) => {
    const dateObj = new Date(timestampMillis);
    const year = dateObj.getFullYear(); // 2019
    const day = dateObj.getDate(); // 23
    const monthName = months[dateObj.getMonth()]; // getMonth() return month index

    if (useTodayFormat) {
        // check if this current timestamp is today
        const today = new Date();
        const todayYear = today.getFullYear();
        const todayDay = today.getDate();
        const todayMonthName = months[today.getMonth()];

        if (year === todayYear && monthName === todayMonthName && day === todayDay) {
            return 'Today';
        }
    }

    if (type === 'MONTH_DAY') {
        return `${monthName} ${day}`;
    }

    return `${monthName} ${day}/${year}`;
};

const getFormattedPercentageValue = (
    value: number,
    hideDecimals = false,
    usePlusSymbol: boolean = false,
) => {
    const sign = getValueSign(value);
    if (usePlusSymbol) {
        value = Math.abs(value);
    }

    let percentageFormat = 100 * value;
    const numOfDecimals = mathUtils.countDecimals(percentageFormat);

    if (numOfDecimals === 0 && hideDecimals) {
        return `${percentageFormat.toFixed(0)}%`;
    }

    if (usePlusSymbol) {
        return `${sign} ${percentageFormat.toFixed(2)}%`;
    }
    return `${percentageFormat.toFixed(2)}%`;
};

const getValueSign = (value: number) => {
    if (isNaN(value) || value === 0) {
        return ' ';
    }

    if (value < 0) {
        return '- ';
    }

    return '+ ';
};

const getFormattedCryptoValue = (value: number, roundDecimals: number = 4) => {
    if (isNaN(value)) {
        return '-';
    }

    // TODO double check this code and make sure it does what you want
    if (value === 0 || Math.abs(value) < 1 / Math.pow(10, roundDecimals + 1)) {
        return 0;
    }

    // if (value === 0) {
    //     return 0;
    // }

    const firstTwoAfterDecimals = mathUtils.toTwoDecimals(value);

    // compute how many decimals are there before first non-zero value after decimal
    const zeroDecimalsCount = mathUtils.countDecimals(firstTwoAfterDecimals);
    if (zeroDecimalsCount > roundDecimals + 1) {
        return '0.000...';
    }

    return value.toFixed(roundDecimals);
};

const getTokenSymbolArr = (tokensArr: Array<any>) => {
    const tokenSymbolsArr = new Array(tokensArr.length);
    tokensArr.forEach((token, i) => {
        tokenSymbolsArr[i] = token.symbol;
    });

    return tokenSymbolsArr;
};

const getTokenWeightsArr = (tokensArr: Array<types.PoolToken>) => {
    const weightsArr = new Array(tokensArr.length);
    tokensArr.forEach((token, i) => {
        weightsArr[i] = token.weight;
    });

    return weightsArr;
};

const tokenArrToCommaSeparatedString = (tokenSymbols: Array<string>) => {
    let text = '';
    tokenSymbols.forEach((symbol, i) => {
        text = text + ', ' + symbol;
    });
    return text.substring(1); //delete first char (comma)
};

export {
    getFormattedDateFromTimestamp,
    getFormattedPercentageValue,
    getFormattedCryptoValue,
    getTokenSymbolArr,
    getTokenWeightsArr,
    tokenArrToCommaSeparatedString,
};