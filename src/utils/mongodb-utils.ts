require('dotenv/config');


var mongoose = require("mongoose");

const StockSymbols = require("../schemas/stockSymbols");

const DB_NAME = "bobtheskull";
const DB_USER = "thewebsitewiz";
const DB_PSWD = "6beFJJHk0kKA4uvo";


// const CONN_STR = `mongodb+srv://${DB_USER}:${DB_PSWD}@${DB_NAME}.tyssykn.mongodb.net/?retryWrites=true&w=majority`
// const CONN_STR = `mongodb+srv://${DB_USER}:${DB_PSWD}@${DB_NAME}.tyssykn.mongodb.net/?retryWrites=true&w=majority`
const CONN_STR = `mongodb+srv://thewebsitewiz:6beFJJHk0kKA4uvo@bobtheskull.tyssykn.mongodb.net/FATDATA`;
var DB_CONN: any;

main()

// main().catch(err => console.log(err));

async function main() {

    mongoose.connect(CONN_STR);
    const db = mongoose.connection;
    db.on("error", console.error.bind(console, "connection error: "));
    db.once("open", function () {
        console.log("Connected successfully");
        DB_CONN = db;
    });

}
module.exports.patchStock = async (stockSymbol: string, stockInfo: any) => {

    const stocksymbols = StockSymbols();
    const saveSymbolData = stocksymbols.updateOne({ symbol: stockSymbol }, stockInfo);
    console.log(`saveSymbolData: ${saveSymbolData}`)
}



module.exports.addSymbolSummary = async (data: any) => {
    //console.log(data);
    const dataPassed = JSON.stringify(data, undefined, 2);
    const saveSymbolData = new StockSymbols(data);

    try {
        const result = await saveSymbolData.save();
        if (!!result) {
            console.log(`Success with ${data.symbol}`);
        }
    } catch (err) {
        console.error(`\n\n*********************************n\nFailed saveSymbolData: - ${err}\n${data}\n\n${saveSymbolData}\n\n*********************************n\n`)
        // *************************
        process.exit(0)
        // *************************
    }

}

module.exports.dbClose = async () => {
    try {
        DB_CONN.close();

        console.log("DB closed successfully");
    }
    catch (err) {
        return new Error(`DB Failed to close: ${err}`)
    }
}
