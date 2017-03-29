var env = process.env.NODE_ENV;

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI);

module.exports = {mongoose};

process.env.NODE_END === 'test'
