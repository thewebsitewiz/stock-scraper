require('dotenv/config');

const DB_NAME = "bobtheskull";
const DB_USER = "thewebsitewiz";
const DB_PSWD = "6beFJJHk0kKA4uvo";


// const CONN_STR = `mongodb+srv://${DB_USER}:${DB_PSWD}@${DB_NAME}.tyssykn.mongodb.net/?retryWrites=true&w=majority`
const CONN_STR = `mongodb+srv://${DB_USER}:${DB_PSWD}@${DB_NAME}.tyssykn.mongodb.net/?retryWrites=true&w=majority`
const mongoose = require('mongoose');

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

module.exports.addSymbolSummary = async (collectionName: string, data: any) => {
    if (collectionName !== null) {
        console.log("collectionName: ", collectionName);

        try {
            const dataPassed = JSON.stringify(data, undefined, 2);
            const result = await DB_CONN.collection(collectionName).save(data);
            console.log(`Success with ${collectionName}: ${result}`);
        } catch (err) {
            throw new Error(`Failed collection: ${collectionName} - ${err}\n${data}`);
        }
    }
    else {
        return new Error("Missing collection name")
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
