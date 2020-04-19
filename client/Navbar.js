// This is where users login, links to account features. Sign in, sign out, create account
const TopNav = () =>
{
  return (
    <div id="topNav">
      <Logo />
      <LoginPanel />
    </div>
  );
};

const Logo = () => {
  return (
    <a href="/" id="logo">am_radio</a>
  );
};

const LoginPanel = () => {
  return (
    <ul>
      <li className="navlink"><input id="user" type="text" name="username" placeholder="username"/></li>
      <li className="navLink"><input id="pass" type="password" name="pass" placeholder="password"/></li>
      <li className="navlink"><a id="loginButton" href="/login">Login</a></li>
      <li className="navlink"><a id="signupButton" href="/signup">Sign up</a></li>
    </ul>
  );
};

const LogoutPanel = (props) => {
  return (
    <div>
      <h1>Welcome {props.username}! </h1>
      <ul>
        <li className="navlink"><a href="/logout">Log out</a></li>
      </ul>
    </div>
  );
};

const SignupWindow = (props) => {
  return (
    <form id="signupForm"
          name="signupForm"
          onSubmit={handleSignup}
          action="/signup"
          method="POST"
          className="mainForm"
    >
      <label htmlFor="username">Username: </label>
      <input id="user" type="text" name="username" placeholder="username"/>
      <label htmlFor="pass">Password: </label>
      <input id="pass" type="password" name="pass" placeholder="password"/>
      <label htmlFor="pass2">Password: </label>
      <input id="pass2" type="password" name="pass2" placeholder="retype password"/>
      // <input type="hidden" name="_csrf" value={props.csrf} />
      // <input className="formSubmit" type="submit" value="Sign Up" />
    </form>
  );
};
