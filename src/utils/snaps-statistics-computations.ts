import {
    AllPoolsGlobal,
    CumulativeStats,
    DailyData,
    DailyStats,
    Deposit,
    IntervalStats,
    PoolItem,
    Snap,
    SummaryStats,
    Withdrawal,
} from '@types';
import { formatUtils, helperUtils, lossUtils, mathUtils, validationUtils } from '@utils';

const getEthValueOfTokenArray = (tokenBalances, tokenPrices, ethPrice): number => {
    const startTokenValue = mathUtils.multiplyArraysElementWise(tokenBalances, tokenPrices);

    return mathUtils.sumArr(mathUtils.divideEachArrayElementByValue(startTokenValue, ethPrice));
};

const getIntervalStats = (snapshotT0: Snap, snapshotT1: Snap): IntervalStats => {
    // variables declaration
    const reserveTokensCount = snapshotT0.tokens.length;
    const tokenWeights = new Array(reserveTokensCount);

    const tokenBalancesStart = new Array(reserveTokensCount);
    const tokenBalancesEnd = new Array(reserveTokensCount);

    const totalTokenReservesStart = new Array(reserveTokensCount);
    const totalTokenReservesEnd = new Array(reserveTokensCount);

    const tokenPricesStart = new Array(reserveTokensCount);
    const tokenPricesEnd = new Array(reserveTokensCount);

    // liquidity pool tokens
    const lpTokenUserBalanceStart = snapshotT0.liquidityTokenBalance;

    const lpTokenTotalSupplyStart = snapshotT0.liquidityTokenTotalSupply;
    const lpTokenTotalSupplyEnd = snapshotT1.liquidityTokenTotalSupply; // this is how much the user had BEFORE he made deposit/withdraw

    const userPoolShareStart = lpTokenUserBalanceStart / lpTokenTotalSupplyStart;
    const userPoolShareEnd = lpTokenUserBalanceStart / lpTokenTotalSupplyEnd;

    // token prices
    const ethPriceStart = snapshotT0.ethPrice;
    const ethPriceEnd = snapshotT1.ethPrice;

    // get token balances at the beginning of the interval
    snapshotT0.tokens.forEach((tokenData, i) => {
        totalTokenReservesStart[i] = tokenData.reserve;
        tokenBalancesStart[i] = userPoolShareStart * tokenData.reserve;

        tokenWeights[i] = tokenData.weight;
        tokenPricesStart[i] = tokenData.priceUsd;
    });

    // Compute theoretical token balances if no fees were gained
    snapshotT1.tokens.forEach((tokenData, i) => {
        totalTokenReservesEnd[i] = tokenData.reserve;
        tokenBalancesEnd[i] = userPoolShareEnd * tokenData.reserve;
        tokenPricesEnd[i] = tokenData.priceUsd;
    });

    // *** Stats Computations ***
    // compute theoretical new token balances after price change without fees
    const { exchange } = snapshotT0;
    let newBalancesNoFees;

    if (exchange === 'UNI_V2' || exchange === 'SUSHI' || exchange === 'MATERIA') {
        newBalancesNoFees = lossUtils.getNewBalancesUniswap(tokenBalancesStart, tokenPricesEnd);
    } else if (exchange === 'BALANCER') {
        newBalancesNoFees = lossUtils.getNewBalancesBalancer(
            tokenBalancesStart,
            tokenPricesEnd,
            tokenWeights,
        );
    }

    // get how much the user gained on fees
    const feesTokenAmounts = mathUtils.subtractArraysElementWise(
        tokenBalancesEnd,
        newBalancesNoFees,
    );

    // Temporary Workaround - if the fees are negative (should not happen in theory, but the data might be inaccurate)
    for (let i = 0; i < feesTokenAmounts.length; i++) {
        if (feesTokenAmounts[i] < 0) {
            feesTokenAmounts.fill(0);
            break;
        }
    }

    // yield rewards
    const yieldUnclaimedTokenAmount = snapshotT0.yieldReward ? snapshotT0.yieldReward.unclaimed : 0;
    const yieldClaimedTokenAmount = snapshotT0.yieldReward ? snapshotT0.yieldReward.claimed : 0;
    const yieldTotalTokenAmount = yieldUnclaimedTokenAmount + yieldClaimedTokenAmount;

    // the difference of you token holdings compared to the start amount
    const tokenDiffNoFees = mathUtils.subtractArraysElementWise(
        newBalancesNoFees,
        tokenBalancesStart,
    );

    // Pool value
    const poolValueUsdStart = mathUtils.getTokenArrayValue(tokenBalancesStart, tokenPricesStart);
    const poolValueUsdEnd = mathUtils.getTokenArrayValue(tokenBalancesEnd, tokenPricesEnd);

    // Comparison with putting everything to ETH
    // compute ETH value of each token reserve at the beginning
    const startTokenValue = mathUtils.multiplyArraysElementWise(
        tokenBalancesStart,
        tokenPricesStart,
    );

    // this his how much ETH was your deposit worth at the beginning of the interval
    // array[5.0 ETH, 5.0 ETH]
    const ethAmountStart = mathUtils.sumArr(
        mathUtils.divideEachArrayElementByValue(startTokenValue, ethPriceStart),
    );

    // this is how much would your assets be worth if you put everything to ETH instead of pooled tokens
    const ethHodlValueUsd = ethAmountStart * ethPriceEnd;
    const endTokenValues = mathUtils.multiplyArraysElementWise(tokenBalancesEnd, tokenPricesEnd);

    // this his how much ETH was the pool worth at the end of interval
    const endEthAmount = mathUtils.sumArr(
        mathUtils.divideEachArrayElementByValue(endTokenValues, ethPriceEnd),
    );

    // Imp. loss compared to HODL
    const hodlValueUsd = mathUtils.getTokenArrayValue(tokenBalancesStart, tokenPricesEnd);
    const impLossUsd =
        hodlValueUsd - mathUtils.getTokenArrayValue(newBalancesNoFees, tokenPricesEnd);

    return {
        // Timestamp (convert timestamp from seconds to milliseconds)
        timestampStart: snapshotT0.timestamp * 1000,
        timestampEnd: snapshotT1.timestamp * 1000,

        // Token balances
        tokenBalancesStart,
        tokenBalancesEnd,

        // Fees and imp. loss
        feesTokenAmounts,
        feesUsdEndPrice: mathUtils.sumArr(
            mathUtils.multiplyArraysElementWise(feesTokenAmounts, tokenPricesEnd),
        ),
        tokenDiffNoFees,

        // User's pool share
        userPoolShareStart,
        userPoolShareEnd,
        liquidityTokenBalanceStart: snapshotT0.liquidityTokenBalance,
        liquidityTokenBalanceEnd: snapshotT1.liquidityTokenBalance,

        // Token prices
        tokenPricesStart,
        tokenPricesEnd,
        ethPriceStart,
        ethPriceEnd,

        // TX Cost
        txCostEthStart: snapshotT0.txCostEth,
        txCostEthEnd: snapshotT1.txCostEth,

        // Yield rewards
        yieldUnclaimedTokenAmount,
        yieldClaimedTokenAmount,
        yieldTotalTokenAmount,
        yieldTokenPriceStart: snapshotT0.yieldReward ? snapshotT0.yieldReward.price : null,
        yieldTokenPriceEnd: snapshotT1.yieldReward ? snapshotT1.yieldReward.price : null,
        yieldTokenSymbol: snapshotT0.yieldReward ? snapshotT0.yieldReward.token.symbol : null,

        // Imp. loss
        impLossUsd: impLossUsd ? mathUtils.roundToNDecimals(impLossUsd, 4) : 0,

        // Strategy values (for interval start/end prices, not current prices)
        poolValueUsdStart,
        poolValueUsdEnd,
        hodlValueUsd,
        ethHodlValueUsd,

        // If staked LP tokens (for Uniswap)
        staked: snapshotT0.stakingService !== null,
    };
};

