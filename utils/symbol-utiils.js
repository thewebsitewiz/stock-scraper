const fs = require("fs");
const path = require("path");

let nasdaq;
let nasdaqList;

let nyse;
let nyseList;

let amex;
let amexList;

module.exports.getExchangeSymbols = (scope = all) => {
   let symbolsList = {};

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
