import { lossUtils, mathUtils, formatUtils } from '.';
import {
    Snap,
    IntervalStats,
    CumulativeStats,
    AllPoolsGlobal,
    SummaryStats,
    Deposit,
    Withdrawal,
    DailyData,
    PoolItem,
    DailyStats,
} from '@types';
import { Console } from 'console';

const getPoolStatsFromSnapshots = (poolSnapshots: Snap[]) => {
    // get interval stats first
    let intervalStats = new Array();

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
    let cumulativeStats = getCumulativeStats(intervalStats, deposits, withdrawals, poolSnapshots);

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

    if (exchange === 'UNI_V2' || exchange === 'SUSHI') {
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

    // Workaround - if the fees are negative (which is WRONG!), set NaN fees
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
        tokenBalancesStart: tokenBalancesStart,
        tokenBalancesEnd: tokenBalancesEnd,

        // Fees and imp. loss
        feesTokenAmounts: feesTokenAmounts,
        feesUsdEndPrice: mathUtils.sumArr(
            mathUtils.multiplyArraysElementWise(feesTokenAmounts, tokenPricesEnd),
        ),
        tokenDiffNoFees: tokenDiffNoFees,

        // User's pool share
        userPoolShareStart: userPoolShareStart,
        userPoolShareEnd: userPoolShareEnd,
        liquidityTokenBalanceStart: snapshotT0.liquidityTokenBalance,
        liquidityTokenBalanceEnd: snapshotT1.liquidityTokenBalance,

        // Token prices
        tokenPricesStart: tokenPricesStart,
        tokenPricesEnd: tokenPricesEnd,
        ethPriceStart: ethPriceStart,
        ethPriceEnd: ethPriceEnd,

        // TX Cost
        txCostEthStart: snapshotT0.txCostEth,
        txCostEthEnd: snapshotT1.txCostEth,

        // Yield rewards
        yieldUnclaimedTokenAmount: yieldUnclaimedTokenAmount,
        yieldClaimedTokenAmount: yieldClaimedTokenAmount,
        yieldTotalTokenAmount: yieldTotalTokenAmount,
        yieldTokenPriceStart: snapshotT0.yieldReward ? snapshotT0.yieldReward.price : null,
        yieldTokenPriceEnd: snapshotT1.yieldReward ? snapshotT1.yieldReward.price : null,
        yieldTokenSymbol: snapshotT0.yieldReward ? snapshotT0.yieldReward.token.symbol : null,

        // Imp. loss
        impLossUsd: impLossUsd ? mathUtils.roundToNDecimals(impLossUsd, 4) : 0,

        // Strategy values (for interval start/end prices, not current prices)
        poolValueUsdStart: poolValueUsdStart,
        poolValueUsdEnd: poolValueUsdEnd,
        hodlValueUsd: hodlValueUsd,
        ethHodlValueUsd: ethHodlValueUsd,

        // If staked LP tokens (for Uniswap)
        staked: snapshotT0.stakingService !== null,
    };
};

