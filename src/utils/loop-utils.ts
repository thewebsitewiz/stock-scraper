const symbolUtils = require("./symbol-utils");
const symbolLists = symbolUtils.getExchangeSymbols();
const mysqlUtils = require("./mysql-utils");

const log = true;
import { SymbolList, SymbolListInfo } from "../interfaces/stockSymbols";

module.exports.loopThruStocks = async (doThis: Function) => {
  if (log) console.log("\tIn Loop");
  const existingSymbolsData: SymbolList = await mysqlUtils.getSymbolsWithData();
  let existingSymbols: any = {};
  if (existingSymbolsData.length > 0) {
    if (log) console.log("\tFound Existing Symbols");
    existingSymbolsData.forEach((symbolData: SymbolListInfo) => {
      let ex: string = symbolData["exchangeNickname"];
      let sym: string = symbolData["symbol"];
      if (!(existingSymbols[ex] in existingSymbols)) {
        existingSymbols[ex] = {};
      }
      existingSymbols[ex][sym] = true;
    });
  }

  let cnt = 0;
  if (log) console.log("Starting Loop");
  console.log("existingSymbols: ", existingSymbols);
  for (let exchange in symbolLists) {
    console.log(`Exchange: ${exchange}`);
    if (symbolLists.hasOwnProperty(exchange)) {
      const symbolList = Object.keys(symbolLists[exchange]);
      for (let symbol of symbolList) {
        console.log(`Symbol: ${symbol}`);
        const existingSymbolsKeyList = Object.keys(existingSymbols);

        console.log(`Length: ${existingSymbolsKeyList.length}`);
        if (existingSymbolsKeyList.length === 0) {
          console.log(`${exchange} : ${symbol}`);
          await doThis(exchange, symbol);
        } else {
          if (existingSymbols[exchange][symbol] === undefined) {
            console.log(`${exchange} : ${symbol}`);
            await doThis(exchange, symbol);
          }
        }
        cnt++;
        if (cnt > 0) {
          process.exit(0);
        }
      }
    }
    // }
  }
};
