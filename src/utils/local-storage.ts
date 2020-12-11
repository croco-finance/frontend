export const loadState = () => {
    try {
        const serializedState = localStorage.getItem('state');

        if (serializedState === null) {
            return undefined;
        }
        return JSON.parse(serializedState);
    } catch (err) {
        return undefined;
    }
};

export const saveState = state => {
    try {
        const { allAddresses, selectedAddress } = state;
        const serializedState = JSON.stringify({ allAddresses, selectedAddress });
        localStorage.setItem('state', serializedState);
    } catch {
        // ignore write errors
    }
};
