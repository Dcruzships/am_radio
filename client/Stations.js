const StationList = (props) => {
  if(props.stations.length === 0) {
    return (
      <div className="stationList">
        <h3 className="emptyStations">No Stations yet</h3>
      </div>
    );
  }

  const allStations = props.stations.map (function(station) {
    return(
      <div key={station._id} className="station">
        <img src={station[0].albumArt} alt="/assets/img/radio.png" className="cover" />
        <h3 className="stationName"> Name: {station.name} </h3>
        <h3 className="stationCreator"> Created by: {station.creator} </h3>
      </div>
    );
  });

  return (
    <div className="stationList">
      {allStations}
    </div>
  );
};

const getAllStations = () => {
  sendAjax('GET', '/getAll', null, (data) => {
    ReactDOM.render(
      <StationList stations={data.stations} />, document.querySelector("#window")
    );
  });
}
