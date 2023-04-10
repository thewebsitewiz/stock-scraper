const loopUtils = require("./utils/loop-utils");
const contentUtils = require("./utils/content-utils");

const mySQLUtils = require("./utils/mysql-utils");

const log = true;

import {
  Company,
  Dividend,
  KeyExecutive,
  Notification,
  StockSymbolInfo,
} from "./interfaces/stockSymbols";

const companyInfoUrlTpl =
  "https://api.nasdaq.com/api/quote/__STOCK_SYMBOL__/info?assetclass=stocks";

// https://api.nasdaq.com/api/quote/fsk/info?assetclass=stocks

const companyProfileUrlTpl =
  "https://api.nasdaq.com/api/company/__STOCK_SYMBOL__/company-profile";

// https://api.nasdaq.com/api/company/fsk/company-profile

const dividendDataUrlTpl =
  "https://api.nasdaq.com/api/quote/__STOCK_SYMBOL__/__PARAMS__";

const dividendParams = [
  "dividends?assetclass=stocks",
  "dividends?assetclass=etf",
];

// https://api.nasdaq.com/api/quote/fsk/dividends?assetclass=stocks
// https://api.nasdaq.com/api/quote/fsk/dividends?assetclass=etf

const historicalDataUrlTpl =
  "https://api.nasdaq.com/api/quote/__STOCK_SYMBOL__/historical?assetclass=stocks&fromdate=2013-03-02&limit=__LIMIT__&todate=2023-03-02";

// Field Lists
const companyInfoFields: string[] = [
  "symbol",
  "companyName",
  "stockType",
  "exchange",
  "isNasdaqListed",
  "isNasdaq100",
  "assetClass",
  "keyStats",
];

const companyProfileFields: string[] = [
  "addressString",
  "phone",
  "industry",
  "sector",
  "region",
  "companyUrl",
  "companyDescription",
];

const companyDividendInfoFields = [
  "exDividendDate",
  "dividendPaymentDate",
  "yield",
  "annualizedDividend",
  "payoutRatio",
];

const dividendInfoFields = [
  "exOrEffDate",
  "type",
  "amount",
  "declarationDate",
  "recordDate",
  "paymentDate",
  "currency",
];

const symbolTableFields: any = {
  symbol: "",
  companyName: "",
  stockType: "",
  exchange: "",
  exchangeNickname: "",
  isNasdaqListed: undefined,
  isNasdaq100: undefined,
  assetClass: "",
  keyStats: "",
  addressString: undefined,
  phone: "",
  industry: "",
  sector: "",
  region: "",
  companyUrl: "",
  companyDescription: "",
};

const keyExecutivesTableFields: any = ["name", "title"];

const notificationsTableFields: any = ["headline", "message", "eventName"];

const dividendsTableFields: any = [
  "exOrEffDate",
  "type",
  "amount",
  "declarationDate",
  "recordDate",
  "paymentDate",
  "currency",
];

(async () => {
  if (log) console.log("\tStarting Loop");
  loopUtils.loopThruStocks(getStockInfo);
  // .dbClose();
})();

