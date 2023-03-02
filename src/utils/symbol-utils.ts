/* const fs = require("fs");
const path = require("path");
 */
let nasdaq;
let nasdaqList;

let nyse;
let nyseList;

let amex;
let amexList;

let all;
let allList;

let symbolsList: any = {};

module.exports.getAllSymbols = () => {
   all = require("../data-sources/all");
   symbolsList["all"] = all.getSymbolList();
   return symbolsList;
}

module.exports.getExchangeSymbols = (scope: string) => {

   if (scope === null || scope === undefined) {
      scope = "all";
   }

   if (scope === "all" || scope === "NASDAQ") {
      nasdaq = require("../data-sources/nasdaq");
      nasdaqList = nasdaq.getNASDAQlist();

      symbolsList["nasdaq"] = nasdaqList;
   }

   if (scope === "all" || scope === "NYSE") {
      nyse = require("../data-sources/nyse");
      nyseList = nyse.getNYSElist();

      symbolsList["nyse"] = nyseList;
   }

   if (scope === "all" || scope === "NYSE") {
      amex = require("../data-sources/amex");
      amexList = amex.getAMEXlist();

      symbolsList["amex"] = amexList;
   }

   return symbolsList;
};
