'use-strict';
let express = require('express');
let app = express();
let PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
let cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');

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
//Set up cookie session.
app.use(cookieSession({
  name: 'session',
  keys: ['secret'],
  user_id:'',
  maxAge: 60 * 60 * 24 * 1000 // 24 Hour expiry
}));
//Enalbe EJS
app.set('view engine', 'ejs');

//Mock DB
var urlDatabase = {
  "b2xVn2": { url: "http://www.lighthouselabs.ca", userID: 'x7hB4n' },
  "9sm5xK": { url: "http://www.google.com", userID: '2BBsl2' }
};


//Hash Predefined Users
var salt = bcrypt.genSaltSync(10); // global salt
var uPass = [bcrypt.hashSync("lhl", salt), bcrypt.hashSync("lighthouse", salt)];

//User DB
const users = {
  "x7hB4n": {
    id: "x7hB4n",
    email: "matt6frey@gmail.com",
    password: uPass[0]
  },
  "2BBsl2": {
    id: "2BBsl2",
    email: "sukiYoJimbo@gmail.com",
    password: uPass[1]
  }
};

//Root
app.get("/", (req, res) => {
  res.end("Hello!");
});

//Route to login
app.get("/urls/login", (req,res) => {
  res.statusCode = 200;
  let email = getEmail(users, req.session.user_id);
  let templateVars = {
    user_id: req.session.user_id,
    email: email,
    urls: urlDatabase
  };
  res.render('urls_login', templateVars);
});

//Route for logging in.
app.post('/urls/login', (req, res) => {
  // Set Username value in cookie.
  let pass = req.body.password;
  let email = req.body.email;
  let match; let loggedID;
  if(email === '' || email === undefined) {
    res.status(403).send("<html><head><title>Tiny App | 403 - Enter your Email.</title><link rel='stylesheet' href='//maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css'></head><body><h1 class='text-center' style='margin-top: 100px;''>Error 403: Forbidden</h1><p style='margin-top: 25px;' class='text-center'>You must enter a valid email.</p><p style='margin-top: 26px;' class='text-center'><a href='/urls/login' class='btn btn-primary'>Login</a></p></body></html>");
  } else if (pass === '' || pass === undefined) {
    res.status(403).send("<html><head><title>Tiny App | 403 - Enter your Password.</title><link rel='stylesheet' href='//maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css'></head><body><h1 class='text-center' style='margin-top: 100px;''>Error 403: Forbidden</h1><p style='margin-top: 25px;' class='text-center'>You must enter a valid password to login.</p><p style='margin-top: 26px;' class='text-center'><a href='/urls/login' class='btn btn-primary'>Login</a></p></body></html>");
  } else {
    Object.keys(users).forEach( (user) => {
      if(email === users[user].email) {
        if(bcrypt.compareSync(pass, users[user].password)) {
          match = true;
          loggedID = users[user].id;
        }
      }
    });
    if(match) {
      res.statusCode = 200;
      req.session.user_id = loggedID;
      res.redirect("/urls/");
    } else {
      res.status(403).send("<html><head><title>Tiny App | 403 - Complete your Email & Password.</title><link rel='stylesheet' href='//maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css'></head><body><h1 class='text-center' style='margin-top: 100px;''>Error 403: Forbidden</h1><p style='margin-top: 25px;' class='text-center'>You must enter a valid email and password to login.</p><p style='margin-top: 26px;' class='text-center'><a href='/urls/login' class='btn btn-primary'>Login</a></p></body></html>");
    }
  }
});


//Route for logging out.
app.post('/logout', (req, res) => {
  // Set Username value in cookie.
  req.session = null;
  res.redirect( "/urls");
});

//Route Redirect for Short URLS
app.get("/u/:shortURL", (req, res) => {
  if(!Object.keys(urlDatabase).includes(req.params.shortURL)) {
    res.status(404).send("<html><head><title>Tiny App | 404 - URL Not found.</title><link rel='stylesheet' href='//maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css'></head><body><h1 class='text-center' style='margin-top: 100px;'>Error 404: Not Found</h1><p style='margin-top: 25px;' class='text-center'>The URL you are looking for doesn't exist.</p><p style='margin-top: 26px;' class='text-center'><a href='/urls' class='btn btn-primary'>Login</a></p></body></html>");
  } else {
    let longURL = urlDatabase[req.params.shortURL].url;
    res.redirect( longURL );
  }
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
  let email = getEmail(users, req.session.user_id);;
  let templateVars = {
    user_id: req.session.user_id,
    email: email,
    urls: userURLS(urlDatabase, req.session.user_id)
  };
  res.render("urls_index", templateVars);
});

