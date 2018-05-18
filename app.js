const http = require('http');
const PORT = 8080;

function generateRandomString() {
  var short = '';
  var i = 0;
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


function requestHandler(request, response) {
  if (request.url == "/") {
    response.end("Welcome!");
  } else if (request.url == "/urls") {
    response.end("www.lighthouselabs.ca\nwww.google.com");
  } else {
    response.statusCode = 404;
    response.end("Unknown Path");
  }
}

const bcrypt = require('bcryptjs');
let password = ["purple-monkey-dinosaur", "purple-monkey-dinosaur", "matt", "cat","rat","man in a purple hat"];
const hashedPassword = bcrypt.hashSync(password, 10);

for (var i =0; i < password.length; i++) {
  var p = password[i];
  var h = bcrypt.hashSync(p,10);
  console.log(p);
  console.log("hash " + i + ": ",h);
}

//console.log(hashedPassword);

var server = http.createServer(requestHandler);

//server.listen(PORT, () => {
//  console.log(`Server listening on: http://localhost:${PORT}`);
//});