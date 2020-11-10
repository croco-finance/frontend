import * as validationUtils from './validation';
import * as mathUtils from './math';
import * as lossUtils from './loss-computations';

const getTokenSymbolArr = (tokensArr: Array<any>) => {
    const tokenSymbolsArr = new Array(tokensArr.length);
    tokensArr.forEach((token, i) => {
        tokenSymbolsArr[i] = token.symbol;
    });

    return tokenSymbolsArr;
};

export { validationUtils, mathUtils, lossUtils, getTokenSymbolArr };
