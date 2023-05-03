import { SymbolList } from "../interfaces/stockSymbols";

export {};

const util = require("util");
const mysql = require("mysql");

// DB Connection
const pool = mysql.createPool({
  connectionLimit: 50,
  host: "69.253.103.246",
  database: "fatdata",
  user: "systemuser",
  password: "F@tPr0ject",
});

pool.query = util.promisify(pool.query);

console.log("MySQL connection pool available");

module.exports = pool;

const listOfDateFields: string[] = [
  "exOrEffDate",
  "declarationDate",
  "recordDate",
  "paymentDate",
];

module.exports.getSymbolsWithData = async () => {
  const selectSymbolsSQL = `select symbol,exchangeNickname from symbols order by exchangeNickname,symbol`;
  try {
    let results = await pool.query(selectSymbolsSQL);

    if (!results) {
      console.log("\n\n============================================");
      console.log("ERROR: getSymbolsWithData");
      console.log(selectSymbolsSQL);
      console.log("\n============================================");
      return null;
    } else {
      let listOfSymbols: SymbolList = [];
      results.forEach((result: { [key: string]: string }) => {
        listOfSymbols.push({
          symbol: result["symbol"],
          exchangeNickname: result["exchangeNickname"],
        });
      });
      return listOfSymbols;
    }
  } catch (e: any) {
    console.log(e);
  }
};

module.exports.insertRow = async (table: string, data: any) => {
  await _insertRow(table, data);
};

async function _insertRow(table: string, data: any) {
  let columns: string[] = [];
  let values: string[] = [];

  let dataKeys = Object.keys(data);
  dataKeys.forEach((key: string) => {
    if (table !== "symbols" && key === "stockSymbol") {
      columns.push(`"symbols_symbol"`);
      values.push(`"${data[key]}"`);
    }

    if (key === "companyUrl" && data[key] !== null) {
      if (!data[key].match(/^http/)) {
        data[key] = null;
      }
    }

    if (table === "dividends") {
      const index = listOfDateFields.indexOf(key);
      if (index > -1) {
        // 2014-07-18T04:00:00.000+00:00
        console.log(typeof data[key], key, data[key]);
        data[key] = _yyymmdd(new Date(data[key]));
      }
    }

    if (typeof data[key] === "boolean") {
      data[key] === false || null ? (data[key] = 0) : (data[key] = 1);

      columns.push(`${key}`);
      values.push(`"${data[key]}"`);
    } else if (
      data[key] !== undefined &&
      data[key] !== null &&
      data[key] !== ""
    ) {
      if (typeof data[key] === "string") {
        data[key] = data[key].replace(/ "/g, " &ldquo;");
        data[key] = data[key].replace(/" /g, "&rdquo; ");
        data[key] = data[key].replace(/"./g, "&rdquo;.");
        data[key] = data[key].replace(/"$/g, "&rdquo;");
        // data[key] = data[key].replace(/'/g, '\\\'');
      }

      columns.push(`${key}`);
      values.push(`"${data[key]}"`);
    }
  });

  try {
    console.log(table);
    const sql = `INSERT INTO ${table} (${columns}) VALUES (${values})`;
    // console.log(sql);
    pool.query(sql, (err: any, results: any) => {
      if (err && table === "keyExecutives") {
        console.log("\n\n============================================");
        console.log(table);
        console.log("columns: ", columns);
        console.log("values: ", values);
        console.log(err);
        console.log("\n============================================");
      } else {
        console.log(table, results);
      }
    });
  } catch (e: any) {
    console.log(e);
  }
}

module.exports.insertRows = async (table: string, dataList: any) => {
  dataList.forEach(async (data: any) => {
    await _insertRow(table, data);
  });
};

function _remove(item: string, array: string[]) {
  const index = array.indexOf(item);
  if (index > -1) {
    array.splice(index, 1);
  }
  return array;
}

function _yyymmdd(date: Date) {
  const mm = date.getMonth() + 1; // getMonth() is zero-based
  const dd = date.getDate();
  const yyyy = date.getFullYear();

  console.log(mm, dd, yyyy);

  if (
    typeof mm === "number" &&
    typeof dd === "number" &&
    typeof yyyy === "number"
  ) {
    return [yyyy, (mm > 9 ? "" : "0") + mm, (dd > 9 ? "" : "0") + dd].join("-");
  } else {
    return "";
  }
}
