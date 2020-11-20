import { mathUtils } from '@utils';

const countDecimals = value => {
    try {
        if (Math.floor(value) !== value) return value.toString().split('.')[1].length || 0;
    } catch (e) {
        return '-';
    }

    return 0;
};

const getFirstTwoNonZeroDecimals = n => {
    var log10 = n ? Math.floor(Math.log10(n)) : 0,
        div = log10 < 0 ? Math.pow(10, 1 - log10) : 100;

    return Math.round(n * div) / div;
};

const roundToNDecimals = (value: number, nDecimals: number) => {
    const coeff = Math.pow(10, nDecimals);
    return Math.round(value * coeff) / coeff;
};

const getDailyAverageFeeGains = (timeStampStartMillis, timeStampEndMillis, totalFeesUsd) => {
    const differenceMillis = timeStampEndMillis - timeStampStartMillis;
    const differenceDays = differenceMillis / (3600 * 24 * 1000);
    return totalFeesUsd / differenceDays;
};

const getTokenArrayValue = (tokenBalances: Array<number>, tokenPrices: Array<number>) => {
    if (tokenBalances.length !== tokenPrices.length) {
        throw 'Arrays have to have the same length';
    }

    return mathUtils.sumArr(mathUtils.multiplyArraysElementWise(tokenBalances, tokenPrices));
};

// This is useful for generating data for imp.loss curve.
const arrangeArray = (start, end, step) => {
    const stepDecimals = countDecimals(step);
    // TODO make sure start % step = 0 and start = -end;
    const arrLength = Math.floor(2 * (end / step) + 1);
    const arr = new Array(arrLength);
    const powerElement = Math.pow(10, stepDecimals);
    // TODO make this programmatically more stable
    for (let i = 0; i < arrLength; i++) {
        arr[i] = Math.round((start + i * step) * powerElement) / powerElement;
    }
    return arr;
};

const sumArr = (arr: Array<number>) => {
    // default value is 0
    return arr.reduce((a, b) => a + b, 0);
};

const multiplyArraysElementWise = (arr1: Array<number>, arr2: Array<number>) => {
    // TODO make sure both arrays are the same length
    let result = new Array(arr1.length);

    arr1.forEach((num, i) => {
        result[i] = arr1[i] * arr2[i];
    });

    return result;
};

const sumArraysElementWise = (arr1: Array<number>, arr2: Array<number>) => {
    // TODO make sure both arrays are the same length
    let result = new Array(arr1.length);

    arr1.forEach((num, i) => {
        result[i] = arr1[i] + arr2[i];
    });

    return result;
};

const subtractArraysElementWise = (arr1: Array<number>, arr2: Array<number>) => {
    // TODO make sure both arrays are the same length
    let result = new Array(arr1.length);

    arr1.forEach((num, i) => {
        result[i] = arr1[i] - arr2[i];
    });

    return result;
};

const divideEachArrayElementByValue = (arr: Array<number>, value: number) => {
    const modifiedArr = new Array(arr.length);
    for (let i = 0, length = arr.length; i < length; i++) {
        modifiedArr[i] = arr[i] / value;
    }

    return modifiedArr;
};

const multiplyEachArrayElementByValue = (arr: Array<number>, value: number) => {
    const modifiedArr = new Array(arr.length);
    for (let i = 0, length = arr.length; i < length; i++) {
        modifiedArr[i] = arr[i] * value;
    }

    return modifiedArr;
};

export {
    countDecimals,
    arrangeArray,
    getDailyAverageFeeGains,
    multiplyArraysElementWise,
    subtractArraysElementWise,
    sumArraysElementWise,
    sumArr,
    divideEachArrayElementByValue,
    multiplyEachArrayElementByValue,
    getFirstTwoNonZeroDecimals,
    getTokenArrayValue,
    roundToNDecimals,
};
