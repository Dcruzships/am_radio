const models = require('../models');

const { Station } = models;

const createStation = (req, res) => {
  if (!req.body.stationName || !req.body.playlistID) {
    return res.status(400).json({ error: `Both station name and playlist are required. got ${req.body.stationName} and ${req.body.playlistID}` });
  }

  const stationData = {
    name: req.body.stationName,
    num: req.body.stationNum,
    creator: req.body.user,
    spotifyURI: req.body.playlistID,
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
