export type PoolId = string;

export type UniswapName = 'UNI_V2' | 'UNI_V1' | 'Uniswap' | 'uniswap';
export type BalancerName = 'BALANCER';

export interface InputInterface {
    address: string; // '0x2bb665722a122dd8a80c9d8625430fa1bcc6c3fc'
    exchange: string;
}

export interface PoolItemInterface {
    exchange: string;
    hodlReturnUsd: number; // difference in HODL value now and at the beginning
    netReturnUsd: number; // difference in pool value now and at the beginning
    dexReturnUsd: number; // fees - impermanent_loss - tx_cost
    feesUsd: number; // total user's fee gains
    impLossRel: number | undefined; //  None in case of changes in lp balance
    impLossUsd: number; // impermanent loss
    txCostEth: number | undefined; // v ETH
    endBalanceUsd: number;
    userAddr: string;
    poolId: string; // pool smart contract address
    tokens: Array<{ [key: string]: {} }>;
    tokenWeights: Array<number>;
    endTokenBalances: Array<number>; // User token balances
    endTokenPricesUsd: Array<number>;
    start: number;
    end: number;
    tokenPriceUsd: Array<number>;
    tokenBalanceDiffNoFees: Array<number>;
    hodlReturnEth: number;
    netReturnEth: number;
    feesEth: number;
    endBalanceEth: number;
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
}

export interface CumulativeStats {
    poolValueUsd: any;
    tokenBalances: any;
    feesTokenAmounts: any;
    feesUsd: number;
    yieldTokenAmount: number | null;
    yieldUsd: number | null;
    tokenPricesEnd: any;
    yieldTokenPriceEnd: number | null;
    txCostEth: number;
    ethPriceEnd: number;
    rewardsMinusExpensesUsd: number;
    timestampEnd: number;
    // rewardsSumUsd: number;
}

export interface Pool {
    exchange: string;
    userAddr: string;
    poolId: string;
    isActive: boolean;
}

// snap of pool which I get from server
export interface PoolSnap {
    ethPrice: number;
    exchange: string;
    liquidityTokenBalance: string;
    liquidityTokenTotalSupply: boolean;
    poolId: string;
    timestamp: number;
    tokens: Array<PooledTokenInfo>;
    txCostEth: number;
    userAddr: string;
    yieldReward: null | YieldTokenInfo;
}

export interface PoolItem {
    exchange: string;
    poolId: string;
    userAddr: string;
    isActive: boolean;
    tokens: Array<TokenItemGeneric>;
    yieldToken: Token | null;
    hasYieldReward: boolean;
    timestampEnd: number;
    snapshots: Array<PoolSnap>;
    intervalStats: Array<IntervalStats>;
    cumulativeStats: CumulativeStats;
}

export interface Token {
    contract_address: string;
    name: string;
    platform: string;
    symbol: string;
}

export interface PooledTokenInfo {
    price: number;
    reserve: number;
    weight: number;
    token: Token;
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
