const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
const _ = require('underscore');

let StationModel = {};

// mongoose.Types.ObjectID is a function that
// converts string ID to real mongo ID
const convertId = mongoose.Types.ObjectId;
const setName = (name) => _.escape(name).trim();

// A station object with a name, number from 0 - 999, spotify URI, and user data
const StationSchema = new mongoose.Schema({
  stationName: {
    type: String,
    required: true,
    trim: true,
    set: setName,
  },

  stationNum: {
    type: Number,
    minimum: 0,
    maximum: 999,
  },

  userID: {
    type: String,
    required: true,
  },

  createdDate: {
    type: Date,
    default: Date.now,
  },

  spotifyURI: {
    type: String,
    required: true,
  },
});

// Readable station info
StationSchema.statics.toAPI = (doc) => ({
  stationName: doc.stationName,
  stationNum: doc.stationNum,
  userID: doc.userID,
  spotifyURI: doc.spotifyURI,
});

// Find a station from a UserID
StationSchema.statics.findByCreator = (userID, callback) => {
  const search = {
    userID: convertId(userID),
  };

  return StationModel.find(search).select('name spotifyURI').lean().exec(callback);
};

// Find a station from a number
StationSchema.statics.findStation = (num, callback) => {
  const search = {
    stationNum: num,
  };

  return StationModel.findOne(search, callback);
};

StationModel = mongoose.model('Station', StationSchema);

module.exports.StationModel = StationModel;
module.exports.StationSchema = StationSchema;
