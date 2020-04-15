const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
const _ = require('underscore');

let PlaylistModel = {};

// mongoose.Types.ObjectID is a function that
// converts string ID to real mongo ID
const convertId = mongoose.Types.ObjectId;
const setName = (name) => _.escape(name).trim();

// Schema for a playlist
// Holds a tracklist, which is a list of tracks
const PlaylistSchema = new mongoose.Schema({
  playlistName: {
    type: String,
    unique: true,
    required: true,
  },
  tracklist: {
    type: Array,
    required: true,
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Account',
  },
  createdData: {
    type: Date,
    default: Date.now,
  },
});

// Schema for a track, or a song
// Holds a Spotify URL link and other track info
// Also holds enough info to find the corresponding playlist it belongs to
const TrackSchema = new mongoose.Schema({
  trackName: String,
  artist: String,
  album: String,
  link: String,
  playlistOwner: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Account',
  },
  playlistName: {
    type: String,
    required: true,
  },
  addedDate: {
    type: Date,
    default: Date.now,
  },
});

PlaylistSchema.statics.toAPI = (doc) => ({
  name: doc.playlistName,
  owner: doc.owner,
});

TrackSchema.statics.toAPI = (doc) => ({
  name: doc.trackName,
  link: doc.link,
  owner: doc.playlistOwner,
});

PlaylistSchema.statics.findByOwner = (ownerId, callback) => {
  const search = {
    owner: convertId(ownerId),
  };

  return PlaylistModel.find(search).select('playlistName tracklist').lean().exec(callback);
};

PlaylistModel = mongoose.model('Playlist', PlaylistSchema);

module.exports.PlaylistModel = PlaylistModel;
module.exports.PlaylistSchema = PlaylistSchema;
