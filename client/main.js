const init = () =>
{
  ReactDOM.render(<TopNav />, document.querySelector('#topNav'));
  // getAllStations();
};

$(document).ready(function() {
  init();
});
