"use strict";

var _this = void 0;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var handleError = function handleError(message) {
  $("#errorMessage").text(message);
  $("#domoMessage").animate({
    width: 'toggle'
  }, 350);
};

var redirect = function redirect(response) {
  $("#domoMessage").animate({
    width: 'hide'
  }, 350);
  window.location = response.redirect;
};

var sendAjax = function sendAjax(type, action, data, success) {
  $.ajax({
    cache: false,
    type: type,
    url: action,
    data: data,
    dataType: "json",
    success: success,
    error: function error(xhr, status, _error) {
      var messageObj = JSON.parse(xhr.responseText);
      handleError(messageObj.error);
    }
  });
};

var currentStation = 0;
var currentVis = 0;
var spotifyToken;
var userPlaylists;
var userName = "";

var init = function init() {
  var queryString = window.location.search;
  var urlParams = new URLSearchParams(queryString);
  spotifyToken = urlParams.get('access_token');

  if (!spotifyToken) {
    ReactDOM.render( /*#__PURE__*/React.createElement("button", {
      id: "#loginButton",
      onClick: function onClick(e) {
        window.location = '/login';
        isLogged = true;
        e.preventDefault();
        return false;
      }
    }, "Login with Spotify"), document.querySelector('#window'));
  } else {
    fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': 'Bearer ' + spotifyToken
      }
    }).then(function (response) {
      return response.json();
    }).then(function (data) {
      return createTopNav(data.display_name);
    });
    fetch('https://api.spotify.com/v1/me/playlists', {
      headers: {
        'Authorization': 'Bearer ' + spotifyToken
      }
    }).then(function (response) {
      return response.json();
    }).then(function (playlistData) {
      var playlists = playlistData.items;
      var trackDataPromises = playlists.map(function (playlist) {
        var responsePromise = fetch(playlist.tracks.href, {
          headers: {
            'Authorization': 'Bearer ' + spotifyToken
          }
        });
        var trackDataPromise = responsePromise.then(function (response) {
          return response.json();
        });
        return trackDataPromise;
      });
      var allTracksDataPromises = Promise.all(trackDataPromises);
      var playlistsPromise = allTracksDataPromises.then(function (trackDatas) {
        trackDatas.forEach(function (trackData, i) {
          playlists[i].trackDatas = trackData.items.map(function (item) {
            return item.track;
          }).map(function (trackData) {
            return {
              name: trackData.name,
              duration: trackData.duration_ms / 1000
            };
          });
        });
        return playlists;
      }).then(function (data) {
        return createRightNav(data);
      });
      return playlistsPromise;
    });
    ReactDOM.render( /*#__PURE__*/React.createElement(LeftNav, null), document.querySelector('#leftNav'));
    ReactDOM.render( /*#__PURE__*/React.createElement(BotNav, null), document.querySelector('#botNav'));
  }
};

var createTopNav = function createTopNav(data) {
  ReactDOM.render( /*#__PURE__*/React.createElement(TopNav, {
    name: data
  }), document.querySelector('#topNav'));
};

var createRightNav = function createRightNav(data) {
  ReactDOM.render( /*#__PURE__*/React.createElement(RightNav, {
    playlists: data
  }), document.querySelector('#rightNav'));
};

$(document).ready(function () {
  init();
}); // This is where users login, links to account features. Sign in, sign out, create account

var TopNav = function TopNav(props) {
  return (/*#__PURE__*/React.createElement("div", {
      id: "stations"
    }, /*#__PURE__*/React.createElement("a", {
      className: "topNavLink",
      href: "/",
      id: "logo"
    }, "am_radio"), /*#__PURE__*/React.createElement("img", {
      className: "topNavLink",
      id: "prevStation",
      src: "https://img.icons8.com/material-two-tone/48/000000/double-left.png"
    }), /*#__PURE__*/React.createElement("div", {
      className: "topNavLink",
      id: "stationNum"
    }, "234"), /*#__PURE__*/React.createElement("img", {
      className: "topNavLink",
      id: "nextStation",
      src: "https://img.icons8.com/material-two-tone/48/000000/double-right.png"
    }), /*#__PURE__*/React.createElement("p", {
      className: "topNavLink",
      id: "name"
    }, "Hello ", props.name))
  );
};

var LeftNav = function LeftNav() {
  return (/*#__PURE__*/React.createElement("div", {
      id: "stations"
    }, /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
      href: "/all",
      "class": "leftNavButts"
    }, "All")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
      href: "/mine",
      "class": "leftNavButts"
    }, "Mine")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
      href: "/station",
      "class": "leftNavButts"
    }, "Station"))), /*#__PURE__*/React.createElement("div", {
      id: "album"
    }))
  );
};

