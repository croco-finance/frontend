import { currentPriceRatioExample } from '../config/example-data';
import { PoolItemsInterface, PoolItemInterface } from '../config/types';

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

const getDailyAverageFeeGains = (timeStampStart, timeStampEnd, totalFeesUSD) => {
    const differenceMilliseconds = timeStampEnd - timeStampStart;
    const differenceDays = differenceMilliseconds / (1000 * 3600 * 24);
    return totalFeesUSD / differenceDays;
};

const getPoolsSummaryObject = (pools: any) => {
    // TODO compute separately for Balancer and for Uniswap
    let summaryObject = {};
    let endBalanceUSDSum = 0;
    let netReturnUSDSum = 0;
    let feesUSDSum = 0;
    let impLossUSDSum = 0;
    let dexReturnUSDSum = 0;
    let txCostEthSum = 0;
    let averageDailyFeesUSDSum = 0;

    // for (const [id, pool] of Object.entries(pools)) {
    //     endBalanceUSDSum += pool.endBalanceUSD;
    //     netReturnUSDSum += pool.netReturnUSD;
    //     feesUSDSum += pool.feesUSD;
    //     impLossUSDSum += pool.impLossUSD;
    //     dexReturnUSDSum += pool.dexReturnUSD;
    //     txCostEthSum += pool.txCostEth;
    //     averageDailyFeesUSDSum += getDailyAverageFeeGains(pool.start, pool.end, pool.feesUSD);
    // }

    summaryObject['endBalanceUSD'] = endBalanceUSDSum;
    summaryObject['netReturnUSD'] = netReturnUSDSum;
    summaryObject['feesUSD'] = feesUSDSum;
    summaryObject['impLossUSD'] = impLossUSDSum;
    summaryObject['dexReturnUSD'] = dexReturnUSDSum;
    summaryObject['txCostEth'] = txCostEthSum;
    summaryObject['averageDailyFeesUSD'] = averageDailyFeesUSDSum;

    const impermanentLoss = endBalanceUSDSum / (endBalanceUSDSum - dexReturnUSDSum) - 1;
    summaryObject['impLoss'] = impermanentLoss;

    return summaryObject;
};

export {
    countDecimals,
    getFiatValueFromCryptoAmounts,
    getFiatFromCrypto,
    getFormattedPercentageValue,
    getPoolsSummaryObject,
};
