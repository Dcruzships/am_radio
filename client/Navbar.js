// This is where users login, links to account features. Sign in, sign out, create account
const TopNav = (props) =>
{
  const logout = (e) =>
  {
    document.cookie = 'spotifyToken=';
    spotifyToken = null;
    loaded = false;
  }
  if(props.name == null) {
    return(
      <div id="topNav">
        <a className="topNavLink" href="/" id="logo"><p>am_radio</p></a>
        <a className="topNavLink" href="https://github.com/Dcruzships" id="logo"><p>by brandon dcruz</p></a>
      </div>
    );
  }
  else {
    return(
      <div id="topNav">
        <a className="topNavLink" href="/" id="logo"><p>am_radio</p></a>
        <p className="topNavLink" id="name">Hello {props.name}</p>
        <a className="topNavLink" id="logout" href='/' onClick={logout}><p>logout</p></a>
      </div>
    );
  }
};

const NewStationForm = (props) =>
{
  const handleChange = (event) =>
  {
    event.value = event.target.value;
    event.target.name = 'spotifyURI';
    document.querySelector("#formStationNum").value = currentStation;
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
    optionsArray.unshift(<option key={undefined} value={undefined}>Playlist...</option>);

    return optionsArray;
  }

  return (
    <div>
      <form id="newStationForm"
            name="newStationForm"
            onSubmit={handleNewStation}
            action="/create"
            method="POST"
            className="stationForm rightNavLink"
      >
        <label className='rightNavLink' id="stationLabel">Station</label>
        <input className='rightNavLink' id="stationName" type="text" name="stationName" placeholder="Station Name"/>
        <select className='rightNavLink' name="spotifyURI" id="spotifyURI" onChange={handleChange}>
          {buildOptions()}
        </select>
        <input type="hidden" id="formUserID" name="userID" value={displayName}/>
        <input type="hidden" id="formStationNum" name="stationNum" value={currentStation}/>
        <input className="createStationSubmit rightNavLink" type="submit" value="Create"/>
      </form>
    </div>
  );
};

const BotNav = (props) =>
{
  const upStation = (e) => {
    loadStation(parseInt(document.querySelector("#stationNum").innerHTML) + 1);
    document.querySelector("#stationNum").innerHTML = currentStation;
  };
  const downStation = (e) => {
    loadStation(parseInt(document.querySelector("#stationNum").innerHTML) - 1);
    document.querySelector("#stationNum").innerHTML = currentStation;
  };

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
  };

  return (
    <div id="botNav">
      <div className="botNavLink" id='radioLabel'>
        <p className="botNavLink">{props.text}</p>
      </div>

      <div className="botNavLink" id='stationControls'>
        <img className="botNavLink" id="nextStation" onClick={upStation} src="https://img.icons8.com/material-two-tone/48/000000/double-right.png"></img>
        <div className="botNavLink" id="stationNum" onClick={allowStationChange}>{currentStation}</div>
        <img className="botNavLink" id="prevStation" onClick={downStation} src="https://img.icons8.com/material-two-tone/48/000000/double-left.png"></img>
      </div>
    </div>
  );
};

const handleNewStation = (e) => {
    e.preventDefault();
    document.cookie = `lastStation=${lastStation}`;

    if ($("#stationName").val() == '')
    {
      document.querySelector("#errorMessage").innerHTML = "Error: All fields are required."
      return false;
    }

    sendAjax('POST', $("#newStationForm").attr("action"), $("#newStationForm").serialize(), redirect, function() {
      loadStation();
    });

    return false;
};
