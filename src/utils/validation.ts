import { ethers } from 'ethers';

export const isValidEthereumAddress = (address: string) => {
    try {
        const addressX = ethers.utils.getAddress(address.toLowerCase());
    } catch (e) {
        return false;
    }
    return true;
};

// check if value ix hex (if starts with 0x)
export const isHex = num => Boolean(num.match(/^0x[0-9a-f]+$/i));

// timestamps in milliseconds are expected
export const timestampsAreOnSameDay = (timestamps0: number, timestamp1: number) => {
    const date0 = new Date(timestamps0);
    const date1 = new Date(timestamp1);

    return (
        date0.getFullYear() === date1.getFullYear() &&
        date0.getMonth() === date1.getMonth() &&
        date0.getDate() === date1.getDate()
    );
};
