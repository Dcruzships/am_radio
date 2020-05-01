let currentStation = 0;
let currentStationObject;
let currentVis = 0;
let spotifyToken;
let userPlaylists;
let userID = "";
let displayName = "";
let changeStation = false;
let spotifyPlayer;
let appWindow;

const init = () =>
{
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  spotifyToken = urlParams.get('access_token');
  if(spotifyToken == null)
  {
    spotifyToken = getCookie("spotifyToken");
  }

  currentStation = Math.floor(Math.random() * 990);
  currentStation = ('000' + currentStation).substr(-3);
  currentStation = '749';

  if(!spotifyToken)
  {
    document.cookie = 'spotifyToken=';
    spotifyToken = null;

    ReactDOM.render(
        <button id="#loginButton" onClick={(e) =>
          {
            window.location = ('/login');
            isLogged = true;
            e.preventDefault();
            return false;
          }
      }>Login with Spotify</button>, document.querySelector('#window'));
  }
  else
  {
    document.querySelector("#window").innerHTML = "<h3><span id='errorMessage'></span></h3>";
    document.cookie = `spotifyToken=${spotifyToken}`;
    appWindow = document.querySelector("#window");

    makeNav();
    loadStation(currentStation);
    // createWindow();
  }
};

const makeNav = () =>
{
  fetch('https://api.spotify.com/v1/me', {
    headers: {'Authorization': `Bearer ${spotifyToken}`}
  }).then(response => response.json())
  .then(data => createTopNav(data));

  fetch('https://api.spotify.com/v1/me/playlists', {
    headers: {'Authorization': 'Bearer ' + spotifyToken}
  }).then(response => response.json())
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
    }).then(data => createRightNav(data))
    return playlistsPromise;
  });

  // const token = getOAuthTokenForPlayer(spotifyToken);
  // const player = new Spotify.Player({
  //   name: 'Web Playback SDK Quick Start Player',
  //   getOAuthToken: cb => { cb(token); }
  // });

  // Error handling
  // player.addListener('initialization_error', ({ message }) => { console.error(message); });
  // player.addListener('authentication_error', ({ message }) => { console.error(message); });
  // player.addListener('account_error', ({ message }) => { console.error(message); });
  // player.addListener('playback_error', ({ message }) => { console.error(message); });
  //
  // // Playback status updates
  // player.addListener('player_state_changed', state => { console.log(state); });
  //
  // // Ready
  // player.addListener('ready', ({ device_id }) => {
  //   console.log('Ready with Device ID', device_id);
  // });
  //
  // // Not Ready
  // player.addListener('not_ready', ({ device_id }) => {
  //   console.log('Device ID has gone offline', device_id);
  // });
  //
  // // Connect to the player!
  // player.connect();

  // createBotNav();
  ReactDOM.render(<LeftNav />, document.querySelector('#leftNav'));
};

const getOAuthTokenForPlayer = (access_token) => {
  return fetch(`https://api.spotify.com/v1/me/player`, {
    body: JSON.stringify({ device_ids: 'am_radio', play: true }),
    headers: {
      Authorization: `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    },
    method: 'PUT',
  });
};

const createTopNav = (data) =>
{
  if(data.error != undefined)
  {
    document.cookie = 'spotifyToken=';
    spotifyToken = null;
    location.reload();
  }
  userID = data.id;
  displayName = data.display_name;
  ReactDOM.render(<TopNav name={data.display_name} />, document.querySelector('#topNav'));
};

const createRightNav = (data) =>
{
  userPlaylists = data;
  ReactDOM.render(<RightNav playlists={data} />, document.querySelector('#rightNav'));
};

const createBotNav = () =>
{
  // spotifyPlayer.connect().then(success => {
  //   if (success) {
  //     console.log('The Web Playback SDK successfully connected to Spotify!');
  //   }
  // })

  ReactDOM.render(<BotNav />, document.querySelector('#botNav'));
};

const getCookie = (cname) => {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i = 0; i < ca.length; i++) {
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

const loadStation = (stationNum) =>
{
  if(stationNum < 0 || stationNum > 999)
  {
    console.log('error!');
    return;
  }
  console.log(`loading station ${stationNum}`);
  currentStation = stationNum;

  let theStation =
  {
    stationNum: stationNum,
  };

  sendAjax('POST', '/getStation', theStation, (data) =>
  {
    if(data != null)
    {
      appWindow.innerHTML = '';
      currentStationObject = data.station;
      let url = uriToUrl(currentStationObject.spotifyURI);
      appWindow.innerHTML = `<iframe src=${url} width="500" height="500" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>`;
    }
    else
    {
      appWindow.innerHTML = '';
    }

  });
};

const createWindow = (data) => {
  console.log(data);
};

const uriToUrl = (uri) => {
  let finalURL = 'https://open.spotify.com/embed/';
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
