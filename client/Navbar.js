// This is where users login, links to account features. Sign in, sign out, create account
const TopNav = (props) =>
{
  let name;

  return(
    <div id="stations">
      <a href="/" id="logo">am_radio</a>
      <img id="prevStation" src="https://img.icons8.com/material-two-tone/48/000000/double-left.png"></img>
      <div id="stationNum">234</div>
      <img id="nextStation" src="https://img.icons8.com/material-two-tone/48/000000/double-right.png"></img>
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
            <select id="playlists" name="playlists"></select>
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
