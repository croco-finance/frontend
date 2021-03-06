import { DexBaseUrls } from '@types';

export const GITHUB_LINK = 'https://github.com/croco-finance';
export const TELEGRAM_LINK = 'https://t.me/crocofinancechat';
export const TWITTER_LINK = 'https://twitter.com/CrocoFinance';
export const DISCORD_LINK = 'https://discord.gg/X6PnFqy';
export const PORTIS_DAPP_KEY = 'a73f6025-1669-49cf-9880-a81d3de67e7f';
export const GOOGLE_ANALYTICS_TRACKING_ID = 'G-Z20W1K81CF';

// individual pool
export const BALANCER_POOL_BASE_URL = 'https://pools.balancer.exchange/#/pool/';
export const UNISWAP_POOL_BASE_URL = 'https://info.uniswap.org/pair/';
export const SUSHISWAP_POOL_BASE_URL = 'https://app.sushi.com/pair/';
export const MATERIA_POOL_BASE_URL = 'https://materia.exchange/#/add/';

// list of all pools
export const BALANCER_POOLS_BASE_URL = 'https://pools.balancer.exchange/#/explore';
export const UNISWAP_POOLS_BASE_URL = 'https://info.uniswap.org/pairs';
export const SUSHISWAP_POOLS_BASE_URL = 'https://app.sushi.com/pairs';
export const MATERIA_POOLS_BASE_URL = '#';

export const DEX_POOL_BASE_URLS: DexBaseUrls = {
    BALANCER: BALANCER_POOL_BASE_URL,
    UNI_V2: UNISWAP_POOL_BASE_URL,
    SUSHI: SUSHISWAP_POOL_BASE_URL,
    MATERIA: MATERIA_POOL_BASE_URL,
};

export const DEX_POOLS_BASE_URLS: DexBaseUrls = {
    BALANCER: BALANCER_POOLS_BASE_URL,
    UNI_V2: UNISWAP_POOLS_BASE_URL,
    SUSHI: SUSHISWAP_POOLS_BASE_URL,
    MATERIA: MATERIA_POOLS_BASE_URL,
};
