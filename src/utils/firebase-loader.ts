/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import {
    Exchange,
    NoneEnum,
    PoolSnaps,
    PoolToken,
    Snap,
    SnapStructure,
    StakingService,
    Token,
    tokens,
    YieldReward,
} from '@types';
import { firebase } from '@config';

function parseSnap(snap: any): Snap {
    let yieldReward: YieldReward | null = null;
    if (Object.prototype.hasOwnProperty.call(snap, 'stakingService')) {
        const token: Token = tokens[snap.stakingService as StakingService];
        // Price is null in situations where the staking was initiated before the token was on exchange
        let price: null | number = null;
        if (Object.prototype.hasOwnProperty.call(snap, 'yieldTokenPrice')) {
            price = parseFloat(snap.yieldTokenPrice);
        }
        yieldReward = {
            token,
            price,
            claimed: 0,
            unclaimed: 0,
        };
    } else if (Object.prototype.hasOwnProperty.call(snap, 'yieldTokenPrice')) {
        // In Balancer there is no staking service but the yield tokens are distributed
        if (snap.exchange !== 'BALANCER') {
            // TODO: send log to firebase along with address
            console.log(
                'ERROR: yieldTokenPrice property and no stakingService in non-Balancer snap',
            );
        } else {
            yieldReward = {
                token: tokens.BALANCER as Token,
                price: parseFloat(snap.yieldTokenPrice),
                claimed: 0,
                unclaimed: 0,
            };
        }
    }
    const poolTokens: PoolToken[] = [];
    for (const token of snap.tokens) {
        poolTokens.push({
            priceUsd: parseFloat(token.priceUsd),
            reserve: parseFloat(token.reserve),
            weight: parseFloat(token.weight),
            token: token.token,
        });
    }
    return {
        block: snap.block,
        ethPrice: parseFloat(snap.ethPrice),
        exchange: snap.exchange,
        liquidityTokenBalance: parseFloat(snap.liquidityTokenBalance),
        liquidityTokenTotalSupply: parseFloat(snap.liquidityTokenTotalSupply),
        timestamp: snap.timestamp,
        txCostEth: Object.prototype.hasOwnProperty.call(snap, 'txCostEth')
            ? parseFloat(snap.txCostEth)
            : 0,
        tokens: poolTokens,
        txHash: Object.prototype.hasOwnProperty.call(snap, 'txHash') ? snap.txHash : null,
        yieldReward,
        stakingService: Object.prototype.hasOwnProperty.call(snap, 'stakingService')
            ? snap.stakingService
            : null,
        idWithinStakingContract: Object.prototype.hasOwnProperty.call(
            snap,
            'idWithinStakingContract',
        )
            ? snap.idWithinStakingContract
            : null,
    };
}

function sortAndTransformSnaps(userData: any): SnapStructure {
    const snaps: SnapStructure = {};
    for (const exchange of Object.values(Exchange)) {
        if (Object.prototype.hasOwnProperty.call(userData, exchange)) {
            const exchangeSnaps = userData[exchange].snaps;
            if (exchangeSnaps === undefined) {
                // TODO: send log to firebase along with address
                console.log('WARNING: no snaps for existing yield');
            } else {
                for (const poolId of Object.keys(exchangeSnaps)) {
                    const poolSnaps: PoolSnaps = {};
                    for (const snapId of Object.keys(exchangeSnaps[poolId])) {
                        const rawSnap = exchangeSnaps[poolId][snapId];
                        rawSnap.exchange = exchange;
                        const snap: Snap = parseSnap(rawSnap);
                        const key =
                            snap.stakingService === null ? NoneEnum.NONE : snap.stakingService;
                        if (poolSnaps[key] === undefined) {
                            poolSnaps[key] = [];
                        }
                        poolSnaps[key]?.push(snap);
                    }

                    for (const arr of Object.values(poolSnaps)) {
                        arr!.sort((a: any, b: any) => parseFloat(a.block) - parseFloat(b.block));
                    }
                    snaps[poolId] = poolSnaps;
                }
            }
        }
    }
    return snaps;
}

