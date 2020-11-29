import { types } from '@config';
import { mathUtils } from '.';
import { lossUtils } from '.';

const getSimulationStats = (
    currentTokenBalances: Array<number>,
    currentFeesTokenAmounts: Array<number>,
    newTokenPrices: Array<number>,
    tokenWeights: Array<number>,
    exchange: types.Exchange,
) => {
    // make sure token weights sum is equal to 1
    // const weightsSum = mathUtils.sumArr(tokenWeights);

    let newTokenBalances;
    if (exchange === 'UNI_V2' || exchange === 'SUSHI') {
        newTokenBalances = lossUtils.getNewBalancesUniswap(currentTokenBalances, newTokenPrices);
    } else if (exchange === 'BALANCER') {
        newTokenBalances = lossUtils.getNewBalancesBalancer(
            currentTokenBalances,
            newTokenPrices,
            tokenWeights,
        );
    }

    const newPoolValueUsd = mathUtils.sumArr(
        mathUtils.multiplyArraysElementWise(newTokenBalances, newTokenPrices),
    );
    const newFeesUsd = mathUtils.sumArr(
        mathUtils.multiplyArraysElementWise(currentFeesTokenAmounts, newTokenPrices),
    );

    // Imp. loss and HODL value
    const hodlValueUsd = mathUtils.sumArr(
        mathUtils.multiplyArraysElementWise(currentTokenBalances, newTokenPrices),
    );

    return {
        newTokenBalances: newTokenBalances,
        newPoolValueUsd: newPoolValueUsd,
        newFeesUsd: newFeesUsd,
        newHodlValueUsd: hodlValueUsd,
        impLossRel: lossUtils.getRelativeImpLoss(newPoolValueUsd, hodlValueUsd),
        impLossUsd: hodlValueUsd - newPoolValueUsd,
    };
};

// const getHodlSTrategyValue = () => {

//        // strategies
//        const poolStrategyUsd = currentPoolValueUsd + withdrawalsUsd + yieldUsd - txCostUsd;
//        const tokensHodlStrategyTokenAmounts = depositsTokenAmounts;
//        const tokensHodlStrategyUsd = depositsUsd;
//        const ethHodlStrategyUsd = depositsEth * ethPriceEnd;
//        const ethHodlStrategyEth = depositsEth;
// };

export { getSimulationStats };
