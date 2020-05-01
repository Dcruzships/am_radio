// This is where users login, links to account features. Sign in, sign out, create account
const TopNav = (props) =>
{
  const upStation = (e) => { loadStation(parseInt(document.querySelector("#stationNum").innerHTML) + 1) };
  const downStation = (e) => { loadStation(parseInt(document.querySelector("#stationNum").innerHTML) - 1) };

  const allowStationChange = (e) =>
  {
    let stationNumLabel = document.querySelector("#stationNum");
    stationNumLabel.innerHTML = "___";
    stationNumLabel.style.backgroundColor = "yellow";
    let count = 0;
    changeStation = true;

    const checkInput = (e) => {
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
  }

  return(
    <div id="stations">
      <a className="topNavLink" href="/" id="logo">am_radio</a>
      <img className="topNavLink" id="prevStation" onClick={downStation} src="https://img.icons8.com/material-two-tone/48/000000/double-left.png"></img>
      <div className="topNavLink" id="stationNum" onClick={allowStationChange}>{currentStation}</div>
      <img className="topNavLink" id="nextStation" onClick={upStation} src="https://img.icons8.com/material-two-tone/48/000000/double-right.png"></img>
      <p className="topNavLink" id="name">Hello {props.name}</p>
    </div>
  );
};

const LeftNav = () =>
{
  return (
    <div id="stations">
      <ul>
        <li><a href="/all" class="leftNavButts">All</a></li>
        <li><a href="/mine" class="leftNavButts">Mine</a></li>
        <li><a href="/station" class="leftNavButts">Station</a></li>
      </ul>
      <div id="album"></div>
    </div>
  );
};

const RightNav = (props) =>
{
  const handleChange = (event) =>
  {
    event.value = event.target.value;
    event.target.name = 'spotifyURI';
  }

  const buildOptions = () =>
  {
    let playlistNames = [];
    let playlistIDs = [];
    let optionsArray = [];

    for(let i = 0; i < props.playlists.length; i++)
    {
      playlistNames.push(props.playlists[i].name);
      playlistIDs.push(props.playlists[i].uri);
      optionsArray.push(<option key={playlistNames[i]} value={playlistIDs[i]}>{playlistNames[i]}</option>);
    }
    optionsArray.unshift(<option key={undefined} value={undefined}>...</option>);

    return optionsArray;
  }

  return (
    <div>
      <ul>
        <form id="newStationForm"
              name="newStationForm"
              onSubmit={handleNewStation}
              action="/create"
              method="POST"
              className="stationForm"
        >
          <label id="stationLabel">Station Name: </label>
          <input id="stationName" type="text" name="stationName" placeholder="My Radio 101"/>
          <label id="playlistLabel">Playlist: </label>
            <select name="spotifyURI" id="spotifyURI" onChange={handleChange}>
              {buildOptions()}
            </select>
          <input type="hidden" id="userID" name="userID" value={userID}/>
          <input type="hidden" id="stationNum" name="stationNum" value={currentStation}/>
          <input className="createStationSubmit" type="submit" value="Create Station"/>
        </form>
      </ul>
    </div>
  );
};

const BotNav = (props) =>
{
  return (
    <div id="audioControls">
      <img src="https://img.icons8.com/wired/64/000000/play-button-circled.png"/>
      <img src="https://img.icons8.com/cotton/64/000000/circled-pause.png"/>
    </div>
  );
};

const handleNewStation = (e) => {
    e.preventDefault();

    if ($("#stationName").val() == '')
    {
      console.log("missing name");
      return false;
    }

    // console.log($("#newStationForm").serialize());

    sendAjax('POST', $("#newStationForm").attr("action"), $("#newStationForm").serialize(), redirect, function() {
      loadStation();
    });

    return false;
};
