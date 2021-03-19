import { Exchange } from '@types';
import { mathUtils } from '@utils';

const getRelativeImpLoss = (poolValue: number, hodlValue: number) => poolValue / hodlValue - 1;

const getNewBalancesBalancer = (
    initialTokenBalances: number[],
    newTokenPrices: number[],
    tokenWeights: number[],
): number[] => {
    // get new balances of tokens in the pool after price change (without fees)
    const tokensCount = initialTokenBalances.length;

    // get value of V
    let V = 1;

    initialTokenBalances.forEach((balance, i) => {
        V *= balance ** tokenWeights[i];
    });

    // compute new token balances
    const newBalances: number[] = new Array(tokensCount);
    const weightsSum = mathUtils.sumArr(tokenWeights);

    for (let i = 0; i < tokensCount; i++) {
        const firstEquationPart =
            (tokenWeights[i] / newTokenPrices[i]) ** (weightsSum - tokenWeights[i]);
        let secondEquationPart = 1;
        for (let j = 0; j < tokensCount; j++) {
            if (j !== i) {
                secondEquationPart *= (newTokenPrices[j] / tokenWeights[j]) ** tokenWeights[j];
            }
        }

        newBalances[i] = V * firstEquationPart * secondEquationPart;
    }

    return newBalances;
};

const getNewBalancesUniswap = (
    initialTokenBalances: number[],
    newTokenPrices: number[],
): number[] => {
    // get value of k
    const k = initialTokenBalances[0] * initialTokenBalances[1];

    // get price change ratio of the two tokens
    const priceRatioChange = newTokenPrices[0] / newTokenPrices[1];

    // compute new token balances (there are 2 tokens in uniswap)
    const newBalances: number[] = new Array(2);

    // compute new token balances
    newBalances[0] = Math.sqrt(k / priceRatioChange);
    newBalances[1] = Math.sqrt(k * priceRatioChange);

    return newBalances;
};

const getUniImpLossFromPriceChangeRatio = priceChangeRatio =>
    (2 * Math.sqrt(priceChangeRatio)) / (1 + priceChangeRatio) - 1;

const getIntervalFees = (
    startTokenBalances: number[],
    endTokenBalances: number[],
    endTokenPrices: number[],
    tokenWeights: number[],
    exchange: Exchange,
) => {
    let tokenBalancesNoFees: number[] = [];
    if (exchange === 'UNI_V2' || exchange === 'SUSHI' || exchange === 'MATERIA') {
        tokenBalancesNoFees = getNewBalancesUniswap(startTokenBalances, endTokenPrices);
    } else if (exchange === 'BALANCER') {
        tokenBalancesNoFees = getNewBalancesBalancer(
            startTokenBalances,
            endTokenPrices,
            tokenWeights,
        );
    }

    const feesTokenAmounts = mathUtils.subtractArraysElementWise(
        endTokenBalances,
        tokenBalancesNoFees,
    );

    const feesUsd = mathUtils.getTokenArrayValue(feesTokenAmounts, endTokenPrices);

    return { feesTokenAmounts, feesUsd };
};

export {
    getUniImpLossFromPriceChangeRatio,
    getNewBalancesUniswap,
    getNewBalancesBalancer,
    getRelativeImpLoss,
    getIntervalFees,
};
