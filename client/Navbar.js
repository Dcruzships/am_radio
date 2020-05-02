// This is where users login, links to account features. Sign in, sign out, create account
const TopNav = (props) =>
{
  return(
    <div id="topNav">
      <a className="topNavLink" href="/" id="logo">am_radio</a>
      <p className="topNavLink" id="name">Hello {props.name}</p>
    </div>
  );
};

const LeftNav = () =>
{
  return (
    <div id="leftNav">
    </div>
  );
  //
  // <ul>
  //   <li><a href="/all" className="leftNavLink">All</a></li>
  //   <li><a href="/mine" className="leftNavLink">Mine</a></li>
  //   <li><a href="/station" className="leftNavLink">Station</a></li>
  // </ul>
  // <div id="album"></div>
};

const RightNav = (props) =>
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
    optionsArray.unshift(<option key={undefined} value={undefined}>...</option>);

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
        <label className='rightNavLink' id="stationLabel">Station Name: </label>
        <input className='rightNavLink' id="stationName" type="text" name="stationName" placeholder="My Radio 101"/>
        <label className='rightNavLink' id="playlistLabel">Playlist: </label>
          <select className='rightNavLink' name="spotifyURI" id="spotifyURI" onChange={handleChange}>
            {buildOptions()}
          </select>
        <input type="hidden" id="formUserID" name="userID" value={userID}/>
        <input type="hidden" id="formStationNum" name="stationNum" value={currentStation}/>
        <input className="createStationSubmit rightNavLink" type="submit" value="Create Station"/>
      </form>
    </div>
  );
};

const BotNav = () =>
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
    <div className="botNavLink" id='stationControls'>
      <img className="botNavLink" id="nextStation" onClick={upStation} src="https://img.icons8.com/material-two-tone/48/000000/double-right.png"></img>
      <div className="botNavLink" id="stationNum" onClick={allowStationChange}>{currentStation}</div>
      <img className="botNavLink" id="prevStation" onClick={downStation} src="https://img.icons8.com/material-two-tone/48/000000/double-left.png"></img>
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
