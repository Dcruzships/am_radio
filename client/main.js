let currentStation = 0;
let currentVis = 0;
let spotifyToken;
let userPlaylists;
let userName = "";

const init = () =>
{
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  spotifyToken = urlParams.get('access_token');

  if(!spotifyToken)
  {
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
    fetch('https://api.spotify.com/v1/me', {
      headers: {'Authorization': 'Bearer ' + spotifyToken}
    }).then(response => response.json())
    .then(data => createTopNav(data.display_name));

    fetch('https://api.spotify.com/v1/me/playlists', {
      headers: {'Authorization': 'Bearer ' + spotifyToken}
    }).then(response => response.json())
    .then(playlistData => {
      let playlists = playlistData.items;
      let trackDataPromises = playlists.map(playlist => {
        let responsePromise = fetch(playlist.tracks.href, {
          headers: {'Authorization': 'Bearer ' + spotifyToken}
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

    ReactDOM.render(<LeftNav />, document.querySelector('#leftNav'));
    ReactDOM.render(<BotNav />, document.querySelector('#botNav'));

  }
};

const createTopNav = (data) =>
{
  ReactDOM.render(<TopNav name={data} />, document.querySelector('#topNav'));
}

const createRightNav = (data) =>
{
  ReactDOM.render(<RightNav playlists={data} />, document.querySelector('#rightNav'));
}

$(document).ready(function() {
  init();
});
