// https://stackoverflow.com/questions/39596625/nested-objects-in-mongoose-schemas
const mongoose = require('mongoose');

const Notification = mongoose.Schema({
    notification: String
});

const Address = mongoose.Schema({
    city: String,
    street: String,
    houseNumber: String,
});

const KeyExecutive = mongoose.Schema({
    TBD: {
        type: String,
        required: false,
    }
});

const StockSymbolSchema = mongoose.Schema({
    symbol: {
        type: String,
        required: true,
    },
    companyName: {
        type: String,
        required: true,
    },
    stockType: {
        type: String,
        required: true,
    },
    exchange: {
        type: String,
        required: true,
    },
    isNasdaqListed: {
        type: Boolean,
        required: true,
        default: false
    },
    isNasdaq100: {
        type: Boolean,
        required: true,
        default: false
    },
    isHeld: {
        type: Boolean,
        required: false,
        default: false
    },
    assetClass: {
        type: Boolean,
        required: true,
        default: false
    },
    keyStats: {
        type: String,
        required: true,
    },
    notifications: [Notification],
    AddressString: {
        type: String,
        required: false,
    },
    Address: {
        type: Address,
        required: false,
    },
    Phone: {
        type: String,
        required: false,
    },
    Industry: {
        type: String,
        required: false,
    },
    Sector: {
        type: String,
        required: false,
    },
    Region: {
        type: String,
        required: false,
    },
    CompanyUrl: {
        type: String,
        required: false,
    },
    CompanyDescription: {
        type: String,
        required: false,
    },
    KeyExecutives: [KeyExecutive]
})


StockSymbolSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

StockSymbolSchema.set('toJSON', {
    virtuals: true,
});

exports.StockSymbol = mongoose.model('StockSymbol', StockSymbolSchema);