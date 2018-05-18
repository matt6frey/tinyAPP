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

function getEmail(users, userID) {
  var match;
  Object.keys(users).forEach((user) => {
    if(users[user].id === userID) {
      match = users[user].email;
    }
  });
  return match;
}

//Parse Form Data
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
//Enalbe EJS
app.set('view engine', 'ejs');

//Mock DB
var urlDatabase = {
  "b2xVn2": { url: "http://www.lighthouselabs.ca", userID : 'x7hB4n' },
  "9sm5xK": { url: "http://www.google.com", userID: '2BBsl2' }
};

//User DB
const users = {
  "x7hB4n": {
    id: "x7hB4n",
    email: "matt6frey@gmail.com",
    password: "mf6Doom"
  },
  "2BBsl2": {
    id: "2BBsl2",
    email: "sukiYoJimbo@gmail.com",
    password: "businessTime7"
  }
};

//Root
app.get("/", (req, res) => {
  res.end("Hello!");
});

//Route to login
app.get("/urls/login", (req,res) => {
  res.statusCode = 200;
  let email = getEmail(users, req.cookies.user_id);
  let templateVars = {
    user_id: req.cookies.user_id,
    email: email,
    urls: urlDatabase
  };
  console.log("From login: ",templateVars);
  res.render('urls_login', templateVars);
});

//Route for logging in. // Maybe need to fix.
app.post('/urls/login', (req, res) => {
  // Set Username value in cookie.
  let email = req.body.email;
  let pass = req.body.password;
  let match;
  let loggedID;
  if(email === '' || email === undefined) {
    res.sendStatus(404);
  } else if (pass === '' || pass === undefined) {
    res.sendStatus(404);
  } else {
    Object.keys(users).forEach( (user) => {
      if(email === users[user].email && pass === users[user].password) {
        match = true;
        loggedID = users[user].id;
      }
    });
    if(match) {
      res.statusCode = 200;
      res.cookie("user_id", loggedID, { expires: new Date(Date.now() + (60*60*24)) });
      res.redirect("/urls/");
    } else {
      res.sendStatus(403);
    }
  }
});

//Route for logging out.
app.get('/logout', (req, res) => {
  // Set Username value in cookie.
  res.clearCookie("user_id");
  res.redirect( "/urls/");
});

//Route Redirect for Short URLS
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].url;
  res.redirect( longURL );
});

function userURLS(urlDB, userID) {
  var urlList = {};
  let i = 0;
  Object.keys(urlDB).forEach( ( url ) => {
    if (urlDB[url].userID === userID) {
      urlList[url] = Object.assign( url, {
        user_id: userID,
        longURL: urlDB[url].url,
        shortURL: url
       });
    }
  });
  return urlList;
}
//Route for link list
app.get("/urls", (req, res) => {
  let email = getEmail(users, req.cookies.user_id);;
  let templateVars = {
    user_id: req.cookies.user_id,
    email: email,
    urls: userURLS(urlDatabase, req.cookies.user_id)
  };
  res.render("urls_index", templateVars);
});

//Route to shortURL page.
app.post("/urls", (req, res) => {
  let short = generateRandomString();
  urlDatabase[short] = { url: req.body.longURL, userID: req.cookies.user_id };
  res.redirect( `/urls/${ short }`);
});

//Route for New URL Form
app.get("/urls/new", (req, res) => {
  if(req.cookies.user_id !== undefined) {
    Object.keys(users).forEach( (user) => {
      if(users[user].id === req.cookies.user_id) {
        let email = getEmail(users, req.cookies.user_id);;
        let templateVars = {
          email: email,
          user_id: req.cookies.user_id,
          user: users[req.cookies['user_id']]
        };
        res.render("urls_new", templateVars);
      }
    });
  } else {
    res.redirect("/urls/login");
  }
});

//Route for Register Form
app.get("/urls/register", (req, res) => {
  let templateVars = {
    user: users[req.cookies['user_id']]
  };
  res.render("urls_register", templateVars);
});

app.post("/urls/register", (req, res) => {
  newUserID = generateRandomString();
  var userList = Object.keys(users);
  userList.forEach((user) => {
    if (users[user].email === req.body.email) {
      res.sendStatus(400);
    }
  });
  if (req.body.email === '' || req.body.email === undefined || req.body.password === '' || req.body.password === undefined) {
    res.sendStatus(403);
  } else {
    users[newUserID] = {
      id: newUserID,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie("user_id", newUserID, { expires: new Date(Date.now() + (60*60*24)) });
    let email = getEmail(users, req.cookies.user_id);;
    templateVars = {
      user_id: req.cookies['user_id'],
      email: email,
      urls: urlDatabase
    };
    res.redirect('/urls');
  }
});

//Route for short links
app.get("/urls/:id", (req, res) => {
  let email = getEmail(users, req.cookies.user_id);
  let templateVars = {
    user_id: req.cookies.user_id,
    email: email,
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].url
  };
  res.render("urls_show", templateVars);
});

//Route for deleting entries.
app.get("/urls/:id/delete", (req, res) => {
  if(urlDatabase[req.params.id].userID === req.cookies.user_id) {
    res.statusCode = 200;
    delete urlDatabase[req.params.id];
  }
  res.redirect( '/urls');
});

//Route for editing URLs
app.post("/urls/:id/edit", (req, res) => {
  if(urlDatabase[req.params.id].userID === req.cookies.user_id) {
    res.statusCode = 200;
    urlDatabase[req.params.id] = { url: req.body.longURL, userID: req.cookies.user_id };
    res.redirect( `/urls/${ req.params.id }/`);
  } else {
    res.redirect('/urls');
  }
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