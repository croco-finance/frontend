import { mathUtils } from '.';

export const getRelativeImpLoss = (poolValue: number, hodlValue: number) => {
    return poolValue / hodlValue - 1;
};

const getNewBalancesBalancer = (
    initialTokenBalances: Array<number>,
    newTokenPrices: Array<number>,
    tokenWeights: Array<number>,
) => {
    // get new balances of tokens in the pool after price change (without fees)
    const tokensCount = initialTokenBalances.length;

    // get value of V
    let V = 1;

    initialTokenBalances.forEach((balance, i) => {
        V = V * Math.pow(balance, tokenWeights[i]);
    });

    // compute new token balances
    let newBalances = new Array(tokensCount);
    const weightsSum = mathUtils.sumArr(tokenWeights);

    for (let i = 0; i < tokensCount; i++) {
        const firstEquationPart = Math.pow(
            tokenWeights[i] / newTokenPrices[i],
            weightsSum - tokenWeights[i],
        );

        let secondEquationPart = 1;
        for (let j = 0; j < tokensCount; j++) {
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

    // compute new token balances (there are 2 tokens in uniswap)
    let newBalances = new Array(2);

    // compute new token balances
    newBalances[0] = Math.sqrt(k / priceRatioChange);
    newBalances[1] = Math.sqrt(k * priceRatioChange);

    return newBalances;
};

const getUniImpLossFromPriceChangeRatio = priceChangeRatio => {
    return (2 * Math.sqrt(priceChangeRatio)) / (1 + priceChangeRatio) - 1;
};

export { getUniImpLossFromPriceChangeRatio, getNewBalancesUniswap, getNewBalancesBalancer };
