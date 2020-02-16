const express = require('express');
const router = express.Router();
const { getDb } = require('../db');

router.get('/login', function (req, res) {
  res.render('login');
});

router.get('/register', function (req, res) {
  res.render('register');
});

router.get('/logout', function (req, res) {
  req.session.destroy(function () {
    res.redirect('/user/login');
  });
});

router.post('/login', function (req, res) {

  let db = getDb();
  db.collection('users').findOne({ "email": req.body.email }, function (err, result) {
    if (err) throw err;
    if (result && result.password == req.body.password) {
      req.session.user = result;
      res.redirect('/');
    }
    else {
      res.render('login', { error: "Invalid Credintials" });
    }
  });

});

router.post('/register', function (req, res) {
  let db = getDb();
  var user = { email: req.body.email, password: req.body.password, type: req.body.type };
  db.collection('users').findOne({ email: req.body.email }, function (err, result) {
    if (result)
      return res.render('register', { error: "User already exists" });
    db.collection('users').insert(user, function (err, result) {
      if (err) throw err;
      return res.redirect('/user/login');
    });

  });

});

module.exports = router;
