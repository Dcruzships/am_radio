/* This is our config file. Essentially what this file will do is
 * serve as our interface between our .env file (in the root directory)
 * and the rest of our code base. We will export configurations based
 * on our current environment from this file for others to use.
 */

require('dotenv').config();
const url = require('url');

const env = process.env.NODE_ENV;

let redisConfig = {};
if (process.env.REDISCLOUD_URL) {
  let parsed = url.parse(process.env.REDISCLOUD_URL);
  redisConfig.host = parsed.hostname;
  redisConfig.port = parsed.port;
  redisConfig.password = parsed.auth.split(':')[1];
} else {
  redisConfig.host = process.env.REDIS_HOST;
  redisConfig.port = process.env.REDIS_PORT;
  redisConfig.password = process.env.REDIS_PASS;
}

const connections = {
  http: {
    port: process.env.PORT || process.env.NODE_PORT || 3000,
  },
  mongo: process.env.MONGODB_URI || 'mongodb://localhost/am_radio',
  redis: redisConfig,
};

const get = () => ({
  env,
  connections: connections,
});

module.exports = get();
