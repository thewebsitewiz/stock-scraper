const symbolUtils = require("./symbol-utils");
const symbolLists = symbolUtils.getExchangeSymbols();
const mysqlUtils = require("./mysql-utils");

const log = true;
import {
  ExistingSymbols,
  SymbolList,
  SymbolListInfo,
} from "../interfaces/stockSymbols";

module.exports.loopThruStocks = async (doThis: Function) => {
  console.log("\tIn Loop");
  try {
    const existingSymbolsData = await mysqlUtils.getSymbolsWithData();

    let existingSymbols: ExistingSymbols = {};
    if (existingSymbolsData !== null && existingSymbolsData.length > 0) {
      console.log("\tFound Existing Symbols");
      existingSymbolsData.forEach((symbolData: SymbolListInfo) => {
        const exNick: string = symbolData["exchangeNickname"];
        const symbol: string = symbolData["symbol"];
        if (!existingSymbols[exNick] || existingSymbols[exNick] !== undefined) {
          existingSymbols[exNick] = {};
        }
        existingSymbols[exNick][symbol] = true;
      });
    }

    const existingSymbolsKeyList = Object.keys(existingSymbols);

    let cnt = 0;
    console.log("Starting Loop");
    const exchanges = Object.keys(symbolLists).sort();
    for (let exchange of exchanges) {
      console.log(`Exchange: ${exchange}`);
      const symbolList = Object.keys(symbolLists[exchange]).sort();
      for (let symbol of symbolList) {
        if (existingSymbolsKeyList.length === 0) {
          console.log(`\t${exchange} : ${symbol}`);
          await doThis(exchange, symbol);
        } else {
          if (
            existingSymbols[exchange] &&
            existingSymbols[exchange] !== undefined &&
            existingSymbols[exchange][symbol] === undefined
          ) {
            console.log(`\t${exchange} : ${symbol}`);
            await doThis(exchange, symbol);
          } else {
            console.log(`\t\tskipping${exchange} : ${symbol}`);
          }
        }
        cnt++;
        if (cnt > 0) {
          break;
        }
      }
      if (cnt > 0) {
        break;
      }
    }
  } catch (e) {
    console.log("e: ", e);
  }
};
