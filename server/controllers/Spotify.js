const querystring = require('query-string');
const request = require('request');

const scopes = [
  'user-read-currently-playing',
  'user-read-playback-state',
  'user-read-private',
  'user-read-email',
];

const login = (req, res) => {
  res.redirect(`https://accounts.spotify.com/authorize?${
    querystring.stringify({
      response_type: 'code',
      client_id: process.env.SPOTIFY_CLIENT_ID,
      scope: scopes,
      redirect_uri: `${process.env.FRONTEND_URI}/callback`,
    })}`);
};

const callback = (req, res) => {
  const code = req.query.code || null;
  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code,
      redirect_uri: `${process.env.FRONTEND_URI}/callback`,
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
    const uri = `${process.env.FRONTEND_URI}` || `https://localhost:3000`;
    res.redirect(`${uri}?access_token=${body.access_token}`);
  });
};

module.exports.login = login;
module.exports.callback = callback;
