import ethers from 'ethers';

const isValidEthereumAddress = (address: string) => {
    try {
        const addressX = ethers.utils.getAddress(address.toLowerCase());
    } catch (e) {
        return false;
    }
    return true;
};

// check if value ix hex (if starts with 0x)
const isHex = num => {
    return Boolean(num.match(/^0x[0-9a-f]+$/i));
};

export { isValidEthereumAddress, isHex };
