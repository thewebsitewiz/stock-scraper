const symbolUtils = require("./symbol-utils");
const symbolLists = symbolUtils.getExchangeSymbols();

module.exports.loopThruStocks = (doThis: Function) => {
    for (let exchange in symbolLists) {
        if (symbolLists.hasOwnProperty(exchange)) {
            const stockSymbols = symbolLists[exchange];
            exchange = exchange.toLowerCase();
            for (let stockSymbol in stockSymbols) {
                stockSymbol = stockSymbol.toLowerCase();
                doThis(exchange, stockSymbol);
            }
        }
    }
};

