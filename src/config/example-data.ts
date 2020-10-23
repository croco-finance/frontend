import { PoolItemInterface, PoolItemsDict, PoolItemsInterface, PriceRatesInterface } from './types';

export const poolItemExample1 = {
    exchange: 'balancer',
    poolId: '0x59a19d8c652fa0284f44113d0ff9aba70bd46fb4',
    userAddr: '0xb652c617d18971A53f3727E01f6E86f975312c28',
    tokens: [
        {
            symbol: 'usdt',
            address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
            platform: 'ethereum',
            price: {
                usd: 14119.35,
                eur: 12029.27,
            },
        },
        {
            symbol: 'wbtc',
            address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
            platform: 'ethereum',
        },
    ],
    tokenWeights: [0.8, 0.2],
    endTokenBalances: [234, 17.8],
    endBalanceUsd: 97000.54,
    netReturnUsd: 254,
    hodlReturnUsd: 454,
    dexReturnUsd: -44343,
    feesUsd: 232.54,
    impLossUsd: -98.342,
    impLossRel: -0.45,
    txCostEth: 0.00343,
    start: 975625200000,
    end: 976402800000,
    tokenPriceUsd: [1.001, 14119.6],
};

export const poolItemExample2 = {
    exchange: 'balancer',
    poolId: '0xf54025af2dc86809be1153c1f20d77adb7e8ecf4',
    userAddr: '0xb652c617d18971A53f3727E01f6E86f975312c28',
    tokens: [
        {
            symbol: 'weth',
            address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            platform: 'ethereum',
            // ...
        },
        {
            symbol: 'dai',
            address: '0x6b175474e89094c44da98b954eedeac495271d0f',
            platform: 'ethereum',
            // ...
        },
        {
            symbol: 'yfi',
            address: '0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e',
            platform: 'ethereum',
            // ...
        },
    ],
    tokenWeights: [0.3, 0.2, 0.5],
    endTokenBalances: [12.32, 74.3, 2.64],
    endBalanceUsd: 60000,
    // endBalanceETH ...,

    netReturnUsd: 3243,
    // To co tam máš teď v rezervách v Usd (fees, všechno) - rezervy v Usd v t0.
    // 1. interakce vs

    hodlReturnUsd: 236564,
    // Návratnost, kdybych tam prvotní dva asety nevložil. Jakou teď má hodnotu to, co jsem tam vložil
    // hodnota v čase t1 - hodnota assetů v čase t0

    dexReturnUsd: 34.53,
    // Fees - impermanent loss - tx cost
    // rozdíl oproti HODL

    feesUsd: 232.54,
    // + fees v ETH
    // + Yield farming

    impLossUsd: -113,
    impLossRel: -0.25,
    txCostEth: 0.00145,
    start: 971128800000,
    end: 973810800000,
    tokenPriceUsd: [370.32, 1.003, 14004.8],
};

export const poolItemExample3 = {
    exchange: 'uniswap',
    poolId: '0xbb2b8038a1640196fbe3e38816f3e67cba72d940',
    userAddr: '0xb652c617d18971A53f3727E01f6E86f975312c28',
    tokens: [
        {
            symbol: 'comp',
            address: '0xc00e94cb662c3520282e6f5717214004a7f26888',
            platform: 'ethereum',
        },
        {
            symbol: 'link',
            address: '0x514910771af9ca656af840dff83e8264ecf986ca',
            platform: 'ethereum',
        },
    ],
    tokenWeights: [0.5, 0.5],
    endTokenBalances: [123, 34443.45],
    endBalanceUsd: 50000,
    netReturnUsd: 324,
    hodlReturnUsd: 432,
    dexReturnUsd: 642.908,
    feesUsd: 3434,
    impLossUsd: -345,
    impLossRel: -2.45,
    txCostEth: 0.0541,
    start: 1573340400000,
    end: 1604962800000,
    tokenPriceUsd: [180.32, 27.88],
};

export const PoolItemsExample = {
    balancer: {
        '0x59a19d8c652fa0284f44113d0ff9aba70bd46fb4': poolItemExample1,
        '0xf54025af2dc86809be1153c1f20d77adb7e8ecf4': poolItemExample2,
    },
    uniswap: {
        '0xbb2b8038a1640196fbe3e38816f3e67cba72d940': poolItemExample3,
    },
};

// bude se nám hodit i stará cena tokenů, abychom mohli spočítat jak si uživatel polepšil/pohoršil od doby vložení
export const oldRatioExample = {
    usd: {
        usdt: 1.01,
        wbtc: 6343.78,
        weth: 322.46,
        dai: 1.03,
        yfi: 35.45,
        bal: 46.78,
        uni: 2.45,
        lend: 19,
        comp: 4.4,
        link: 34,
    },
    eur: {
        // ...
    },
};

export const currentPriceRatioExample = {
    usd: {
        usdt: 1.01,
        wbtc: 10343.78,
        weth: 342.46,
        dai: 1.0,
        yfi: 25.45,
        bal: 16.78,
        uni: 3.45,
        lend: 17,
        comp: 4.4,
        link: 35.0,
    },
    eur: {
        // ...
    },
};

export const PoolItemsDictExample = {
    '0x59a19d8c652fa0284f44113d0ff9aba70bd46fb4': poolItemExample1,
    '0xf54025af2dc86809be1153c1f20d77adb7e8ecf4': poolItemExample2,
    '0xbb2b8038a1640196fbe3e38816f3e67cba72d940': poolItemExample3,
};
