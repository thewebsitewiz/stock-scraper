require('dotenv/config');
var mongoose = require('mongoose');

const DB_CONN = "mongodb+srv://thewebsitewiz:6beFJJHk0kKA4uvo@bobtheskull.tyssykn.mongodb.net/test"

mongoose.connect(DB_CONN, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'projectgreen-database'
})
    .then(() => {
        console.log('Database Connection is ready...')
    })
    .catch((err: any) => {
        console.log(err);
    })