const getDepositsOrWithdrawalsSum = (deposits: Deposit[]) => {
    // deposits and withdrawals share the same interface (for now)

    const tokenCount = deposits[0].tokenAmounts.length;
    let tokenAmountsSum = new Array(tokenCount).fill(0);

    deposits.forEach(deposit => {
        tokenAmountsSum = mathUtils.sumArraysElementWise(tokenAmountsSum, deposit.tokenAmounts);
    });

    return tokenAmountsSum;
};

const getDepositsOrWithdrawalsEthSum = (deposits: Deposit[] | Withdrawal[]) => {
    // deposits and withdrawals share the same interface (for now)
    let valueEthSum = 0;

    deposits.forEach(deposit => {
        valueEthSum += deposit.valueEth;
    });

    return valueEthSum;
};

const getCumulativeStats = (
    intervalStats: IntervalStats[],
    deposits: Deposit[],
    withdrawals: Withdrawal[],
    snapshots: Snap[],
): CumulativeStats => {
    const lastSnap = snapshots[snapshots.length - 1];
    const pooledTokensCount = intervalStats[0].tokenBalancesStart.length;
    const intervalsCount = intervalStats.length;
    const lastInterval = intervalStats[intervalsCount - 1];

    // End token prices
    const pooledTokenPricesEnd = lastInterval.tokenPricesEnd;
    const yieldTokenPriceEnd = lastInterval.yieldTokenPriceEnd
        ? lastInterval.yieldTokenPriceEnd
        : 0;
    const { ethPriceEnd } = lastInterval;

    const isActive = lastInterval.liquidityTokenBalanceEnd !== 0;

    const endPoolValueUsd = mathUtils.getTokenArrayValue(
        lastInterval.tokenBalancesEnd,
        pooledTokenPricesEnd,
    );

    // Current pool value. If pool is not active, current pool value is 0
    let currentPoolValueUsd = endPoolValueUsd;
    if (!isActive) {
        currentPoolValueUsd = 0;
    }

    const currentTokenBalances = isActive
        ? lastInterval.tokenBalancesEnd
        : new Array(pooledTokensCount).fill(0);

    // Sum and value of all withdrawals/deposits
    const depositsTokenAmounts = getDepositsOrWithdrawalsSum(deposits);
    const withdrawalsTokenAmounts = getDepositsOrWithdrawalsSum(withdrawals);
    const depositsEth = getDepositsOrWithdrawalsEthSum(deposits);
    const depositsUsd = mathUtils.getTokenArrayValue(depositsTokenAmounts, pooledTokenPricesEnd);
    const withdrawalsUsd = mathUtils.getTokenArrayValue(
        withdrawalsTokenAmounts,
        pooledTokenPricesEnd,
    );

    // get cumulative fees, yield, txCostEth gains
    const yieldTokenRewards: { [key: string]: yieldTokenRewards } = {};
    // Create object of symbols and amounts for yield rewards
    const yieldUnclaimedTokenAmounts: number[] = [];
    const yieldClaimedTokenAmounts: number[] = [];
    const yieldTotalTokenAmounts: number[] = [];
    const yieldTokenPrices: number[] = [];
    const yieldTokenSymbols: string[] = [];

    let feesTokenAmounts = new Array(pooledTokensCount).fill(0);
    let txCostEth = 0;
    intervalStats.forEach((stat, i) => {
        // Fees
        feesTokenAmounts = mathUtils.sumArraysElementWise(feesTokenAmounts, stat.feesTokenAmounts);

        // Tx Cost eth
        txCostEth += stat.txCostEthStart;

        // if last stat, add txCostEthEnd as well
        if (i === intervalStats.length - 1) {
            txCostEth += stat.txCostEthEnd;
        }

        // yield rewards
        const { yieldTokenSymbol } = stat;

        if (yieldTokenSymbol) {
            // initialize object for not-yet-seen symbol
            if (!yieldTokenRewards[yieldTokenSymbol]) {
                yieldTokenRewards[yieldTokenSymbol] = { claimed: 0, unclaimed: 0, price: 0 };
            }

            yieldTokenRewards[yieldTokenSymbol].claimed += stat.yieldClaimedTokenAmount;
            yieldTokenRewards[yieldTokenSymbol].unclaimed += stat.yieldUnclaimedTokenAmount;
            // always overwrite the price, so at the end you get the latest one (not current, but latest)
            if (stat.yieldTokenPriceEnd && stat.yieldTokenPriceEnd !== null)
                yieldTokenRewards[yieldTokenSymbol].price = stat.yieldTokenPriceEnd;
        }
    });

    // Get unclaimed yield from the last snapshot
    if (lastSnap.yieldReward && lastSnap.yieldReward.token) {
        const lastSnapYieldSymbol = lastSnap.yieldReward.token.symbol;
        if (!yieldTokenRewards[lastSnapYieldSymbol])
            yieldTokenRewards[lastSnapYieldSymbol] = { claimed: 0, unclaimed: 0, price: 0 };
        yieldTokenRewards[lastSnapYieldSymbol].unclaimed += lastSnap.yieldReward.unclaimed;
    }

    // iterate over yieldTokenRewards and parse yield information into an array
    Object.keys(yieldTokenRewards).forEach(symbol => {
        const reward = yieldTokenRewards[symbol];
        yieldTokenSymbols.push(symbol);
        yieldTotalTokenAmounts.push(reward.unclaimed + reward.claimed);
        yieldUnclaimedTokenAmounts.push(reward.unclaimed);
        yieldClaimedTokenAmounts.push(reward.claimed);
        yieldTokenPrices.push(reward.price);
    });

    // Tx. cost USD
    const txCostUsd = txCostEth * ethPriceEnd;

    // Fees USD
    const feesUsd = mathUtils.getTokenArrayValue(feesTokenAmounts, pooledTokenPricesEnd);

    let feesTokenAmountsExceptLastInt = new Array(pooledTokensCount).fill(0);
    for (let i = 0; i < intervalStats.length - 1; i++) {
        feesTokenAmountsExceptLastInt = mathUtils.sumArraysElementWise(
            feesTokenAmountsExceptLastInt,
            intervalStats[i].feesTokenAmounts,
        );
    }

    // yield USD
    // If there is zero for some yield token, it means that the price is not defined and I can't compute overall yield USD
    let yieldUsd = 0;
    if (!yieldTokenPrices.includes(0)) {
        yieldUsd = mathUtils.getTokenArrayValue(yieldTotalTokenAmounts, yieldTokenPrices);
    }

    // strategies
    const poolStrategyUsd = currentPoolValueUsd + withdrawalsUsd + yieldUsd - txCostUsd;
    const tokensHodlStrategyTokenAmounts = depositsTokenAmounts;
    const tokensHodlStrategyUsd = depositsUsd;
    const ethHodlStrategyUsd = depositsEth * ethPriceEnd;
    const ethHodlStrategyEth = depositsEth;

    return {
        txCostEth,
        txCostUsd,
        feesUsd,
        yieldUsd,
        yieldUnclaimedTokenAmounts,
        yieldClaimedTokenAmounts,
        yieldTotalTokenAmounts,
        yieldTokenSymbols,
        yieldTokenPrices,
        tokenBalances: lastInterval.tokenBalancesEnd,
        feesTokenAmounts,
        ethPriceEnd: lastInterval.ethPriceEnd,
        tokenPricesEnd: pooledTokenPricesEnd,
        yieldTokenPriceEnd: yieldTokenPrices[0], // TODO take into account there might be more yield tokens
        currentPoolValueUsd,
        endPoolValueUsd,
        timestampEnd: lastInterval.timestampEnd,
        depositsTokenAmounts,
        withdrawalsTokenAmounts,
        depositsUsd,
        withdrawalsUsd,
        poolStrategyUsd,
        tokensHodlStrategyTokenAmounts,
        tokensHodlStrategyUsd,
        ethHodlStrategyUsd,
        ethHodlStrategyEth,
        currentTokenBalances,
        feesTokenAmountsExceptLastInt,
    };
};

