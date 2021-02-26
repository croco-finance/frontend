import { Exchange } from '@types';
import { mathUtils } from '.';
import { lossUtils } from '.';

const getSimulationStats = (
    currentTokenBalances: number[],
    currentFeesTokenAmounts: number[],
    newTokenPrices: number[],
    tokenWeights: number[],
    exchange: Exchange,
) => {
    // make sure token weights sum is equal to 1
    // const weightsSum = mathUtils.sumArr(tokenWeights);

    let newTokenBalances;
    if (exchange === 'UNI_V2' || exchange === 'SUSHI' || exchange === 'MATERIA') {
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

    const currentFeesTokenPercentages = mathUtils.divideArraysElementWise(
        currentFeesTokenAmounts,
        currentTokenBalances,
    );

    const simulatedFeesTokenAmounts = mathUtils.multiplyArraysElementWise(
        currentFeesTokenPercentages,
        newTokenBalances,
    );

    const newFeesUsd = mathUtils.getTokenArrayValue(simulatedFeesTokenAmounts, newTokenPrices);

    // Imp. loss and HODL value
    const hodlValueUsd = mathUtils.sumArr(
        mathUtils.multiplyArraysElementWise(currentTokenBalances, newTokenPrices),
    );

    return {
        simulatedTokenBalances: newTokenBalances,
        simulatedPoolValueUsd: newPoolValueUsd,
        simulatedFeesUsd: newFeesUsd,
        simulatedFeesTokenAmounts: simulatedFeesTokenAmounts,
        simulatedHodlValueUsd: hodlValueUsd,
        impLossRel: lossUtils.getRelativeImpLoss(newPoolValueUsd, hodlValueUsd),
        impLossUsd: hodlValueUsd - newPoolValueUsd,
    };
};

export { getSimulationStats };
