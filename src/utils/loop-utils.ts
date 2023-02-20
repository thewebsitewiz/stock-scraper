const symbolUtils = require("./symbol-utils");
const symbolLists = symbolUtils.getExchangeSymbols();

module.exports.loopThruStocks = async (doThis: Function) => {
    for (let exchange in symbolLists) {
        if (exchange === "nasdaq") {
            if (symbolLists.hasOwnProperty(exchange)) {
                const stockSymbols = symbolLists[exchange];
                const stocks = Object.keys(stockSymbols);
                const sortedStocks = stocks.sort();

                exchange = exchange.toLowerCase();

                var cnt = 0;
                for (let stockSymbol of sortedStocks) {
                    const subDir = stockSymbol.charAt(0).toUpperCase();
                    if (subDir === "B") {
                        stockSymbol = stockSymbol.toLowerCase();

                        if (stockSymbol === "banf") {
                            console.log(`${exchange} = ${stockSymbol}`)
                            await doThis(exchange, stockSymbol);
                            cnt++;
                            if (cnt > 5) {
                                break;
                            }
                        }
                    }

                }
            }
        }
    }
};

