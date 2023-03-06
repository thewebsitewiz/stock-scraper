const loopUtils = require("./utils/loop-utils");
const contentUtils = require("./utils/content-utils");

const mongoUtils = require("./utils/mongodb-utils");

// const StockSymbolInfo = require('./interfaces/stockSymbolInfo');
import { StockSymbolInfo } from './interfaces/stockSymbolInfo';

const stockCompanyUrlTpl = "https://api.nasdaq.com/api/quote/__STOCK_SYMBOL__/info?assetclass=stocks";
const stockInfoUrlTpl = "https://api.nasdaq.com/api/company/__STOCK_SYMBOL__/company-profile";
const stockDataUrlTpl = "https://api.nasdaq.com/api/quote/__STOCK_SYMBOL__/__PARAMS__";


const historicalDataUrlTpl = "https://api.nasdaq.com/api/quote/__STOCK_SYMBOL__/historical?assetclass=stocks&fromdate=2013-03-02&limit=__LIMIT__&todate=2023-03-02"


const params = [
   "dividends?assetclass=stocks",
   "dividends?assetclass=etf"
];

const stockInfoFields = [
   "Address",
   "Phone",
   "Industry",
   "Sector",
   "Region",
   "CompanyUrl",
   "CompanyDescription",
   "KeyExecutives"
];

const stockCompanyFields = [
   "symbol",
   "companyName",
   "stockType",
   "exchange",
   "isNasdaqListed",
   "isNasdaq100",
   "isHeld",
   "secondaryData",
   "assetClass",
   "keyStats",
   "notifications"
];

const stockDataFields = [
   "exDividendDate",
   "dividendPaymentDate",
   "yield",
   "annualizedDividend",
   "payoutRatio",
   "stockType",
   "exchange",
   "isNasdaqListed",
   "isNasdaq100",
   "isHeld",
   "assetClass",
   "keyStats",
   "notifications"
];

(async () => {
   loopUtils.loopThruStocks(getStockInfo);
   mongoUtils.dbClose();
}
)();

async function getStockInfo(exchange: string, stockSymbol: string) {
   let stockInsert: any = {
      symbol: "",
      companyName: "",
      stockType: "",
      exchange: "",
      isNasdaqListed: undefined,
      isNasdaq100: undefined,
      isHeld: undefined,
      assetClass: "",
      keyStats: "",
      notifications: undefined,
      address: undefined,
      addressString: undefined,
      phone: "",
      industry: "",
      sector: "",
      region: "",
      companyUrl: "",
      companyDescription: "",
      keyExecutives: undefined,
   };

   // Get Stock Info
   let infoUrl = stockInfoUrlTpl.replace(
      "__STOCK_SYMBOL__",
      stockSymbol);

   const infoJson = await contentUtils.getPageContent(infoUrl);

   for (let property of stockInfoFields) {
      if (infoJson !== null && infoJson.data !== undefined &&
         infoJson.data !== null &&
         infoJson.data[property].value !== null) {
         const lowerProperty = property.charAt(0).toLowerCase() + property.slice(1);
         stockInsert[lowerProperty] = infoJson.data[property].value;
      }
   }

   if (stockInsert !== undefined && stockInsert["address"] !== null) {
      stockInsert["addressString"] = stockInsert["address"];
      stockInsert["address"] = undefined;
   }

   // Get Stock Company Profile
   let companyUrl = stockCompanyUrlTpl.replace(
      "__STOCK_SYMBOL__",
      stockSymbol);

   const companyJson = await contentUtils.getPageContent(companyUrl);

   for (let property of stockCompanyFields) {
      if (companyJson !== null && companyJson.data !== undefined &&
         companyJson.data !== null &&
         companyJson.data[property] !== undefined &&
         companyJson.data[property] !== null) {
         if (property === "symbol") {
            let lowerSymbol = companyJson.data[property].toLowerCase();
            companyJson.data[property] = lowerSymbol;
         }
         stockInsert[property] = companyJson.data[property];
      }
   }

   // Get Stock Data
   const dataUrlTpl = stockDataUrlTpl.replace(
      "__STOCK_SYMBOL__",
      stockSymbol);

   const firstDataUrl = dataUrlTpl.replace(
      "__PARAMS__",
      params[0]
   );

   const secondDataUrl = dataUrlTpl.replace(
      "__PARAMS__",
      params[1]
   );
   let url = firstDataUrl;
   let dataJson = await contentUtils.getPageContent(firstDataUrl);

   if (dataJson?.data === null) {
      url = secondDataUrl;
      dataJson = await contentUtils.getPageContent(secondDataUrl);
   }

   for (let property of stockDataFields) {
      if (dataJson !== null && dataJson.data !== undefined &&
         dataJson.data !== null &&
         dataJson.data[property] &&
         dataJson.data[property] !== null) {
         stockInsert[property] = dataJson.data[property];
      }
   }

   if (dataJson !== null && dataJson.data !== undefined &&
      dataJson.data !== null &&
      dataJson.data["dividends"] &&
      dataJson.data["dividends"] !== null) {
      stockInsert["dividends"] = dataJson.data["dividends"].rows;
   }
   try {
      await mongoUtils.insertSymbolData(stockInsert)
   } catch (err) {
      console.error("ERROR: addSymbolSummary: ", exchange, stockSymbol, err);
   }

}