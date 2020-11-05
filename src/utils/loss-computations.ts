import { math } from '.';

const getNewBalancesBalancer = (
    initialTokenBalances: Array<number>,
    newTokenPrices: Array<number>,
    tokenWeights: Array<number>,
) => {
    // get new balances of tokens in the pool after price change (without fees)
    const tokenCount = initialTokenBalances.length;

    // get value of V
    let V = 1;

    initialTokenBalances.forEach((balance, i) => {
        V = V * Math.pow(balance, tokenWeights[i]);
    });

    // compute new token balances
    let newBalances = new Array(tokenCount);
    const weightsSum = math.sumArr(tokenWeights);

    for (let i = 0; i < tokenCount; i++) {
        const firstEquationPart = Math.pow(
            tokenWeights[i] / newTokenPrices[i],
            weightsSum - tokenWeights[i],
        );

        let secondEquationPart = 1;
        for (let j = 0; j < tokenCount; j++) {
            if (j !== i) {
                secondEquationPart =
                    secondEquationPart *
                    Math.pow(newTokenPrices[j] / tokenWeights[j], tokenWeights[j]);
            }
        }

        newBalances[i] = V * firstEquationPart * secondEquationPart;
    }

    return newBalances;
};

const getNewBalancesUniswap = (
    initialTokenBalances: Array<number>,
    newTokenPrices: Array<number>,
) => {
    // get value of k
    const k = initialTokenBalances[0] * initialTokenBalances[1];

    // get price change ratio of the two tokens
    const priceRatioChange = newTokenPrices[0] / newTokenPrices[1];

    // compute new token balances
    const tokenCount = 2;
    let newBalances = new Array(tokenCount);

    // compute new token balances
    newBalances[0] = Math.sqrt(k / priceRatioChange);
    newBalances[1] = Math.sqrt(k * priceRatioChange);

    return newBalances;
};

const getBalancerSimulationStats = (
    initialTokenBalances: Array<number>,
    currentTokenBalances: Array<number>,
    newTokenPrices: Array<number>,
    cumulatedTokenBalanceDiff: Array<number>,
    tokenWeights: Array<number>,
) => {
    const weightsSum = math.sumArr(tokenWeights);

    // how much tokens I should have at the beginning (if the current balance didn't included fees)
    let hodlTokenBalances = math.subtractArraysElementWise(
        currentTokenBalances,
        cumulatedTokenBalanceDiff,
    );

    // compute fees as the difference of what "I should've had" and what I actually had
    let feeBalances = math.subtractArraysElementWise(hodlTokenBalances, initialTokenBalances);

    // compute simulated token difference if we neglect fees
    let currentTokenBalancesNoFees = math.subtractArraysElementWise(
        currentTokenBalances,
        feeBalances,
    );

    // Make sure the weights sum up to one
    // if (weightsSum !== 1) throw 'Sum of token weights is not equal to 1';

    const newBalances = getNewBalancesBalancer(
        currentTokenBalancesNoFees,
        newTokenPrices,
        tokenWeights,
    );

    return getStatsFromNewBalances(
        feeBalances,
        initialTokenBalances,
        newBalances,
        currentTokenBalancesNoFees,
        cumulatedTokenBalanceDiff,
        newTokenPrices,
    );
};

const getUniImpLossFromPriceChangeRatio = priceChangeRatio => {
    return (2 * Math.sqrt(priceChangeRatio)) / (1 + priceChangeRatio) - 1;
};

const getUniswapSimulationStats = (
    initialTokenBalances: Array<number>,
    currentTokenBalances: Array<number>,
    newTokenPrices: Array<number>,
    cumulatedTokenBalanceDiff: Array<number>,
) => {
    /*
    First get how much the tokens balance changed compared to your initial deposit since the first deposit
    (without fees)
    */

    // how much tokens I should have at the beginning (if the current balance didn't included fees)
    let hodlTokenBalances = math.subtractArraysElementWise(
        currentTokenBalances,
        cumulatedTokenBalanceDiff,
    );

    // compute fees as the difference of what "I should've had" and what I actually had
    let feeBalances = math.subtractArraysElementWise(hodlTokenBalances, initialTokenBalances);

    // compute simulated token difference if we neglect fees
    let currentTokenBalancesNoFees = math.subtractArraysElementWise(
        currentTokenBalances,
        feeBalances,
    );

    const newBalances = getNewBalancesUniswap(currentTokenBalancesNoFees, newTokenPrices);

    return getStatsFromNewBalances(
        feeBalances,
        initialTokenBalances,
        newBalances,
        currentTokenBalancesNoFees,
        cumulatedTokenBalanceDiff,
        newTokenPrices,
    );
};

