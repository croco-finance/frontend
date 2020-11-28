import { lossUtils, mathUtils } from '.';
import {
    Snap,
    IntervalStats,
    CumulativeStats,
    AllPoolsGlobal,
    SummaryStats,
    Deposit,
    Withdrawal,
} from '@types';

const getPoolStatsFromSnapshots = (poolSnapshots: Array<Snap>) => {
    // get interval stats first
    let intervalStats = new Array();

    poolSnapshots.forEach((snapshot, i) => {
        if (i > 0) {
            intervalStats.push(getIntervalStats(poolSnapshots[i - 1], poolSnapshots[i]));
        }
    });

    const poolIsActive = poolSnapshots[poolSnapshots.length - 1].liquidityTokenBalance > 0;
    const { deposits, withdrawals } = getDepositsAndWithdrawals(intervalStats, poolIsActive);

    // get cumulative stats
    let cumulativeStats = getCumulativeStats(intervalStats, deposits, withdrawals);

    return { intervalStats, cumulativeStats, deposits, withdrawals };
};

const getIntervalStats = (snapshotT0: Snap, snapshotT1: Snap): IntervalStats => {
    // variables declaration
    const reserveTokensCount = snapshotT0.tokens.length;
    const tokenWeights = new Array(reserveTokensCount);

    const tokenBalancesStart = new Array(reserveTokensCount);
    const tokenBalancesEnd = new Array(reserveTokensCount);

    const totalTokenReservesStart = new Array(reserveTokensCount);
    const totalTokenReservesEnd = new Array(reserveTokensCount);

    const tokenPricesStart = new Array(reserveTokensCount);
    const tokenPricesEnd = new Array(reserveTokensCount);

    // liquidity pool tokens
    const lpTokenUserBalanceStart = snapshotT0.liquidityTokenBalance;

    const lpTokenTotalSupplyStart = snapshotT0.liquidityTokenTotalSupply;
    const lpTokenTotalSupplyEnd = snapshotT1.liquidityTokenTotalSupply; // this is how much the user had BEFORE he made deposit/withdraw

    const userPoolShareStart = lpTokenUserBalanceStart / lpTokenTotalSupplyStart;
    const userPoolShareEnd = lpTokenUserBalanceStart / lpTokenTotalSupplyEnd;

    // token prices
    const ethPriceStart = snapshotT0.ethPrice;
    const ethPriceEnd = snapshotT1.ethPrice;

    // get token balances at the beginning of the interval
    snapshotT0.tokens.forEach((tokenData, i) => {
        totalTokenReservesStart[i] = tokenData.reserve;
        tokenBalancesStart[i] = userPoolShareStart * tokenData.reserve;

        tokenWeights[i] = tokenData.weight;
        tokenPricesStart[i] = tokenData.priceUsd;
    });

    // Compute theoretical token balances if no fees were gained
    snapshotT1.tokens.forEach((tokenData, i) => {
        totalTokenReservesEnd[i] = tokenData.reserve;
        tokenBalancesEnd[i] = userPoolShareEnd * tokenData.reserve;
        tokenPricesEnd[i] = tokenData.priceUsd;
    });

    // *** Stats Computations ***
    // compute theoretical new token balances after price change without fees
    const { exchange } = snapshotT0;
    let newBalancesNoFees;

    if (exchange === 'UNI_V2' || exchange === 'SUSHI') {
        newBalancesNoFees = lossUtils.getNewBalancesUniswap(tokenBalancesStart, tokenPricesEnd);
    } else if (exchange === 'BALANCER') {
        newBalancesNoFees = lossUtils.getNewBalancesBalancer(
            tokenBalancesStart,
            tokenPricesEnd,
            tokenWeights,
        );
    }

    // get how much the user gained on fees
    const feesTokenAmounts = mathUtils.subtractArraysElementWise(
        tokenBalancesEnd,
        newBalancesNoFees,
    );

    // the difference of you token holdings compared to the start amount
    const tokenDiffNoFees = mathUtils.subtractArraysElementWise(
        newBalancesNoFees,
        tokenBalancesStart,
    );

    // Pool value
    const poolValueUsdStart = mathUtils.getTokenArrayValue(tokenBalancesStart, tokenPricesStart);
    const poolValueUsdEnd = mathUtils.getTokenArrayValue(tokenBalancesEnd, tokenPricesEnd);

    // Comparison with putting everything to ETH
    // compute ETH value of each token reserve at the beginning
    const startTokenValue = mathUtils.multiplyArraysElementWise(
        tokenBalancesStart,
        tokenPricesStart,
    );

    // this his how much ETH was your deposit worth at the beginning of the interval
    // array[5.0 ETH, 5.0 ETH]
    const ethAmountStart = mathUtils.sumArr(
        mathUtils.divideEachArrayElementByValue(startTokenValue, ethPriceStart),
    );

    // this is how much would your assets be worth if you put everything to ETH instead of pooled tokens
    const ethHodlValueUsd = ethAmountStart * ethPriceEnd;
    const endTokenValues = mathUtils.multiplyArraysElementWise(tokenBalancesEnd, tokenPricesEnd);

    // this his how much ETH was the pool worth at the end of interval
    const endEthAmount = mathUtils.sumArr(
        mathUtils.divideEachArrayElementByValue(endTokenValues, ethPriceEnd),
    );

    // Imp. loss compared to HODL
    const hodlValueUsd = mathUtils.getTokenArrayValue(tokenBalancesStart, tokenPricesEnd);
    const impLossUsd =
        hodlValueUsd - mathUtils.getTokenArrayValue(newBalancesNoFees, tokenPricesEnd);

    return {
        // Timestamp (convert timestamp from seconds to milliseconds)
        timestampStart: snapshotT0.timestamp * 1000,
        timestampEnd: snapshotT1.timestamp * 1000,

        // Token balances
        tokenBalancesStart: tokenBalancesStart,
        tokenBalancesEnd: tokenBalancesEnd,

        // Fees and imp. loss
        feesTokenAmounts: feesTokenAmounts,
        feesUsdEndPrice: mathUtils.sumArr(
            mathUtils.multiplyArraysElementWise(feesTokenAmounts, tokenPricesEnd),
        ),
        tokenDiffNoFees: tokenDiffNoFees,

        // User's pool share
        userPoolShareStart: userPoolShareStart,
        userPoolShareEnd: userPoolShareEnd,
        liquidityTokenBalanceStart: snapshotT0.liquidityTokenBalance,
        liquidityTokenBalanceEnd: snapshotT1.liquidityTokenBalance,

        // Token prices
        tokenPricesStart: tokenPricesStart,
        tokenPricesEnd: tokenPricesEnd,

        ethPriceStart: ethPriceStart,
        ethPriceEnd: ethPriceEnd,

        // TX Cost
        txCostEthStart: snapshotT0.txCostEth,
        txCostEthEnd: snapshotT1.txCostEth,

        // Yield reward (use snapshot T0 to get yield ina  given interval)
        yieldTokenAmount: snapshotT0.yieldReward ? snapshotT0.yieldReward.amount : 0,
        yieldTokenPriceStart: snapshotT0.yieldReward ? snapshotT0.yieldReward.price : null,
        yieldTokenPriceEnd: snapshotT1.yieldReward ? snapshotT1.yieldReward.price : null,

        // Imp. loss
        impLossUsd: impLossUsd ? mathUtils.roundToNDecimals(impLossUsd, 4) : 0,

        // Strategy values (for interval start/end prices, not current prices)
        poolValueUsdStart: poolValueUsdStart,
        poolValueUsdEnd: poolValueUsdEnd,
        hodlValueUsd: hodlValueUsd,
        ethHodlValueUsd: ethHodlValueUsd,

        // If staked LP tokens (for Uniswap)
        staked: snapshotT0.staked,
    };
};

