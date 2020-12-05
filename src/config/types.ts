export interface Snap {
    block: number,
    ethPrice: number,
    exchange: Exchange,
    liquidityTokenBalance: number,
    liquidityTokenTotalSupply: number,
    timestamp: number,
    txCostEth: number,
    tokens: PoolToken[],
    txHash: string | null,
    yieldReward: YieldReward | null,
    stakingService: StakingService | null
}

export enum Exchange {
    UNI_V2 = 'UNI_V2',
    BALANCER = 'BALANCER',
    SUSHI = 'SUSHI'
}

export enum StakingService {
    UNI_V2 = 'UNI_V2',
    BALANCER = 'BALANCER',
    SUSHI = 'SUSHI',
    INDEX = 'INDEX'
}

export interface PoolToken {
    priceUsd: number,
    reserve: number,
    weight: number,
    token: Token,
}

export interface Token {
    symbol: string
    name: string,
    contractAddress: string,
    platform: string,
}

export interface YieldReward {
    'token': Token,
    'amount': number,
    'price': number
}

export const tokens: { [key in StakingService]: Token } = {
    'UNI_V2': {
        'symbol': 'UNI',
        'name': 'Uniswap',
        'contractAddress': '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
        'platform': 'ethereum',
    },
    'BALANCER': {
        'symbol': 'BAL',
        'name': 'Balancer',
        'contractAddress': '0xba100000625a3754423978a60c9317c58a424e3d',
        'platform': 'ethereum',
    },
    'SUSHI': {
        'symbol': 'SUSHI',
        'name': 'SushiToken',
        'contractAddress': '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2',
        'platform': 'ethereum',
    },
    'INDEX': {
        'symbol': 'INDEX',
        'name': 'Index',
        'contractAddress': '0x0954906da0Bf32d5479e25f46056d22f08464cab',
        'platform': 'ethereum',
    },
};

export interface SnapStructure {
    [key: string]: Snap[]
}

// Types from above are used in firebase-loader

export type DexBaseUrls = { [key in keyof typeof Exchange]: string };
export type DexToPoolIdMap = { [key in keyof typeof Exchange]: Array<string> };

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
    currentTokenBalances: number[];
    feesTokenAmountsExceptLastInt: number[];
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
    intervalStats: IntervalStats[];
    cumulativeStats: CumulativeStats;
    tokenWeights: number[];
    withdrawals: Withdrawal[];
    deposits: Deposit[];
    depositTimestamps: number[];
    depositTokenAmounts: number[][];
    depositEthAmounts: number[][];
    tokenSymbols: string[];
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
