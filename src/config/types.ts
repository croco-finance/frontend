export enum Exchange {
    UNI_V2 = 'UNI_V2',
    BALANCER = 'BALANCER',
    SUSHI = 'SUSHI',
}

export type DexBaseUrls = { [key in keyof typeof Exchange]: string };
export type DexToPoolIdMap = { [key in keyof typeof Exchange]: Array<string> };

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
    tokenBalancesStart: any;
    tokenBalancesEnd: any;
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
    yieldTokenPriceStart: number | null;
    yieldTokenPriceEnd: number | null;
    impLossUsd: number;
    // strategies
    hodlValueUsd: number;
    poolValueUsdStart: number;
    poolValueUsdEnd: number;
    ethHodlValueUsd: number;
    staked: boolean;
    liquidityTokenBalanceStart: number;
    liquidityTokenBalanceEnd: number;
    // ethAmountStart: number; // this is how much ETH was your deposits worth
}

export interface CumulativeStats {
    currentPoolValueUsd: number;
    endPoolValueUsd: number;
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
    timestampEnd: number;
    depositsTokenAmounts: Array<number>;
    withdrawalsTokenAmounts: Array<number>;
    depositsUsd: number;
    withdrawalsUsd: number;
    poolStrategyUsd: number;
    tokensHodlStrategyTokenAmounts: number[];
    tokensHodlStrategyUsd: number;
    ethHodlStrategyUsd: number;
    ethHodlStrategyEth: number;
    lastIntAvDailyRewardsUsd: number;
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
    pooledTokens: Array<GenericPooledTokenInfo>;
    yieldToken: Token | null;
    hasYieldReward: boolean;
    timestampEnd: number;
    intervalStats: Array<IntervalStats>;
    cumulativeStats: CumulativeStats;
    tokenWeights: Array<number>;
}

export interface YieldTokenInfo {
    price: number;
    amount: number;
    token: Token;
}

export interface GenericPooledTokenInfo extends Token {
    weight: number;
}

export type AllPoolsGlobal = { [key: string]: PoolItem };

export interface GraphData {
    lastTimestamp: number;
    timestampPrev: number | null;
    timestamp: number;
    poolValues: Array<number | undefined>; // undefined has to be here because of recharts library
    poolValuePrev: number | undefined;
    feesUsd: number;
    yieldUsd: number;
    txCostUsd: number;
    impLossUsd: number;
}

export interface SummaryStats {
    valueLockedUsd: any;
    pooledTokenSymbols: Array<string>;
    pooledTokenAmounts: Array<number>;
    yieldTokenSymbols: Array<string>;
    yieldTokenAmounts: Array<number>;
    feesTokenSymbols: Array<string>;
    feesTokenAmounts: Array<number>;
    feesUsd: number;
    yieldUsd: number;
    txCostEth: number;
    txCostUsd: number;
    // average rewards since last deposit -> average rewards in last snapshot
}

export interface Deposit {
    timestamp: number | undefined;
    tokenAmounts: Array<number>;
    valueUsd: number;
    valueEth: number;
}

export interface Withdrawal extends Deposit {}
