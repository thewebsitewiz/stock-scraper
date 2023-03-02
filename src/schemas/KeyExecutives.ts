require('dotenv/config');

var mongoose = require("mongoose");

const KeyExecutivesSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        stockSymbol: {
            type: String,
            required: true,
        },
        stockSymbolId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'stockSymbol'
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("KeyExecutives", KeyExecutivesSchema);