function getSnapUsdValue(snap: Snap): number {
    let reservesUsd = 0;
    for (const token of snap.tokens) {
        reservesUsd += token.reserve * token.priceUsd;
    }
    return (reservesUsd * snap.liquidityTokenBalance) / snap.liquidityTokenTotalSupply;
}

// eslint-disable-next-line @typescript-eslint/ban-types
function distributeBalYields(yields: object, snaps: SnapStructure) {
    for (const yieldReward of Object.values(yields)) {
        const eligibleSnaps: { [key: number]: Snap } = {};
        const periodStart = yieldReward.timestamp - 691200; // 691200 = 8 * 24 * 60 * 60 -> 8 days
        const periodEnd = yieldReward.timestamp;
        // Get all the Balancer snaps from the period
        let eligibleSnapsUsdValue = 0;
        Object.values(snaps).forEach(poolSnaps_ => {
            // For Balancer the key is always None
            const poolSnaps = poolSnaps_[NoneEnum.NONE];
            if (poolSnaps !== undefined && poolSnaps[0].exchange === 'BALANCER') {
                for (let i = 0; i < poolSnaps.length - 1; i++) {
                    if (
                        !(
                            poolSnaps[i].timestamp > periodEnd ||
                            poolSnaps[i + 1].timestamp < periodStart
                        )
                    ) {
                        const snapUsdValue = getSnapUsdValue(poolSnaps[i]);
                        eligibleSnapsUsdValue += snapUsdValue;
                        eligibleSnaps[snapUsdValue] = poolSnaps[i];
                        break;
                    }
                }
            }
        });
        if (eligibleSnapsUsdValue > 0) {
            const yieldRewardPerUsd = parseFloat(yieldReward.amount) / eligibleSnapsUsdValue;
            for (const [snapUsdValue, snap] of Object.entries(eligibleSnaps)) {
                if (snap.yieldReward !== null) {
                    snap.yieldReward.claimed += parseFloat(snapUsdValue) * yieldRewardPerUsd;
                } else {
                    // TODO: send log to firebase along with address
                    console.log(
                        'ERROR: null reward object for snap eligible for Balancer yield reward',
                    );
                }
            }
        } else {
            // TODO: send log to firebase along with address
            console.log('ERROR: zero eligible snaps USD value');
        }
    }
}

function getRelevantSnaps(snaps: SnapStructure, yield_: any): Snap[] {
    const stakingService = yield_.stakingService as StakingService;
    let poolSnaps = snaps[yield_.poolId][stakingService]!;
    if (stakingService === StakingService.SUSHI) {
        // All this overly complicated code is here because of migrations within the MasterChef.sol
        const sushiId: null | number = poolSnaps[0].idWithinStakingContract;
        if (sushiId !== null) {
            Object.values(snaps).forEach(poolSnaps_ => {
                const sushiStakedSnaps = poolSnaps_[StakingService.SUSHI];
                if (
                    sushiStakedSnaps !== undefined &&
                    sushiStakedSnaps[0].exchange === Exchange.UNI_V2 &&
                    sushiStakedSnaps[0].idWithinStakingContract === sushiId
                ) {
                    poolSnaps = poolSnaps.concat(sushiStakedSnaps);
                }
            });
        } else {
            // TODO: send log to firebase along with address
            console.log('ERROR: no sushi id found');
        }
    }
    return poolSnaps;
}

