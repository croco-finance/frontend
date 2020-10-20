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
    let netReturnUsdSum = 0;
    let feesUsdSum = 0;
    let impLossUsdSum = 0;
    let dexReturnUsdSum = 0;
    let txCostEthSum = 0;
    let averageDailyFeesUsdSum = 0;

    for (const poolId of Object.keys(pools)) {
        const pool = pools[poolId];
        endBalanceUsdSum += pool.endBalanceUsd;
        netReturnUsdSum += pool.netReturnUsd;
        feesUsdSum += pool.feesUsd;
        impLossUsdSum += pool.impLossUsd;
        dexReturnUsdSum += pool.dexReturnUsd;
        if (pool.txCostEth) {
            txCostEthSum += pool.txCostEth;
        }
        averageDailyFeesUsdSum += getDailyAverageFeeGains(pool.start, pool.end, pool.feesUsd);
    }

    summaryObject['endBalanceUsd'] = endBalanceUsdSum;
    summaryObject['netReturnUsd'] = netReturnUsdSum;
    summaryObject['feesUsd'] = feesUsdSum;
    summaryObject['impLossUsd'] = impLossUsdSum;
    summaryObject['dexReturnUsd'] = dexReturnUsdSum;
    summaryObject['txCostEth'] = txCostEthSum;
    summaryObject['averageDailyFeesUsd'] = averageDailyFeesUsdSum;

    const impermanentLoss = endBalanceUsdSum / (endBalanceUsdSum - dexReturnUsdSum) - 1;
    summaryObject['impLoss'] = impermanentLoss;

    return summaryObject;
};

const arrangeArray = (start, end, step) => {
    // TODO make sure start % step = 0 and start = -end;
    const arrLength = 2 * (end / step) + 1;
    const arr = new Array(arrLength);

    for (let i = 0; i < arrLength; i++) {
        arr[i] = start + i * step;
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