const getDepositsAndWithdrawals = (intervalStats: Array<IntervalStats>, poolIsActive: boolean) => {
    const deposits: Deposit[] = [];
    const withdrawals: Withdrawal[] = [];

    // add first deposit to pool separately
    const {
        timestampStart,
        tokenBalancesStart,
        poolValueUsdStart,
        ethPriceStart,
        tokenPricesStart,
    } = intervalStats[0];
    deposits[0] = {
        timestamp: timestampStart,
        tokenAmounts: tokenBalancesStart,
        valueUsd: poolValueUsdStart,
        valueEth: getEthValueOfTokenArray(tokenBalancesStart, tokenPricesStart, ethPriceStart),
    };

    // Note: loop until the "i < length - 1 snap", because i + 1 is not defined for last snap
    for (let i = 0; i < intervalStats.length - 1; i++) {
        const endBalancePrev = intervalStats[i].tokenBalancesEnd;
        const startBalanceNext = intervalStats[i + 1].tokenBalancesStart;
        const startTokenPricesNext = intervalStats[i + 1].tokenPricesStart;
        const startEthPriceNext = intervalStats[i + 1].ethPriceStart;

        const endUsdValuePrev = intervalStats[i].poolValueUsdEnd;
        const startUsdValueNext = intervalStats[i + 1].poolValueUsdStart;

        // deposit
        if (endUsdValuePrev < startUsdValueNext) {
            const tokenAmountDeposited = mathUtils.subtractArraysElementWise(
                startBalanceNext,
                endBalancePrev,
            );

            deposits.push({
                timestamp: intervalStats[i].timestampEnd,
                tokenAmounts: tokenAmountDeposited,
                valueUsd: endUsdValuePrev - startUsdValueNext,
                valueEth: getEthValueOfTokenArray(
                    tokenAmountDeposited,
                    startTokenPricesNext,
                    startEthPriceNext,
                ),
            });
        }

        // withdrawal
        if (endUsdValuePrev > startUsdValueNext) {
            const tokenAmountWithdrawn = mathUtils.subtractArraysElementWise(
                endBalancePrev,
                startBalanceNext,
            );

            withdrawals.push({
                timestamp: intervalStats[i].timestampEnd,
                tokenAmounts: tokenAmountWithdrawn,
                valueUsd: startUsdValueNext - endUsdValuePrev,
                valueEth: getEthValueOfTokenArray(
                    tokenAmountWithdrawn,
                    startTokenPricesNext,
                    startEthPriceNext,
                ),
            });
        }
    }

    // If pool is not active, the user withdrew all his funds and we want to add this to withdrawals array
    const lastInterval = intervalStats[intervalStats.length - 1];
    if (!poolIsActive) {
        withdrawals.push({
            timestamp: lastInterval.timestampEnd,
            tokenAmounts: lastInterval.tokenBalancesEnd,
            valueUsd: lastInterval.poolValueUsdEnd,
            valueEth: getEthValueOfTokenArray(
                lastInterval.tokenBalancesEnd,
                lastInterval.tokenPricesEnd,
                lastInterval.ethPriceEnd,
            ),
        });
    }

    // if there were no withdrawals, return an array full of zero (I can manipulate with this easier than with an empty array or null)
    if (withdrawals.length === 0) {
        withdrawals.push({
            timestamp: undefined,
            tokenAmounts: new Array(lastInterval.tokenBalancesEnd.length).fill(0),
            valueUsd: 0,
            valueEth: 0,
        });
    }

    // DEPOSITS / WITHDRAWALS
    const depositTimestamps: number[] = [];
    const depositTokenAmounts: number[][] = [];
    const depositEthAmounts: number[][] = [];

    deposits.forEach(deposit => {
        // put withdrawals data into an array so I can render it more easily
        if (deposit.timestamp) {
            depositTimestamps.push(deposit.timestamp);
            depositTokenAmounts.push(deposit.tokenAmounts);
            depositEthAmounts.push([deposit.valueEth]);
        }
    });

    return { deposits, withdrawals, depositTimestamps, depositTokenAmounts, depositEthAmounts };
};

