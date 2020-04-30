const models = require('../models');

const { Station } = models;

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
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Station already taken.' });
    }

    return res.status(400).json({ error: 'An error occurred' });
  });

  return stationPromise;
};

const getAll = (req, res) => Station.StationModel.findByOwner(
  req.session.account._id, (err, docs) => {
    if (err) {
      // console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }

    return res.json({ stations: docs });
  },
);

module.exports.getAll = getAll;
module.exports.createStation = createStation;