async function getStockInfo(exchange: string, symbol: string) {
  // get Company Info
  if (log) console.log("\tGetting Company Info");
  const companyInfoUrl = companyInfoUrlTpl.replace("__STOCK_SYMBOL__", symbol);
  const infoJson = await contentUtils.getPageContent(companyInfoUrl);

  // get Company Profile
  const companyProfileUrl = companyProfileUrlTpl.replace(
    "__STOCK_SYMBOL__",
    symbol
  );
  if (log) console.log("\tGetting Company Profile");
  const profileJson = await contentUtils.getPageContent(companyProfileUrl);

  // get Dividends
  const dividendUrlTpl = dividendDataUrlTpl.replace("__STOCK_SYMBOL__", symbol);

  const firstDividendUrl = dividendUrlTpl.replace(
    "__PARAMS__",
    dividendParams[0]
  );

  const secondDividendUrl = dividendUrlTpl.replace(
    "__PARAMS__",
    dividendParams[1]
  );

  if (log) console.log("\tGetting Dividends");
  let dividendJson = await contentUtils.getPageContent(firstDividendUrl);

  if (dividendJson?.data === null) {
    dividendJson = await contentUtils.getPageContent(secondDividendUrl);
  }

  // Build Symbol Table Insert

  for (let property of companyInfoFields) {
    if (
      infoJson !== null &&
      infoJson.data !== undefined &&
      infoJson.data !== null &&
      infoJson.data[property] &&
      infoJson.data[property] !== null
    ) {
      symbolTableFields[property] = infoJson.data[property];
    } else {
      symbolTableFields[property] = null;
    }
  }

  for (let property of companyProfileFields) {
    let profileJsonProperty = property;
    profileJsonProperty =
      profileJsonProperty.charAt(0).toUpperCase() +
      profileJsonProperty.slice(1);
    if (
      profileJson !== null &&
      profileJson.data !== undefined &&
      profileJson.data !== null &&
      profileJson.data[profileJsonProperty] &&
      profileJson.data[profileJsonProperty] !== null
    ) {
      if (property === "addressString") {
        symbolTableFields[property] = profileJson.data["Address"]["value"];
      } else {
        symbolTableFields[property] =
          profileJson.data[profileJsonProperty]["value"];
      }
    } else {
      symbolTableFields[property] = null;
    }
  }

  // Insert into symbols Table
  if (log) console.log("\tInserting Symbol");
  if (log) console.log(symbolTableFields);
  mySQLUtils.insertRow("symbols", symbolTableFields);

  // Build Notifications Insert
  if (
    infoJson.notifications !== undefined &&
    infoJson.notifications.length > 0
  ) {
    let notificationInsertList: Notification[] = [];

    infoJson.notifications.notifications.forEach(async (notification: any) => {
      const notificationInsert: any = { symbols_symbol: symbol };

      if (notification["headline"]) {
        notificationInsert["headline"] = notification["headline"];
      }

      if (
        notification["eventTypes"] !== undefined &&
        notification["eventTypes"][0]["message"]
      ) {
        notificationInsert["message"] =
          notification["eventTypes"][0]["message"];
      }

      if (
        notification["eventTypes"] !== undefined &&
        notification["eventTypes"][0]["eventName"]
      ) {
        notificationInsert["eventName"] =
          notification["eventTypes"][0]["eventName"];
      }

      if (notification["eventTypes"][0]["url"]["value"]) {
        notificationInsert["url"] =
          notification["eventTypes"][0]["url"]["value"];
      }

      notificationInsertList.push(notificationInsert);
    });

    // Inserts into notifications Table
    if (log) console.log("\tInserting Notifications");
    mySQLUtils.insertRows("notifications", notificationInsertList);
  }

  // Build KeyExecutives Insert
  if (
    profileJson !== null &&
    profileJson.data !== undefined &&
    profileJson.data !== null &&
    profileJson.data["KeyExecutives"] &&
    profileJson.data["KeyExecutives"] !== null &&
    profileJson.data["KeyExecutives"]["value"] &&
    profileJson.data["KeyExecutives"]["value"] !== null &&
    profileJson.data["KeyExecutives"]["value"].length > 0
  ) {
    let keyExecutiveList: KeyExecutive[] = [];
    profileJson.data["KeyExecutives"]["value"].forEach((ke: KeyExecutive) => {
      keyExecutiveList.push({ name: ke.name, title: ke.title });
    });

    // Inserts into keyExecutives Table
    if (log) console.log("\tInserting keyExecutives");
    mySQLUtils.insertRows("keyExecutives", keyExecutiveList);
  }

  // Build Dividends Insert

  if (
    dividendJson !== null &&
    dividendJson.data !== undefined &&
    dividendJson.data !== null &&
    dividendJson.data["dividends"] &&
    dividendJson.data["dividends"] !== null &&
    dividendJson.data["dividends"]["rows"] &&
    dividendJson.data["dividends"]["rows"] !== null &&
    dividendJson.data["dividends"]["rows"].length > 0
  ) {
    let dividendList: Dividend[] = [];
    dividendJson.data["dividends"]["rows"].forEach((div: Dividend) => {
      dividendList.push({
        exOrEffDate: div.exOrEffDate,
        type: div.type,
        amount: div.amount,
        declarationDate: div.declarationDate,
        recordDate: div.recordDate,
        paymentDate: div.paymentDate,
      });
    });

    // Inserts into dividends Table
    if (log) console.log("\tInserting dividends");
    mySQLUtils.insertRows("dividends", dividendList);
  }
}
