// const crypto = require('crypto');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

let AccountModel = {};

// Default account data
// Does not get a password = the ULTIMATE password encryption
const AccountSchema = new mongoose.Schema({
  spotifyID: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    match: /^[A-Za-z0-9_\-.]{1,16}$/,
  },
  auth: {
    type: Array,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

// Readable accounts
AccountSchema.statics.toAPI = (doc) => ({
  spotifyID: doc.id,
  auth: doc.auth,
  name: doc.name,
});

// Get an account from the userID
AccountSchema.statics.findByUsername = (id, callback) => {
  const search = {
    spotifyID: id,
  };

  return AccountModel.findOne(search, callback);
};

AccountModel = mongoose.model('Account', AccountSchema);

module.exports.AccountModel = AccountModel;
module.exports.AccountSchema = AccountSchema;
