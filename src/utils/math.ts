import { currentPriceRatioExample, PoolItemsDictExample } from '../config/example-data';

const countDecimals = value => {
    if (Math.floor(value) !== value) return value.toString().split('.')[1].length || 0;
    return 0;
};

const getFiatValueFromCryptoAmounts = (
    cryptoAmounts: { [key: string]: number },
    fiatRates: any,
    fiat: string,
) => {
    let fiatSum = 0;

    for (const [token, amount] of Object.entries(cryptoAmounts)) {
        fiatSum = fiatSum + amount * fiatRates[fiat][token];
    }

    return fiatSum;
};

const getFiatFromCrypto = (cryptoSymbol: string, fiatSymbol: string, cryptoAmount: number) => {
    return cryptoAmount * currentPriceRatioExample[fiatSymbol][cryptoSymbol];
};

const getFormattedPercentageValue = (value: number, hideDecimals = false) => {
    let percentageFormat = 100 * value;
    const numOfDecimals = countDecimals(percentageFormat);

    if (numOfDecimals === 0 && hideDecimals) {
        return `${percentageFormat.toFixed(0)}%`;
    }

    return `${percentageFormat.toFixed(2)}%`;
};

const getDailyAverageFeeGains = (timeStampStartSeconds, timeStampEndSeconds, totalFeesUsd) => {
    const differenceMilliseconds = timeStampEndSeconds - timeStampStartSeconds;
    const differenceDays = differenceMilliseconds / (3600 * 24);
    return totalFeesUsd / differenceDays;
};

const getPoolsSummaryObject = (pools = PoolItemsDictExample) => {
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

    for (const poolId of Object.keys(pools)) {
        const pool = pools[poolId];
        endBalanceUsdSum += pool.endBalanceUsd;
        endBalanceEthSum += pool.endBalanceEth;
        if (pool.feesUsd) feesUsdSum += pool.feesUsd;
        if (pool.feesEth) feesEthSum += pool.feesEth;
        if (pool.txCostEth) txCostEthSum += pool.txCostEth;
        if (pool.txCostUsd) txCostUsdSum += pool.txCostUsd;
        if (pool.yieldRewardUsd) yieldRewardUsdSum += pool.yieldRewardUsd;
        if (pool.yieldRewardEth) yieldRewardEthSum += pool.yieldRewardEth;
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

const sumArr = (total, num) => {
    return total + num;
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

export {
    countDecimals,
    getFiatValueFromCryptoAmounts,
    getFiatFromCrypto,
    getFormattedPercentageValue,
    getPoolsSummaryObject,
    arrangeArray,
    getDailyAverageFeeGains,
    multiplyArraysElementWise,
    subtractArraysElementWise,
    sumArraysElementWise,
    sumArr,
};
