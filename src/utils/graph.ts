import { mathUtils, lossUtils } from '.';
import {
    GraphData,
    IntervalStats,
    SnapStructure,
    Exchange,
    DailyData,
    PoolToken,
    PoolItem,
} from '@types';

const getPooledTokenBalancesAsArr = (userPoolShare: number, tokens: PoolToken[]) => {
    const tokenBalances = new Array();
    tokens.forEach(token => {
        tokenBalances.push(token.reserve * userPoolShare);
    });

    return tokenBalances;
};

const getPooledTokenPricesAsArr = (tokens: PoolToken[]) => {
    const tokenPrices = new Array();
    tokens.forEach(token => {
        tokenPrices.push(token.priceUsd);
    });

    return tokenPrices;
};

const getIntervalFees = (
    startTokenBalances: number[],
    endTokenBalances: number[],
    endTokenPrices: number[],
    tokenWeights: number[],
    exchange: Exchange,
) => {
    let tokenBalancesNoFees;
    if (exchange === 'UNI_V2' || exchange === 'SUSHI') {
        tokenBalancesNoFees = lossUtils.getNewBalancesUniswap(startTokenBalances, endTokenPrices);
    } else if (exchange === 'BALANCER') {
        tokenBalancesNoFees = lossUtils.getNewBalancesBalancer(
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

const getDailyFeesGraphData = (dailyData: { [key: number]: DailyData }, poolItem: PoolItem) => {
    const { exchange, snapshots, tokenWeights } = poolItem;

    const daysCount = Object.keys(dailyData).length;
    const userLiquidityTokenBalancesDaily = new Array();
    const userTokenBalancesDaily = new Array();
    const tokenPricesDaily = new Array();
    const tokenFeesArr = new Array();
    const usdFeesArr = new Array();
    const dayTimestamps = new Array();
    const timestampsForGraph = new Array();
    const pooledTokenSymbols = new Array();
    let indexOfLastSnapChecked = 0; // index of snapshot which lp tokens a

    // Iterate day by day
    for (const [dayId, poolDayData] of Object.entries(dailyData)) {
        // get day timestamp
        const dayTimestamp = parseFloat(dayId) * 86400 * 1000;
        let newerSnapFound = false;

        dayTimestamps.push(dayTimestamp);
        tokenPricesDaily.push(getPooledTokenPricesAsArr(poolDayData.tokens));
        console.log('dayTimestamp', dayTimestamp);

        // get how much tokens did the user have at this day
        for (let i = indexOfLastSnapChecked; i < snapshots.length; i++) {
            const snap = snapshots[i];
            console.log('snap.timestamp ', snap.timestamp);

            // if there is a snapshot newer than this day
            if (snap.timestamp > dayTimestamp && i > 0) {
                // push token balances based on data from the previous snap
                const userLPTokenBalance = snapshots[i - 1].liquidityTokenBalance;
                const userPoolShare = userLPTokenBalance / poolDayData.liquidityTokenTotalSupply;
                const pooledTokenBalances = getPooledTokenBalancesAsArr(
                    userPoolShare,
                    poolDayData.tokens,
                );

                console.log('pushing: ', pooledTokenBalances);
                userTokenBalancesDaily.push(pooledTokenBalances);

                newerSnapFound = true;
                indexOfLastSnapChecked = i - 1;
                break;
            }
        }

        // if no snap newer than the day was found, add LP token balances from the last checked snap
        if (!newerSnapFound) {
            const userLPTokenBalance = snapshots[indexOfLastSnapChecked].liquidityTokenBalance;
            const userPoolShare = userLPTokenBalance / poolDayData.liquidityTokenTotalSupply;
            const pooledTokenBalances = getPooledTokenBalancesAsArr(
                userPoolShare,
                poolDayData.tokens,
            );

            userTokenBalancesDaily.push(pooledTokenBalances);
            console.log('pushing: ', pooledTokenBalances);
        }
    }

    // get array of fees collected
    for (let i = 0; i < userTokenBalancesDaily.length - 1; i++) {
        const { feesTokenAmounts, feesUsd } = getIntervalFees(
            userTokenBalancesDaily[i],
            userTokenBalancesDaily[i + 1],
            tokenPricesDaily[i + 1],
            tokenWeights,
            exchange,
        );
        tokenFeesArr.push(feesTokenAmounts);
        usdFeesArr.push(feesUsd);

        timestampsForGraph.push(dayTimestamps[i + 1]);
    }

    // return data in graph-ready format
    let graphData = new Array();
    for (let i = 0; i < timestampsForGraph.length; i++) {
        graphData[i] = {
            timestamp: timestampsForGraph[i],
            feesTokenAmounts: tokenFeesArr[i],
            feesUsd: usdFeesArr[i],
        };
    }

    console.log('graphData', graphData);

    return graphData;
};

const getGraphData = (intervalStats: IntervalStats[]) => {
    const statsCount = intervalStats.length;
    const lastTimestamp = intervalStats[intervalStats.length - 1].timestampEnd;
    let graphData: GraphData[] = new Array(statsCount + 1);

    // Get first element of graph data. The rest will be computed using loop
    const initialPoolValues = new Array(statsCount).fill(undefined);

    // initialPoolValues[0] = intervalStats[0].poolValueUsd;
    initialPoolValues[0] = intervalStats[0].poolValueUsdStart;

    graphData[0] = {
        label: `${intervalStats[0].timestampStart}_Deposit`,
        lastTimestamp: lastTimestamp,
        timestampPrev: null,
        timestamp: intervalStats[0].timestampStart,
        poolValues: initialPoolValues,
        poolValuePrev: undefined,
        feesUsd: 0,
        yieldUsd: 0,
        txCostUsd: intervalStats[0].txCostEthStart * intervalStats[0].ethPriceStart,
        impLossUsd: 0,
    };

    intervalStats.forEach((stat, i) => {
        // ship the first stat (is already included)
        const poolValues = new Array(statsCount).fill(undefined);

        // get end value of pool
        poolValues[i] = stat.poolValueUsdEnd;

        // if not last stat.
        if (i !== statsCount - 1) {
            // get next interval stat.
            const nextStat = intervalStats[i + 1];

            // compute the start value of the next interval
            poolValues[i + 1] = nextStat.poolValueUsdStart;
        }

        // previous pool Value
        // const poolValuePrev = graphData[i].poolValues[i];

        // Get label (deposit/withdraw)
        let label;
        if (i === statsCount - 1) {
            // if last stat, withdraw label
            if (stat.liquidityTokenBalanceEnd === 0) {
                label = 'Withdraw';
            } else {
                label = 'Today';
            }
        } else {
            if (intervalStats[i + 1].poolValueUsdStart < stat.poolValueUsdEnd) {
                label = 'Withdraw';
            } else if (intervalStats[i + 1].poolValueUsdStart > stat.poolValueUsdEnd) {
                label = 'Deposit';
            } else {
                if (intervalStats[i + 1].poolValueUsdStart === 0) {
                    label = '';
                } else {
                    // the USD value did not change. Check if the user staked or un-staked

                    if (i > 0) {
                        // if the previous snap was staked
                        if (stat.staked === false) {
                            label = 'Yield start';
                        } else {
                            label = 'Yield end';
                        }
                    } else {
                        label = 'Yield start';
                    }
                }
            }
        }

        graphData[i + 1] = {
            label: `${stat.timestampEnd}_${label}`,
            lastTimestamp: lastTimestamp,
            timestampPrev: stat.timestampStart,
            timestamp: stat.timestampEnd,
            poolValues: poolValues,
            feesUsd: mathUtils.getTokenArrayValue(stat.feesTokenAmounts, stat.tokenPricesEnd),
            yieldUsd: stat.yieldTokenPriceEnd
                ? stat.yieldTotalTokenAmount * stat.yieldTokenPriceEnd
                : 0,
            txCostUsd: stat.txCostEthEnd * stat.ethPriceEnd,
            impLossUsd: stat.impLossUsd,
            poolValuePrev: stat.poolValueUsdStart,
            // poolValuePrev: poolValuePrev,
        };
    });

    return graphData;
};

const getILGraphData = (
    currentPoolValue: number,
    newPoolValue: number,
    newHodlValue: number,
    poolIsActive: boolean,
) => {
    const data = new Array(2);

    data[0] = {
        name: poolIsActive ? 'Today' : 'Withdrawal time',
        poolValue: currentPoolValue,
        hodlValue: currentPoolValue,
    };

    data[1] = {
        name: 'Simulated',
        poolValue: newPoolValue,
        hodlValue: newHodlValue,
    };

    return data;
};

const getStrategiesGraphData = (
    currentPoolValue: number,
    currentTokensHodlValue: number,
    currentEthHodlValue: number,
    simulatedPoolValue: number,
    simulatedTokensHodlValue: number,
    simulatedEthHodlValue: number,
) => {
    const data = new Array(2);

    data[0] = {
        name: 'Today',
        poolValue: currentPoolValue,
        hodlValue: currentTokensHodlValue,
        ethHodlValue: currentEthHodlValue,
    };

    data[1] = {
        name: 'Simulated',
        poolValue: simulatedPoolValue,
        hodlValue: simulatedTokensHodlValue,
        ethHodlValue: simulatedEthHodlValue,
    };

    return data;
};

const getMaxPossiblePoolValue = (
    currentTokenBalances: Array<number>,
    currentTokenPrices: Array<number>,
    defaultPriceChangeCoeffs: Array<number>,
    maxCoeffIncreaseRate: number = 2,
) => {
    const maxPossibleCoeffs = mathUtils.multiplyEachArrayElementByValue(
        defaultPriceChangeCoeffs,
        maxCoeffIncreaseRate,
    );
    const maxPossiblePrices = mathUtils.multiplyArraysElementWise(
        currentTokenPrices,
        maxPossibleCoeffs,
    );
    const maxPossiblePoolValue = mathUtils.getTokenArrayValue(
        currentTokenBalances,
        maxPossiblePrices,
    );

    return maxPossiblePoolValue;
};

const getStrategiesMaxPossiblePoolValues = (
    currentTokenPrices: Array<number>,
    currentEthPrice: number,
    defaultTokensPriceChangeCoeffs: Array<number>,
    defaultEthPriceCoeff: number,
    currentTokenBalances: Array<number>,
    withdrawalsTokenAmounts: number[],
    yieldUsd: number,
    txCostEth: number,
    tokensHodlTokenAmounts: number[],
    ethHodlEthAmount: number,
    maxCoeffIncreaseRate: number = 2,
) => {
    const maxPossibleCoeffs = mathUtils.multiplyEachArrayElementByValue(
        defaultTokensPriceChangeCoeffs,
        maxCoeffIncreaseRate,
    );
    const maxPossibleEthCoeff = defaultEthPriceCoeff * maxCoeffIncreaseRate;

    const maxPossiblePrices = mathUtils.multiplyArraysElementWise(
        currentTokenPrices,
        maxPossibleCoeffs,
    );

    const maxPossibleEthPrice = currentEthPrice * maxPossibleEthCoeff;

    // Pool strategy
    let maxPossiblePoolStrategyValue = mathUtils.getTokenArrayValue(
        currentTokenBalances,
        maxPossiblePrices,
    );

    maxPossiblePoolStrategyValue += mathUtils.getTokenArrayValue(
        withdrawalsTokenAmounts,
        maxPossiblePrices,
    );

    maxPossiblePoolStrategyValue += yieldUsd - txCostEth * maxPossibleEthPrice;

    // HODL strategies
    const maxPossibleTokensHodlValue = mathUtils.getTokenArrayValue(
        tokensHodlTokenAmounts,
        maxPossiblePrices,
    );
    const possibleEthHodlValue = ethHodlEthAmount * maxPossibleEthPrice;

    return Math.max(maxPossiblePoolStrategyValue, maxPossibleTokensHodlValue, possibleEthHodlValue);
};

export {
    getGraphData,
    getILGraphData,
    getMaxPossiblePoolValue,
    getStrategiesGraphData,
    getStrategiesMaxPossiblePoolValues,
    getDailyFeesGraphData,
};

const exampleGraphData = [
    {
        timestamp: 1595087838000,
        poolValues: [10000, undefined, undefined],
        poolValues_new: ['intervalStat1_start', undefined, undefined],
        feesUsd: null,
        yieldUsd: null,
        txCostUsd: 12,
        poolValuesPrev: undefined,
    },
    {
        timestamp: 1595087838000,
        poolValues: [24000, 15000, undefined],
        poolValues_new: ['intervalStat1_end', 'intervalStat2_start', undefined],
        feesUsd: 120,
        yieldUsd: 4,
        txCostUsd: 3,
        poolValuesPrev: 10000, // 'intervalStat0_start'
    },
    {
        timestamp: 1595160904000,
        poolValues: [undefined, 20000, 10000],
        poolValues_new: [undefined, 'intervalStat2_end', 'intervalStat3_start'],
        feesUsd: 80,
        yieldUsd: 12,
        txCostUsd: 150,
        poolValuesPrev: 15000, // 'intervalStat1_start'
    },
    {
        timestamp: 1595388461000,
        poolValues: [undefined, undefined, 5000],
        poolValues_new: [undefined, undefined, 'intervalStat3_end'],
        feesUsd: 333,
        yieldUsd: 111,
        txCostUsd: 99,
        poolValuesPrev: 10000,
    },
];
