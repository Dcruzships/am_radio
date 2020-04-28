// import libraries
const path = require('path');
const express = require('express');
const compression = require('compression');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const expressHandlebars = require('express-handlebars');
// const csrf = require('csurf');

// Redis
const redis = require('redis');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);

const config = require('./config.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

// Setup mongoose options to use newer functionality
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// Here we have traded out mongoURI for our config.connecctions.mongo
mongoose.connect(config.connections.mongo, mongooseOptions, (err) => {
  if (err) {
    console.log('Could not connect to database');
    throw err;
  }
});

// Use config file
const redisClient = redis.createClient(config.connections.redis);

// pull in our routes
const router = require('./router.js');

const app = express();
app.use('/assets', express.static(path.resolve(`${__dirname}/../hosted/`)));
app.use(favicon(`${__dirname}/../hosted/img/favicon.png`));
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  key: 'sessionid',
  store: new RedisStore({
    client: redisClient,
  }),
  secret: 'Domo Arigato',
  resave: true,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
  },
}));
app.engine('handlebars', expressHandlebars({ defaultLayout: '' }));
app.set('view engine', 'handlebars');
app.set('views', `${__dirname}/../views`);
app.disable('x-powered-by');
app.use(cookieParser());


router(app);

app.listen(port, (err) => {
  if (err) {
    throw err;
  }
  console.log(`Listening on port ${port}`);
});
