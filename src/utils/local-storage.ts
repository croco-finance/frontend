export const loadState = () => {
    try {
        const serializedState = localStorage.getItem('state');

        if (serializedState === null) {
            return undefined;
        }
        return JSON.parse(serializedState);
    } catch (err) {
        console.log('Error while loading state from local storage');
        return undefined;
    }
};

export const saveState = state => {
    try {
        const { allAddresses, selectedAddress, theme } = state;
        const serializedState = JSON.stringify({ allAddresses, selectedAddress, theme });
        localStorage.setItem('state', serializedState);
    } catch {
        // ignore write errors
    }
};