const getStatsFromNewBalances = (
    currentFeeBalances: Array<number>,
    initialTokenBalances: Array<number>,
    newBalances: Array<number>,
    currentTokenBalances: Array<number>,
    cumulatedTokenBalanceDiff: Array<number>,
    newTokenPrices: Array<number>,
) => {
    const tokenCount = newTokenPrices.length;

    // compute new difference in token balances compared to the first user's input
    const simulatedTokenBalanceDiff = math.subtractArraysElementWise(
        newBalances,
        currentTokenBalances,
    );

    const newTotalTokenDiff = math.sumArraysElementWise(
        cumulatedTokenBalanceDiff,
        simulatedTokenBalanceDiff,
    );

    // compute impermanent loss
    let impLossCompToInitialUsd = 0;
    let simulatedPoolValue = 0;
    let simulatedHodlValue = 0;
    let simulatedFeesUsd = 0;

    // TODO what if there is more deposits?
    for (let i = 0; i < tokenCount; i++) {
        impLossCompToInitialUsd += newTotalTokenDiff[i] * newTokenPrices[i];
        simulatedPoolValue += newBalances[i] * newTokenPrices[i];
        simulatedHodlValue += initialTokenBalances[i] * newTokenPrices[i];
        simulatedFeesUsd += currentFeeBalances[i] * newTokenPrices[i];
    }

    const impLossCompToInitialRel = simulatedPoolValue / simulatedHodlValue - 1;

    return {
        simulatedPoolValue,
        impLossCompToInitialUsd,
        impLossCompToInitialRel,
        newBalances,
        simulatedFeesUsd,
    };
};

const getGraphData = () => {
    const steps = 10;
    const scaleCoeff = 4;

    const priceChangeCoeffArr = math.arrangeArray(1, 2, steps);

    // compute max and min relative price difference
    const minRelDiff = priceChangeCoeffArr[1] / priceChangeCoeffArr[priceChangeCoeffArr.length - 1]; // second / last:
    const maxRelDiff = priceChangeCoeffArr[priceChangeCoeffArr.length - 1] / priceChangeCoeffArr[1]; // last / second:

    const relDiffArr = math.arrangeArray(0.1, 4, 0.1);
    const impLoss = new Array(relDiffArr.length);
    let graphData = new Array(relDiffArr.length);
    relDiffArr.forEach((coeff, i) => {
        const loss = getUniImpLossFromPriceChangeRatio(coeff);
        graphData[i] = { priceChangeRel: coeff, loss: loss * 100 };
    });

    return graphData;
};

const getPoolStats = (poolSnapshots: Array<any>) => {
    console.log('poolSnapshots', poolSnapshots);

    poolSnapshots.forEach((snapshot, i) => {
        const {
            exchange,
            startTokenBalances,
            endTokenBalances,
            tokenWeights,
            tokenBalanceDiffNoFees,
            endTokenPricesUsd,
            ethPriceUsdEnd,
            txCostEth,
        } = snapshot;

        // compute theoretical new token balances after price change without fees
        let newBalancesNoFees;

        if (exchange === 'UNI_V2' || exchange === 'UNI_V1') {
            newBalancesNoFees = getNewBalancesUniswap(startTokenBalances, endTokenPricesUsd);
        } else if (exchange === 'BALANCER') {
            newBalancesNoFees = getNewBalancesBalancer(
                startTokenBalances,
                endTokenPricesUsd,
                tokenWeights,
            );
        }

        // get how much the user gained on fees
        const fees = math.subtractArraysElementWise(endTokenBalances, newBalancesNoFees);

        const hodlValue = math.multiplyArraysElementWise(startTokenBalances, endTokenPricesUsd);
        const poolValue = math.multiplyArraysElementWise(endTokenBalances, endTokenPricesUsd);

        console.log('startTokenBalances', startTokenBalances);
        console.log('endTokenBalances', endTokenBalances);
        console.log('newBalancesNoFees', newBalancesNoFees);
        console.log('fees', fees);
        console.log('endTokenPricesUsd', endTokenPricesUsd);

        const yieldRewardToken = 0;

        const txCostUsd = txCostEth * ethPriceUsdEnd;

        const initialEthAmount = 0;

        let ethHodl = 0; // potřebuji cenu ETH na začátku a cenu ETH na konci intervalu

        // compute imp loss
        // compute fees
        // compute hodl
        // compute compute hodl ETH
        // compute hodl Token
        // get tx expenses
        // get yield

        return 3;
    });
};

export {
    getBalancerSimulationStats,
    getUniswapSimulationStats,
    getGraphData,
    getUniImpLossFromPriceChangeRatio,
    getPoolStats,
    getNewBalancesUniswap,
    getNewBalancesBalancer,
};
