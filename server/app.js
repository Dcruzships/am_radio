// import libraries
const path = require('path');
const express = require('express');
const compression = require('compression');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const expressHandlebars = require('express-handlebars');
const url = require('url');
const csrf = require('csurf');

// Redis
const redis = require('redis');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);

const config = require('./config.js');

// We can also grab our port from our config file.
const port = config.connections.http.port;

const dbURL = process.env.MONGODB_URI || 'mongodb://localhost/am_radio';

// Setup mongoose options to use newer functionality
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// Here we have traded out mongoURI for our config.connecctions.mongo
mongoose.connect(config.connections.mongo, mongooseOptions, (err) => {
  if (err) {
    // console.log('Could not connect to database');
    throw err;
  }
});

// Use config file
const redisClient = redis.createClient(config.connections.redis);

// Pull in our routes
const router = require('./router.js');

const app = express();

app.use('/assets', express.static(path.resolve(`${__dirname}/../hosted/`)));
app.use(favicon(`${__dirname} /../hosted/img/favicon.png`));
app.use(compression());
app.use(bodyParser.urlencoded({
  extended: true,
}));

app.use(session({
  key: 'sessionid',
  store: new RedisStore({
    client: redisClient,
  }),
  resave: true,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
  },
}));
app.engine('handlebars', expressHandlebars());
app.set('view engine', 'handlebars');
app.set('views', `${__dirname}/../views`);
app.disable('x-powered-by');
app.use(cookieParser());

app.use(csrf());
app.use((err, req, res, next) => {
  if (err.code !== 'EBADCSRFTOKEN') return next(err);

  console.log('Missing CSRF token');
  return false;
});

router(app);

app.listen(port, (err) => {
  if (err) {
    throw err;
  }
  console.log(`Listening on port ${port}`);
});
