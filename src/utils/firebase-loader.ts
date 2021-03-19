/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-continue */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-prototype-builtins */
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

async function getSnaps(address: string): Promise<SnapStructure | null> {
    let ref = firebase.snaps(address);
    let snaps: SnapStructure | null = null;
    const payload = await ref.once('value');
    if (payload.exists()) {
        let userData = payload.val();
        snaps = sortAndTransformSnaps(userData);
        if (userData.hasOwnProperty('BALANCER') && userData['BALANCER'].hasOwnProperty('yields')) {
            distributeBalYields(userData['BALANCER']['yields'], snaps);
        }
        if (userData.hasOwnProperty('UNI_V2') && userData['UNI_V2'].hasOwnProperty('yields')) {
            distributeStakedYields(userData['UNI_V2']['yields'], snaps);
        }
        if (userData.hasOwnProperty('SUSHI') && userData['SUSHI'].hasOwnProperty('yields')) {
            distributeStakedYields(userData['SUSHI']['yields'], snaps);
        }

        const dayIds: { [key in Exchange]?: number } = {};
        // Iterate over pools
        for (const [poolId, poolSnaps] of Object.entries(snaps)) {
            // Iterate over arrays corresponding to farms and unstaked
            for (const farmSnaps of Object.values(poolSnaps)) {
                let lastSnap = farmSnaps![farmSnaps!.length - 1];

                if (lastSnap.liquidityTokenBalance !== 0) {
                    if (!dayIds.hasOwnProperty(lastSnap.exchange)) {
                        const ref = firebase.exchangeDayId(lastSnap.exchange);
                        dayIds[lastSnap.exchange] = (await ref.once('value')).val();
                    }
                    const dayId = <number>dayIds[lastSnap.exchange];
                    let currentSnap = await getCurrentSnap(poolId, lastSnap, dayId);
                    if (currentSnap !== null) {
                        farmSnaps!.push(currentSnap);
                    }
                }
            }
        }
    }
    return snaps;
}

