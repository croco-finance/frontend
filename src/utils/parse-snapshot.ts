const toNumberAttributes = [
    'ethPrice',
    'liquidityTokenBalance',
    'liquidityTokenTotalSupply',
    'txCostEth',
];

const toNumberReserveTokenAttributes = ['price', 'reserve', 'weight'];
const toNumberYieldTokenAttributes = ['price', 'amount'];

const parseSnapshotToNumberValues = snapshot => {
    // convert string attributes to float
    toNumberAttributes.forEach(attribute => {
        if (snapshot[attribute]) {
            snapshot[attribute] = parseFloat(snapshot[attribute]);
        }
    });

    snapshot['tokens']?.forEach(token => {
        toNumberReserveTokenAttributes.forEach(attribute => {
            token[attribute] = parseFloat(token[attribute]);
        });
    });

    toNumberYieldTokenAttributes.forEach(attribute => {
        if (snapshot['yieldReward']) {
            snapshot['yieldReward'][attribute] = parseFloat(snapshot['yieldReward'][attribute]);
        }
    });

    return snapshot;
};

export default parseSnapshotToNumberValues;
