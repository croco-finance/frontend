import ethers from 'ethers';

const isValidEthereumAddress = (address: string) => {
    try {
        const addressX = ethers.utils.getAddress(address.toLowerCase());
        console.log('addressX', addressX);
    } catch (e) {
        return false;
    }
    return true;
};

export { isValidEthereumAddress };
