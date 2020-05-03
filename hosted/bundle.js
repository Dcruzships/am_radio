"use strict";

var _this = void 0;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var handleError = function handleError(message) {
  $("#errorMessage").text(message);
};

var redirect = function redirect(response) {
  // $("#domoMessage").animate({width: 'hide'}, 350);
  window.location = response.redirect;
};

var getCookie = function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');

  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];

    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }

    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }

  return "";
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
      var messageObj = JSON.parse(xhr.responseText); // console.log(messageObj);
    }
  });
};

var currentStation = 0;
var lastStation = 0;
var currentStationObject;
var currentStationName = '';
var currentVis = 0;
var spotifyToken;
var userPlaylists;
var userID = "";
var displayName = "";
var imageID = "";
var changeStation = false;
var spotifyPlayer;
var appWindow;
var loaded = false;

var init = function init() {
  var queryString = window.location.search;
  var urlParams = new URLSearchParams(queryString);
  spotifyToken = urlParams.get('access_token');

  if (spotifyToken == null) {
    spotifyToken = getCookie("spotifyToken");
  } // currentStation = Math.floor(Math.random() * 990);
  // currentStation = ('000' + currentStation).substr(-3);


  currentStation = '749';
  lastStation = getCookie("lastStation");

  if (lastStation != 0) {
    currentStation = lastStation;
  }

  if (!spotifyToken) {
    document.cookie = 'spotifyToken=';
    spotifyToken = null;
    ReactDOM.render( /*#__PURE__*/React.createElement("button", {
      id: "loginButton",
      onClick: function onClick(e) {
        window.location = '/login';
        isLogged = true;
        e.preventDefault();
        return false;
      }
    }, "Login with Spotify"), document.querySelector('#window'));
    ReactDOM.render( /*#__PURE__*/React.createElement(TopNav, null), document.querySelector('#topNav'));
  } else {
    document.querySelector("#window").innerHTML = "<h3><span id='errorMessage'></span></h3>";
    document.cookie = "spotifyToken=".concat(spotifyToken);
    appWindow = document.querySelector("#window");
    makeNav();
  }
};

