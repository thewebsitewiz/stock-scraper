/* const fs = require("fs");
const path = require("path");
 */
let nasdaq;
let nasdaqList;

let nyse;
let nyseList;

let amex;
let amexList;

let symbolsList: any = {};

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
