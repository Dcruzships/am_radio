const models = require('../models');

const { Station } = models;

const getAll = (req, res) => {
  return Station.StationModel.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }

    return res.json({ stations: docs });
  });
};

module.exports.getAll = getAll;
