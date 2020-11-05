import { math } from '.';
import * as loss from './loss-computations';

const getPoolStats = (poolSnapshots: Array<any>) => {
    // console.log('poolSnapshots', poolSnapshots);
    let intervalStats = new Array();

    poolSnapshots.forEach((snapshot, i) => {
        // console.log('poolSnapshots.forEach()');
        if (i > 0) {
            intervalStats.push(getIntervalStats(poolSnapshots[i - 1], poolSnapshots[i]));
        }
    });

    return intervalStats;
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
    let statsReturnObject = {};
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
    const feesTokenAmounts = math.subtractArraysElementWise(
        userTokenBalancesEnd,
        newBalancesNoFees,
    );
    const hodlValueUsd = math.multiplyArraysElementWise(userTokenBalancesStart, tokenPricesEnd);
    const poolValueUsd = math.multiplyArraysElementWise(userTokenBalancesEnd, tokenPricesEnd);

    // the difference of you token holdings compared to the start amount
    const tokenDiffNoFees = math.subtractArraysElementWise(
        newBalancesNoFees,
        userTokenBalancesStart,
    );

    // compute ETH value of each token reserve at the beginning
    const startTokenValue = math.multiplyArraysElementWise(
        userTokenBalancesStart,
        tokenPricesStart,
    );

    // this his how much ETH was your initial deposit worth at the beginning of the interval
    // array[5.0 ETH, 5.0 ETH]
    const startEthAmount = math.sumArr(
        math.divideEachArrayElementByValue(startTokenValue, ethPriceStart),
    );

    const endTokenValues = math.multiplyArraysElementWise(userTokenBalancesEnd, tokenPricesEnd);

    // this his how much ETH wis the pool worth at the end of interval
    const endEthAmount = math.sumArr(
        math.divideEachArrayElementByValue(endTokenValues, ethPriceEnd),
    );

    // this is how much would your assets be worth if you put everything to ETH instead of pooled tokens
    const ethHodlValueUsd = startEthAmount * ethPriceEnd;

    // Timestamp
    statsReturnObject['timestampStart'] = snapshot1.timestamp;
    statsReturnObject['timestampEnd'] = snapshot2.timestamp;

    // Token balances
    statsReturnObject['userTokenBalancesStart'] = userTokenBalancesStart;
    statsReturnObject['userTokenBalancesEnd'] = userTokenBalancesEnd;

    // Fees and imp. loss
    statsReturnObject['feesTokenAmounts'] = feesTokenAmounts;
    statsReturnObject['tokenDiffNoFees'] = tokenDiffNoFees;

    // User's pool share
    statsReturnObject['userPoolShareStart'] = userPoolShareStart;
    statsReturnObject['userPoolShareEnd'] = userPoolShareEnd;

    // Token prices
    statsReturnObject['tokenPricesStart'] = tokenPricesStart;
    statsReturnObject['tokenPricesEnd'] = tokenPricesEnd;

    statsReturnObject['ethPriceStart'] = ethPriceStart;
    statsReturnObject['ethPriceEnd'] = ethPriceEnd;

    // TX Cost
    statsReturnObject['txCostEthStart'] = snapshot1.txCostEth;
    statsReturnObject['txCostEthEnd'] = snapshot2.txCostEth;

    // Yield reward
    statsReturnObject['yieldRewardAmountStart'] = yieldRewardAmountStart;
    statsReturnObject['yieldRewardAmountEnd'] = yieldRewardAmountEnd;
    statsReturnObject['yieldTokenPriceStart'] = yieldTokenPriceStart;
    statsReturnObject['yieldTokenPriceEnd'] = yieldTokenPriceEnd;

    // Strategy values (for interval start/end prices, not current prices)
    statsReturnObject['hodlValueUsd'] = hodlValueUsd;
    statsReturnObject['poolValueUsd'] = poolValueUsd;
    statsReturnObject['ethHodlValueUsd'] = ethHodlValueUsd;

    // TODO
    // statsReturnObject['singleTokenHodl'] = 0;
    // statsReturnObject['startTxType'] = 'deposit';

    return statsReturnObject;
};

export { getPoolStats };
