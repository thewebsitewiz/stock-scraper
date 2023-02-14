const symbolUtils = require("./symbol-utils");
const symbolLists = symbolUtils.getExchangeSymbols();

module.exports.loopThruStocks = async (doThis: Function) => {

    let cnt = 0;
    for (let exchange in symbolLists) {
        if (symbolLists.hasOwnProperty(exchange)) {
            const stockSymbols = symbolLists[exchange];
            exchange = exchange.toLowerCase();
            for (let stockSymbol in stockSymbols) {
                stockSymbol = stockSymbol.toLowerCase();
                await doThis(exchange, stockSymbol);
                cnt++;
                /* 
                if (cnt > 5) {
                // *************************
                // process.exit(0)
                // *************************
                } */
            }
        }
    }
};