const getEthValueOfTokenArray = (tokenBalances, tokenPrices, ethPrice): number => {
    const startTokenValue = mathUtils.multiplyArraysElementWise(tokenBalances, tokenPrices);

    return mathUtils.sumArr(mathUtils.divideEachArrayElementByValue(startTokenValue, ethPrice));
};

const getDepositsAndWithdrawals = (intervalStats: Array<IntervalStats>, poolIsActive: boolean) => {
    const deposits: Deposit[] = [];
    const withdrawals: Withdrawal[] = [];

    // add first deposit to pool separately
    const {
        timestampStart,
        tokenBalancesStart,
        poolValueUsdStart,
        ethPriceStart,
        tokenPricesStart,
    } = intervalStats[0];
    deposits[0] = {
        timestamp: timestampStart,
        tokenAmounts: tokenBalancesStart,
        valueUsd: poolValueUsdStart,
        valueEth: getEthValueOfTokenArray(tokenBalancesStart, tokenPricesStart, ethPriceStart),
    };

    // Note: loop until the "i < length - 1 snap", because i + 1 is not defined for last snap
    for (let i = 0, length = intervalStats.length; i < length - 1; i++) {
        const endBalancePrev = intervalStats[i].tokenBalancesEnd;
        const startBalanceNext = intervalStats[i + 1].tokenBalancesStart;
        const startTokenPricesNext = intervalStats[i + 1].tokenPricesStart;
        const startEthPriceNext = intervalStats[i + 1].ethPriceStart;

        const endUsdValuePrev = intervalStats[i].poolValueUsdEnd;
        const startUsdValueNext = intervalStats[i + 1].poolValueUsdStart;

        const valueEth = getEthValueOfTokenArray(
            startBalanceNext,
            startTokenPricesNext,
            startEthPriceNext,
        );

        // deposit
        if (endUsdValuePrev < startUsdValueNext) {
            deposits.push({
                timestamp: intervalStats[i].timestampEnd,
                tokenAmounts: mathUtils.subtractArraysElementWise(startBalanceNext, endBalancePrev),
                valueUsd: endUsdValuePrev - startUsdValueNext,
                valueEth: valueEth,
            });
        }

        // withdrawal
        if (endUsdValuePrev > startUsdValueNext) {
            withdrawals.push({
                timestamp: intervalStats[i].timestampEnd,
                tokenAmounts: mathUtils.subtractArraysElementWise(endBalancePrev, startBalanceNext),
                valueUsd: startUsdValueNext - endUsdValuePrev,
                valueEth: valueEth,
            });
        }
    }

    // If pool is not active, the user withdrew all his funds and we want to add this to withdrawals array
    const lastInterval = intervalStats[intervalStats.length - 1];
    if (!poolIsActive) {
        withdrawals.push({
            timestamp: lastInterval.timestampEnd,
            tokenAmounts: lastInterval.tokenBalancesEnd,
            valueUsd: lastInterval.poolValueUsdEnd,
            valueEth: getEthValueOfTokenArray(
                lastInterval.tokenBalancesEnd,
                lastInterval.tokenPricesEnd,
                lastInterval.ethPriceEnd,
            ),
        });
    }

    // if there were no withdrawals, return an array full of zero (I can manipulate with this easier than with an empty array or null)
    if (withdrawals.length === 0) {
        withdrawals.push({
            timestamp: undefined,
            tokenAmounts: new Array(lastInterval.tokenBalancesEnd.length).fill(0),
            valueUsd: 0,
            valueEth: 0,
        });
    }

    return { deposits, withdrawals };
};

