import { firebase } from '@config';

const getLastPoolSnap = async poolId => {
    // load all days
    const ref = firebase.dailyFees(poolId);
    const payload = await ref.once('value');

    if (payload.exists()) {
        const data = payload.val();
        const keysNumbers = Object.keys(data).map(Number);
        const daysCount = keysNumbers.length;
        // sort array
        keysNumbers.sort((a, b) => a - b);
        // get volumeUSD for the last 24 hours
        // compute it bu subtracting total volume of today and total volume of yesterday
        const volumeUsd24 =
            parseInt(data[keysNumbers[daysCount - 1]].volumeUsd, 10) -
            parseInt(data[keysNumbers[daysCount - 2]].volumeUsd, 10);

        return { ...data[keysNumbers[daysCount - 1]], volumeUsd24 };

        // TODO you can check if the maxDayId is today's timestamps
        // const divisor = 86400000; // i will divide current timestamp by this number to get Firebase key
        // const currentTimestampMillis = Date.now();
        // const todayId = Math.floor(currentTimestampMillis / divisor);
    }

    // if no snap found, return null
    return null;
};

export { getLastPoolSnap };
