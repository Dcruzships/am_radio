const querystring = require('query-string');
const request = require('request');

// Spotify API scopes requested
const scopes = [
  'streaming',
  'user-read-birthdate',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-private',
  'user-read-email',
  'user-library-read',
  'user-library-modify',
];

// Redirect to the Spotify Authorization client
const login = (req, res) => {
  res.redirect(`https://accounts.spotify.com/authorize?${
    querystring.stringify({
      response_type: 'code',
      client_id: process.env.SPOTIFY_CLIENT_ID,
      scope: scopes,
      redirect_uri: process.env.REDIRECT_URI,
    })}`);
};

// Will be called if user gets a token from Spotify
const callback = (req, res) => {
  const code = req.query.code || null;
  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code,
      redirect_uri: process.env.REDIRECT_URI,
      grant_type: 'authorization_code',
    },
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
      ).toString('base64')}`,
    },
    json: true,
  };

  request.post(authOptions, (error, response, body) => {
    const uri = process.env.FRONTEND_URI;
    res.redirect(`${uri}?access_token=${body.access_token}`);
  });
};

module.exports.login = login;
module.exports.callback = callback;
