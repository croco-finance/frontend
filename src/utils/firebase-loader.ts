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

async function getSnaps(address: string): Promise<SnapStructure | null> {
    const firebaseConfig = {
        authDomain: 'croco-finance.firebaseapp.com',
        databaseURL: 'https://croco-finance.firebaseio.com',
        projectId: 'croco-finance',
    };

    firebase.initializeApp(firebaseConfig);
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
    // The following is necessary so that the process ends
    firebase.database().goOffline();
    return snaps;
}

function sortAndTransformSnaps(userData: any): SnapStructure {
    const snaps: SnapStructure = {};
    for (const exchange of ['BALANCER', 'UNI_V2']) {
        if (userData.hasOwnProperty(exchange)) {
            let snaps_ = userData[exchange]['snaps'];
            for (const poolId of Object.keys(snaps_)) {
                let poolSnaps: Snap[] = [];
                for (const snapId of Object.keys(snaps_[poolId])) {
                    let snap = snaps_[poolId][snapId];
                    snap['exchange'] = exchange;
                    poolSnaps.push(parseSnap(snap));
                }
                poolSnaps.sort((a: any, b: any) => parseFloat(a.block) - parseFloat(b.block));
                if (uniRewardedPoolIds.includes(poolId)) {
                    resortUniRewardedSnaps(poolSnaps);
                }
                snaps[poolId] = poolSnaps;
            }
        }
    }
    return snaps;
}

function resortUniRewardedSnaps(snaps: Snap[]) {
    // This functions makes sure that snaps with equal blocks get properly sorted depending on
    // the sequence of values of staked attributes
    for (let i = 0; i < snaps.length - 1; i++) {
        const prevSnap = snaps[i - 1],
            currentSnap = snaps[i],
            nextSnap = snaps[i + 1];
        if (
            currentSnap.block === nextSnap.block &&
            currentSnap.staked !== nextSnap.staked &&
            prevSnap.staked === nextSnap.staked
        ) {
            snaps[i] = nextSnap;
            snaps[i + 1] = currentSnap;
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
        const eligibleSnaps: Snap[] = [];
        const periodStart = yield_['timestamp'] - 691200; // 691200 = 8 * 24 * 60 * 60 -> 8 days
        const periodEnd = yield_['timestamp'];
        // Get all the Balancer snaps from the period
        Object.values(snaps).forEach(poolSnaps => {
            if (poolSnaps[0].exchange === 'BALANCER') {
                for (let i = 0; i < poolSnaps.length - 1; i++) {
                    if (
                        !(
                            poolSnaps[i].timestamp > periodEnd ||
                            poolSnaps[i + 1].timestamp < periodStart
                        )
                    ) {
                        eligibleSnaps.push(poolSnaps[i]);
                    }
                }
            }
        });
        if (eligibleSnaps.length > 0) {
            let yieldReward = parseFloat(yield_['amount']);
            for (const snap of eligibleSnaps) {
                if (snap.yieldReward !== null) {
                    snap.yieldReward.amount = yieldReward / eligibleSnaps.length;
                } else {
                    // TODO: send log to firebase along with address
                    console.log(
                        'ERROR: null reward object for snap eligible for Balancer yield reward',
                    );
                }
            }
        } else {
            // TODO: send log to firebase along with address
            console.log('ERROR: no eligible snaps found for a given Balancer yield reward');
        }
    }
}

function distributeUniYields(yields: object, snaps: SnapStructure) {
    for (const yieldId of Object.keys(yields)) {
        // @ts-ignore
        const yield_ = yields[yieldId];
        // I allocate the reward to the snap whose block number is smaller and closest to the reward's
        let eligibleSnap: Snap | null = null;
        for (const snap of snaps[yield_['poolId']]) {
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
