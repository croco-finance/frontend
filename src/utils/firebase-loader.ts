const firebase = require('firebase/app');
require('firebase/auth');
require('firebase/database');

interface Snap {
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
}

enum Exchange {
    UNI_V2 = 'UNI_V2',
    BALANCER = 'BALANCER',
}

interface PoolToken {
    priceUsd: number,
    reserve: number,
    weight: number,
    token: Token,
}

interface Token {
    symbol: string
    name: string,
    contractAddress: string,
    platform: string,
}

interface YieldReward {
    'token': Token,
    'amount': number,
    'price': number
}

const balToken: Token = {
    'symbol': 'BAL',
    'name': 'Balancer',
    'contractAddress': '0xba100000625a3754423978a60c9317c58a424e3d',
    'platform': 'ethereum',
};

const uniToken: Token = {
    'symbol': 'UNI',
    'name': 'Uniswap',
    'contractAddress': '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
    'platform': 'ethereum',
};

interface SnapStructure {
    [key: string]: Snap[]
}

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
                    poolSnaps.push(parseSnap(currentSnap));
                }
            }
        }
        distributeBalYields(userData['BALANCER']['yields'], snaps);
        distributeUniYields(userData['UNI_V2']['yields'], snaps);
        // Set yieldReward objects to null for snaps with 0 yieldReward
        for (const [_, poolSnaps] of Object.entries(snaps)) {
            for (const snap of poolSnaps) {
                if (snap.yieldReward !== null && snap.yieldReward.amount === 0) {
                    snap.yieldReward = null;
                }
            }
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
                snaps[poolId] = poolSnaps;
            }
        }
    }
    return snaps;
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
            'priceUsd': parseFloat(token['priceUsd']),
            'reserve': parseFloat(token['reserve']),
            'weight': parseFloat(token['weight']),
            'token': token['token'],
        });
    }
    return {
        block: snap['block'],
        ethPrice: parseFloat(snap['ethPrice']),
        exchange: snap['exchange'],
        liquidityTokenBalance: parseFloat(snap['liquidityTokenBalance']),
        liquidityTokenTotalSupply: parseFloat(snap['liquidityTokenTotalSupply']),
        timestamp: snap['timestamp'],
        txCostEth: snap.hasOwnProperty('txCostEth') ? parseFloat(snap['txCostEth']) : 0.,
        tokens: poolTokens,
        txHash: snap.hasOwnProperty('txHash') ? snap['txHash'] : null,
        yieldReward: yieldReward,
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
                    if (!(poolSnaps[i].timestamp > periodEnd || poolSnaps[i + 1].timestamp < periodStart)) {
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
                    // TODO: send log to firebase
                    console.log('ERROR: null reward object for snap eligible for yield reward');
                }
            }
        } else {
            // TODO: send log to firebase
            console.log('WARNING: 0 length snaps');
        }
    }
}

function distributeUniYields(yields: object, snaps: SnapStructure) {
    // TODO
}

export { getSnaps };