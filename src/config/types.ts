export enum Exchange {
    UNI_V2 = 'UNI_V2',
    BALANCER = 'BALANCER',
}

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
    userPoolShareStart: any;
    userPoolShareEnd: any;
    tokenPricesStart: any;
    tokenPricesEnd: any;
    ethPriceStart: any;
    ethPriceEnd: any;
    txCostEthStart: any;
    txCostEthEnd: any;
    yieldTokenAmount: number;
    yieldTokenAmountStart: any;
    yieldTokenAmountEnd: any;
    yieldTokenPriceStart: any;
    yieldTokenPriceEnd: any;
    // strategies
    hodlValueUsd: any;
    poolValueUsd: any;
    ethHodlValueUsd: any;
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
