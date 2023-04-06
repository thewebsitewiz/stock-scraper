const symbolUtils = require("./symbol-utils");
const symbolLists = symbolUtils.getExchangeSymbols();

const mysqlUtils = require("./mongodb-utils");

import { SymbolList, SymbolListInfo } from "../interfaces/stockSymbols";

module.exports.loopThruStocks = async (doThis: Function) => {
  const existingSymbolsData: SymbolList = await mysqlUtils.getSymbolsWithData();
  let existingSymbols: any = {};
  if (existingSymbolsData.length > 0) {
    existingSymbolsData.forEach((symbolData: SymbolListInfo) => {
      let ex: string = symbolData["exchangeNickname"];
      let sym: string = symbolData["symbol"];
      if (!(existingSymbols[ex] in existingSymbols)) {
        existingSymbols[ex] = {};
      }
      existingSymbols[ex][sym] = true;
    });
  }

  for (let exchange in symbolLists) {
    if (symbolLists.hasOwnProperty(exchange)) {
      const symbolList = Object.keys(symbolLists[exchange]);

      for (let symbol of symbolList) {
        if (
          existingSymbols[exchange] !== undefined &&
          existingSymbols[exchange][symbol] !== undefined &&
          existingSymbols[exchange][symbol] === true
        ) {
          console.log(`${exchange} : ${symbol}`);
          let results = await doThis(exchange, symbol);
          return results;
        }
      }
    }
    // }
  }
};
