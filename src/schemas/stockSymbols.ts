// https://stackoverflow.com/questions/39596625/nested-objects-in-mongoose-schemas
require('dotenv/config');

var mongoose = require("mongoose");
/* 
const Notification = new mongoose.Schema({
    notification: {
        type: String,
        required: false,
    }
}); */

const Address = new mongoose.Schema({
    city: String,
    street: String,
    houseNumber: String,
});
/* 
const KeyExecutive = new mongoose.Schema({
    Name: {
        type: String,
        required: false,
    },
    Title: {
        type: String,
        required: false,
    }
}); */

const StockSymbolSchema = new mongoose.Schema(
    {
        symbol: {
            type: String,
            required: false,
        },
        companyName: {
            type: String,
            required: false,
        },
        stockType: {
            type: String,
            required: false,
        },
        exchange: {
            type: String,
            required: false,
        },
        isNasdaqListed: {
            type: Boolean,
            required: false,
            default: false
        },
        isNasdaq100: {
            type: Boolean,
            required: false,
            default: false
        },
        isHeld: {
            type: Boolean,
            required: false,
            default: false
        },
        assetClass: {
            type: String,
            required: false
        },
        keyStats: {
            type: String,
            required: false,
        },
        addressString: {
            type: String,
            required: false,
        },
        phone: {
            type: String,
            required: false,
        },
        industry: {
            type: String,
            required: false,
        },
        sector: {
            type: String,
            required: false,
        },
        region: {
            type: String,
            required: false,
        },
        companyUrl: {
            type: String,
            required: false,
        },
        companyDescription: {
            type: String,
            required: false,
        }
    },
    { timestamps: true }
)


/* StockSymbolSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

StockSymbolSchema.set('toJSON', {
    virtuals: true,
}); */


module.exports = mongoose.model("StockSymbols", StockSymbolSchema);
