require('dotenv/config');

var mongoose = require("mongoose");

const NotificationsSchema = new mongoose.Schema(
    {
        headline: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        eventName: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
        id: {
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

module.exports = mongoose.model("Notifications", NotificationsSchema);