function sortAndTransformSnaps(userData: any): SnapStructure {
    const snaps: SnapStructure = {};
    for (const exchange of Object.values(Exchange)) {
        if (userData.hasOwnProperty(exchange)) {
            let snaps_ = userData[exchange]['snaps'];
            if (snaps_ === undefined) {
                // TODO: send log to firebase along with address
                console.log('WARNING: no snaps for existing yield');
                continue;
            }
            for (const poolId of Object.keys(snaps_)) {
                let poolSnaps: PoolSnaps = {};
                for (const snapId of Object.keys(snaps_[poolId])) {
                    let rawSnap = snaps_[poolId][snapId];
                    rawSnap['exchange'] = exchange;
                    let snap: Snap = parseSnap(rawSnap);
                    let key = snap.stakingService === null ? NoneEnum.NONE : snap.stakingService;
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
    return snaps;
}

function parseSnap(snap: any): Snap {
    let yieldReward: YieldReward | null = null;
    if (snap.hasOwnProperty('stakingService')) {
        let token: Token = tokens[snap['stakingService'] as StakingService];
        // Price is null in situations where the staking was initiated before the token was on exchange
        let price: null | number = null;
        if (snap.hasOwnProperty('yieldTokenPrice')) {
            price = parseFloat(snap['yieldTokenPrice']);
        }
        yieldReward = {
            token: token,
            price: price,
            claimed: 0,
            unclaimed: 0,
        };
    } else if (snap.hasOwnProperty('yieldTokenPrice')) {
        // In Balancer there is no staking service but the yield tokens are distributed
        if (snap['exchange'] !== 'BALANCER') {
            // TODO: send log to firebase along with address
            console.log(
                'ERROR: yieldTokenPrice property and no stakingService in non-Balancer snap',
            );
        } else {
            let token: Token = tokens['BALANCER'];
            yieldReward = {
                token: token,
                price: parseFloat(snap['yieldTokenPrice']),
                claimed: 0,
                unclaimed: 0,
            };
        }
    }
    const poolTokens: PoolToken[] = [];
    for (const token of snap['tokens']) {
        poolTokens.push({
            priceUsd: parseFloat(token['priceUsd']),
            reserve: parseFloat(token['reserve']),
            weight: parseFloat(token['weight']),
            token: token['token'],
        });
    }
    return {
        block: snap['block'],
        ethPrice: parseFloat(snap['ethPrice']),
        exchange: snap['exchange'],
        liquidityTokenBalance: parseFloat(snap['liquidityTokenBalance']),
        liquidityTokenTotalSupply: parseFloat(snap['liquidityTokenTotalSupply']),
        timestamp: snap['timestamp'],
        txCostEth: snap.hasOwnProperty('txCostEth') ? parseFloat(snap['txCostEth']) : 0,
        tokens: poolTokens,
        txHash: snap.hasOwnProperty('txHash') ? snap['txHash'] : null,
        yieldReward: yieldReward,
        stakingService: snap.hasOwnProperty('stakingService') ? snap['stakingService'] : null,
        idWithinStakingContract: snap.hasOwnProperty('idWithinStakingContract')
            ? snap['idWithinStakingContract']
            : null,
    };
}

async function getCurrentSnap(poolId: string, lastSnap: Snap, dayId: number): Promise<Snap | null> {
    let ref = firebase.poolSnap(poolId, dayId);
    const payload = await ref.once('value');
    if (payload.exists()) {
        let pool = payload.val();
        pool['liquidityTokenBalance'] = lastSnap.liquidityTokenBalance;
        pool['timestamp'] = Math.floor(Date.now() / 1000);
        pool['stakingService'] = lastSnap.stakingService;
        pool['idWithinStakingContract'] = lastSnap.idWithinStakingContract;
        if (lastSnap.stakingService !== null) {
            pool['yieldTokenPrice'] = pool['relevantYieldTokenPrices'][lastSnap.stakingService];
        }
        return parseSnap(pool);
    }
    return null;
}

function distributeBalYields(yields: object, snaps: SnapStructure) {
    for (const yield_ of Object.values(yields)) {
        const eligibleSnaps: { [key: number]: Snap } = {};
        const periodStart = yield_['timestamp'] - 691200; // 691200 = 8 * 24 * 60 * 60 -> 8 days
        const periodEnd = yield_['timestamp'];
        // Get all the Balancer snaps from the period
        let eligibleSnapsUsdValue = 0;
        Object.values(snaps).forEach(poolSnaps_ => {
            // For Balancer the key is always None
            let poolSnaps = poolSnaps_[NoneEnum.NONE];
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
            let yieldRewardPerUsd = parseFloat(yield_['amount']) / eligibleSnapsUsdValue;
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

function getSnapUsdValue(snap: Snap): number {
    let reservesUsd = 0;
    for (const token of snap.tokens) {
        reservesUsd += token.reserve * token.priceUsd;
    }
    return (reservesUsd * snap.liquidityTokenBalance) / snap.liquidityTokenTotalSupply;
}

function distributeStakedYields(yields: any, snaps: SnapStructure) {
    for (const yieldId of Object.keys(yields)) {
        const yield_ = yields[yieldId];
        let relevantSnaps: Snap[] = getRelevantSnaps(snaps, yield_);
        // I allocate the reward to the snap whose block number is smaller and closest to the reward's
        let eligibleSnap: Snap | null = null;
        for (const snap of relevantSnaps) {
            if (snap.stakingService === yield_['stakingService']) {
                if (eligibleSnap === null) {
                    // I am not having <= here because I want the reward to be allocated to the previous non-0 snap
                    if (snap.block < yield_['block']) {
                        eligibleSnap = snap;
                    }
                } else if (snap.block < yield_['block'] && eligibleSnap.block < snap.block) {
                    eligibleSnap = snap;
                }
            }
        }
        if (eligibleSnap !== null) {
            if (eligibleSnap.yieldReward !== null) {
                eligibleSnap.yieldReward.claimed += parseFloat(yield_['amount']);
            } else {
                // TODO: send log to firebase along with address
                console.log('ERROR: null reward object in snap eligible for yield reward');
            }
        } else {
            // TODO: send log to firebase along with address
            console.log(
                `ERROR: no eligible snap found for a given ${yield_['stakingService']} yield reward`,
            );
        }
    }
}

function getRelevantSnaps(snaps: SnapStructure, yield_: any): Snap[] {
    let stakingService = yield_['stakingService'] as StakingService;
    let poolSnaps = snaps[yield_['poolId']][stakingService]!;
    if (stakingService === StakingService.SUSHI) {
        // All this overly complicated code is here because of migrations within the MasterChef.sol
        let sushiId: null | number = null;
        for (const snap of poolSnaps) {
            if (snap.idWithinStakingContract !== null) {
                sushiId = snap.idWithinStakingContract;
                break;
            }
        }
        if (sushiId !== null) {
            poolSnaps = [];
            for (const poolSnaps_ of Object.values(snaps)) {
                if (poolSnaps_[stakingService] !== undefined) {
                    for (const snap of poolSnaps_[stakingService]!) {
                        if (snap.idWithinStakingContract === sushiId) {
                            poolSnaps.push(snap);
                        }
                    }
                }
            }
        } else {
            // TODO: send log to firebase along with address
            console.log('ERROR: no sushi id found');
        }
    }
    return poolSnaps;
}

export { getSnaps };
