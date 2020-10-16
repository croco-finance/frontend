import axios from 'axios';

export const fetchCurrentTokenFiatRates = async (tokens: Array<any>, currencies: Array<string>) => {
    const baseUrl =
        'https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=';
    const separator = '%2C';
    const tokenCount = tokens.length;

    let addressesString: string = tokens[0].address;

    for (let i = 1; i < tokenCount; i++) {
        addressesString += separator + tokens[i].address;
    }

    const currenciesCount = currencies.length;
    let currenciesString: string = '&vs_currencies=' + currencies[0];

    for (let i = 1; i < currenciesCount; i++) {
        currenciesString += separator + currencies[i];
    }

    const ending =
        '&include_market_cap=false&include_24hr_vol=false&include_24hr_change=false&include_last_updated_at=false';
    const requestURL = baseUrl + addressesString + currenciesString + ending;

    try {
        const response = await axios.get(requestURL);
        return response.data;
    } catch (error) {
        console.log('Error while fetching current token prices');
        console.log(error);
        return null;
    }
};