const getEthValueOfTokenArray = (tokenBalances, tokenPrices, ethPrice): number => {
    const startTokenValue = mathUtils.multiplyArraysElementWise(tokenBalances, tokenPrices);

    return mathUtils.sumArr(mathUtils.divideEachArrayElementByValue(startTokenValue, ethPrice));
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
    for (let i = 0, length = intervalStats.length; i < length - 1; i++) {
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

const getDepositsOrWithdrawalsSum = (deposits: Deposit[]) => {
    // deposits and withdrawals share the same interface (for now)

    let tokenCount = deposits[0].tokenAmounts.length;
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

const isZeroInArray = (arr: number[]) => {
    arr.every(element => {
        // check whether element passes condition
        // if passed return true, if fails return false
        if (element === 0) return true;
    });

    return false;
};
interface yieldTokenRewards {
    claimed: number;
    unclaimed: number;
    price: number;
}

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
    const ethPriceEnd = lastInterval.ethPriceEnd;

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
    let yieldTokenRewards: { [key: string]: yieldTokenRewards } = {};
    // Create object of symbols and amounts for yield rewards
    let yieldUnclaimedTokenAmounts: number[] = [];
    let yieldClaimedTokenAmounts: number[] = [];
    let yieldTotalTokenAmounts: number[] = [];
    let yieldTokenPrices: number[] = [];
    let yieldTokenSymbols: string[] = [];

    let feesTokenAmounts = new Array(pooledTokensCount).fill(0);
    let txCostEth = 0;
    intervalStats.forEach((stat, i) => {
        // Fees
        feesTokenAmounts = mathUtils.sumArraysElementWise(
            feesTokenAmounts,
            stat['feesTokenAmounts'],
        );

        // Tx Cost eth
        txCostEth += stat['txCostEthStart'];

        // if last stat, add txCostEthEnd as well
        if (i === intervalStats.length - 1) {
            txCostEth += stat['txCostEthEnd'];
        }

        // yield rewards
        const yieldTokenSymbol = stat['yieldTokenSymbol'];

        if (yieldTokenSymbol) {
            // initialize object for not-yet-seen symbol
            if (!yieldTokenRewards[yieldTokenSymbol]) {
                yieldTokenRewards[yieldTokenSymbol] = { claimed: 0, unclaimed: 0, price: 0 };
            }

            yieldTokenRewards[yieldTokenSymbol].claimed += stat['yieldClaimedTokenAmount'];
            yieldTokenRewards[yieldTokenSymbol].unclaimed += stat['yieldUnclaimedTokenAmount'];
            // always overwrite the price, so at the end you get the latest one (not current, but latest)
            if (stat['yieldTokenPriceEnd'] && stat['yieldTokenPriceEnd'] !== null)
                yieldTokenRewards[yieldTokenSymbol].price = stat['yieldTokenPriceEnd'];
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
    for (const [symbol, value] of Object.entries(yieldTokenRewards)) {
        yieldTokenSymbols.push(symbol);
        yieldTotalTokenAmounts.push(value.unclaimed + value.claimed);
        yieldUnclaimedTokenAmounts.push(value.unclaimed);
        yieldClaimedTokenAmounts.push(value.claimed);
        yieldTokenPrices.push(value.price);
    }

    // Tx. cost USD
    const txCostUsd = txCostEth * ethPriceEnd;

    // Fees USD
    let feesUsd = mathUtils.getTokenArrayValue(feesTokenAmounts, pooledTokenPricesEnd);

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
    if (!isZeroInArray(yieldTokenPrices)) {
        yieldUsd = mathUtils.getTokenArrayValue(yieldTotalTokenAmounts, yieldTokenPrices);
    }

    // strategies
    const poolStrategyUsd = currentPoolValueUsd + withdrawalsUsd + yieldUsd - txCostUsd;
    const tokensHodlStrategyTokenAmounts = depositsTokenAmounts;
    const tokensHodlStrategyUsd = depositsUsd;
    const ethHodlStrategyUsd = depositsEth * ethPriceEnd;
    const ethHodlStrategyEth = depositsEth;

    return {
        txCostEth: txCostEth,
        txCostUsd: txCostUsd,
        feesUsd: feesUsd,
        yieldUsd: yieldUsd,
        yieldUnclaimedTokenAmounts: yieldUnclaimedTokenAmounts,
        yieldClaimedTokenAmounts: yieldClaimedTokenAmounts,
        yieldTotalTokenAmounts: yieldTotalTokenAmounts,
        yieldTokenSymbols: yieldTokenSymbols,
        yieldTokenPrices: yieldTokenPrices,
        tokenBalances: lastInterval.tokenBalancesEnd,
        feesTokenAmounts: feesTokenAmounts,
        ethPriceEnd: lastInterval.ethPriceEnd,
        tokenPricesEnd: pooledTokenPricesEnd,
        yieldTokenPriceEnd: yieldTokenPrices[0], // TODO take into account there might be more yield tokens
        currentPoolValueUsd: currentPoolValueUsd,
        endPoolValueUsd: endPoolValueUsd,
        timestampEnd: lastInterval.timestampEnd,
        depositsTokenAmounts: depositsTokenAmounts,
        withdrawalsTokenAmounts: withdrawalsTokenAmounts,
        depositsUsd: depositsUsd,
        withdrawalsUsd: withdrawalsUsd,
        poolStrategyUsd: poolStrategyUsd,
        tokensHodlStrategyTokenAmounts: tokensHodlStrategyTokenAmounts,
        tokensHodlStrategyUsd: tokensHodlStrategyUsd,
        ethHodlStrategyUsd: ethHodlStrategyUsd,
        ethHodlStrategyEth: ethHodlStrategyEth,
        currentTokenBalances,
        feesTokenAmountsExceptLastInt,
    };
};

// TODO this works with the old croco version
const getPoolsSummaryObject = (
    allPools: AllPoolsGlobal,
    filteredPoolIds: string[], // do summary from these pool Ids
): SummaryStats => {
    // TODO compute separately for Balancer and for Uniswap
    let feesUsdSum = 0;
    let feesTokenAmountsSum: { [key: string]: number } = {}; // {ETH: 5.6, DAI: 123.43, ...}
    let txCostUsdSum = 0;
    let txCostEthSum = 0;
    let yieldUsdSum = 0;
    let totalValueLockedUsd = 0;
    let pooledTokenAmountsSum: { [key: string]: number } = {};
    let yieldTotalTokenAmountsSum: { [key: string]: number } = {};
    filteredPoolIds.forEach(poolId => {
        const pool = allPools[poolId];
        const { cumulativeStats, pooledTokens, yieldToken } = pool;
        const {
            currentPoolValueUsd,
            tokenBalances,
            feesTokenAmounts,
            feesUsd,
            yieldUsd,
            yieldTotalTokenAmount,
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

        if (yieldToken) {
            const yieldTokenSymbol = yieldToken.symbol;
            if (!yieldTotalTokenAmountsSum[yieldTokenSymbol]) {
                yieldTotalTokenAmountsSum[yieldTokenSymbol] = 0;
            }

            yieldTotalTokenAmountsSum[yieldTokenSymbol] += yieldTotalTokenAmount;
        }

        // double check you sum only non-NaN values
        // TODO maybe check directly in interval-stats computations, if number is NaN
        // (but keep in mind that sometimes I might want to know if the number is NaN and not 0)
        if (currentPoolValueUsd) totalValueLockedUsd += currentPoolValueUsd;
        if (yieldUsd) yieldUsdSum += yieldUsd;
        if (feesUsd) feesUsdSum += feesUsd;
        if (txCostEth) txCostEthSum += txCostEth;
        if (txCostUsd) txCostUsdSum += txCostUsd;
    });

    return {
        valueLockedUsd: totalValueLockedUsd,
        pooledTokenSymbols: Object.keys(pooledTokenAmountsSum),
        pooledTokenAmounts: Object.values(pooledTokenAmountsSum),
        yieldTokenSymbols: Object.keys(yieldTotalTokenAmountsSum),
        yieldTotalTokenAmounts: Object.values(yieldTotalTokenAmountsSum),
        yieldUsd: yieldUsdSum,
        txCostEth: txCostEthSum,
        txCostUsd: txCostUsdSum,
        // The symbols for fees are the same as pooledTokenSymbols,
        // but I am not 100% sure if they are always sorted the same way if I use Object.keys(object).
        // TODO check if that's the case
        feesTokenSymbols: Object.keys(feesTokenAmountsSum),
        feesTokenAmounts: Object.values(feesTokenAmountsSum),
        feesUsd: feesUsdSum,
    };
};

const getDailyRewards = (
    dailyData: { [key: number]: DailyData },
    poolItem: PoolItem,
): DailyStats | undefined => {
    const { exchange, snapshots, tokenWeights } = poolItem;
    const userTokenBalancesDaily = new Array();
    const tokenPricesDaily = new Array();
    const tokenFeesArr = new Array();
    const usdFeesArr = new Array();
    const dayTimestamps = new Array();
    const statsTimestamps = new Array();
    const userTokenBalancesIntervals = new Array();
    let indexOfLastSnapChecked = 0; // index of snapshot which lp tokens a

    // Convert dayIds to number and make sure the dayIds are sorted
    let dayIdsString = Object.keys(dailyData);
    let dayIdsNumbers = dayIdsString.map(dayId => parseFloat(dayId));
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
            timestamps: statsTimestamps,
            feesTokenAmounts: tokenFeesArr,
            feesUsd: usdFeesArr,
            averageDailyFeesUsd: averageDailyFeesUsd,
            averageDailyYieldUsd: averageDailyYield,
        };
    } else {
        console.log('Could not compute daily stats.');
        return undefined;
    }
};

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

    console.log('yieldRewardSum', yieldRewardSum);
    console.log('averageDailyYield', averageDailyYield);

    return averageDailyYield;
};

export {
    getPoolStatsFromSnapshots,
    getCumulativeStats,
    getPoolsSummaryObject,
    getDepositsAndWithdrawals,
    getDailyRewards,
};