const getPoolStatsFromSnapshots = (poolSnapshots: Snap[]) => {
    // get interval stats first
    const intervalStats: IntervalStats[] = [];

    poolSnapshots.forEach((snapshot, i) => {
        if (i > 0) {
            intervalStats.push(getIntervalStats(poolSnapshots[i - 1], poolSnapshots[i]));
        }
    });

    const poolIsActive = poolSnapshots[poolSnapshots.length - 1].liquidityTokenBalance > 0;
    const {
        deposits,
        withdrawals,
        depositTimestamps,
        depositTokenAmounts,
        depositEthAmounts,
    } = getDepositsAndWithdrawals(intervalStats, poolIsActive);

    // get cumulative stats
    const cumulativeStats = getCumulativeStats(intervalStats, deposits, withdrawals, poolSnapshots);

    return {
        intervalStats,
        cumulativeStats,
        deposits,
        withdrawals,
        depositTimestamps,
        depositTokenAmounts,
        depositEthAmounts,
    };
};

interface yieldTokenRewards {
    claimed: number;
    unclaimed: number;
    price: number;
}

const mergeTokenSymbolsAndAmountsArrays = (
    feesUsd0: number[],
    feesUsd1: number[],
    timestamps0: number[],
    timestamps1: number[],
) => {
    let errorDays: number[] = [];
    const timestampsMerged = helperUtils.getUniqueItemsFromArray(timestamps0.concat(timestamps1));
    const feesUsdMerged: number[] = new Array(timestampsMerged.length);

    // sort array just to be sure
    timestampsMerged.sort();
    // iterate through each timestamps
    timestampsMerged.forEach((timestamp, i) => {
        // check of timestamp is present in timestamps0 and timestamps1
        const indexOf0 = timestamps0.indexOf(timestamp);
        const indexOf1 = timestamps1.indexOf(timestamp);
        let sum = 0;

        // if the timestamp is not present in of the timestamp arrays,
        if (indexOf0 >= 0) {
            sum += feesUsd0[indexOf0];
        } else {
            errorDays.push(timestamp);
        }
        if (indexOf1 >= 0) {
            sum += feesUsd1[indexOf1];
        } else {
            errorDays.push(timestamp);
        }

        feesUsdMerged[i] = sum;
        // TODO compute token fee estimates as well
        errorDays = helperUtils.getUniqueItemsFromArray(errorDays);
    });

    return { timestamps: timestampsMerged, feesUsd: feesUsdMerged, errorDays };
};

