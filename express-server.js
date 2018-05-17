'use-strict';
let express = require('express');
let app = express();
let PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
let cookieParser = require('cookie-parser');

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

//User DB
const users = {
  "x7hB4n": {
    id: "matt6frey",
    email: "matt6frey@gmail.com",
    password: "mf6Doom"
  },
  "2BBsl2": {
    id: "sukiYoJimbo",
    email: "suki@gmail.com",
    password: "businessTime7"
  }
};

//Root
app.get("/", (req, res) => {
  res.end("Hello!");
});

//Route Redirect for Short URLS
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect( longURL);
});

//Route for link list
app.get("/urls", (req, res) => {
  let templateVars = {
    user_id: req.cookies["user_id"],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

//Route to shortURL page.
app.post("/urls", (req, res) => {
  let short = generateRandomString();
  urlDatabase[short] = req.body.longURL;
  res.redirect( `/urls/${ short }`);
});

//Route for New URL Form
app.get("/urls/new", (req, res) => {
  let  templateVars = {
    user_id: req.cookies["user_id"]
  };
  res.render("urls_new", templateVars);
});

//Route for Register Form
app.get("/urls/register", (req, res) => {
  let  templateVars = {
    user_id: req.cookies["user_id"]
  };
  res.render("urls_register", templateVars);
});

app.post("/urls/register", (req, res) => {
  newUserID = generateRandomString();
  var userList = Object.keys(users);
  userList.forEach((user) => {
    console.log(user);
    if (users[user].email === req.body.email) {
      res.send(res.sendStatus(404));
    }
  });
  if (req.body.email === '' || req.body.email === undefined || req.body.password === '' || req.body.password === undefined) {
    res.sendStatus(404);
  } else {
    users[newUserID] = {
      id: newUserID,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie("user_id", newUserID, { expires: new Date(Date.now() + (60*60*24)) });
    templateVars = {
      user_id: req.cookies["user_id"],
      urls: urlDatabase
    };
    res.redirect('/urls/');
  }
});

//Route for short links
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    user_id: req.cookies["user_id"],
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id]
    };
  res.render("urls_show", templateVars);
});

//Route for deleting entries.
app.post("/urls/:id/delete", (req, res) => {
  res.statusCode = 200;
  delete urlDatabase[req.params.id];
  res.redirect( '/urls/');
});

//Route for editing URLs
app.post("/urls/:id/edit", (req, res) => {
  res.statusCode = 200;
  // console.log();
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect( `/urls/${ req.params.id }/`);
});

//Route for logging in.
app.post('/login', (req, res) => {
  // Set Username value in cookie.
  res.cookie("user_id", req.body.username, { expires: new Date(Date.now() + (60*60*24)) });
  res.redirect("/urls/");
});

//Route for logging out.
app.post('/logout', (req, res) => {
  // Set Username value in cookie.
  res.clearCookie("user_id", req.body.username, { expires: - 999 });
  //console.log("Username entered: ", req.body.username);
  res.redirect( "/urls/");
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