import { mathUtils, lossUtils } from '.';
import { types } from '@config';

interface GraphData {
    timestampMillis: number;
    poolValues: Array<number | undefined>;
    feesUsd: number | null;
    yieldUsd: number | null;
    txCostUsd: number | null;
}

const getGraphData = (intervalStats: types.IntervalStats[]) => {
    const statsCount = intervalStats.length;
    let graphData: GraphData[] = new Array(statsCount + 1);

    // Get first element of graph data. The rest will be computed using loop
    const initialPoolValues = new Array(statsCount).fill(undefined);
    // initialPoolValues[0] = intervalStats[0].poolValueUsd;
    initialPoolValues[0] = mathUtils.getTokenArrayValue(
        intervalStats[0].userTokenBalancesStart,
        intervalStats[0].tokenPricesStart,
    );

    graphData[0] = {
        timestampMillis: intervalStats[0].timestampStart * 1000,
        poolValues: initialPoolValues,
        feesUsd: null,
        yieldUsd: null,
        txCostUsd: null,
    };

    intervalStats.forEach((stat, i) => {
        // ship the first stat (is already included)
        const poolValues = new Array(statsCount).fill(undefined);

        // for (let index = 0; index < statsCount; index++) {
        //     if
        //     poolValues[index]
        // }

        poolValues[i] = mathUtils.getTokenArrayValue(
            stat.userTokenBalancesEnd,
            stat.tokenPricesEnd,
        );

        // if not last stat
        if (i !== statsCount - 1) {
            const nextStat = intervalStats[i + 1];
            poolValues[i + 1] = mathUtils.getTokenArrayValue(
                nextStat.userTokenBalancesStart,
                nextStat.tokenPricesEnd,
            );
        }

        graphData[i + 1] = {
            timestampMillis: stat.timestampEnd * 1000,
            poolValues: poolValues,
            feesUsd: mathUtils.getTokenArrayValue(stat.feesTokenAmounts, stat.tokenPricesEnd),
            yieldUsd: stat.yieldTokenAmountEnd * stat.tokenPricesEnd,
            txCostUsd: stat.txCostEthEnd * stat.ethPriceEnd,
        };
    });

    return graphData;
};

export { getGraphData };

const exampleGraphData = [
    {
        timestamp: 1595087838000,
        poolValues: [10000, undefined, undefined],
        feesUsd: null,
        yieldUsd: null,
        txCostUsd: 12,
    },
    {
        timestamp: 1595087838000,
        poolValues: [24000, 15000, undefined],
        feesUsd: 120,
        yieldUsd: 4,
        txCostUsd: 3,
    },
    {
        timestamp: 1595160904000,
        poolValues: [undefined, 20000, 10000],
        feesUsd: 80,
        yieldUsd: 12,
        txCostUsd: 150,
    },
    {
        timestamp: 1595388461000,
        poolValues: [undefined, undefined, 5000],
        feesUsd: 333,
        yieldUsd: 111,
        txCostUsd: 99,
    },
];