// Returns pools summary object for specified pool IDs
const getPoolsSummaryObject = (
    allPools: AllPoolsGlobal,
    filteredPoolIds: string[],
): SummaryStats => {
    let feesUsdSum = 0;
    const feesTokenAmountsSum: { [key: string]: number } = {}; // {ETH: 5.6, DAI: 123.43, ...}
    let txCostUsdSum = 0;
    let txCostEthSum = 0;
    let yieldUsdSum = 0;
    let totalValueLockedUsd = 0;
    const pooledTokenAmountsSum: { [key: string]: number } = {};
    let tokenSymbolsDailySum: string[] | undefined;
    let feesTokenAmountsDailySum: number[] | undefined;
    let feesTimestampsDailySum: number[] | undefined;
    let feesUsdDailySum: number[] | undefined;
    let yieldRewardsMerged: { [key: string]: number } = {};
    let errorDaysDailyFees: number[] = [];

    // iterate through all specified pool IDs
    for (let i = 0; i < filteredPoolIds.length; i++) {
        const poolId = filteredPoolIds[i];
        const pool: PoolItem = allPools[poolId];
        const { cumulativeStats, pooledTokens, yieldRewards } = pool;
        const {
            currentPoolValueUsd,
            tokenBalances,
            feesTokenAmounts,
            feesUsd,
            yieldUsd,
            txCostUsd,
            txCostEth,
        } = cumulativeStats;

        // iterate through all tokens
        pooledTokens.forEach((token, i) => {
            if (!pooledTokenAmountsSum[token.symbol]) {
                pooledTokenAmountsSum[token.symbol] = 0;
                feesTokenAmountsSum[token.symbol] = 0;
            }

            pooledTokenAmountsSum[token.symbol] += tokenBalances[i];
            feesTokenAmountsSum[token.symbol] += feesTokenAmounts[i];
        });

        // check for yield rewards
        if (yieldRewards) {
            yieldRewardsMerged = helperUtils.mergeStringNumberObjects(
                yieldRewardsMerged,
                yieldRewards,
            );
        }

        // fetch daily fee rewards
        if (!tokenSymbolsDailySum && pool.dailyStats) {
            // this is the first pool I am processing
            tokenSymbolsDailySum = pool.tokenSymbols;
            feesTokenAmountsDailySum = pool.dailyStats.feesTokenAmounts;
            feesTimestampsDailySum = pool.dailyStats.timestamps;
            feesUsdDailySum = pool.dailyStats.feesUsd;
        } else {
            // One pool is already processed and this is another one
            if (
                pool.dailyStats &&
                tokenSymbolsDailySum &&
                feesTokenAmountsDailySum &&
                feesTimestampsDailySum &&
                feesUsdDailySum
            ) {
                const { timestamps, feesUsd, errorDays } = mergeTokenSymbolsAndAmountsArrays(
                    feesUsdDailySum,
                    pool.dailyStats.feesUsd,
                    feesTimestampsDailySum,
                    pool.dailyStats.timestamps,
                );

                feesTimestampsDailySum = timestamps;
                feesUsdDailySum = feesUsd;
                errorDaysDailyFees = helperUtils.getUniqueItemsFromArray(
                    errorDaysDailyFees.concat(errorDays),
                );
            }
        }

        // double check you sum only non-NaN values
        // TODO maybe check directly in interval-stats computations, if number is NaN
        // (but keep in mind that sometimes I might want to know if the number is NaN and not 0)
        if (currentPoolValueUsd) totalValueLockedUsd += currentPoolValueUsd;
        if (yieldUsd) yieldUsdSum += yieldUsd;
        if (feesUsd) feesUsdSum += feesUsd;
        if (txCostEth) txCostEthSum += txCostEth;
        if (txCostUsd) txCostUsdSum += txCostUsd;
    }

    // create daily data object
    let dailyStats: DailyStats | undefined;

    if (feesTimestampsDailySum && feesUsdDailySum && tokenSymbolsDailySum) {
        dailyStats = {
            errorDays: errorDaysDailyFees,
            tokenSymbols: tokenSymbolsDailySum,
            timestamps: feesTimestampsDailySum,
            // TODO token fees in summary overview
            feesTokenAmounts: undefined,
            feesUsd: feesUsdDailySum,
            averageDailyFeesUsd: 0,
            averageDailyYieldUsd: 0,
        };
    }

    return {
        valueLockedUsd: totalValueLockedUsd,
        pooledTokenSymbols: Object.keys(pooledTokenAmountsSum),
        pooledTokenAmounts: Object.values(pooledTokenAmountsSum),
        yieldTokenSymbols: Object.keys(yieldRewardsMerged),
        yieldTotalTokenAmounts: Object.values(yieldRewardsMerged),
        yieldUsd: yieldUsdSum,
        txCostEth: txCostEthSum,
        txCostUsd: txCostUsdSum,
        feesTokenSymbols: Object.keys(feesTokenAmountsSum),
        feesTokenAmounts: Object.values(feesTokenAmountsSum),
        feesUsd: feesUsdSum,
        dailyStats,
    };
};

