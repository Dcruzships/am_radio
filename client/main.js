let currentStation = 0;
let lastStation = 0;
let currentStationObject;
let currentStationName = '';
let currentVis = 0;
let spotifyToken;
let userPlaylists;
let userID = "";
let displayName = "";
let imageID = "";
let changeStation = false;
let spotifyPlayer;
let appWindow;
let loaded = false;

// Begins app
// Finds a Spotify token from URL sent back
// Initializes default station values for optimal launch experience
const init = () =>
{
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  spotifyToken = urlParams.get('access_token');
  if(spotifyToken == null)
  {
    spotifyToken = getCookie("spotifyToken");
  }

  currentStation = '749';
  lastStation = getCookie("lastStation");
  if(lastStation != 0) { currentStation = lastStation; }

  // Checks if a token is found, if not display the login page
  if(!spotifyToken)
  {
    document.cookie = 'spotifyToken=';
    spotifyToken = null;

    ReactDOM.render(
        <button id="loginButton" onClick={(e) =>
          {
            window.location = ('/login');
            isLogged = true;
            e.preventDefault();
            return false;
          }
      }>Login with Spotify</button>, document.querySelector('#window'));

      ReactDOM.render(<TopNav />, document.querySelector('#topNav'));
  }
  else
  {
    document.querySelector("#window").innerHTML = "<h3><span id='errorMessage'></span></h3>";
    document.cookie = `spotifyToken=${spotifyToken}`;
    appWindow = document.querySelector("#window");

    makeNav();
  }
};

// Fetches data from the Spotify API and displays the main UI
// Gets back Spotify username and playlists
const makeNav = () =>
{
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

  // Get the username for the top nav
  fetch('https://api.spotify.com/v1/me', {
    headers: {'Authorization': `Bearer ${spotifyToken}`}
  }).then(handleErrors).then(response => response.json())
  .then(data => createTopNav(data));

  // Get the playlists, then load the current station and print
  // the rest of the UI
  fetch('https://api.spotify.com/v1/me/playlists', {
    headers: {'Authorization': 'Bearer ' + spotifyToken}
  }).then(handleErrors).then(response => response.json())
  .then(playlistData => {
    let playlists = playlistData.items;
    let trackDataPromises = playlists.map(playlist => {
      let responsePromise = fetch(playlist.tracks.href, {
        headers: {'Authorization': `Bearer ${spotifyToken}`}
      })
      let trackDataPromise = responsePromise
        .then(response => response.json())
      return trackDataPromise
    })
    let allTracksDataPromises =
      Promise.all(trackDataPromises)
    let playlistsPromise = allTracksDataPromises.then(trackDatas => {
      trackDatas.forEach((trackData, i) => {
        playlists[i].trackDatas = trackData.items
          .map(item => item.track)
          .map(trackData => ({
            name: trackData.name,
            duration: trackData.duration_ms / 1000
          }))
      })
      return playlists;
    }).then(data => createRightNav(data)).then(loadStation(currentStation)).then(data => createBotNav(data))
    return playlistsPromise;
  });
};

// Create the top nav bar
const createTopNav = (data) =>
{
  userID = data.id;
  displayName = data.display_name;

  ReactDOM.render(<TopNav name={data.display_name} />, document.querySelector('#topNav'));
};

// Render the bottom nav bar
const createBotNav = (data) =>
{
  ReactDOM.render(<BotNav text={"Now listening to: " + currentStationName} />, document.querySelector('#botNav'));
};

// Render the station maker form
const createRightNav = (data) =>
{
  userPlaylists = data;
  ReactDOM.render(<NewStationForm playlists={data} />, document.querySelector('#rightNav'));
  loaded = true;
};

// Load a station, display a spotify widget with a saved playlist from the server
const loadStation = (stationNum) =>
{
  if(stationNum < 0 || stationNum > 999)
  {
    document.querySelector("#window").innerHTML = "<h3><span id='errorMessage'>error</span></h3>";
    return;
  }
  currentStation = stationNum;
  lastStation = currentStation;

  let theStation =
  {
    stationNum: stationNum,
  };

  // Acts as a get request but also sends the station number to return specific data
  sendAjax('POST', '/getStation', theStation, (data) =>
  {
    if(data.station != null)
    {
      if(loaded) document.querySelector("#newStationForm").style.visibility = 'hidden';
      appWindow.innerHTML = '';
      currentStationObject = data.station;
      currentStationName = currentStationObject.stationName;
      let url = uriToUrl('https://open.spotify.com/embed/', currentStationObject.spotifyURI);
      let noEmbedURL = uriToUrl('https://open.spotify.com/', currentStationObject.spotifyURI);
      appWindow.innerHTML = `<iframe src=${url} frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>`;
      if(loaded) document.querySelector("#radioLabel").innerHTML = `<p>Now listening to: <a href=${noEmbedURL} target='_blank'>${currentStationName}</a></p>`;
    }
    else
    {
      if(loaded) document.querySelector("#newStationForm").style.visibility = 'visible';
      appWindow.innerHTML = `<span><p id='errorMessage'>EMPTY STATION</p></span>`;
      if(loaded) document.querySelector("#radioLabel").innerHTML = `<p>BLANK STATION: Add one now!</p>`;
    }
  });

  return currentStationObject;
};

// Returns a Spotify URL given a URI code
const uriToUrl = (start, uri) => {
  let finalURL = start;
  let split = uri.split(':');
  finalURL += `${split[1]}/${split[2]}`;
  return finalURL;
};

$(document).ready(function()
{
  window.onSpotifyWebPlaybackSDKReady = () => {
    init();
  };
});
