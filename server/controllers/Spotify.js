const redirect_uri = `http://localhost:3000/callback`;

const querystring = require("query-string");
const request = require('request');

const models = require('../models');
const { Account } = models;

const scopes = [
  "user-read-currently-playing",
  "user-read-playback-state",
  "user-read-private",
  "user-read-email",
];

const login = (req, res) => {
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: process.env.SPOTIFY_CLIENT_ID,
      scope: scopes,
      redirect_uri
    }));
};

const callback = (req, res) => {
  let code = req.query.code || null
  let authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + (new Buffer(
        process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
      ).toString('base64'))
    },
    json: true
  }

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      // use the access token to access the Spotify Web API
      let token = body.access_token;

      request.post(authOptions, function(error, response, body) {
        let uri = process.env.FRONTEND_URI || 'http://localhost:3000';
        res.redirect(uri + '?access_token=' + token);
      })
    }
  });
};

module.exports.login = login;
module.exports.callback = callback;
