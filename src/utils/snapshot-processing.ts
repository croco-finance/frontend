import { mathUtils } from '.';
import * as loss from './loss-computations';
import { types } from '@config';

const getPoolStatsFromSnapshots = (poolSnapshots: Array<any>) => {
    // get interval stats first
    let intervalStats = new Array();

    poolSnapshots.forEach((snapshot, i) => {
        // console.log('poolSnapshots.forEach()');
        if (i > 0) {
            intervalStats.push(getIntervalStats(poolSnapshots[i - 1], poolSnapshots[i]));
        }
    });

    // get cumulative stats
    let cumulativeStats = getCumulativeStats(poolSnapshots, intervalStats);

    return { intervalStats, cumulativeStats };
};

const getIntervalStats = (snapshot1: any, snapshot2: any) => {
    // variables declaration
    const { exchange } = snapshot1;

    const reserveTokensCount = snapshot1.tokens.length;
    const tokenWeights = new Array(reserveTokensCount);

    const userTokenBalancesStart = new Array(reserveTokensCount);
    const userTokenBalancesEnd = new Array(reserveTokensCount);

    const totalTokenReservesStart = new Array(reserveTokensCount);
    const totalTokenReservesEnd = new Array(reserveTokensCount);

    const tokenPricesStart = new Array(reserveTokensCount);
    const tokenPricesEnd = new Array(reserveTokensCount);

    // yield reward
    const yieldTokenPriceStart = snapshot1.yieldReward ? snapshot1.yieldReward.price : null;
    const yieldTokenPriceEnd = snapshot2.yieldReward ? snapshot2.yieldReward.price : null;

    const yieldRewardAmountStart = snapshot1.yieldReward ? snapshot1.yieldReward.amount : null;
    const yieldRewardAmountEnd = snapshot2.yieldReward ? snapshot2.yieldReward.amount : null;

    // liquidity pool tokens
    const lpTokenUserBalanceStart = snapshot1.liquidityTokenBalance;
    const lpTokenUserBalanceEnd = snapshot2.liquidityTokenBalance;

    const lpTokenTotalSupplyStart = snapshot1.liquidityTokenTotalSupply;
    const lpTokenTotalSupplyEnd = snapshot2.liquidityTokenTotalSupply; // this is how much the user had BEFORE he made deposit/withdraw

    const userPoolShareStart = lpTokenUserBalanceStart / lpTokenTotalSupplyStart;
    const userPoolShareEnd = lpTokenUserBalanceStart / lpTokenTotalSupplyEnd;

    // token prices
    const ethPriceStart = snapshot1.ethPrice;
    const ethPriceEnd = snapshot2.ethPrice;

    // get token balances at the beginning of the interval
    snapshot1.tokens.forEach((tokenData, i) => {
        totalTokenReservesStart[i] = tokenData.reserve;
        userTokenBalancesStart[i] = userPoolShareStart * tokenData.reserve;

        tokenWeights[i] = tokenData.weight;
        tokenPricesStart[i] = tokenData.price;
    });

    // Compute theoretical token balances if no fees were gained
    snapshot2.tokens.forEach((tokenData, i) => {
        totalTokenReservesEnd[i] = tokenData.reserve;
        userTokenBalancesEnd[i] = userPoolShareEnd * tokenData.reserve;
        tokenPricesEnd[i] = tokenData.price;
    });

    // *** Stats Computations ***
    // compute theoretical new token balances after price change without fees
    let newBalancesNoFees;

    if (exchange === 'UNI_V2' || exchange === 'UNI_V1') {
        newBalancesNoFees = loss.getNewBalancesUniswap(userTokenBalancesStart, tokenPricesEnd);
    } else if (exchange === 'BALANCER') {
        newBalancesNoFees = loss.getNewBalancesBalancer(
            userTokenBalancesStart,
            tokenPricesEnd,
            tokenWeights,
        );
    }

    // get how much the user gained on fees
    const feesTokenAmounts = mathUtils.subtractArraysElementWise(
        userTokenBalancesEnd,
        newBalancesNoFees,
    );
    const hodlValueUsd = mathUtils.multiplyArraysElementWise(
        userTokenBalancesStart,
        tokenPricesEnd,
    );
    const poolValueUsd = mathUtils.multiplyArraysElementWise(userTokenBalancesEnd, tokenPricesEnd);

    // the difference of you token holdings compared to the start amount
    const tokenDiffNoFees = mathUtils.subtractArraysElementWise(
        newBalancesNoFees,
        userTokenBalancesStart,
    );

    // compute ETH value of each token reserve at the beginning
    const startTokenValue = mathUtils.multiplyArraysElementWise(
        userTokenBalancesStart,
        tokenPricesStart,
    );

    // this his how much ETH was your initial deposit worth at the beginning of the interval
    // array[5.0 ETH, 5.0 ETH]
    const startEthAmount = mathUtils.sumArr(
        mathUtils.divideEachArrayElementByValue(startTokenValue, ethPriceStart),
    );

    const endTokenValues = mathUtils.multiplyArraysElementWise(
        userTokenBalancesEnd,
        tokenPricesEnd,
    );

    // this his how much ETH wis the pool worth at the end of interval
    const endEthAmount = mathUtils.sumArr(
        mathUtils.divideEachArrayElementByValue(endTokenValues, ethPriceEnd),
    );

    // this is how much would your assets be worth if you put everything to ETH instead of pooled tokens
    const ethHodlValueUsd = startEthAmount * ethPriceEnd;

    let statsReturnObject: types.IntervalStats = {
        // Timestamp
        timestampStart: snapshot1.timestamp,
        timestampEnd: snapshot2.timestamp,

        // Token balances
        userTokenBalancesStart: userTokenBalancesStart,
        userTokenBalancesEnd: userTokenBalancesEnd,

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
        txCostEthStart: snapshot1.txCostEth,
        txCostEthEnd: snapshot2.txCostEth,

        // Yield reward
        yieldTokenAmountStart: yieldRewardAmountStart,
        yieldTokenAmountEnd: yieldRewardAmountEnd,
        yieldTokenAmount: yieldRewardAmountEnd - yieldRewardAmountStart,
        yieldTokenPriceStart: yieldTokenPriceStart,
        yieldTokenPriceEnd: yieldTokenPriceEnd,

        // Strategy values (for interval start/end prices, not current prices)
        hodlValueUsd: hodlValueUsd,
        poolValueUsd: poolValueUsd,
        ethHodlValueUsd: ethHodlValueUsd,
    };

    // TODO
    // statsReturnObject['singleTokenHodl'] = 0;
    // statsReturnObject['startTxType'] = 'deposit';

    return statsReturnObject;
};

