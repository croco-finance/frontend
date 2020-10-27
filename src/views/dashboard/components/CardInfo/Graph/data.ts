export const exampleData = [
    { timestamp: 0, poolValue: 10000, feesUsd: 120, yieldUsd: 34, txCostUsd: 73 },
    { timestamp: 1, poolValue: 20000, feesUsd: 32, yieldUsd: 4, txCostUsd: 3 },
    { timestamp: 2, poolValue: 15000, feesUsd: 80, yieldUsd: 12, txCostUsd: 150 },
    { timestamp: 3, poolValue: 17000, feesUsd: 333, yieldUsd: 111, txCostUsd: 99 },
];

export const exampleDataA = [
    { timestamp: 2, poolValue: 15000, feesUsd: 80, yieldUsd: 12, txCostUsd: 150 },
    { timestamp: 3, poolValue: 17000, feesUsd: 333, yieldUsd: 111, txCostUsd: 99 },
];

export const exampleDataB = [
    { timestamp: 2, poolValue: 15000, feesUsd: 80, yieldUsd: 12, txCostUsd: 150 },
    { timestamp: 3, poolValue: 17000, feesUsd: 333, yieldUsd: 111, txCostUsd: 99 },
];

export const exampleData2 = [
    { timestamp: 0, poolValue: [10000, undefined], feesUsd: 120, yieldUsd: 34, txCostUsd: 73 },
    { timestamp: 1, poolValue: [20000, undefined], feesUsd: 32, yieldUsd: 4, txCostUsd: 3 },
    { timestamp: 2, poolValue: [undefined, 15000], feesUsd: 80, yieldUsd: 12, txCostUsd: 150 },
    { timestamp: 3, poolValue: [undefined, 17000], feesUsd: 333, yieldUsd: 111, txCostUsd: 99 },
];

export const exampleData3 = [
    {
        timestamp: 0,
        poolValue: 10000,
        poolValue2: undefined,
        poolValue3: undefined,
        feesUsd: null,
        yieldUsd: null,
        txCostUsd: 12,
    },
    {
        timestamp: 1,
        poolValue: 20000,
        poolValue2: 15000,
        poolValue3: undefined,
        feesUsd: 120,
        yieldUsd: 4,
        txCostUsd: 3,
    },
    {
        timestamp: 2,
        poolValue: undefined,
        poolValue2: 20000,
        poolValue3: 10000,
        feesUsd: 80,
        yieldUsd: 12,
        txCostUsd: 150,
    },
    {
        timestamp: 3,
        poolValue: undefined,
        poolValue2: undefined,
        poolValue3: 5000,
        feesUsd: 333,
        yieldUsd: 111,
        txCostUsd: 99,
    },
];
