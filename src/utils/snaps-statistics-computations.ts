import { lossUtils, mathUtils } from '.';
import { Snap, IntervalStats, CumulativeStats } from '@types';

const getPoolStatsFromSnapshots = (poolSnapshots: Array<Snap>) => {
    // get interval stats first
    let intervalStats = new Array();

    poolSnapshots.forEach((snapshot, i) => {
        if (i > 0) {
            intervalStats.push(getIntervalStats(poolSnapshots[i - 1], poolSnapshots[i]));
        }
    });

    // get cumulative stats
    let cumulativeStats = getCumulativeStats(intervalStats);

    return { intervalStats, cumulativeStats };
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

    if (exchange === 'UNI_V2') {
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
    const startEthAmount = mathUtils.sumArr(
        mathUtils.divideEachArrayElementByValue(startTokenValue, ethPriceStart),
    );

    // this is how much would your assets be worth if you put everything to ETH instead of pooled tokens
    const ethHodlValueUsd = startEthAmount * ethPriceEnd;
    const endTokenValues = mathUtils.multiplyArraysElementWise(tokenBalancesEnd, tokenPricesEnd);

    // this his how much ETH wis the pool worth at the end of interval
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

        // Token prices
        tokenPricesStart: tokenPricesStart,
        tokenPricesEnd: tokenPricesEnd,

        ethPriceStart: ethPriceStart,
        ethPriceEnd: ethPriceEnd,

        // TX Cost
        txCostEthStart: snapshotT0.txCostEth,
        txCostEthEnd: snapshotT1.txCostEth,

        // Yield reward
        yieldTokenAmount: snapshotT1.yieldReward ? snapshotT1.yieldReward.amount : 0,
        yieldTokenPriceStart: snapshotT0.yieldReward ? snapshotT0.yieldReward.price : null,
        yieldTokenPriceEnd: snapshotT1.yieldReward ? snapshotT1.yieldReward.price : null,

        // Imp. loss
        impLossUsd: impLossUsd ? mathUtils.roundToNDecimals(impLossUsd, 4) : 0,

        // Strategy values (for interval start/end prices, not current prices)
        poolValueUsdStart: poolValueUsdStart,
        poolValueUsdEnd: poolValueUsdEnd,
        hodlValueUsd: hodlValueUsd,
        ethHodlValueUsd: ethHodlValueUsd,
    };
};

const getCumulativeStats = (intervalStats: Array<IntervalStats>) => {
    const pooledTokensCount = intervalStats[0].tokenBalancesStart.length;
    const intervalsCount = intervalStats.length;
    const lastInterval = intervalStats[intervalsCount - 1];

    // TODO: this is not really cumulative pool value, but value of current pool size. (TODO improve naming)
    const poolValueUsd = mathUtils.getTokenArrayValue(
        lastInterval.tokenBalancesEnd,
        lastInterval.tokenPricesEnd,
    );

    // Stats object initialization
    let cumulativeStats: CumulativeStats = {
        txCostEth: 0,
        txCostUsd: 0,
        feesUsd: 0,
        yieldUsd: 0,
        yieldTokenAmount: 0,
        tokenBalances: lastInterval.tokenBalancesEnd,
        feesTokenAmounts: new Array(pooledTokensCount).fill(0),
        ethPriceEnd: lastInterval.ethPriceEnd,
        tokenPricesEnd: lastInterval.tokenPricesEnd,
        yieldTokenPriceEnd: lastInterval.yieldTokenPriceEnd
            ? lastInterval.yieldTokenPriceEnd
            : null,
        poolValueUsd: poolValueUsd,
        timestampEnd: lastInterval.timestampEnd,
    };

    // get cumulative fees, yield, txCostEth gains
    intervalStats.forEach((stat, i) => {
        cumulativeStats['feesTokenAmounts'] = mathUtils.sumArraysElementWise(
            cumulativeStats['feesTokenAmounts'],
            stat['feesTokenAmounts'],
        );
        cumulativeStats['yieldTokenAmount'] += stat['yieldTokenAmount'];
        cumulativeStats['txCostEth'] += stat['txCostEthStart'];

        // if last stat, add txCostEthEnd as well
        if (i === intervalStats.length - 1) {
            cumulativeStats['txCostEth'] += stat['txCostEthEnd'];
        }
    });

    // Tx. cost USD
    cumulativeStats['txCostUsd'] = cumulativeStats['txCostEth'] * cumulativeStats['ethPriceEnd'];

    // Fees USD
    cumulativeStats['feesUsd'] = mathUtils.getTokenArrayValue(
        cumulativeStats['feesTokenAmounts'],
        cumulativeStats['tokenPricesEnd'],
    );

    // yield USD
    if (cumulativeStats['yieldTokenPriceEnd']) {
        cumulativeStats['yieldUsd'] =
            cumulativeStats['yieldTokenAmount'] * cumulativeStats['yieldTokenPriceEnd'];
    }

    return cumulativeStats;
};

// TODO this works with the old croco version
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

export { getPoolStatsFromSnapshots, getCumulativeStats, getPoolsSummaryObject };
