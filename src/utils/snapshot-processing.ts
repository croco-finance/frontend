import { math } from '.';
import * as loss from './loss-computations';

const getPoolStats = (poolSnapshots: Array<any>) => {
    console.log('poolSnapshots', poolSnapshots);
    let intervalStats = new Array();

    poolSnapshots.forEach((snapshot, i) => {
        if (i > 0) {
            intervalStats.push(getIntervalStats(poolSnapshots[i - 1], poolSnapshots[i]));
        }

        // const {
        //     exchange,
        //     startTokenBalances,
        //     endTokenBalances,
        //     tokenWeights,
        //     tokenBalanceDiffNoFees,
        //     endTokenPricesUsd,
        //     ethPriceUsdEnd,
        //     txCostEth,
        // } = snapshot;

        // // compute theoretical new token balances after price change without fees
        // let newBalancesNoFees;

        // if (exchange === 'UNI_V2' || exchange === 'UNI_V1') {
        //     newBalancesNoFees = loss.getNewBalancesUniswap(startTokenBalances, endTokenPricesUsd);
        // } else if (exchange === 'BALANCER') {
        //     newBalancesNoFees = loss.getNewBalancesBalancer(
        //         startTokenBalances,
        //         endTokenPricesUsd,
        //         tokenWeights,
        //     );
        // }

        // // get how much the user gained on fees
        // const fees = math.subtractArraysElementWise(endTokenBalances, newBalancesNoFees);

        // const hodlValue = math.multiplyArraysElementWise(startTokenBalances, endTokenPricesUsd);
        // const poolValue = math.multiplyArraysElementWise(endTokenBalances, endTokenPricesUsd);

        // console.log('startTokenBalances', startTokenBalances);
        // console.log('endTokenBalances', endTokenBalances);
        // console.log('newBalancesNoFees', newBalancesNoFees);
        // console.log('fees', fees);
        // console.log('endTokenPricesUsd', endTokenPricesUsd);

        // const yieldRewardToken = 0;

        // const txCostUsd = txCostEth * ethPriceUsdEnd;

        // const initialEthAmount = 0;

        // let ethHodl = 0; // potřebuji cenu ETH na začátku a cenu ETH na konci intervalu

        // compute imp loss
        // compute fees
        // compute hodl
        // compute compute hodl ETH
        // compute hodl Token
        // get tx expenses
        // get yield
        // compute if isaActive
    });

    console.log('intervalStats', intervalStats);
    return 5;
};

const getIntervalStats = (snapshot1: any, snapshot2: any) => {
    // variables declaration
    const { exchange, txCostEth } = snapshot1;

    const reserveTokensCount = snapshot1.tokens.length;

    const startTokenBalances = new Array(reserveTokensCount);
    const endTokenBalances = new Array(reserveTokensCount);
    const tokenWeights = new Array(reserveTokensCount);
    const startTokenPrices = new Array(reserveTokensCount);
    const endTokenPrices = new Array(reserveTokensCount);

    const startYieldRewardPrice = snapshot1.yieldReward.price;
    const endYieldRewardPrice = snapshot2.yieldReward.price;

    const startYieldRewardAmount = snapshot1.yieldReward.price;
    const endYieldRewardAmount = snapshot2.yieldReward.price;

    const startTimestamp = snapshot1.timestamp;
    const endTimestamp = snapshot2.timestamp;

    const startLpTokenBalance = snapshot1.liquidityTokenBalance;
    const endLpTokenBalance = snapshot2.liquidityTokenBalance;

    const startLpTokenTotalSupply = snapshot1.liquidityTokenTotalSupply;
    const endLpTokenTotalSupply = snapshot2.liquidityTokenTotalSupply;

    const startEthPrice = snapshot1.ethPrice;
    const endEthPrice = snapshot2.ethPrice;

    // get token balances at the beginning of the interval
    // also save token weights into and array
    snapshot1.tokens.forEach((tokenData, i) => {
        startTokenBalances[i] = tokenData.reserve;
        tokenWeights[i] = tokenData.weight;
        startTokenPrices[i] = tokenData.price;
    });

    // get token balances at the end of the interval
    snapshot2.tokens.forEach((tokenData, i) => {
        endTokenBalances[i] = tokenData.reserve;
        endTokenPrices[i] = tokenData.price;
    });

    // *** Stats Computations ***

    // compute theoretical new token balances after price change without fees
    let newBalancesNoFees;

    if (exchange === 'UNI_V2' || exchange === 'UNI_V1') {
        newBalancesNoFees = loss.getNewBalancesUniswap(startTokenBalances, endTokenPrices);
    } else if (exchange === 'BALANCER') {
        newBalancesNoFees = loss.getNewBalancesBalancer(
            startTokenBalances,
            endTokenPrices,
            tokenWeights,
        );
    }

    // get how much the user gained on fees
    const fees = math.subtractArraysElementWise(endTokenBalances, newBalancesNoFees);

    const hodlValue = math.multiplyArraysElementWise(startTokenBalances, endTokenPrices);
    const poolValue = math.multiplyArraysElementWise(endTokenBalances, endTokenPrices);

    // compute ETH value of each token reserve at the beginning
    const startTokenValue = math.multiplyArraysElementWise(startTokenBalances, startTokenPrices);
    const startTokensToEthValue = math.divideEachArrayElementByValue(
        startTokenValue,
        startEthPrice,
    );

    const endTokenValue = math.multiplyArraysElementWise(endTokenBalances, endTokenPrices);
    const endTokensToEthValue = math.divideEachArrayElementByValue(endTokenValue, endEthPrice);

    return 4;
};

export { getPoolStats };
