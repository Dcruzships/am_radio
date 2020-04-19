"use strict";

var handleError = function handleError(message) {
  $("#errorMessage").text(message);
  $("#domoMessage").animate({
    width: 'toggle'
  }, 350);
};

var redirect = function redirect(response) {
  $("#domoMessage").animate({
    width: 'hide'
  }, 350);
  window.location = response.redirect;
};

var sendAjax = function sendAjax(type, action, data, success) {
  $.ajax({
    cache: false,
    type: type,
    url: action,
    data: data,
    dataType: "json",
    success: success,
    error: function error(xhr, status, _error) {
      var messageObj = JSON.parse(xhr.responseText);
      handleError(messageObj.error);
    }
  });
};

var init = function init() {
  ReactDOM.render( /*#__PURE__*/React.createElement(TopNav, null), document.querySelector('#topNav')); // getAllStations();
};

$(document).ready(function () {
  init();
}); // This is where users login, links to account features. Sign in, sign out, create account

var TopNav = function TopNav() {
  return (/*#__PURE__*/React.createElement("div", {
      id: "topNav"
    }, /*#__PURE__*/React.createElement(Logo, null), /*#__PURE__*/React.createElement(LoginPanel, null))
  );
};

var Logo = function Logo() {
  return (/*#__PURE__*/React.createElement("a", {
      href: "/",
      id: "logo"
    }, "am_radio")
  );
};

var LoginPanel = function LoginPanel() {
  return (/*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", {
      className: "navlink"
    }, /*#__PURE__*/React.createElement("input", {
      id: "user",
      type: "text",
      name: "username",
      placeholder: "username"
    })), /*#__PURE__*/React.createElement("li", {
      className: "navLink"
    }, /*#__PURE__*/React.createElement("input", {
      id: "pass",
      type: "password",
      name: "pass",
      placeholder: "password"
    })), /*#__PURE__*/React.createElement("li", {
      className: "navlink"
    }, /*#__PURE__*/React.createElement("a", {
      id: "loginButton",
      href: "/login"
    }, "Login")), /*#__PURE__*/React.createElement("li", {
      className: "navlink"
    }, /*#__PURE__*/React.createElement("a", {
      id: "signupButton",
      href: "/signup"
    }, "Sign up")))
  );
};

var LogoutPanel = function LogoutPanel(props) {
  return (/*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", null, "Welcome ", props.username, "! "), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", {
      className: "navlink"
    }, /*#__PURE__*/React.createElement("a", {
      href: "/logout"
    }, "Log out"))))
  );
};

var SignupWindow = function SignupWindow(props) {
  return (/*#__PURE__*/React.createElement("form", {
      id: "signupForm",
      name: "signupForm",
      onSubmit: handleSignup,
      action: "/signup",
      method: "POST",
      className: "mainForm"
    }, /*#__PURE__*/React.createElement("label", {
      htmlFor: "username"
    }, "Username: "), /*#__PURE__*/React.createElement("input", {
      id: "user",
      type: "text",
      name: "username",
      placeholder: "username"
    }), /*#__PURE__*/React.createElement("label", {
      htmlFor: "pass"
    }, "Password: "), /*#__PURE__*/React.createElement("input", {
      id: "pass",
      type: "password",
      name: "pass",
      placeholder: "password"
    }), /*#__PURE__*/React.createElement("label", {
      htmlFor: "pass2"
    }, "Password: "), /*#__PURE__*/React.createElement("input", {
      id: "pass2",
      type: "password",
      name: "pass2",
      placeholder: "retype password"
    }), "// ", /*#__PURE__*/React.createElement("input", {
      type: "hidden",
      name: "_csrf",
      value: props.csrf
    }), "// ", /*#__PURE__*/React.createElement("input", {
      className: "formSubmit",
      type: "submit",
      value: "Sign Up"
    }))
  );
};

var StationList = function StationList(props) {
  if (props.stations.length === 0) {
    return (/*#__PURE__*/React.createElement("div", {
        className: "stationList"
      }, /*#__PURE__*/React.createElement("h3", {
        className: "emptyStations"
      }, "No Stations yet"))
    );
  }

  var allStations = props.stations.map(function (station) {
    return (/*#__PURE__*/React.createElement("div", {
        key: station._id,
        className: "station"
      }, /*#__PURE__*/React.createElement("img", {
        src: station[0].albumArt,
        alt: "/assets/img/radio.png",
        className: "cover"
      }), /*#__PURE__*/React.createElement("h3", {
        className: "stationName"
      }, " Name: ", station.name, " "), /*#__PURE__*/React.createElement("h3", {
        className: "stationCreator"
      }, " Created by: ", station.creator, " "))
    );
  });
  return (/*#__PURE__*/React.createElement("div", {
      className: "stationList"
    }, allStations)
  );
};

var getAllStations = function getAllStations() {
  sendAjax('GET', '/getAll', null, function (data) {
    ReactDOM.render( /*#__PURE__*/React.createElement(StationList, {
      stations: data.stations
    }), document.querySelector("#window"));
  });
};