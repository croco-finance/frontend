import Web3 from 'web3';
import Portis from '@portis/web3';
import { constants } from '@config';
import ethers from 'ethers';

const portis = new Portis(constants.PORTIS_DAPP_KEY, 'mainnet');

// const web3 = new ethers.providers.Web3Provider(portis.provider);
const web3 = new Web3(portis.provider);

export { portis, web3 };
