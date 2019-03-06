const auth = require('./auth.json');
const package = require('../package.json');

/////////////
// DISCORD //
/////////////
process.env.DISCORD_TOKEN = process.env.DISCORD_TOKEN || auth.discord_token;

////////////
// LOGGER //
////////////
process.env.LOGGER_PATH = process.env.LOGGER_PATH || '';
process.env.LOGGER_FILE = process.env.LOGGER_FILE || process.env.npm_package_name || `${package.name}.log`;

//////////////
// PASTEBIN //
//////////////
process.env.PASTEBIN_KEY = process.env.PASTEBIN_KEY || auth.pastebin_key;

///////////
// MONGO //
///////////
process.env.MONGO_USER = process.env.MONGO_USER || 'admin';
process.env.MONGO_PASS = process.env.MONGO_PASS || 'debug';
process.env.MONGO_IP = process.env.MONGO_IP || 'localhost';
process.env.MONGO_PORT = process.env.MONGO_PORT || 27017;
process.env.MONGO_DB = process.env.MONGO_DB || process.env.npm_package_name || package.name;