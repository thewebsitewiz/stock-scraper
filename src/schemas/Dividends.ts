require('dotenv/config');

var mongoose = require("mongoose");

const DividendsSchema = new mongoose.Schema(
    {
        exOrEffDate: {
            type: Date,
            required: false,
        },
        type: {
            type: String,
            required: false,
        },
        amount: {
            type: Number,
            required: false,
        },
        declarationDate: {
            type: Date,
            required: false,
        },
        recordDate: {
            type: Date,
            required: false,
        },
        paymentDate: {
            type: Date,
            required: false,
        },
        currency: {
            type: String,
            required: false,
        },
        stockSymbol: {
            type: String,
            required: false,
            lowercase: true
        },
        stockSymbolId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'stockSymbol'
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Dividends", DividendsSchema);