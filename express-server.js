'use-strict';
var express = require('express');
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');

function generateRandomString() {
  let short = '';
  let i = 0;
  while (i < 6) {
    if (i % 2 === 0) {
      if(Math.floor(Math.random() * 3) == 1) {
        short += String.fromCharCode(57 - Math.floor(Math.random() * 10)); // Log a number
      } else {
        short += String.fromCharCode(90 - Math.floor((Math.random() * 25))).toLowerCase(); // Log a LowerCase letter
      }
    } else {
      short += String.fromCharCode(90 - Math.floor((Math.random() * 25))).toUpperCase(); // Log UpperCase letter
    }
    i++;
  }
  return short;
}

//Parse Form Data
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
//Enalbe EJS
app.set('view engine', 'ejs');

//Mock DB
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Root
app.get("/", (req, res) => {
  res.end("Hello!");
});

//Route Redirect for Short URLS
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//Route for link list
app.get("/urls", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

//Route to shortURL page.
app.post("/urls", (req, res) => {
  let short = generateRandomString();
  urlDatabase[short] = req.body.longURL;
  res.redirect(`/urls/${ short }`);
});

//Route for Form
app.get("/urls/new", (req, res) => {
  var  templateVars = {
    username: req.cookies["username"]
  }
  res.render("urls_new", templateVars);
});

//Route for short links
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id]
    };
  res.render("urls_show", templateVars);
});

//Route for deleting entries.
app.post("/urls/:id/delete", (req, res) => {
  res.statusCode = 200;
  delete urlDatabase[req.params.id];
  res.redirect('/urls/');
});

//Route for editing URLs
app.post("/urls/:id/edit", (req, res) => {
  res.statusCode = 200;
  // console.log();
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect(`/urls/${ req.params.id }/`);
});

//Route for logging in.
app.post('/login', (req, res) => {
  // Set Username value in cookie.
  res.cookie("username", req.body.username, { expires: new Date(Date.now() + (60*60*24)) });
  //console.log("Username entered: ", req.body.username);
  res.redirect("/urls/");
});

//Route for logging out.
app.post('/logout', (req, res) => {
  // Set Username value in cookie.
  res.clearCookie("username", req.body.username, { expires: -999 });
  //console.log("Username entered: ", req.body.username);
  res.redirect("/urls/");
});

//Route to JSON Data of URLS
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/hello", (req, res) => {
  res.end("<html><head><title>Hello</title></head><body><h1>Hello</h1><p>Welcome to this page.</p></body></html>");
});

// //});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});