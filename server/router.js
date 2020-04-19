// import the controller folder (automatically calls the index.js file)
const controllers = require('./controllers');

const router = (app) => {
  app.get('/', controllers.Home.homepage);
  app.get('/getAll', controllers.Music.getAll);
};

module.exports = router;
