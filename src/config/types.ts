export enum Exchange {
    UNI_V2 = 'UNI_V2',
    BALANCER = 'BALANCER',
}

export type DexBaseUrls = { [key in keyof typeof Exchange]: string };

export interface Token {
    symbol: string;
    name: string;
    contractAddress: string;
    platform: string;
}

export interface PoolToken {
    priceUsd: number;
    reserve: number;
    weight: number;
    token: Token;
}

export interface YieldReward {
    token: Token;
    amount: number;
    price: number;
}

export interface Snap {
    block: number;
    ethPrice: number;
    exchange: Exchange;
    liquidityTokenBalance: number;
    liquidityTokenTotalSupply: number;
    timestamp: number;
    txCostEth: number;
    tokens: PoolToken[];
    txHash: string | null;
    yieldReward: YieldReward | null;
    staked: boolean;
}

export interface SnapStructure {
    [key: string]: Snap[];
}

export interface IntervalStats {
    timestampStart: number;
    timestampEnd: number;
    userTokenBalancesStart: any;
    userTokenBalancesEnd: any;
    feesTokenAmounts: any;
    feesUsdEndPrice: number;
    tokenDiffNoFees: any;
    userPoolShareStart: number;
    userPoolShareEnd: number;
    tokenPricesStart: any;
    tokenPricesEnd: any;
    ethPriceStart: number;
    ethPriceEnd: number;
    txCostEthStart: number;
    txCostEthEnd: number;
    yieldTokenAmount: number;
    yieldTokenAmountStart: number;
    yieldTokenAmountEnd: number;
    yieldTokenPriceStart: number | null;
    yieldTokenPriceEnd: number | null;
    impLossUsd: number;
    // strategies
    hodlValueUsd: number;
    poolValueUsdStart: number;
    poolValueUsdEnd: number;
    ethHodlValueUsd: number;
    // TODO Deposits / Withdrawals
}

export interface CumulativeStats {
    poolValueUsd: any;
    tokenBalances: any;
    feesTokenAmounts: any;
    feesUsd: number;
    yieldTokenAmount: number;
    yieldUsd: number;
    tokenPricesEnd: any;
    yieldTokenPriceEnd: number | null;
    txCostEth: number;
    txCostUsd: number;
    ethPriceEnd: number;
    rewardsMinusExpensesUsd: number;
    timestampEnd: number;
    // average rewards since last deposit -> average rewards in last snapshot
}

export interface Pool {
    exchange: Exchange;
    userAddr: string;
    poolId: string;
    isActive: boolean;
}

export interface PoolItem {
    exchange: Exchange;
    poolId: string;
    userAddr: string;
    isActive: boolean;
    tokens: Array<TokenItemGeneric>;
    yieldToken: Token | null;
    hasYieldReward: boolean;
    timestampEnd: number;
    snapshots: Array<Snap>;
    intervalStats: Array<IntervalStats>;
    cumulativeStats: CumulativeStats;
    tokenWeights: Array<number>;
}

export interface YieldTokenInfo {
    price: number;
    amount: number;
    token: Token;
}

export interface TokenItemGeneric extends Token {
    weight: number;
}

export type AllPoolsGlobal = { [key: string]: PoolItem };

export interface GraphData {
    lastTimestampMillis: number;
    timestampMillisPrev: number | null;
    timestampMillis: number;
    poolValues: Array<number | undefined>; // undefined has to be here because of recharts library
    poolValuePrev: number | undefined;
    feesUsd: number;
    yieldUsd: number;
    txCostUsd: number;
    impLossUsd: number;
}
