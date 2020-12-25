import { PoolToken, Snap, SnapStructure, StakingService, Token, tokens, YieldReward } from '@types';
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

        for (const [poolId, poolSnaps] of Object.entries(snaps)) {
            filter0SameBlockSnaps(poolSnaps);
            let lastSnap = poolSnaps[poolSnaps.length - 1];
            if (lastSnap.liquidityTokenBalance !== 0) {
                let currentSnap = await getCurrentSnap(poolId, lastSnap);
                if (currentSnap !== null) {
                    poolSnaps.push(currentSnap);
                }
            }
        }
    }
    return snaps;
}

function sortAndTransformSnaps(userData: any): SnapStructure {
    const snaps: SnapStructure = {};
    for (const exchange of ['BALANCER', 'UNI_V2', 'SUSHI']) {
        if (userData.hasOwnProperty(exchange)) {
            let snaps_ = userData[exchange]['snaps'];
            if (snaps_ === undefined) {
                // TODO: send log to firebase along with address
                console.log('WARNING: no snaps for existing yield');
                continue;
            }
            for (const poolId of Object.keys(snaps_)) {
                let poolSnaps: Snap[] = [];
                for (const snapId of Object.keys(snaps_[poolId])) {
                    let snap = snaps_[poolId][snapId];
                    snap['exchange'] = exchange;
                    poolSnaps.push(parseSnap(snap));
                }
                poolSnaps.sort((a: any, b: any) => parseFloat(a.block) - parseFloat(b.block));
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

function filter0SameBlockSnaps(snaps: Snap[]) {
    for (let i = 0; i < snaps.length - 1; i++) {
        if (
            snaps[i].block === snaps[i + 1].block &&
            snaps[i].stakingService !== snaps[i + 1].stakingService
        ) {
            if (snaps[i].liquidityTokenBalance === 0) {
                if (snaps[i].stakingService !== null) {
                    snaps[i + 1].yieldReward = snaps[i].yieldReward;
                }
                snaps.splice(i, 1);
            } else if (snaps[i + 1].liquidityTokenBalance === 0) {
                snaps.splice(i + 1, 1);
            } else {
                // TODO: send log to firebase along with address
                console.log('WARNING: incomplete stake edge case occured');
            }
        }
    }
}

async function getCurrentSnap(poolId: string, lastSnap: Snap): Promise<Snap | null> {
    let ref = firebase.pool(poolId);
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
        Object.values(snaps).forEach(poolSnaps => {
            if (poolSnaps[0].exchange === 'BALANCER') {
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
        // I allocate the reward to the snap whose block number is smaller and closest to the reward's
        let poolSnaps = getRelevantSnaps(snaps, yield_);
        let eligibleSnap: Snap | null = null;
        for (const snap of poolSnaps) {
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
            console.log('ERROR: no eligible snap found for a given Uni yield reward');
        }
    }
}

function getRelevantSnaps(snaps: SnapStructure, yield_: any): Snap[] {
    let poolSnaps = snaps[yield_['poolId']];
    if (yield_['stakingService'] === StakingService.SUSHI) {
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
                for (const snap of poolSnaps_) {
                    if (snap.idWithinStakingContract === sushiId) {
                        poolSnaps.push(snap);
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
