import { firebase } from '@config';

const getLastPoolSnap = async poolId => {
    // load all days
    const ref = firebase.dailyFees(poolId);
    const payload = await ref.once('value');

    if (payload.exists()) {
        const data = payload.val();
        const keysNumbers = Object.keys(data).map(Number);
        const maxDayId = Math.max(...keysNumbers);
        return data[maxDayId];

        // TODO you can check if the maxDayId is today's timestamps
        // const divisor = 86400000; // i will divide current timestamp by this number to get Firebase key
        // const currentTimestampMillis = Date.now();
        // const todayId = Math.floor(currentTimestampMillis / divisor);
    }

    // if no snap found, return null
    return null;
};

export { getLastPoolSnap };
