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

const getDailyAverageFeeGains = (timeStampStart, timeStampEnd, totalFeesUsd) => {
    const differenceMilliseconds = timeStampEnd - timeStampStart;
    const differenceDays = differenceMilliseconds / (1000 * 3600 * 24);
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

const getBalancerImpLoss = (initialBalances, tokenWeights, newTokenPrices) => {
    const weightsSum = tokenWeights.reduce(sumArr);

    // Make sure the weights sum up to one
    // if (weightsSum !== 1) throw 'Sum of token weights is not equal to 1';

    // get value of V
    let V = 1;

    initialBalances.forEach((balance, i) => {
        V = V * Math.pow(balance, tokenWeights[i]);
    });

    // compute new token balances
    const tokenCount = initialBalances.length;
    let newBalances = new Array(tokenCount);

    for (let i = 0; i < tokenCount; i++) {
        const firstPart = Math.pow(
            tokenWeights[i] / newTokenPrices[i],
            weightsSum - tokenWeights[i],
        );

        let secondPart = 1;
        for (let j = 0; j < tokenCount; j++) {
            if (j !== i) {
                secondPart =
                    secondPart * Math.pow(newTokenPrices[j] / tokenWeights[j], tokenWeights[j]);
            }
        }

        newBalances[i] = V * firstPart * secondPart;
    }

    // compute impermanent loss
    let valuePool = 0;
    let valueHodl = 0;

    for (let i = 0; i < tokenCount; i++) {
        valuePool += newBalances[i] * newTokenPrices[i];
        valueHodl += initialBalances[i] * newTokenPrices[i];
    }

    const impLossAbs = valuePool - valueHodl;
    const impLossRel = valuePool / valueHodl - 1;

    return { impLossAbs, impLossRel };
};

export {
    countDecimals,
    getFiatValueFromCryptoAmounts,
    getFiatFromCrypto,
    getFormattedPercentageValue,
    getPoolsSummaryObject,
    arrangeArray,
    getBalancerImpLoss,
    getDailyAverageFeeGains,
};