const getDepositsOrWithdrawalsSum = (deposits: Deposit[]) => {
    // deposits and withdrawals share the same interface (for now)

    let tokenCount = deposits[0].tokenAmounts.length;
    let tokenAmountsSum = new Array(tokenCount).fill(0);

    deposits.forEach(deposit => {
        tokenAmountsSum = mathUtils.sumArraysElementWise(tokenAmountsSum, deposit.tokenAmounts);
    });

    return tokenAmountsSum;
};

const getDepositsOrWithdrawalsEthSum = (deposits: Deposit[] | Withdrawal[]) => {
    // deposits and withdrawals share the same interface (for now)
    let valueEthSum = 0;

    deposits.forEach(deposit => {
        valueEthSum += deposit.valueEth;
    });

    return valueEthSum;
};

const getCumulativeStats = (
    intervalStats: IntervalStats[],
    deposits: Deposit[],
    withdrawals: Withdrawal[],
): CumulativeStats => {
    const pooledTokensCount = intervalStats[0].tokenBalancesStart.length;
    const intervalsCount = intervalStats.length;
    const lastInterval = intervalStats[intervalsCount - 1];

    // End token prices
    const pooledTokenPricesEnd = lastInterval.tokenPricesEnd;
    const yieldTokenPriceEnd = lastInterval.yieldTokenPriceEnd
        ? lastInterval.yieldTokenPriceEnd
        : 0;
    const ethPriceEnd = lastInterval.ethPriceEnd;

    const isActive = lastInterval.liquidityTokenBalanceEnd !== 0;

    const endPoolValueUsd = mathUtils.getTokenArrayValue(
        lastInterval.tokenBalancesEnd,
        pooledTokenPricesEnd,
    );

    // Current pool value. If pool is not active, current pool value is 0
    let currentPoolValueUsd = endPoolValueUsd;
    if (!isActive) {
        currentPoolValueUsd = 0;
    }

    // const endPoolValueUsd =

    // Sum and value of all withdrawals/deposits
    const depositsTokenAmounts = getDepositsOrWithdrawalsSum(deposits);
    const withdrawalsTokenAmounts = getDepositsOrWithdrawalsSum(withdrawals);
    const depositsEth = getDepositsOrWithdrawalsEthSum(deposits);
    const depositsUsd = mathUtils.getTokenArrayValue(depositsTokenAmounts, pooledTokenPricesEnd);
    const withdrawalsUsd = mathUtils.getTokenArrayValue(
        withdrawalsTokenAmounts,
        pooledTokenPricesEnd,
    );

    console.log('deposits', deposits);
    console.log('withdrawals', withdrawals);

    // get cumulative fees, yield, txCostEth gains
    let yieldTokenAmount = 0;
    let feesTokenAmounts = new Array(pooledTokensCount).fill(0);
    let txCostEth = 0;
    intervalStats.forEach((stat, i) => {
        feesTokenAmounts = mathUtils.sumArraysElementWise(
            feesTokenAmounts,
            stat['feesTokenAmounts'],
        );
        yieldTokenAmount += stat['yieldTokenAmount'];
        txCostEth += stat['txCostEthStart'];

        // if last stat, add txCostEthEnd as well
        if (i === intervalStats.length - 1) {
            txCostEth += stat['txCostEthEnd'];
        }
    });

    // Tx. cost USD
    const txCostUsd = txCostEth * ethPriceEnd;

    // Fees USD
    let feesUsd = mathUtils.getTokenArrayValue(feesTokenAmounts, pooledTokenPricesEnd);

    // yield USD
    let yieldUsd = 0;
    if (yieldTokenPriceEnd) {
        yieldUsd = yieldTokenAmount * yieldTokenPriceEnd;
    }

    // Average daily rewards in last interval
    const lastIntAvDailyRewardsUsd = mathUtils.getAverageDailyRewards(
        lastInterval.timestampStart,
        lastInterval.timestampEnd,
        lastInterval.feesUsdEndPrice + lastInterval.yieldTokenAmount * yieldTokenPriceEnd,
    );
    // strategies
    const poolStrategyUsd = currentPoolValueUsd + withdrawalsUsd + yieldUsd - txCostUsd;
    const tokensHodlStrategyTokenAmounts = depositsTokenAmounts;
    const tokensHodlStrategyUsd = depositsUsd;
    const ethHodlStrategyUsd = depositsEth * ethPriceEnd;
    const ethHodlStrategyEth = depositsEth;

    return {
        txCostEth: txCostEth,
        txCostUsd: txCostUsd,
        feesUsd: feesUsd,
        yieldUsd: yieldUsd,
        yieldTokenAmount: yieldTokenAmount,
        tokenBalances: lastInterval.tokenBalancesEnd,
        feesTokenAmounts: feesTokenAmounts,
        ethPriceEnd: lastInterval.ethPriceEnd,
        tokenPricesEnd: pooledTokenPricesEnd,
        yieldTokenPriceEnd: yieldTokenPriceEnd,
        currentPoolValueUsd: currentPoolValueUsd,
        endPoolValueUsd: endPoolValueUsd,
        timestampEnd: lastInterval.timestampEnd,
        depositsTokenAmounts: depositsTokenAmounts,
        withdrawalsTokenAmounts: withdrawalsTokenAmounts,
        depositsUsd: depositsUsd,
        withdrawalsUsd: withdrawalsUsd,
        lastIntAvDailyRewardsUsd: lastIntAvDailyRewardsUsd,
        poolStrategyUsd: poolStrategyUsd,
        tokensHodlStrategyTokenAmounts: tokensHodlStrategyTokenAmounts,
        tokensHodlStrategyUsd: tokensHodlStrategyUsd,
        ethHodlStrategyUsd: ethHodlStrategyUsd,
        ethHodlStrategyEth: ethHodlStrategyEth,
    };
};

