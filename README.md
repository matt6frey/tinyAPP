# tinyAPP
This is a fullstack App using Express, EJS and Node. It allows users to shorten URLs similar to the way that bit.ly does. Each user can create, edit or delete their URLs they have added. Only users who are logged in can perform any major actions. Anyone who isn't logged in can still use the shortened URLs and are directed to sign up if they want to add shortened URLs.

## Screenshots
<img alt="Screenshot of the Log in Page" src="https://github.com/matt6frey/tinyAPP/blob/master/docs/login-tinyApp.png" width="100%" height="auto" align="center">
<img alt="Screenshot of the main page when logged in." width="100%" height="auto" src="https://github.com/matt6frey/tinyAPP/blob/master/docs/logged-in.png" align="center">

<div style="clear:both;"></div>




## Dependencies

- bcryptjs
- body-parser
- cookie-parser
- cookie-session
- ejs
- express
- http
- nan
- node-pre-gyp

## Start-Up Instructions

1. Fork & Clone the project.
2. Install all required dependencies. Once they're finished installing, open up the terminal.
3. Call the script using `node express-server.js`
4. Once the server is running, navigate to `http://localhost:8080/` and you can begin experimenting with TinyApp!
