/**
 * Abstract: Fetch exchange rate from the API server to keep the currency conversion rate updated.
 * The function below requests to convert Swedish Krown(SEK) into Korean Won (KRW) and saves that value into a local variable.
 */
require('dotenv').config()

const { localStorageHandler } = require('./localStorage.js');

const rapidAPI = process.env.RAPID_API_KEY;

async function fetchExchangeRate () {
    const url = 'https://currency-conversion-and-exchange-rates.p.rapidapi.com/convert?from=SEK&to=KRW&amount=1';
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': rapidAPI,
            'x-rapidapi-host': 'currency-conversion-and-exchange-rates.p.rapidapi.com'
        }
    };
    
    try {
        const response = await fetch(url, options);
        const result = await response.json();
        console.log('Updating Currency', result.result, new Date());
        localStorageHandler.setItem('exchangeRate', result.result)

        return result;
    } catch (error) {
        console.error(error);
    }
}

fetchExchangeRate()

module.exports = {
    fetchExchangeRate
}