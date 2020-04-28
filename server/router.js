// import the controller folder (automatically calls the index.js file)
const controllers = require('./controllers');

const router = (app) => {
  app.get('/', controllers.Home.homepage);
  app.post('/create', controllers.Music.createStation);
  app.get('/create', controllers.Music.createStation);
  app.get('/getAll', controllers.Music.getAll);
  app.get('/login', controllers.Spotify.login);
  app.get('/callback', controllers.Spotify.callback);
  app.post('/callback', controllers.Spotify.callback);
  // app.get('/getToken', controllers.Spotify.getToken);
};

module.exports = router;