var makeNav = function makeNav() {
  function handleErrors(response) {
    if (!response.ok) {
      throw Error(response.statusText);
      document.cookie = 'spotifyToken=';
      spotifyToken = null;
      window.location = '/';
    }

    return response;
  }

  function checkLoaded() {
    loaded = true;
    return loaded;
  }

  fetch('https://api.spotify.com/v1/me', {
    headers: {
      'Authorization': "Bearer ".concat(spotifyToken)
    }
  }).then(handleErrors).then(function (response) {
    return response.json();
  }).then(function (data) {
    return createTopNav(data);
  });
  fetch('https://api.spotify.com/v1/me/playlists', {
    headers: {
      'Authorization': 'Bearer ' + spotifyToken
    }
  }).then(handleErrors).then(function (response) {
    return response.json();
  }).then(function (playlistData) {
    var playlists = playlistData.items;
    var trackDataPromises = playlists.map(function (playlist) {
      var responsePromise = fetch(playlist.tracks.href, {
        headers: {
          'Authorization': "Bearer ".concat(spotifyToken)
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
    }).then(loadStation(currentStation)).then(function (data) {
      return createBotNav(data);
    });
    return playlistsPromise;
  });
};

var createTopNav = function createTopNav(data) {
  userID = data.id;
  displayName = data.display_name;
  ReactDOM.render( /*#__PURE__*/React.createElement(TopNav, {
    name: data.display_name
  }), document.querySelector('#topNav'));
};

var createBotNav = function createBotNav(data) {
  ReactDOM.render( /*#__PURE__*/React.createElement(BotNav, {
    text: "Now listening to: " + currentStationName
  }), document.querySelector('#botNav'));
};

var createRightNav = function createRightNav(data) {
  userPlaylists = data;
  ReactDOM.render( /*#__PURE__*/React.createElement(NewStationForm, {
    playlists: data
  }), document.querySelector('#rightNav'));
  loaded = true;
};

var loadStation = function loadStation(stationNum) {
  if (stationNum < 0 || stationNum > 999) {
    document.querySelector("#window").innerHTML = "<h3><span id='errorMessage'>error</span></h3>";
    return;
  }

  currentStation = stationNum;
  lastStation = currentStation;
  var theStation = {
    stationNum: stationNum
  };
  sendAjax('POST', '/getStation', theStation, function (data) {
    if (data.station != null) {
      if (loaded) document.querySelector("#newStationForm").style.visibility = 'hidden';
      appWindow.innerHTML = '';
      currentStationObject = data.station;
      currentStationName = currentStationObject.stationName;
      var url = uriToUrl('https://open.spotify.com/embed/', currentStationObject.spotifyURI);
      var noEmbedURL = uriToUrl('https://open.spotify.com/', currentStationObject.spotifyURI);
      appWindow.innerHTML = "<iframe src=".concat(url, " frameborder=\"0\" allowtransparency=\"true\" allow=\"encrypted-media\"></iframe>");
      if (loaded) document.querySelector("#radioLabel").innerHTML = "<p>Now listening to: <a href=".concat(noEmbedURL, ">").concat(currentStationName, "</a></p>");
    } else {
      if (loaded) document.querySelector("#newStationForm").style.visibility = 'visible';
      appWindow.innerHTML = "<span><p id='errorMessage'>EMPTY STATION</p></span>";
      if (loaded) document.querySelector("#radioLabel").innerHTML = "<p>BLANK STATION: Add one now!</p>";
    }
  });
  return currentStationObject;
};

var uriToUrl = function uriToUrl(start, uri) {
  var finalURL = start;
  var split = uri.split(':');
  finalURL += "".concat(split[1], "/").concat(split[2]);
  return finalURL;
};

$(document).ready(function () {
  window.onSpotifyWebPlaybackSDKReady = function () {
    init();
  };
}); // This is where users login, links to account features. Sign in, sign out, create account

var TopNav = function TopNav(props) {
  var logout = function logout(e) {
    document.cookie = 'spotifyToken=';
    spotifyToken = null;
    loaded = false;
  };

  if (props.name == null) {
    return (/*#__PURE__*/React.createElement("div", {
        id: "topNav"
      }, /*#__PURE__*/React.createElement("a", {
        className: "topNavLink",
        href: "/",
        id: "logo"
      }, /*#__PURE__*/React.createElement("p", null, "am_radio")), /*#__PURE__*/React.createElement("a", {
        className: "topNavLink",
        href: "https://github.com/Dcruzships",
        id: "logo"
      }, /*#__PURE__*/React.createElement("p", null, "by brandon dcruz")))
    );
  } else {
    return (/*#__PURE__*/React.createElement("div", {
        id: "topNav"
      }, /*#__PURE__*/React.createElement("a", {
        className: "topNavLink",
        href: "/",
        id: "logo"
      }, /*#__PURE__*/React.createElement("p", null, "am_radio")), /*#__PURE__*/React.createElement("p", {
        className: "topNavLink",
        id: "name"
      }, "Hello ", props.name), /*#__PURE__*/React.createElement("a", {
        className: "topNavLink",
        id: "logout",
        href: "/",
        onClick: logout
      }, /*#__PURE__*/React.createElement("p", null, "logout")))
    );
  }
};

var NewStationForm = function NewStationForm(props) {
  var handleChange = function handleChange(event) {
    event.value = event.target.value;
    event.target.name = 'spotifyURI';
    document.querySelector("#formStationNum").value = currentStation;
  };

  var buildOptions = function buildOptions() {
    var playlistNames = [];
    var playlistIDs = [];
    var optionsArray = [];

    for (var i = 0; i < props.playlists.length; i++) {
      playlistNames.push(props.playlists[i].name);
      playlistIDs.push(props.playlists[i].uri);
      optionsArray.push( /*#__PURE__*/React.createElement("option", {
        key: playlistNames[i],
        value: playlistIDs[i]
      }, playlistNames[i]));
    }

    optionsArray.unshift( /*#__PURE__*/React.createElement("option", {
      key: undefined,
      value: undefined
    }, "Playlist..."));
    return optionsArray;
  };

  return (/*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("form", {
      id: "newStationForm",
      name: "newStationForm",
      onSubmit: handleNewStation,
      action: "/create",
      method: "POST",
      className: "stationForm rightNavLink"
    }, /*#__PURE__*/React.createElement("label", {
      className: "rightNavLink",
      id: "stationLabel"
    }, "Station"), /*#__PURE__*/React.createElement("input", {
      className: "rightNavLink",
      id: "stationName",
      type: "text",
      name: "stationName",
      placeholder: "Station Name"
    }), /*#__PURE__*/React.createElement("select", {
      className: "rightNavLink",
      name: "spotifyURI",
      id: "spotifyURI",
      onChange: handleChange
    }, buildOptions()), /*#__PURE__*/React.createElement("input", {
      type: "hidden",
      id: "formUserID",
      name: "userID",
      value: displayName
    }), /*#__PURE__*/React.createElement("input", {
      type: "hidden",
      id: "formStationNum",
      name: "stationNum",
      value: currentStation
    }), /*#__PURE__*/React.createElement("input", {
      className: "createStationSubmit rightNavLink",
      type: "submit",
      value: "Create"
    })))
  );
};

var BotNav = function BotNav(props) {
  var upStation = function upStation(e) {
    loadStation(parseInt(document.querySelector("#stationNum").innerHTML) + 1);
    document.querySelector("#stationNum").innerHTML = currentStation;
  };

  var downStation = function downStation(e) {
    loadStation(parseInt(document.querySelector("#stationNum").innerHTML) - 1);
    document.querySelector("#stationNum").innerHTML = currentStation;
  };

  var allowStationChange = function allowStationChange(e) {
    var stationNumLabel = document.querySelector("#stationNum");
    stationNumLabel.innerHTML = "___";
    stationNumLabel.style.backgroundColor = "yellow";
    var count = 0;
    changeStation = true;

    var checkInput = function checkInput(e) {
      if (isFinite(e.key) && changeStation) {
        if (count == 0) stationNumLabel.innerHTML = "";
        stationNumLabel.innerHTML += e.key;
        count++;

        if (count == 3) {
          changeStation = false;
          loadStation(stationNumLabel.innerHTML);
          stationNumLabel.style.backgroundColor = "white";
          document.removeEventListener('keyup', checkInput);
          return;
        }
      }
    };

    document.addEventListener('keyup', checkInput);
  };

  return (/*#__PURE__*/React.createElement("div", {
      id: "botNav"
    }, /*#__PURE__*/React.createElement("div", {
      className: "botNavLink",
      id: "radioLabel"
    }, /*#__PURE__*/React.createElement("p", {
      className: "botNavLink"
    }, props.text)), /*#__PURE__*/React.createElement("div", {
      className: "botNavLink",
      id: "stationControls"
    }, /*#__PURE__*/React.createElement("img", {
      className: "botNavLink",
      id: "nextStation",
      onClick: upStation,
      src: "https://img.icons8.com/material-two-tone/48/000000/double-right.png"
    }), /*#__PURE__*/React.createElement("div", {
      className: "botNavLink",
      id: "stationNum",
      onClick: allowStationChange
    }, currentStation), /*#__PURE__*/React.createElement("img", {
      className: "botNavLink",
      id: "prevStation",
      onClick: downStation,
      src: "https://img.icons8.com/material-two-tone/48/000000/double-left.png"
    })))
  );
};

var handleNewStation = function handleNewStation(e) {
  e.preventDefault();
  document.cookie = "lastStation=".concat(lastStation);

  if ($("#stationName").val() == '') {
    document.querySelector("#errorMessage").innerHTML = "Error: All fields are required.";
    return false;
  }

  sendAjax('POST', $("#newStationForm").attr("action"), $("#newStationForm").serialize(), redirect, function () {
    loadStation();
  });
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