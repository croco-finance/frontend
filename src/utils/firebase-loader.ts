import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import { PoolToken, Snap, SnapStructure, Token, YieldReward } from '@types';

const balToken: Token = {
    symbol: 'BAL',
    name: 'Balancer',
    contractAddress: '0xba100000625a3754423978a60c9317c58a424e3d',
    platform: 'ethereum',
};

const uniToken: Token = {
    symbol: 'UNI',
    name: 'Uniswap',
    contractAddress: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
    platform: 'ethereum',
};

const uniRewardedPoolIds: string[] = [
    '0xbb2b8038a1640196fbe3e38816f3e67cba72d940',
    '0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc',
    '0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852',
    '0xa478c2975ab1ea89e8196811f51a7b7ade33eb11',
];

interface BalRewardSnapStructure {
    [key: number]: Snap;
}

async function getSnaps(address: string): Promise<SnapStructure | null> {
    const firebaseConfig = {
        authDomain: 'croco-finance.firebaseapp.com',
        databaseURL: 'https://croco-finance.firebaseio.com',
        projectId: 'croco-finance',
    };

    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    let ref = firebase.database().ref(`users/${address}`);
    let snaps: SnapStructure | null = null;
    const payload = await ref.once('value');
    if (payload.exists()) {
        let userData = payload.val();
        snaps = sortAndTransformSnaps(userData);
        for (const [poolId, poolSnaps] of Object.entries(snaps)) {
            let lastSnap = poolSnaps[poolSnaps.length - 1];
            if (lastSnap.liquidityTokenBalance !== 0) {
                let currentSnap = await getCurrentSnap(poolId, lastSnap.liquidityTokenBalance);
                if (currentSnap !== null) {
                    poolSnaps.push(currentSnap);
                }
            }
        }
        if (userData.hasOwnProperty('BALANCER') && userData['BALANCER'].hasOwnProperty('yields')) {
            distributeBalYields(userData['BALANCER']['yields'], snaps);
        }
        if (userData.hasOwnProperty('UNI_V2') && userData['UNI_V2'].hasOwnProperty('yields')) {
            distributeUniYields(userData['UNI_V2']['yields'], snaps);
        }
    }
    return snaps;
}

function sortAndTransformSnaps(userData: any): SnapStructure {
    const snaps: SnapStructure = {};
    for (const exchange of ['BALANCER', 'UNI_V2']) {
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
                if (uniRewardedPoolIds.includes(poolId)) {
                    filter0SameBlockSnaps(poolSnaps);
                }
                snaps[poolId] = poolSnaps;
            }
        }
    }
    return snaps;
}

function filter0SameBlockSnaps(snaps: Snap[]) {
    for (let i = 0; i < snaps.length - 1; i++) {
        if (snaps[i].block === snaps[i + 1].block && snaps[i].staked !== snaps[i + 1].staked) {
            if (snaps[i].liquidityTokenBalance === 0) {
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

function parseSnap(snap: any): Snap {
    let yieldReward: YieldReward | null = null;
    if (snap.hasOwnProperty('yieldTokenPrice')) {
        yieldReward = {
            amount: 0,
            price: parseFloat(snap['yieldTokenPrice']),
            token: snap['exchange'] === 'BALANCER' ? balToken : uniToken,
        };
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
        staked: snap.hasOwnProperty('staked') ? snap['staked'] : false,
    };
}

async function getCurrentSnap(poolId: string, liquidityTokenBalance: number): Promise<Snap | null> {
    const db = firebase.database();
    let ref = db.ref(`pools/${poolId}`);
    const payload = await ref.once('value');
    if (payload.exists()) {
        let pool = payload.val();
        pool['liquidityTokenBalance'] = liquidityTokenBalance;
        pool['timestamp'] = Math.floor(Date.now() / 1000);
        return parseSnap(pool);
    }
    return null;
}

function distributeBalYields(yields: object, snaps: SnapStructure) {
    for (const yieldId of Object.keys(yields)) {
        // @ts-ignore
        const yield_ = yields[yieldId];
        const eligibleSnaps: BalRewardSnapStructure = {};
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
                    // @ts-ignore
                    snap.yieldReward.amount += snapUsdValue * yieldRewardPerUsd;
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

function distributeUniYields(yields: object, snaps: SnapStructure) {
    for (const yieldId of Object.keys(yields)) {
        // @ts-ignore
        const yield_ = yields[yieldId];
        // I allocate the reward to the snap whose block number is smaller and closest to the reward's
        let poolSnaps = snaps[yield_['poolId']];
        let eligibleSnap: Snap | null = null;
        for (const snap of poolSnaps) {
            if (snap.staked) {
                if (eligibleSnap === null) {
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
                eligibleSnap.yieldReward.amount += parseFloat(yield_['amount']);
            } else {
                // TODO: send log to firebase along with address
                console.log('ERROR: null reward object in snap eligible for Uni yield reward');
            }
        } else {
            // TODO: send log to firebase along with address
            console.log('ERROR: no eligible snap found for a given Uni yield reward');
        }
    }
}

export { getSnaps };
