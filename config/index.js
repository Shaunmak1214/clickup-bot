const dotenv = require('dotenv');
dotenv.config();

module.exports.prefix = "@";
module.exports.BaseAPI = `${process.env.BASE_URL}`;
module.exports.db = require('./database')