const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
const _ = require('underscore');

let StationModel = {};

// mongoose.Types.ObjectID is a function that
// converts string ID to real mongo ID
const convertId = mongoose.Types.ObjectId;
const setName = (name) => _.escape(name).trim();

const StationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    set: setName,
  },

  creator: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'User',
  },

  createdData: {
    type: Date,
    default: Date.now,
  },

  spotifyURI: {
    type: String,
    required: true,
  },
});

StationSchema.statics.toAPI = (doc) => ({
  name: doc.name,
  age: doc.age,
});

StationSchema.statics.findByCreator = (creatorID, callback) => {
  const search = {
    creator: convertId(creatorID),
  };

  return StationModel.find(search).select('name spotifyURI').lean().exec(callback);
};

StationModel = mongoose.model('Station', StationSchema);

module.exports.StationModel = StationModel;
module.exports.StationSchema = StationSchema;