function distributeStakedYields(yields: any, snaps: SnapStructure) {
    for (const yieldId of Object.keys(yields)) {
        const yieldReward = yields[yieldId];
        const relevantSnaps: Snap[] = getRelevantSnaps(snaps, yieldReward);
        // I allocate the reward to the snap whose block number is smaller and closest to the reward's
        let eligibleSnap: Snap | null = null;
        for (const snap of relevantSnaps) {
            if (snap.stakingService === yieldReward.stakingService) {
                if (eligibleSnap === null) {
                    // I am not having <= here because I want the reward to be allocated to the previous non-0 snap
                    if (snap.block < yieldReward.block) {
                        eligibleSnap = snap;
                    }
                } else if (snap.block < yieldReward.block && eligibleSnap.block < snap.block) {
                    eligibleSnap = snap;
                }
            }
        }
        if (eligibleSnap !== null) {
            if (eligibleSnap.yieldReward !== null) {
                eligibleSnap.yieldReward.claimed += parseFloat(yieldReward.amount);
            } else {
                // TODO: send log to firebase along with address
                console.log('ERROR: null reward object in snap eligible for yield reward');
            }
        } else {
            // TODO: send log to firebase along with address
            console.log(
                `ERROR: no eligible snap found for a given ${yieldReward.stakingService} yield reward`,
            );
        }
    }
}

async function getCurrentSnap(poolId: string, lastSnap: Snap, dayId: number): Promise<Snap | null> {
    const ref = firebase.poolSnap(poolId, dayId);
    const payload = await ref.once('value');
    if (payload.exists()) {
        const pool = payload.val();
        pool.liquidityTokenBalance = lastSnap.liquidityTokenBalance;
        pool.timestamp = Math.floor(Date.now() / 1000);
        pool.stakingService = lastSnap.stakingService;
        pool.idWithinStakingContract = lastSnap.idWithinStakingContract;
        if (lastSnap.stakingService !== null) {
            pool.yieldTokenPrice = pool.relevantYieldTokenPrices[lastSnap.stakingService];
        }
        return parseSnap(pool);
    }
    return null;
}

async function getSnaps(address: string): Promise<SnapStructure | null> {
    const ref = firebase.snaps(address);
    let snaps: SnapStructure | null = null;
    const payload = await ref.once('value');
    if (payload.exists()) {
        const userData = payload.val();
        snaps = sortAndTransformSnaps(userData);
        if (
            Object.prototype.hasOwnProperty.call(userData, 'BALANCER') &&
            Object.prototype.hasOwnProperty.call(userData.BALANCER, 'yields')
        ) {
            distributeBalYields(userData.BALANCER.yields, snaps);
        }
        if (
            Object.prototype.hasOwnProperty.call(userData, 'UNI_V2') &&
            Object.prototype.hasOwnProperty.call(userData.UNI_V2, 'yields')
        ) {
            distributeStakedYields(userData.UNI_V2.yields, snaps);
        }
        if (
            Object.prototype.hasOwnProperty.call(userData, 'SUSHI') &&
            Object.prototype.hasOwnProperty.call(userData.SUSHI, 'yields')
        ) {
            distributeStakedYields(userData.SUSHI.yields, snaps);
        }

        const dayIds: { [key in Exchange]?: number } = {};
        // Iterate over pools
        for (const [poolId, poolSnaps] of Object.entries(snaps)) {
            // Iterate over arrays corresponding to farms and unstaked
            for (const farmSnaps of Object.values(poolSnaps)) {
                const lastSnap = farmSnaps![farmSnaps!.length - 1];

                if (lastSnap.liquidityTokenBalance !== 0) {
                    if (!Object.prototype.hasOwnProperty.call(dayIds, lastSnap.exchange)) {
                        const ref = firebase.exchangeDayId(lastSnap.exchange);
                        dayIds[lastSnap.exchange] = (await ref.once('value')).val();
                    }
                    const dayId = <number>dayIds[lastSnap.exchange];
                    const currentSnap = await getCurrentSnap(poolId, lastSnap, dayId);
                    if (currentSnap !== null) {
                        farmSnaps!.push(currentSnap);
                    }
                }
            }
        }
    }
    return snaps;
}

export { getSnaps };
