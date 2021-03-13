import { firebase } from '@config';

const getLastPoolSnap = async poolId => {
    const divisor = 86400000; // i will divide current timestamp by this number to get Firebase key
    const currentTimestampMillis = Date.now();
    const todayId = Math.floor(currentTimestampMillis / divisor);
    const ref = firebase.poolSnap(poolId, todayId);
    const payload = await ref.once('value');

    console.log('poolId', poolId);
    console.log('todayId', todayId);

    console.log('payload today', payload);

    // try if there is a snap from today
    if (payload.exists()) {
        return payload.val();
    } else {
        // try snap from yesterday (24 * 3600 * 1000 milliseconds sooner)
        const yesterdayId = Math.floor(currentTimestampMillis - 24 * 3600 * 1000) / divisor;
        const refYesterday = firebase.poolSnap(poolId, yesterdayId);
        const payloadYesterday = await refYesterday.once('value');

        console.log('payload yesterday', payloadYesterday);

        if (payloadYesterday.exists()) {
            return payloadYesterday.val();
        }
    }

    // if no snap found, return null
    return null;
};

export { getLastPoolSnap };