var RightNav = function RightNav(props) {
  var buildOptions = function buildOptions() {
    var playlistNames = [];
    var playlistIDs = [];
    var optionsArray = [];

    for (var i = 0; i < props.playlists.length; i++) {
      playlistNames.push(props.playlists[i].name);
      playlistIDs.push(props.playlists[i].name);
      optionsArray.push( /*#__PURE__*/React.createElement("option", {
        key: playlistIDs[i],
        value: playlistNames[i]
      }, playlistIDs[i]));
    } // for (let i = 1; i <= 10; i++) {
    //     arr.push(<option key={i} value="{i}">{i}</option>)
    // }
    // {props.playlists.map((x) => <option key={y}>{x}</option>)}


    return optionsArray;
  };

  return (/*#__PURE__*/React.createElement("div", {
      id: "newStationForm"
    }, /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("form", {
      id: "newStationForm",
      name: "newStationForm",
      onSubmit: handleNewStation,
      action: "/NewStation",
      method: "POST",
      className: "mainForm"
    }, /*#__PURE__*/React.createElement("label", {
      htmlFor: "stationName"
    }, "Station Name: "), /*#__PURE__*/React.createElement("input", {
      id: "stationName",
      type: "text",
      name: "stationName",
      placeholder: "My Radio 101"
    }), /*#__PURE__*/React.createElement("label", {
      htmlFor: "playlist"
    }, "Playlist: "), /*#__PURE__*/React.createElement("select", null, buildOptions()), ";", /*#__PURE__*/React.createElement("input", {
      className: "formSubmit",
      type: "submit",
      value: "Create Station"
    }))))
  );
};

var BotNav = function BotNav() {
  return (/*#__PURE__*/React.createElement("div", {
      id: "audioControls"
    }, /*#__PURE__*/React.createElement("img", {
      src: "https://img.icons8.com/wired/64/000000/play-button-circled.png"
    }), /*#__PURE__*/React.createElement("img", {
      src: "https://img.icons8.com/cotton/64/000000/circled-pause.png"
    }))
  );
};

var handleNewStation = function handleNewStation(e) {
  e.preventDefault();
  $("#domoMessage").animate({
    width: 'hide'
  }, 350);

  if ($("#stationName").val() == '') {
    handleError("Missing station name!");
    return false;
  }

  sendAjax('POST', $("#newStationForm").attr("action"), $("#newStationForm").serialize(), redirect);
  return false;
};

var StationList = function StationList(props) {
  if (props.stations.length === 0) {
    return (/*#__PURE__*/React.createElement("div", {
        className: "stationList"
      }, /*#__PURE__*/React.createElement("h3", {
        className: "emptyStations"
      }, "No Stations yet"))
    );
  }

  var allStations = props.stations.map(function (station) {
    return (/*#__PURE__*/React.createElement("div", {
        key: station._id,
        className: "station"
      }, /*#__PURE__*/React.createElement("img", {
        src: station[0].albumArt,
        alt: "/assets/img/radio.png",
        className: "cover"
      }), /*#__PURE__*/React.createElement("h3", {
        className: "stationName"
      }, " Name: ", station.name, " "), /*#__PURE__*/React.createElement("h3", {
        className: "stationCreator"
      }, " Created by: ", station.creator, " "))
    );
  });
  return (/*#__PURE__*/React.createElement("div", {
      className: "stationList"
    }, allStations)
  );
};

var getAllStations = function getAllStations() {
  sendAjax('GET', '/getAll', null, function (data) {
    ReactDOM.render( /*#__PURE__*/React.createElement(StationList, {
      stations: data.stations
    }), document.querySelector("#window"));
  });
};

var PlaylistCounter = function PlaylistCounter() {
  return (/*#__PURE__*/React.createElement("div", {
      style: {
        width: "40%",
        display: 'inline-block'
      }
    }, /*#__PURE__*/React.createElement("h2", null, _this.props.playlists.length, " playlists"))
  );
};

var HoursCounter = function HoursCounter() {
  var allSongs = _this.props.playlists.reduce(function (songs, eachPlaylist) {
    return songs.concat(eachPlaylist.songs);
  }, []);

  var totalDuration = allSongs.reduce(function (sum, eachSong) {
    return sum + eachSong.duration;
  }, 0);
  return (/*#__PURE__*/React.createElement("div", {
      style: _objectSpread({}, defaultStyle, {
        width: "40%",
        display: 'inline-block'
      })
    }, /*#__PURE__*/React.createElement("h2", null, Math.round(totalDuration / 60), " hours"))
  );
};

var Filter = function Filter() {
  return (/*#__PURE__*/React.createElement("div", {
      style: defaultStyle
    }, /*#__PURE__*/React.createElement("img", null), /*#__PURE__*/React.createElement("input", {
      type: "text",
      onKeyUp: function onKeyUp(event) {
        return _this.props.onTextChange(event.target.value);
      }
    }))
  );
};

var Playlist = function Playlist() {
  var playlist = _this.props.playlist;
  return (/*#__PURE__*/React.createElement("div", {
      style: _objectSpread({}, defaultStyle, {
        display: 'inline-block',
        width: "25%"
      })
    }, /*#__PURE__*/React.createElement("img", {
      src: playlist.imageUrl,
      style: {
        width: '60px'
      }
    }), /*#__PURE__*/React.createElement("h3", null, playlist.name), /*#__PURE__*/React.createElement("ul", null, playlist.songs.map(function (song) {
      return (/*#__PURE__*/React.createElement("li", null, song.name)
      );
    })))
  );
};