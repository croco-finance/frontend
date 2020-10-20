import { math } from '.';

const getBalancerSimulationStats = (
    currentTokenBalances: Array<number>,
    newTokenPrices: Array<number>,
    cumulatedTokenBalanceDiff: Array<number>,
    tokenWeights: Array<number>,
) => {
    const weightsSum = tokenWeights.reduce(math.sumArr);

    // Make sure the weights sum up to one
    // if (weightsSum !== 1) throw 'Sum of token weights is not equal to 1';

    // get value of V
    let V = 1;

    currentTokenBalances.forEach((balance, i) => {
        V = V * Math.pow(balance, tokenWeights[i]);
    });

    // compute new token balances
    const tokenCount = currentTokenBalances.length;
    let newBalances = new Array(tokenCount);

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

    return getStatsFromNewBalances(
        newBalances,
        currentTokenBalances,
        cumulatedTokenBalanceDiff,
        newTokenPrices,
    );
};

const getUniswapSimulationStats = (
    currentTokenBalances: Array<number>,
    newTokenPrices: Array<number>,
    cumulatedTokenBalanceDiff: Array<number>,
) => {
    // get value of k
    const k = currentTokenBalances[0] * currentTokenBalances[1];

    // get price change ratio of the two tokens
    const priceRatioChange = newTokenPrices[0] / newTokenPrices[1];

    // compute new token balances
    const tokenCount = 2;
    let newBalances = new Array(tokenCount);

    // compute new toke balances
    newBalances[0] = Math.sqrt(k / priceRatioChange);
    newBalances[1] = Math.sqrt(k * priceRatioChange);

    return getStatsFromNewBalances(
        newBalances,
        currentTokenBalances,
        cumulatedTokenBalanceDiff,
        newTokenPrices,
    );
};

const getStatsFromNewBalances = (
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
    let impLossCompToCurrentUsd = 0;
    let simulatedPoolValue = 0;
    let simulatedHodlValue = 0;

    let hodlTokenBalances = math.subtractArraysElementWise(
        currentTokenBalances,
        cumulatedTokenBalanceDiff,
    );

    // TODO what if there is more deposits?
    for (let i = 0; i < tokenCount; i++) {
        impLossCompToInitialUsd += newTotalTokenDiff[i] * newTokenPrices[i];
        simulatedPoolValue += newBalances[i] * newTokenPrices[i];
        simulatedHodlValue += hodlTokenBalances[i] * newTokenPrices[i];
    }

    const impLossCompToInitialRel = simulatedPoolValue / simulatedHodlValue - 1;

    return { simulatedPoolValue, impLossCompToInitialUsd, impLossCompToInitialRel, newBalances };
};

export { getBalancerSimulationStats, getUniswapSimulationStats };