//Route to shortURL page.
app.post("/urls", (req, res) => {
  if (req.session.user_id !== undefined) {
    let short = generateRandomString();
    urlDatabase[short] = { url: req.body.longURL, userID: req.session.user_id };
    res.redirect( `/urls/${ short }`);
  } else {
    res.status(403).send("<html><head><title>Tiny App | 403 - Forbidden.</title><link rel='stylesheet' href='//maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css'></head><body><h1 class='text-center' style='margin-top: 100px;'>Error 403: Forbidden</h1><p style='margin-top: 25px;' class='text-center'>You must be logged in to submit URLS.</p><p style='margin-top: 26px;' class='text-center'><a href='/urls/login' class='btn btn-primary'>Login</a></p></body></html>");
  }
});

//Route for New URL Form
app.get("/urls/new", (req, res) => {
  if(req.session.user_id !== undefined) {
    Object.keys(users).forEach( (user) => {
      if(users[user].id === req.session.user_id) {
        let email = getEmail(users, req.session.user_id);;
        let templateVars = {
          email: email,
          user_id: req.session.user_id,
          user: users[req.session.user_id]
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
    user: users[req.session.user_id]
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
    var hash = bcrypt.hashSync(req.body.password, salt);
    users[newUserID] = {
      id: newUserID,
      email: req.body.email,
      password: hash
    };
    req.session.user_id = newUserID;
    let email = getEmail(users, req.session.user_id);;
    templateVars = {
      user_id: req.session.user_id,
      email: email,
      urls: urlDatabase
    };
    res.redirect('/urls');
  }
});

//Route for short links
app.get("/urls/:id", (req, res) => {
  if(!urlDatabase[req.params.id]) {
    res.status(404).send("<html><head><title>Tiny App | 404 - URL Not found.</title><link rel='stylesheet' href='//maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css'></head><body><h1 class='text-center' style='margin-top: 100px;'>Error 404: Not Found</h1><p style='margin-top: 25px;' class='text-center'>The URL you are looking for doesn't exist.</p><p style='margin-top: 26px;' class='text-center'><a href='/urls' class='btn btn-primary'>Login</a></p></body></html>");
  } else if(req.session.user_id === undefined) {
    res.status(403).send("<html><head><title>Tiny App | 403 - Forbidden.</title><link rel='stylesheet' href='//maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css'></head><body><h1 class='text-center' style='margin-top: 100px;'>Error 403: Forbidden</h1><p style='margin-top: 25px;' class='text-center'>You must be logged in to view this page.</p><p style='margin-top: 26px;' class='text-center'><a href='/urls/login' class='btn btn-primary'>Login</a></p></body></html>");
  } else {
    let email = getEmail(users, req.session.user_id);
    if(email !== getEmail(users, urlDatabase[req.params.id].userID)) {
      res.status(403).send("<html><head><title>Tiny App | 403 - Forbidden.</title><link rel='stylesheet' href='//maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css'></head><body><h1 class='text-center' style='margin-top: 100px;'>Error 403: Access Denied</h1><p style='margin-top: 25px;' class='text-center'>You don't have permission to access this page.</p><p style='margin-top: 26px;' class='text-center'><a href='/urls/login' class='btn btn-primary'>Login</a></p></body></html>");
    } else {
    let templateVars = {
      user_id: req.session.user_id,
      email: email,
      shortURL: req.params.id,
      longURL: urlDatabase[req.params.id].url
    };
    res.render("urls_show", templateVars);
    }
  }
});

app.post("/urls/:id", (req, res) => {
    if(urlDatabase[req.params.id].userID === req.session.user_id) {
      res.statusCode = 200;
      urlDatabase[req.params.id] = { url: req.body.longURL, userID: req.session.user_id };
      res.redirect( `/urls/${ req.params.id }/`);
    } else {
      res.redirect('/urls');
    }
});

//Route for deleting entries.
app.get("/urls/:id/delete", (req, res) => {
  if(req.session.user_id !== undefined && urlDatabase[req.params.id].userID === req.session.user_id) {
    res.statusCode = 200;
    delete urlDatabase[req.params.id];
  } else if (req.session.user_id === undefined) {
    res.status(403).send("<html><head><title>Tiny App | 403 - Forbidden.</title><link rel='stylesheet' href='//maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css'></head><body><h1 class='text-center' style='margin-top: 100px;'>Error 403: Forbidden</h1><p style='margin-top: 25px;' class='text-center'>You need to login to perform this action.</p><p style='margin-top: 26px;' class='text-center'><a href='/urls/login' class='btn btn-primary'>Login</a></p></body></html>");
  } else {
    res.status(403).send("<html><head><title>Tiny App | 403 - Forbidden.</title><link rel='stylesheet' href='//maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css'></head><body><h1 class='text-center' style='margin-top: 100px;'>Error 403: Forbidden</h1><p style='margin-top: 25px;' class='text-center'>You don't have permission to delete this page.</p><p style='margin-top: 26px;' class='text-center'><a href='/urls/login' class='btn btn-primary'>Login</a></p></body></html>");
  }
  res.redirect( '/urls');
});

//Route to JSON Data of URLS
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><head><title>Hello</title></head><body><h1>Hello</h1><p>Welcome to this page.</p></body></html>");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});