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

const listOfDateFields: string[] = [];

module.exports.getSymbolsWithData = async () => {
  const selectSymbolsSQL = `select symbol from symbols order by exchangeNickname,symbol`;
  const results = await pool.query(selectSymbolsSQL);
  return results;
};

module.exports.insertRow = async (table: string, data: any) => {
  await _insertRow(table, data);
};

async function _insertRow(table: string, data: any) {
  let post: any = {};

  let dataKeys = Object.keys(data);
  dataKeys.forEach((key: string) => {
    if (table !== "symbols" && key === "stockSymbol") {
      post["symbols_symbol"] = `"${data[key]}"`;
    }

    if (key === "companyUrl") {
      if (!data[key].match(/^http/)) {
        data[key] = null;
      }
    }

    if (table === "dividends") {
      const index = listOfDateFields.indexOf(key);
      if (index > -1) {
        // 2014-07-18T04:00:00.000+00:00
        // console.log(typeof data[key], key, data[key])
        data[key] = _yyymmdd(new Date(data[key]));
      }
    }

    if (typeof data[key] === "boolean") {
      data[key] === false || null ? (data[key] = 0) : (data[key] = 1);
      post[key] = `"${data[key]}"`;
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
      post[key] = `"${data[key]}"`;
    }
  });
  try {
    const query = await pool.query("INSERT INTO posts SET ?", post);
    console.log(query.sql); // INSERT INTO posts SET `id` = 1, `title` = 'Hello MySQL'

    if (table === "symbols") console.log(query.results);
  } catch (e: any) {
    throw new Error(e);
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
  var mm = date.getMonth() + 1; // getMonth() is zero-based
  var dd = date.getDate();

  return [
    date.getFullYear(),
    (mm > 9 ? "" : "0") + mm,
    (dd > 9 ? "" : "0") + dd,
  ].join("-");
}
