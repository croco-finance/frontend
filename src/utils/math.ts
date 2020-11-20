import { mathUtils } from '@utils';

const countDecimals = value => {
    try {
        if (Math.floor(value) !== value) return value.toString().split('.')[1].length || 0;
    } catch (e) {
        return '-';
    }

    return 0;
};

const toTwoDecimals = n => {
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

const getPoolsSummaryObject = (allPools: any, filteredPoolIds: Array<string> | 'all') => {
    // TODO compute separately for Balancer and for Uniswap
    let summaryObject = {};
    let endBalanceUsdSum = 0;
    let endBalanceEthSum = 0;
    let feesUsdSum = 0;
    let feesEthSum = 0;
    let txCostUsdSum = 0;
    let txCostEthSum = 0;
    let yieldRewardUsdSum = 0;
    let yieldRewardEthSum = 0;

    for (const poolId of Object.keys(allPools)) {
        if (filteredPoolIds.includes(poolId) || filteredPoolIds === 'all') {
            const pool = allPools[poolId];
            endBalanceUsdSum += pool.endBalanceUsd;
            endBalanceEthSum += pool.endBalanceEth;
            if (pool.feesUsd) feesUsdSum += pool.feesUsd;
            if (pool.feesEth) feesEthSum += pool.feesEth;
            if (pool.txCostEth) txCostEthSum += pool.txCostEth;
            if (pool.txCostUsd) txCostUsdSum += pool.txCostUsd;
            if (pool.yieldRewardUsd) yieldRewardUsdSum += pool.yieldRewardUsd;
            if (pool.yieldRewardEth) yieldRewardEthSum += pool.yieldRewardEth;
        }
    }

    summaryObject['endBalanceUsd'] = endBalanceUsdSum;
    summaryObject['endBalanceEth'] = endBalanceEthSum;
    summaryObject['feesUsd'] = feesUsdSum;
    summaryObject['feesEth'] = feesEthSum;
    summaryObject['txCostUsd'] = txCostUsdSum;
    summaryObject['txCostEth'] = txCostEthSum;
    summaryObject['yieldRewardUsd'] = yieldRewardUsdSum;
    summaryObject['yieldRewardEth'] = yieldRewardEthSum;
    summaryObject['rewardFeesBalanceUSD'] = feesUsdSum + yieldRewardUsdSum - txCostUsdSum;
    summaryObject['rewardFeesBalanceETH'] = feesEthSum + yieldRewardEthSum - txCostEthSum;

    return summaryObject;
};

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
    getPoolsSummaryObject,
    arrangeArray,
    getDailyAverageFeeGains,
    multiplyArraysElementWise,
    subtractArraysElementWise,
    sumArraysElementWise,
    sumArr,
    divideEachArrayElementByValue,
    multiplyEachArrayElementByValue,
    toTwoDecimals,
    getTokenArrayValue,
    roundToNDecimals,
};