const getCumulativeStats = (
    poolSnapshots: Array<types.PoolSnap>,
    intervalStats: Array<types.IntervalStats>,
) => {
    const pooledTokensCount = intervalStats[0].userTokenBalancesStart.length;
    const intervalsCount = intervalStats.length;
    const snapshotsCount = poolSnapshots.length;

    const lastInterval = intervalStats[intervalsCount - 1];
    const lastSnapshot = poolSnapshots[snapshotsCount - 1];

    let cumulativeStats: types.CumulativeStats = {
        txCostEth: 0,
        txCostUsd: 0,
        // tokens: lastSnapshot.tokens;
        tokenBalances: lastInterval.userTokenBalancesEnd,
        feesTokenAmounts: new Array(pooledTokensCount).fill(0),
        yieldTokenAmount: lastSnapshot.yieldReward ? 0 : null, // initialization, not final value
        ethPriceEnd: lastSnapshot.ethPrice,
        tokenPricesEnd: lastInterval.tokenPricesEnd,
        yieldTokenPriceEnd: lastSnapshot.yieldReward ? lastSnapshot.yieldReward.price : null,
        feesUsd: 0,
        yieldUsd: null,

        // pool value
        poolValueUsd: mathUtils.sumArr(
            mathUtils.multiplyArraysElementWise(
                lastInterval.userTokenBalancesEnd,
                lastInterval.tokenPricesEnd,
            ),
        ),
        rewardsMinusExpensesUsd: 0,
        timestampEnd: lastSnapshot.timestamp,
    };

    // Get cumulative tx. cost and yield rewards by looping over all snapshots
    poolSnapshots.forEach(snapshot => {
        // TODO what do I get as txCostEth if this is the last snapshot of currently active pool?
        if (snapshot['txCostEth']) {
            cumulativeStats['txCostEth'] += snapshot['txCostEth'];
        }
        if (cumulativeStats['yieldTokenAmount'] !== null && snapshot['yieldReward'] !== null) {
            cumulativeStats['yieldTokenAmount'] += snapshot['yieldReward'].amount;
        }
    });

    // get cumulative fee gains
    intervalStats.forEach(stat => {
        cumulativeStats['feesTokenAmounts'] = mathUtils.sumArraysElementWise(
            cumulativeStats['feesTokenAmounts'],
            stat['feesTokenAmounts'],
        );
    });

    // Tx. cost USD reward
    cumulativeStats['txCostUsd'] = cumulativeStats['txCostEth'] * cumulativeStats['ethPriceEnd'];

    // Fees USD reward
    cumulativeStats['feesUsd'] = mathUtils.sumArr(
        mathUtils.multiplyArraysElementWise(
            cumulativeStats['feesTokenAmounts'],
            cumulativeStats['tokenPricesEnd'],
        ),
    );

    // yield reward USD
    if (cumulativeStats['yieldTokenAmount'] && cumulativeStats['yieldTokenPriceEnd']) {
        cumulativeStats['yieldUsd'] =
            cumulativeStats['yieldTokenAmount'] * cumulativeStats['yieldTokenPriceEnd'];
    }

    // rewards minus expenses
    if (cumulativeStats['yieldUsd']) {
        // compute overall rewards
        cumulativeStats['rewardsMinusExpensesUsd'] =
            cumulativeStats['feesUsd'] - cumulativeStats['txCostUsd'] - cumulativeStats['yieldUsd'];
    } else {
        // omit yield reward if not present
        cumulativeStats['rewardsMinusExpensesUsd'] =
            cumulativeStats['feesUsd'] - cumulativeStats['txCostUsd'];
    }

    return cumulativeStats;
};

export { getPoolStatsFromSnapshots, getCumulativeStats };