// TODO this works with the old croco version
const getPoolsSummaryObject = (
    allPools: AllPoolsGlobal,
    filteredPoolIds: string[], // do summary from these pool Ids
): SummaryStats => {
    // TODO compute separately for Balancer and for Uniswap
    let feesUsdSum = 0;
    let feesTokenAmountsSum: { [key: string]: number } = {}; // {ETH: 5.6, DAI: 123.43, ...}
    let txCostUsdSum = 0;
    let txCostEthSum = 0;
    let yieldUsdSum = 0;
    let totalValueLockedUsd = 0;
    let pooledTokenAmountsSum: { [key: string]: number } = {};
    let yieldTokenAmountsSum: { [key: string]: number } = {};

    filteredPoolIds.forEach(poolId => {
        const pool = allPools[poolId];
        const { cumulativeStats, pooledTokens, yieldToken } = pool;
        const {
            currentPoolValueUsd,
            tokenBalances,
            feesTokenAmounts,
            feesUsd,
            yieldUsd,
            yieldTokenAmount,
            txCostUsd,
            txCostEth,
        } = cumulativeStats;

        // iterate through all tokens
        pooledTokens.forEach((token, i) => {
            if (!pooledTokenAmountsSum[token.symbol]) {
                pooledTokenAmountsSum[token.symbol] = 0;
                feesTokenAmountsSum[token.symbol] = 0;
            }

            pooledTokenAmountsSum[token.symbol] += tokenBalances[i];
            feesTokenAmountsSum[token.symbol] += feesTokenAmounts[i];
        });

        if (yieldToken) {
            const yieldTokenSymbol = yieldToken.symbol;
            if (!yieldTokenAmountsSum[yieldTokenSymbol]) {
                yieldTokenAmountsSum[yieldTokenSymbol] = 0;
            }

            yieldTokenAmountsSum[yieldTokenSymbol] += yieldTokenAmount;
        }

        // double check you sum only non-NaN values
        // TODO maybe check directly in interval-stats computations, if number is NaN
        // (but keep in mind that sometimes I might want to know if the number is NaN and not 0)
        if (currentPoolValueUsd) totalValueLockedUsd += currentPoolValueUsd;
        if (yieldUsd) yieldUsdSum += yieldUsd;
        if (feesUsd) feesUsdSum += feesUsd;
        if (txCostEth) txCostEthSum += txCostEth;
        if (txCostUsd) txCostUsdSum += txCostUsd;
    });

    return {
        valueLockedUsd: totalValueLockedUsd,
        pooledTokenSymbols: Object.keys(pooledTokenAmountsSum),
        pooledTokenAmounts: Object.values(pooledTokenAmountsSum),
        yieldTokenSymbols: Object.keys(yieldTokenAmountsSum),
        yieldTokenAmounts: Object.values(yieldTokenAmountsSum),
        yieldUsd: yieldUsdSum,
        txCostEth: txCostEthSum,
        txCostUsd: txCostUsdSum,
        // The symbols for fees are the same as pooledTokenSymbols,
        // but I am not 100% sure if they are always sorted the same way if I use Object.keys(object).
        // TODO check if that's the case
        feesTokenSymbols: Object.keys(feesTokenAmountsSum),
        feesTokenAmounts: Object.values(feesTokenAmountsSum),
        feesUsd: feesUsdSum,
    };
};

export {
    getPoolStatsFromSnapshots,
    getCumulativeStats,
    getPoolsSummaryObject,
    getDepositsAndWithdrawals,
};
