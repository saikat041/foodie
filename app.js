var express=require('express');
var exhbs=require('express-handlebars');
var bodyParser=require('body-parser');
var user=require('./router/user');
var shop=require('./router/shop');
var session=require('express-session');
var app=express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var home=require('./router/home')(io);

var helpers={
              concat:  function (text) { return "myshop/editItem?itemNumber="+text;},
              concat1: function (text) { return "?shopNumber="+text;       }
            };



app.engine('handlebars',exhbs({defaultLayout:'main',helpers:helpers}));
app.set('view engine','handlebars');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(__dirname+'/public'));

app.use(session({ secret: 'keyboard cat',  resave: true,
  saveUninitialized: true, cookie: { maxAge: 300000 }}));
app.use(function (req,res,next) {
res.locals.user=req.session.user;
next();
});
app.use('/',home);
app.use('/user',user);
app.use('/myshop',shop);


http.listen(4200,function(){
  console.log('server started at 4200...');
});
