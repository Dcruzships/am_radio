// This is where users login, links to account features. Sign in, sign out, create account
const TopNav = (props) =>
{
  return(
    <div id="stations">
      <a className="topNavLink" href="/" id="logo">am_radio</a>
      <img className="topNavLink" id="prevStation" src="https://img.icons8.com/material-two-tone/48/000000/double-left.png"></img>
      <div className="topNavLink" id="stationNum">234</div>
      <img className="topNavLink" id="nextStation" src="https://img.icons8.com/material-two-tone/48/000000/double-right.png"></img>
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
  const buildOptions = () =>
  {
    let playlistNames = [];
    let playlistIDs = [];
    let optionsArray = [];

    for(let i = 0; i < props.playlists.length; i++)
    {
      playlistNames.push(props.playlists[i].name);
      playlistIDs.push(props.playlists[i].name);

      optionsArray.push(<option key={playlistIDs[i]} value={playlistNames[i]}>{playlistIDs[i]}</option>);
    }

    // for (let i = 1; i <= 10; i++) {
    //     arr.push(<option key={i} value="{i}">{i}</option>)
    // }
    // {props.playlists.map((x) => <option key={y}>{x}</option>)}
    return optionsArray;
  }
  return (
    <div id="newStationForm">
      <ul>
        <form id="newStationForm" name="newStationForm"
        onSubmit={handleNewStation}
        action="/NewStation"
        method="POST"
        className="mainForm">
          <label htmlFor="stationName">Station Name: </label>
          <input id="stationName" type="text" name="stationName" placeholder="My Radio 101"/>
          <label htmlFor="playlist">Playlist: </label>
            <select>
              {buildOptions()}
            </select>;
          <input className="formSubmit" type="submit" value="Create Station" />
        </form>
      </ul>
    </div>
  );
};

const BotNav = () =>
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

    $("#domoMessage").animate({width:'hide'}, 350);

    if ($("#stationName").val() == '') {
      handleError("Missing station name!");
      return false;
    }

    sendAjax('POST', $("#newStationForm").attr("action"), $("#newStationForm").serialize(), redirect);

    return false;
};
