import * as validation from './validation';
import * as math from './math';
import * as loss from './loss-computations';

const getTokenSymbolArr = (tokensArr: Array<any>) => {
    const tokenSymbolsArr = new Array(tokensArr.length);
    tokensArr.forEach((token, i) => {
        tokenSymbolsArr[i] = token.symbol;
    });

    return tokenSymbolsArr;
};

export { validation, math, loss, getTokenSymbolArr };