const getDailyRewards = (
    dailyData: { [key: number]: DailyData },
    poolItem: PoolItem,
): DailyStats | undefined => {
    const { exchange, snapshots, tokenWeights, tokenSymbols } = poolItem;
    const userTokenBalancesDaily: number[][] = [];
    const tokenPricesDaily: number[][] = [];
    const tokenFeesArr: number[][] | undefined = [];
    const usdFeesArr: number[] = [];
    const dayTimestamps: number[] = [];
    const statsTimestamps: number[] = [];
    const userTokenBalancesIntervals: Array<{ start: number[]; end: number[] }> = [];
    let indexOfLastSnapChecked = 0; // index of snapshot which lp tokens a
    const errorDaysDailyFees: number[] = [];

    // Convert dayIds to number and make sure the dayIds are sorted
    const dayIdsString = Object.keys(dailyData);
    const dayIdsNumbers = dayIdsString.map(dayId => parseFloat(dayId));
    dayIdsNumbers.sort();

    // Iterate day by day
    dayIdsNumbers.forEach((dayId, i) => {
        const poolDayData = dailyData[dayId.toString()];
        let poolDayDataNext;

        // check if this is not the last snap
        if (i < dayIdsNumbers.length - 1) {
            poolDayDataNext = dailyData[dayIdsNumbers[i + 1].toString()];
        } else {
            poolDayDataNext = poolDayData;
        }

        // get day timestamp
        const dayTimestamp = dayId * 86400 * 1000;
        let newerSnapFound = false;

        dayTimestamps.push(dayTimestamp);
        tokenPricesDaily.push(formatUtils.getPooledTokenPricesAsArr(poolDayData.tokens));

        // get how much tokens did the user have at this day
        for (let i = indexOfLastSnapChecked; i < snapshots.length; i++) {
            const snap = snapshots[i];

            // if there is a snapshot newer than this day and it's not the first snapshot ever (i > 0), get LPT balance from previous snap
            if (snap.timestamp * 1000 > dayTimestamp && i > 0) {
                // At this day, the user's LPT balance was equal to the LPT balance from the previous snap
                const userLPTokenBalance = snapshots[i - 1].liquidityTokenBalance;

                // users pool share at this particular day (timestamp)
                const userPoolShare = userLPTokenBalance / poolDayData.liquidityTokenTotalSupply;

                // also check user's pool share at the beginning of the next day in BEFORE he makes withdraw or deposit.
                // In such scenario the fees would be computed incorrectly
                const userPoolShareNextDay =
                    userLPTokenBalance / poolDayDataNext.liquidityTokenTotalSupply;

                // how much of the total pool reserves belongs to the user
                const pooledTokenBalances = formatUtils.getPooledTokenBalancesAsArr(
                    userPoolShare,
                    poolDayData.tokens,
                );

                const pooledTokenBalancesNextDay = formatUtils.getPooledTokenBalancesAsArr(
                    userPoolShareNextDay,
                    poolDayDataNext.tokens,
                );

                // push to array how much tokens did the user have at this day
                userTokenBalancesDaily.push(pooledTokenBalances);
                userTokenBalancesIntervals.push({
                    start: pooledTokenBalances,
                    end: pooledTokenBalancesNextDay,
                });

                // save that I found a snap newer than current day timestamp
                newerSnapFound = true;

                // next time I don't have to loop from the first snap. Save the index from which I want to start the next loop
                indexOfLastSnapChecked = i;
                break;
            }
        }

        // if no snap newer than the day was found, add LP token balances from the last checked snap
        /* there are two scenarios this could happen:
            - the user's first snapshot is from the future and it didn't pass the condition (i > 0) snap from previous loop 
            - the latest (current in active pools) snapshot is older than the last snap 
        */

        if (!newerSnapFound) {
            // check if the first snap is from the future
            if (snapshots[indexOfLastSnapChecked].timestamp * 1000 > dayTimestamp) {
                // the first snap appeared after this day. Thus the user had 0 LPT balance at this day
                // ... do nothing
            } else {
                const userLPTokenBalance = snapshots[indexOfLastSnapChecked].liquidityTokenBalance;
                const userPoolShare = userLPTokenBalance / poolDayData.liquidityTokenTotalSupply;
                const userPoolShareNextDay =
                    userLPTokenBalance / poolDayDataNext.liquidityTokenTotalSupply;

                const pooledTokenBalances = formatUtils.getPooledTokenBalancesAsArr(
                    userPoolShare,
                    poolDayData.tokens,
                );

                const pooledTokenBalancesNextDay = formatUtils.getPooledTokenBalancesAsArr(
                    userPoolShareNextDay,
                    poolDayDataNext.tokens,
                );

                userTokenBalancesDaily.push(pooledTokenBalances);
                userTokenBalancesIntervals.push({
                    start: pooledTokenBalances,
                    end: pooledTokenBalancesNextDay,
                });
            }
        }
    });

    // get array of fees collected
    for (let i = 0; i < userTokenBalancesDaily.length - 1; i++) {
        const { feesTokenAmounts, feesUsd } = lossUtils.getIntervalFees(
            userTokenBalancesIntervals[i].start,
            userTokenBalancesIntervals[i].end,
            tokenPricesDaily[i + 1],
            tokenWeights,
            exchange,
        );

        tokenFeesArr.push(feesTokenAmounts);
        usdFeesArr.push(feesUsd);
        statsTimestamps.push(dayTimestamps[i + 1]);
    }

    // compute average rewards of from last N samples (N included)
    const statDaysCount = statsTimestamps.length;
    if (statDaysCount > 0) {
        const N = statDaysCount >= 7 ? 7 : statDaysCount;
        const averageDailyFeesUsd = mathUtils.getArrayAverage(
            usdFeesArr.slice(Math.max(usdFeesArr.length - N, 0)),
        );

        // compute average yield reward since the day which is "Nth from the end"
        // sum yield rewards in all snapshots since
        // const averageDailyYield = getAverageDailyYieldRewardsSinceTimestamp(
        //     statsTimestamps[statDaysCount - N],
        //     snapshots,
        // );

        const averageDailyYield = 0;

        return {
            errorDays: [],
            tokenSymbols,
            timestamps: statsTimestamps,
            feesTokenAmounts: tokenFeesArr,
            feesUsd: usdFeesArr,
            averageDailyFeesUsd,
            averageDailyYieldUsd: averageDailyYield,
        };
    }

    console.log('Could not compute daily stats.');
    return undefined;
};

