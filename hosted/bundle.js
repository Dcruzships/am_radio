"use strict";

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
"use strict";

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
var loaded = false; // Begins app
// Finds a Spotify token from URL sent back
// Initializes default station values for optimal launch experience

var init = function init() {
  var queryString = window.location.search;
  var urlParams = new URLSearchParams(queryString);
  spotifyToken = urlParams.get('access_token');

  if (spotifyToken == null) {
    spotifyToken = getCookie("spotifyToken");
  }

  currentStation = '749';
  lastStation = getCookie("lastStation");

  if (lastStation != 0) {
    currentStation = lastStation;
  } // Checks if a token is found, if not display the login page


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
}; // Fetches data from the Spotify API and displays the main UI
// Gets back Spotify username and playlists


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
  } // Get the username for the top nav


  fetch('https://api.spotify.com/v1/me', {
    headers: {
      'Authorization': "Bearer ".concat(spotifyToken)
    }
  }).then(handleErrors).then(function (response) {
    return response.json();
  }).then(function (data) {
    return createTopNav(data);
  }); // Get the playlists, then load the current station and print
  // the rest of the UI

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
}; // Create the top nav bar


var createTopNav = function createTopNav(data) {
  userID = data.id;
  displayName = data.display_name;
  ReactDOM.render( /*#__PURE__*/React.createElement(TopNav, {
    name: data.display_name
  }), document.querySelector('#topNav'));
}; // Render the bottom nav bar


var createBotNav = function createBotNav(data) {
  ReactDOM.render( /*#__PURE__*/React.createElement(BotNav, {
    text: "Now listening to: " + currentStationName
  }), document.querySelector('#botNav'));
}; // Render the station maker form


var createRightNav = function createRightNav(data) {
  userPlaylists = data;
  ReactDOM.render( /*#__PURE__*/React.createElement(NewStationForm, {
    playlists: data
  }), document.querySelector('#rightNav'));
  loaded = true;
}; // Load a station, display a spotify widget with a saved playlist from the server


var loadStation = function loadStation(stationNum) {
  if (stationNum < 0 || stationNum > 999) {
    document.querySelector("#window").innerHTML = "<h3><span id='errorMessage'>error</span></h3>";
    return;
  }

  currentStation = stationNum;
  lastStation = currentStation;
  var theStation = {
    stationNum: stationNum
  }; // Acts as a get request but also sends the station number to return specific data

  sendAjax('POST', '/getStation', theStation, function (data) {
    if (data.station != null) {
      if (loaded) document.querySelector("#newStationForm").style.visibility = 'hidden';
      appWindow.innerHTML = '';
      currentStationObject = data.station;
      currentStationName = currentStationObject.stationName;
      var url = uriToUrl('https://open.spotify.com/embed/', currentStationObject.spotifyURI);
      var noEmbedURL = uriToUrl('https://open.spotify.com/', currentStationObject.spotifyURI);
      appWindow.innerHTML = "<iframe src=".concat(url, " frameborder=\"0\" allowtransparency=\"true\" allow=\"encrypted-media\"></iframe>");
      if (loaded) document.querySelector("#radioLabel").innerHTML = "<p>Now listening to: <a href=".concat(noEmbedURL, " target='_blank'>").concat(currentStationName, "</a></p>");
    } else {
      if (loaded) document.querySelector("#newStationForm").style.visibility = 'visible';
      appWindow.innerHTML = "<span><p id='errorMessage'>EMPTY STATION</p></span>";
      if (loaded) document.querySelector("#radioLabel").innerHTML = "<p>BLANK STATION: Add one now!</p>";
    }
  });
  return currentStationObject;
}; // Returns a Spotify URL given a URI code


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
});
"use strict";

// This is where users logout and see their information
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
        target: "_blank",
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
}; // A form to collect data about a potential station from a user's Spotify playlists


var NewStationForm = function NewStationForm(props) {
  // To adjust form values
  var handleChange = function handleChange(event) {
    event.value = event.target.value;
    event.target.name = 'spotifyURI';
    document.querySelector("#formStationNum").value = currentStation;
  }; // For the options of the playlist selector


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
}; // Displays a station adjuster and a radio-esque label


var BotNav = function BotNav(props) {
  // Station controls
  var upStation = function upStation(e) {
    loadStation(parseInt(document.querySelector("#stationNum").innerHTML) + 1);
    document.querySelector("#stationNum").innerHTML = currentStation;
  };

  var downStation = function downStation(e) {
    loadStation(parseInt(document.querySelector("#stationNum").innerHTML) - 1);
    document.querySelector("#stationNum").innerHTML = currentStation;
  }; // For the interactable station changer, uses keyboard


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
}; // Called when user submits form, sends data through AJAX to the server


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
