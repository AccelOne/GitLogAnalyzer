var config = {};

switch (process.env.NODE_ENV) {
    case 'staging':
        config = require('./config-staging.json');
        break;
    case 'production':
        config = require('./config-prod.json');
        break;
    case 'development':
        config = require('./config-dev.json');
        break;
    default:
        config = require('./config-dev.json');
        process.env.NODE_ENV = 'development';
    break;
}

config.envflag = process.env.NODE_ENV;

module.exports = config;
