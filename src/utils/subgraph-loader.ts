import { Exchange, Pool, PoolToken, Token } from '@types';
import axios from 'axios';

const subgraphs: Map<Exchange, string> = new Map([
    [Exchange.UNI_V2, 'benesjan/uniswap-v2'],
    [Exchange.SUSHI, 'benesjan/sushi-swap'],
    [Exchange.BALANCER, 'benesjan/balancer-with-snapshots'],
    [Exchange.MATERIA, 'materia-dex/materia'],
]);

async function getBalPool(poolId: string, exchange: Exchange): Promise<Pool> {
    const query = `
        {
            pool(id: "${poolId}") {
                totalWeight
                reserveUSD: liquidity
                swapFee
                volumeUSD: totalSwapVolume
                tokens {
                    symbol
                    name
                    address
                    denormWeight
                    reserve: balance
                }
            }
            _meta {
                block {
                    number
                }
            }
        }
    `;

    const result = (
        await axios.post(`https://api.thegraph.com/subgraphs/name/${subgraphs.get(exchange)!}`, {
            query,
        })
    ).data.data;
    const { pool } = result;

    const tokens: PoolToken[] = pool.tokens.map((rawToken: any) => {
        const weight = rawToken.denormWeight / pool.totalWeight;
        const token: Token = {
            symbol: rawToken.symbol,
            name: rawToken.name,
            contractAddress: rawToken.address,
            platform: 'ethereum',
        };
        return {
            priceUsd: (pool.reserveUSD * weight) / rawToken.reserve,
            reserve: +rawToken.reserve,
            weight,
            token,
        };
    });

    return {
        address: poolId,
        exchange,
        // eslint-disable-next-line no-underscore-dangle
        block: result._meta.block.number,
        swapFee: +pool.swapFee,
        volumeUsd: +pool.volumeUSD,
        tokens,
    };
}

async function getUniV2Pool(poolId: string, exchange: Exchange): Promise<Pool> {
    const query = `
        {
            pool: pair(id: "${poolId}") {
                reserveUSD
                reserve0
                reserve1
                volumeUSD
                token0 {
                    address: id
                    symbol
                    name
                }
                token1 {
                    address: id
                    symbol
                    name
                }
            }
            _meta {
                block {
                    number
                }
            }
        }
    `;
    const result = (
        await axios.post(`https://api.thegraph.com/subgraphs/name/${subgraphs.get(exchange)!}`, {
            query,
        })
    ).data.data;
    const { pool } = result;

    pool.token0.platform = 'ethereum';
    pool.token1.platform = 'ethereum';

    const poolToken0: PoolToken = {
        priceUsd: pool.reserve0 / (2 * pool.reserveUSD),
        reserve: +pool.reserve0,
        weight: 0.5,
        token: pool.token0 as Token,
    };

    const poolToken1: PoolToken = {
        priceUsd: pool.reserve1 / (2 * pool.reserveUSD),
        reserve: +pool.reserve1,
        weight: 0.5,
        token: pool.token1 as Token,
    };

    return {
        address: poolId,
        exchange,
        // eslint-disable-next-line no-underscore-dangle
        block: result._meta.block.number,
        swapFee: 0.5,
        volumeUsd: +pool.volumeUSD,
        tokens: [poolToken0, poolToken1],
    };
}

export function getPool(poolId: string, exchange: Exchange): Promise<Pool> {
    if (exchange === Exchange.BALANCER) {
        return getBalPool(poolId, exchange);
    }
    return getUniV2Pool(poolId, exchange);
}
