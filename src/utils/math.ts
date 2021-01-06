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

const getAverageDailyRewards = (timeStampStartMillis, timeStampEndMillis, totalReward) => {
    if (totalReward === 0) return 0;
    const differenceMillis = timeStampEndMillis - timeStampStartMillis;
    const differenceDays = differenceMillis / (3600 * 24 * 1000);
    return totalReward / differenceDays;
};

const getTokenArrayValue = (tokenBalances: Array<number>, tokenPrices: Array<number>) => {
    if (tokenBalances.length !== tokenPrices.length) {
        throw 'Arrays have to have the same length';
    }

    let sum = 0;
    for (let i = 0; i < tokenBalances.length; i++) {
        sum += tokenBalances[i] * tokenPrices[i];
    }
    return sum;
};

const sumArr = (arr: number[]) => {
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

const getArrayAverage = (arr: number[]) => {
    const arraySum = sumArr(arr);

    return arraySum / arr.length;
};

const divideArraysElementWise = (arr1: Array<number>, arr2: Array<number>) => {
    // TODO make sure both arrays are the same length
    let result = new Array(arr1.length);

    arr1.forEach((num, i) => {
        if (arr2[i] === 0) {
            result[i] = Infinity;
        } else {
            result[i] = arr1[i] / arr2[i];
        }
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

const sumArrayOfTokenArrays = (tokenArr: Array<Array<number>>) => {
    let tokenCount = tokenArr[0].length;
    let tokenAmountsSum = new Array(tokenCount).fill(0);

    tokenArr.forEach(arr => {
        tokenAmountsSum = sumArraysElementWise(tokenAmountsSum, arr);
    });

    return tokenAmountsSum;
};

const arraysContainEqualElements = (_arr1: string[], _arr2: string[]) => {
    if (!Array.isArray(_arr1) || !Array.isArray(_arr2) || _arr1.length !== _arr2.length) {
        return false;
    }

    const arr1 = _arr1.concat().sort();
    const arr2 = _arr2.concat().sort();

    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }

    return true;
};

export {
    countDecimals,
    getAverageDailyRewards,
    multiplyArraysElementWise,
    subtractArraysElementWise,
    sumArraysElementWise,
    sumArr,
    divideEachArrayElementByValue,
    multiplyEachArrayElementByValue,
    getFirstTwoNonZeroDecimals,
    getTokenArrayValue,
    roundToNDecimals,
    sumArrayOfTokenArrays,
    divideArraysElementWise,
    arraysContainEqualElements,
    getArrayAverage,
};
