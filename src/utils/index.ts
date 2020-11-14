import { types } from '@config';
import * as validationUtils from './validation';
import * as mathUtils from './math';
import * as lossUtils from './loss-computations';
import * as statsComputations from './snapshot-processing';
import * as simulatorUtils from './simulator';
import parseSnapshotToNumberValues from './parse-snapshot';
import { getSnaps } from './firebase-loader';

const getTokenSymbolArr = (tokensArr: Array<any>) => {
    const tokenSymbolsArr = new Array(tokensArr.length);
    tokensArr.forEach((token, i) => {
        tokenSymbolsArr[i] = token.symbol;
    });

    return tokenSymbolsArr;
};

const getTokenWeightsArr = (tokensArr: Array<types.PoolToken>) => {
    const weightsArr = new Array(tokensArr.length);
    tokensArr.forEach((token, i) => {
        weightsArr[i] = token.weight;
    });

    return weightsArr;
};

export {
    validationUtils,
    mathUtils,
    lossUtils,
    getTokenSymbolArr,
    getTokenWeightsArr,
    statsComputations,
    parseSnapshotToNumberValues,
    getSnaps,
    simulatorUtils,
};