// TODO compute average yield rewards for the last month
const getAverageDailyYieldRewardsSinceTimestamp = (timestamp: number, snapshots: Snap[]) => {
    console.log('--- YIELD ---');
    console.log('timestamp', timestamp);
    console.log('snapshots', snapshots);

    let yieldRewardSum = 0;
    let newerSnapFound = false;

    // go through all snapshots and find the first one that is newer than timestamp
    for (let i = 0; i < snapshots.length; i++) {
        const snap = snapshots[i];

        // if there is a snapshot newer than this day
        if (snap.timestamp * 1000 > timestamp && i > 0) {
            console.log('snap.timestamp * 1000 > timestamp && i > 0');
            console.log('snap.timestamp', snap.timestamp * 1000);

            if (snapshots[i].yieldReward) {
                console.log('snapshots[i].yieldReward', snapshots[i].yieldReward);
                const claimed = snapshots[i].yieldReward?.claimed;
                const unclaimed = snapshots[i].yieldReward?.unclaimed;

                if (claimed) yieldRewardSum += claimed;
                if (unclaimed) yieldRewardSum += unclaimed;
            }

            // if this is the first time I found newer snapshot, check if I was gaining yield reward in since the previous snap as well
            if (!newerSnapFound && i > 0) {
                if (snapshots[i - 1].yieldReward) {
                    console.log('snapshots[i - 1].yieldReward', snapshots[i - 1].yieldReward);

                    // get snapshot timestamp
                    const snapTimestamp = snapshots[i - 1].timestamp * 1000;
                    const nextSnapTimestamp = snapshots[i].timestamp * 1000;

                    // how much time by percentage passed since timestamp to nextSnapTimestamp
                    const percentagePassedSinceTimestamp =
                        (nextSnapTimestamp - timestamp) / (nextSnapTimestamp - snapTimestamp);

                    // get how of the total time is
                    const claimed = snapshots[i - 1].yieldReward?.claimed;
                    const unclaimed = snapshots[i - 1].yieldReward?.unclaimed;

                    if (claimed) yieldRewardSum += percentagePassedSinceTimestamp * claimed;
                    if (unclaimed) yieldRewardSum += percentagePassedSinceTimestamp * unclaimed;
                }
            }

            newerSnapFound = true;
            break;
        }
    }

    // compute average daily yield reward since timestamp
    const lastSnapTimestamp = snapshots[snapshots.length - 1].timestamp * 1000;

    const averageDailyYield = mathUtils.getAverageDailyRewards(
        timestamp,
        lastSnapTimestamp,
        yieldRewardSum,
    );

    return averageDailyYield;
};

const getYieldTokensFromSnaps = (snapshots: Snap[]) => {
    const yieldRewards = {};
    snapshots.forEach(snap => {
        if (snap.yieldReward && snap.yieldReward.token) {
            const tokenSymbol = snap.yieldReward.token.symbol;
            if (!yieldRewards[tokenSymbol]) {
                yieldRewards[tokenSymbol] = 0;
            }
            yieldRewards[tokenSymbol] += snap.yieldReward.claimed + snap.yieldReward.unclaimed;
        }
    });

    return yieldRewards;
};

export {
    getPoolStatsFromSnapshots,
    getCumulativeStats,
    getPoolsSummaryObject,
    getDepositsAndWithdrawals,
    getDailyRewards,
    getYieldTokensFromSnaps,
};
