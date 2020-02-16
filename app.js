const express = require('express');
const exhbs = require('express-handlebars');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

// routes
const home = require('./router/home')(io);
const user = require('./router/user');
const shop = require('./router/shop');

const { NODE_ENV } = process.env;

// if in development mode take environment variables from .env file
if (NODE_ENV === 'development') {
  require('dotenv').config();
}

var { DB_URL, PORT } = process.env;

if(!DB_URL){
  console.log('Provide DB_URL in environment variable');
  return;
}

// if port is not provided in environment variable then use 3000
if(!PORT){
  PORT = 3000;
}

// connecting to database
const { initDb } = require('./db');

initDb(DB_URL, function (err, db) {
  if (err) {
    console.log("Failed to connect to database, please provide correct database url")
    process.exit();
  }
  console.log("Connected to database");
});


const helpers = {
  concat: function (text) { return "myshop/editItem?itemNumber=" + text; },
  concat1: function (text) { return "?shopNumber=" + text; }
};

app.engine('handlebars', exhbs({ defaultLayout: 'main', helpers: helpers }));
app.set('view engine', 'handlebars');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));

app.use(session({
  secret: 'keyboard cat', resave: true,
  saveUninitialized: true, cookie: { maxAge: 300000 }
}));

app.use(function (req, res, next) {
  res.locals.user = req.session.user;
  next();
});

app.use('/', home);
app.use('/user', user);
app.use('/myshop', shop);


// creating server
http.listen(PORT, function () {
  console.log("server started at port: " + PORT);
});
