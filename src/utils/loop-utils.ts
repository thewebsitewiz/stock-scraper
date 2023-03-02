const symbolUtils = require("./symbol-utils");
const symbolLists = symbolUtils.getExchangeSymbols();

const mongoUtils = require("./mongodb-utils");

module.exports.loopThruStocks = async (doThis: Function) => {

    const existingSymbols = await mongoUtils.getSymbolsWithData();
    const existingSymbolsLookup: { [key: string]: boolean } = {};
    existingSymbols.forEach((symbol: any) => {
        existingSymbolsLookup[symbol["symbol"]] = true;
        console.log(`${symbol["symbol"]}: ${existingSymbolsLookup[symbol["symbol"]]}`)
    })

    for (let exchange in symbolLists) {
        if (symbolLists.hasOwnProperty(exchange)) {
            const stockSymbols = symbolLists[exchange];
            const stocks = Object.keys(stockSymbols);
            const sortedStocks = stocks.sort();

            exchange = exchange.toLowerCase();

            for (let stockSymbol of sortedStocks) {
                // const subDir = stockSymbol.charAt(0).toUpperCase();
                stockSymbol = stockSymbol.toLowerCase();
                if (existingSymbolsLookup[stockSymbol] !== true) {
                    console.log(`${exchange} = ${stockSymbol}`)
                    await doThis(exchange, stockSymbol);
                }
            }
        }
        // }
    }
};

