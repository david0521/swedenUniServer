const cron = require('node-cron');
const { fetchExchangeRate } = require('./services/currencyExchange.service.js');

// Schedule to run exchange rate conversion every 3 hours
cron.schedule('0 */3 * * *', () => {
    fetchExchangeRate();
})