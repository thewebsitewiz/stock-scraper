require("dotenv/config");

var mongoose = require("mongoose");

import {
  Dividend,
  KeyExecutive,
  Notification,
  StockSymbolInfo,
} from "../interfaces/stockSymbols";

const StockSymbols = require("../schemas/StockSymbols");
const KeyExecutives = require("../schemas/KeyExecutives");
const Notifications = require("../schemas/Notifications");
const Dividends = require("../schemas/Dividends");

const DB_NAME = "bobtheskull";
const DB_USER = "thewebsitewiz";
const DB_PSWD = "6beFJJHk0kKA4uvo";

const dateFields = [
  "exOrEffDate",
  "declarationDate",
  "recordDate",
  "paymentDate",
];

// mongodb+srv://thewebsitewiz:VpJpIe3giTKGQguE@fat.chok35z.mongodb.net/FAT

// VpJpIe3giTKGQguE

// const CONN_STR = `mongodb+srv://${DB_USER}:${DB_PSWD}@${DB_NAME}.tyssykn.mongodb.net/?retryWrites=true&w=majority`
// const CONN_STR = `mongodb+srv://${DB_USER}:${DB_PSWD}@${DB_NAME}.tyssykn.mongodb.net/?retryWrites=true&w=majority`
const CONN_STR = `mongodb+srv://thewebsitewiz:VpJpIe3giTKGQguE@fat.chok35z.mongodb.net/FAT`;
var DB_CONN: any;

main();

// main().catch(err => console.log(err));

async function main() {
  mongoose.connect(CONN_STR);
  mongoose.set("strictQuery", true);
  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "connection error: "));
  db.once("open", function () {
    console.log("Connected successfully");
    DB_CONN = db;
  });
}

module.exports.getSymbolData = async (
  exchange: string,
  symbol: string
): Promise<StockSymbolInfo> => {
  const symbolData = await StockSymbols.findOne({ symbol: symbol });
  let newSymbolData;

  if (symbolData !== null && symbolData !== undefined) {
    newSymbolData = { ...symbolData }._doc;
    delete newSymbolData.__v;
    delete newSymbolData._id;
    delete newSymbolData.isHeld;
    delete newSymbolData.createdAt;
    delete newSymbolData.updatedAt;
  }

  return newSymbolData;
};

module.exports.getKeyExecutivesData = async (symbol: string) => {
  const keyExecutivesDataList = await KeyExecutives.find({
    stockSymbol: symbol,
  });
  const count = keyExecutivesDataList.length;
  let newKeyExecutivesDataList: any[] = [];
  keyExecutivesDataList.forEach((ke: any) => {
    let newKeyExecutivesData = { ...ke }._doc;
    delete newKeyExecutivesData.__v;
    delete newKeyExecutivesData._id;
    newKeyExecutivesDataList.push(newKeyExecutivesData);
  });

  return newKeyExecutivesDataList;
};

module.exports.getNotificationsData = async (symbol: string) => {
  const notificationsDataList = await Notifications.find({
    stockSymbol: symbol,
  });
  let newNotificationsDataList: any[] = [];
  notificationsDataList.forEach((nd: any) => {
    let newNotificationsData = { ...nd }._doc;
    delete newNotificationsData.__v;
    delete newNotificationsData._id;
    delete newNotificationsData.id;
    newNotificationsDataList.push(newNotificationsData);
  });

  return newNotificationsDataList;
};

module.exports.getDividendsData = async (symbol: string) => {
  const dividendsDataList = await Dividends.find({ stockSymbol: symbol });
  let newDividendsDataList: any[] = [];
  dividendsDataList.forEach((nd: any) => {
    let newDividendsData = { ...nd }._doc;
    delete newDividendsData.__v;
    delete newDividendsData._id;
    newDividendsDataList.push(newDividendsData);
  });

  return newDividendsDataList;
};

module.exports.getSymbolsWithData = async (symbol: string) => {
  const q = StockSymbols.find({}, "symbol -_id");
  const allSymbols = await q;
  return allSymbols;
};

module.exports.checkSymbol = async (symbol: string) => {
  await _checkSymbol(symbol);
};

async function _checkSymbol(symbol: string) {
  StockSymbols.find({ symbol: symbol }, async function (err: any, docs: any) {
    console.log(docs);
  });
}
/* 
module.exports.insertSymbolData = async (data: StockSymbolInfo) => {
  const dataPassed = JSON.stringify(data, undefined, 2);

  const keyExecutives = data.keyExecutives;
  data.keyExecutives = undefined;
  delete data.keyExecutives;

  const notifications = data.notifications;
  data.notifications = undefined;
  delete data.notifications;

  const dividends = data.dividends;
  data.dividends = undefined;
  delete data.dividends;

  if (!!data["exchange"] && !!data["symbol"]) {
    const saveSymbolData = new StockSymbols(data);

    try {
      const symbolResult = await saveSymbolData.save();
      if (!!symbolResult) {
        console.log(`\tSuccess with ${data.exchange} - ${data.symbol}`);
        const symbol = data.symbol;
        const symbolId = symbolResult.id;

        if (keyExecutives && keyExecutives.length > 0) {
          keyExecutives.forEach(async (kE: KeyExecutive) => {
            const keyExecutiveInsert: any = { ...kE };
            keyExecutiveInsert["stockSymbol"] = symbol;
            keyExecutiveInsert["stockSymbolId"] = symbolId;
            const saveKeyExecutiveData = new KeyExecutives(keyExecutiveInsert);
            await saveKeyExecutiveData.save();
          });
        }

        if (notifications && notifications.length > 0) {
          notifications.forEach(async (notification: any) => {
            const notificationInsert: any = {};

            notificationInsert["headline"] = notification["headline"];
            notificationInsert["message"] =
              notification["eventTypes"][0]["message"];
            notificationInsert["eventName"] =
              notification["eventTypes"][0]["eventName"];
            notificationInsert["url"] =
              notification["eventTypes"][0]["url"]["value"];
            notificationInsert["id"] = notification["eventTypes"][0]["id"];
            notificationInsert["stockSymbol"] = symbol;
            notificationInsert["stockSymbolId"] = symbolId;

            const saveNotificationData = new Notifications(notificationInsert);
            await saveNotificationData.save();
          });
        }

        if (dividends && dividends.length > 0) {
          dividends.forEach(async (dividend: Dividend) => {
            const dividendInsert: any = { ...dividend };

            dateFields.forEach((field) => {
              const dateIn = dividendInsert[field];
              if (dateIn === "N/A") {
                dividendInsert[field] = null;
              } else {
                const datePieces = dateIn.split("/");
                dividendInsert[
                  field
                ] = `${datePieces[2]}/${datePieces[0]}/${datePieces[1]}`;
              }
            });

            dividendInsert["amount"] = Number(
              dividendInsert["amount"].replace("$", "")
            );
            dividendInsert["stockSymbol"] = symbol;
            dividendInsert["stockSymbolId"] = symbolId;
            const saveDividendData = new Dividends(dividendInsert);
            await saveDividendData.save();
          });
        }
      }
    } catch (err) {
      console.log(`\n\n*********************************`);
      console.log(
        `Failed saveSymbolData: - ${err}\n${data}\n\n${saveSymbolData}\n\n`
      );
      console.log(`*********************************\n\n`);

      // *************************
      process.exit(0);
      // *************************
    }
  }
}; */

module.exports.dbClose = async () => {
  try {
    DB_CONN.close();

    console.log("DB closed successfully");
  } catch (err) {
    return new Error(`DB Failed to close: ${err}`);
  }
};
