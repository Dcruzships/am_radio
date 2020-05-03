const models = require('../models');

const { Station } = models;

// Creates new station, saves name, number, user, and the spotify URI
const createStation = (req, res) => {
  if (!req.body.stationName || !req.body.spotifyURI) {
    return res.status(400).json({ error: `Both station name and playlist are required. got ${req.body.stationName} and ${req.body.spotifyURI}` });
  }

  const stationData = {
    stationName: req.body.stationName,
    stationNum: req.body.stationNum,
    userID: req.body.userID,
    spotifyURI: req.body.spotifyURI,
  };

  const newStation = new Station.StationModel(stationData);

  const stationPromise = newStation.save();

  stationPromise.then(() => res.json({ redirect: '/' }));

  stationPromise.catch((err) => {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Station already taken.' });
    }

    return res.status(400).json({ error: 'An error occurred' });
  });

  return stationPromise;
};

// Returns a station from the server
const getStation = (req, res) => Station.StationModel.findStation(
  req.body.stationNum, (err, docs) => {
    if (err) {
      return res.status(400).json({ error: 'An error occurred' });
    }

    return res.json({ station: docs });
  },
);

module.exports.getStation = getStation;
module.exports.createStation = createStation;
