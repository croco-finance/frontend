import { firebase } from '@config';

const getDailyFees = async poolId => {
    const ref = firebase.dailyFees(poolId);
    const payload = await ref.once('value');

    if (payload.exists()) {
        return payload.val();
    }
    return null;
};

export { getDailyFees };
