import { DexBaseUrls } from '@types';
import INJECTED_ICON_URL from '../data/images/icons/arrow-right.svg';
import COINBASE_ICON_URL from '../data/images/icons/coinbaseWalletIcon.svg';
import FORTMATIC_ICON_URL from '../data/images/icons/fortmaticIcon.png';
import METAMASK_ICON_URL from '../data/images/icons/metamask.png';
import PORTIS_ICON_URL from '../data/images/icons/portisIcon.png';
import WALLETCONNECT_ICON_URL from '../data/images/icons/walletConnectIcon.svg';
import { WalletInfo, injected, portis, walletconnect, walletlink } from '../connectors';

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

export const SUPPORTED_WALLETS: { [key: string]: WalletInfo } = {
    INJECTED: {
        connector: injected,
        name: 'Injected',
        iconURL: INJECTED_ICON_URL,
        description: 'Injected web3 provider.',
        href: null,
        color: '#010101',
        primary: true,
    },
    METAMASK: {
        connector: injected,
        name: 'MetaMask',
        iconURL: METAMASK_ICON_URL,
        description: 'Easy-to-use browser extension.',
        href: null,
        color: '#E8831D',
    },
    WALLET_CONNECT: {
        connector: walletconnect,
        name: 'WalletConnect',
        iconURL: WALLETCONNECT_ICON_URL,
        description: 'Connect to Trust Wallet, Rainbow Wallet and more...',
        href: null,
        color: '#4196FC',
        mobile: true,
    },
    WALLET_LINK: {
        connector: walletlink,
        name: 'Coinbase Wallet',
        iconURL: COINBASE_ICON_URL,
        description: 'Use Coinbase Wallet app on mobile device',
        href: null,
        color: '#315CF5',
    },
    COINBASE_LINK: {
        name: 'Open in Coinbase Wallet',
        iconURL: COINBASE_ICON_URL,
        description: 'Open in Coinbase Wallet app.',
        href: 'https://go.cb-w.com/mtUDhEZPy1',
        color: '#315CF5',
        mobile: true,
        mobileOnly: true,
    },
    //   FORTMATIC: {
    //     connector: fortmatic,
    //     name: 'Fortmatic',
    //     iconURL: FORTMATIC_ICON_URL,
    //     description: 'Login using Fortmatic hosted wallet',
    //     href: null,
    //     color: '#6748FF',
    //     mobile: true,
    //   },
    Portis: {
        connector: portis,
        name: 'Portis',
        iconURL: PORTIS_ICON_URL,
        description: 'Login using Portis hosted wallet',
        href: null,
        color: '#4A6C9B',
        mobile: true,
    },
};
